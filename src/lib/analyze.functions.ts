import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type AnalysisResult = {
  riskScore: number;
  verdict: "SAFE" | "SUSPICIOUS" | "SCAM";
  redFlags: { title: string; explanation: string }[];
  recommendedActions: string[];
  explanation: string;
  aiVerified: boolean;
};

const SYSTEM_PROMPT = `You are an expert academic fraud forensic analyst for "AI Academic Scam Shield". You help students detect fake internships, predatory scholarships, fake recruiters, phishing job offers, predatory journals, and academic credential scams.

Analyze the provided content and respond with STRICT JSON only — no markdown, no commentary. Schema:
{
  "riskScore": <integer 0-100>,
  "verdict": "SAFE" | "SUSPICIOUS" | "SCAM",
  "redFlags": [{"title": "<short title>", "explanation": "<1 sentence>"}],
  "recommendedActions": ["<imperative action>"],
  "explanation": "<2-4 sentence forensic breakdown>",
  "aiVerified": true
}

Risk bands: 0-30 SAFE, 31-70 SUSPICIOUS, 71-100 SCAM. Be evidence-driven. If content is genuinely benign, return SAFE with empty redFlags.`;

const InputSchema = z.object({
  type: z.enum(["text", "url", "image"]),
  content: z.string().min(1).max(20000),
  imageDataUrl: z.string().optional(),
});

