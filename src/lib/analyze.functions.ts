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
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userParts },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("AI rate limit reached. Please retry in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace settings.");
    throw new Error(`AI gateway error ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "{}";
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
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    let parts: unknown[];
    if (data.type === "image" && data.imageDataUrl) {
      parts = [
        { type: "text", text: "Analyze this screenshot for academic scam indicators. Extract any visible text via OCR first, then evaluate." },
        { type: "image_url", image_url: { url: data.imageDataUrl } },
      ];
    } else if (data.type === "url") {
      parts = [{ type: "text", text: `Analyze this suspicious URL/website for academic scam indicators. Consider domain age signals, TLD suspiciousness, brand spoofing, and known patterns:\n\n${data.content}` }];
    } else {
      parts = [{ type: "text", text: `Analyze this suspicious text content (email, message, offer letter, internship description, scholarship pitch, etc.):\n\n"""${data.content}"""` }];
    }
    const result = await callGemini(parts);

    // Persist (best-effort)
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("analysis_reports").insert({
        input_type: data.type,
        input_content: data.type === "image" ? null : data.content.slice(0, 5000),
        file_url: null,
        risk_score: result.riskScore,
        verdict: result.verdict,
        red_flags: result.redFlags,
        recommended_actions: result.recommendedActions,
        explanation: result.explanation,
      });
    } catch (e) {
      console.error("persist analysis failed", e);
    }

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
  .inputValidator((input: unknown) => ReportSchema.parse(input))
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