async function callGemini(userParts: unknown[]): Promise<AnalysisResult> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "Missing GEMINI_API_KEY environment variable. Please configure it in your .env file.",
    );
  }

  // Map userParts (which are in OpenAI chat completions format) to Gemini content parts.
  const mappedParts = (
    userParts as Array<{
      type: string;
      text?: string;
      image_url?: { url: string };
    }>
  )
    .map((part) => {
      if (part.type === "text") {
        // Truncate extremely long inputs to optimize prompt size and avoid unnecessary tokens
        const textContent =
          part.text && part.text.length > 8000
            ? part.text.slice(0, 8000) + "\n[Truncated due to length limit]"
            : part.text;
        return { text: textContent };
      } else if (part.type === "image_url" && part.image_url?.url) {
        const url = part.image_url.url;
        const match = url.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          return {
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          };
        }
      }
      return null;
    })
    .filter(Boolean);

  if (mappedParts.length === 0) {
    throw new Error("No valid inputs provided for AI analysis.");
  }

  const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
  const retryDelays = [2000, 5000, 10000]; // Exponential backoff retries in ms
  let lastError: Error | null = null;
  let text = "";

  console.log(
    `[AI Request Start] Initiating Gemini analysis. Content parts count: ${mappedParts.length}`,
  );

  for (const model of models) {
    let succeeded = false;
    // Try up to retryDelays.length + 1 attempts per model (1 initial attempt + 3 retries)
    for (let attempt = 1; attempt <= retryDelays.length + 1; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000); // 30-second timeout

      try {
        if (attempt > 1) {
          const delayTime = retryDelays[attempt - 2];
          console.log(
            `[AI Request Retry] Model: ${model}, Attempt: ${attempt}. Waiting ${delayTime / 1000}s...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delayTime));
        }

        const startTime = Date.now();
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: mappedParts,
                },
              ],
              systemInstruction: {
                parts: [
                  {
                    text: SYSTEM_PROMPT,
                  },
                ],
              },
              generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: "object",
                  properties: {
                    riskScore: { type: "integer" },
                    verdict: { type: "string", enum: ["SAFE", "SUSPICIOUS", "SCAM"] },
                    redFlags: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          explanation: { type: "string" },
                        },
                        required: ["title", "explanation"],
                      },
                    },
                    recommendedActions: {
                      type: "array",
                      items: { type: "string" },
                    },
                    explanation: { type: "string" },
                    aiVerified: { type: "boolean" },
                  },
                  required: [
                    "riskScore",
                    "verdict",
                    "redFlags",
                    "recommendedActions",
                    "explanation",
                    "aiVerified",
                  ],
                },
              },
            }),
          },
        );

        clearTimeout(timeoutId);

        if (res.status === 429) {
          console.warn(
            `[AI Rate Limit Event] Model ${model} returned 429 Rate Limit Exceeded on attempt ${attempt}.`,
          );
          throw new Error("AI service is currently busy. Please try again in a few moments.");
        }

        if (!res.ok) {
          const body = await res.text();
          let errMessage = body;
          try {
            const parsedErr = JSON.parse(body);
            if (parsedErr?.error?.message) {
              errMessage = parsedErr.error.message;
            }
          } catch {
            // Ignore JSON parse failure, keep raw body
          }
          throw new Error(`Gemini API error ${res.status}: ${errMessage}`);
        }

        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText || candidateText === "{}") {
          throw new Error("Empty or invalid response received from Gemini API.");
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(
          `[AI Request Success] Model ${model} succeeded on attempt ${attempt} in ${duration}s.`,
        );

        text = candidateText;
        lastError = null;
        succeeded = true;
        break; // Stop retry loop since it succeeded
      } catch (e) {
        clearTimeout(timeoutId);

        const isAbort = e instanceof Error && e.name === "AbortError";
        const errorMsg = isAbort
          ? "Request timed out after 30 seconds."
          : e instanceof Error
            ? e.message
            : String(e);

        console.warn(`[AI Request Warning] Model ${model} attempt ${attempt} failed: ${errorMsg}`);
        lastError = isAbort ? new Error(errorMsg) : e instanceof Error ? e : new Error(errorMsg);
      }
    }

    if (succeeded) {
      break; // Successfully got response from this model, stop checking other models
    }
  }

  if (lastError) {
    console.error(
      `[AI Request Failure] Gemini API analysis failed after checking all models: ${lastError.message}`,
    );
    throw lastError;
  }

  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    parsed = match ? JSON.parse(match[0]) : ({} as AnalysisResult);
  }

  // Sanitize
  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.riskScore ?? 0))));
  const verdict: AnalysisResult["verdict"] =
    score <= 30 ? "SAFE" : score <= 70 ? "SUSPICIOUS" : "SCAM";
  return {
    riskScore: score,
    verdict,
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags.slice(0, 10) : [],
    recommendedActions: Array.isArray(parsed.recommendedActions)
      ? parsed.recommendedActions.slice(0, 10)
      : [],
    explanation: typeof parsed.explanation === "string" ? parsed.explanation : "",
    aiVerified: true,
  };
}

export const analyzeContent = createServerFn({ method: "POST" })
  .validator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    let parts: unknown[];
    const truncatedContent =
      data.content.length > 8000
        ? data.content.slice(0, 8000) + "\n[Truncated due to length limit]"
        : data.content;

    if (data.type === "image" && data.imageDataUrl) {
      parts = [
        {
          type: "text",
          text: "Analyze this screenshot for academic scam indicators. Extract any visible text via OCR first, then evaluate.",
        },
        { type: "image_url", image_url: { url: data.imageDataUrl } },
      ];
    } else if (data.type === "url") {
      parts = [
        {
          type: "text",
          text: `Analyze this suspicious URL/website for academic scam indicators. Consider domain age signals, TLD suspiciousness, brand spoofing, and known patterns:\n\n${truncatedContent}`,
        },
      ];
    } else {
      parts = [
        {
          type: "text",
          text: `Analyze this suspicious text content (email, message, offer letter, internship description, scholarship pitch, etc.):\n\n"""${truncatedContent}"""`,
        },
      ];
    }
    const result = await callGemini(parts);

    // TEMP: Disabled Supabase persistence for Railway testing
    console.log("Analysis completed successfully");

    return result;
  });

const ReportSchema = z.object({
  companyName: z.string().min(1).max(200),
  website: z.string().max(500).optional().nullable(),
  scamType: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  evidenceUrl: z.string().max(500).optional().nullable(),
});

export const submitCommunityReport = createServerFn({ method: "POST" })
  .validator((input: unknown) => ReportSchema.parse(input))
  .handler(async ({ data }) => {
    // AI verify the report
    const verifyText = `Community-submitted scam report:
Company: ${data.companyName}
Website: ${data.website ?? "n/a"}
Type: ${data.scamType}
Description: ${data.description}

Determine if this report appears legitimate (describes plausible fraud patterns) and assign a risk score.`;
    let aiVerified = false;
    let riskScore: number | null = null;
    let category: string | null = null;
    try {
      const r = await callGemini([{ type: "text", text: verifyText }]);
      riskScore = r.riskScore;
      category = data.scamType;
      aiVerified = r.riskScore >= 50;
    } catch (e) {
      console.error("verification failed", e);
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("community_reports")
      .insert({
        company_name: data.companyName,
        website: data.website ?? null,
        scam_type: data.scamType,
        description: data.description,
        evidence_url: data.evidenceUrl ?? null,
        ai_verified: aiVerified,
        ai_risk_score: riskScore,
        ai_category: category,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listCommunityReports = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("community_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
});
