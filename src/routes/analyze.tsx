import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  BarChart3,
  FileText,
  Image as ImageIcon,
  Link2,
  Loader2,
  Sparkles,
  Upload,
  X,
  ShieldCheck,
  Zap,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { AnalysisResults } from "@/components/analysis-results";
import { analyzeContent, type AnalysisResult } from "@/lib/analyze.functions";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Suspicious Content · Scam Shield" },
      {
        name: "description",
        content:
          "Paste text, upload a screenshot, or submit a URL to instantly check it for academic scam indicators.",
      },
    ],
  }),
  component: AnalyzePage,
});

const EXAMPLES: Record<"text" | "url", string> = {
  text: "Congratulations! You've been selected for a paid remote internship at Google. Pay ₹1,500 registration fee to confirm your seat. Reply YES to claim.",
  url: "https://google-careers-internship-2026.verify-now.xyz",
};

function AnalyzePage() {
  const analyze = useServerFn(analyzeContent);
  const [tab, setTab] = useState<"text" | "image" | "url">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (tab === "text") {
        if (text.trim().length < 5)
          throw new Error("Please paste at least a few words to analyze.");
        return analyze({ data: { type: "text", content: text } });
      }
      if (tab === "url") {
        if (!url.trim()) throw new Error("Please enter a URL.");
        return analyze({ data: { type: "url", content: url } });
      }
      if (!imageDataUrl) throw new Error("Please upload a screenshot.");
      return analyze({
        data: { type: "image", content: imageName ?? "screenshot", imageDataUrl },
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const result: AnalysisResult | undefined = mutation.data;

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("Please upload an image file.");
    if (file.size > 8 * 1024 * 1024) return toast.error("Image must be under 8MB.");
    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  function clearImage(e?: React.MouseEvent) {
    e?.stopPropagation();
    setImageDataUrl(null);
    setImageName(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const canSubmit =
    !mutation.isPending &&
    ((tab === "text" && text.trim().length >= 5) ||
      (tab === "url" && url.trim().length > 0) ||
      (tab === "image" && !!imageDataUrl));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1 bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Powered by Gemini AI
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Analyze suspicious content
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Paste a message, drop a screenshot, or submit a URL. Get a forensic-grade risk
              breakdown in seconds — no signup required.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> ~3 second results</span>
              <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-primary" /> Private & not stored</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Trained on academic scams</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Input column */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border bg-card/80 p-4 shadow-elevated backdrop-blur sm:p-6">
                <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
                  <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1">
                    <TabsTrigger
                      value="text"
                      className="h-10 rounded-lg data-[state=active]:shadow-soft"
                    >
                      <FileText className="mr-1.5 h-4 w-4" /> Text
                    </TabsTrigger>
                    <TabsTrigger
                      value="image"
                      className="h-10 rounded-lg data-[state=active]:shadow-soft"
                    >
                      <ImageIcon className="mr-1.5 h-4 w-4" /> Screenshot
                    </TabsTrigger>
                    <TabsTrigger
                      value="url"
                      className="h-10 rounded-lg data-[state=active]:shadow-soft"
                    >
                      <Link2 className="mr-1.5 h-4 w-4" /> URL
                    </TabsTrigger>
                  </TabsList>

                  {/* Text */}
                  <TabsContent value="text" className="mt-5">
                    <div className="relative">
                      <Textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste the suspicious email, WhatsApp message, internship offer, recruiter DM, or offer letter…"
                        className="min-h-[280px] resize-none rounded-xl border-border bg-background/60 p-4 text-sm leading-relaxed shadow-inner focus-visible:ring-2 focus-visible:ring-primary/40"
                        maxLength={5000}
                      />
                      <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-background/80 px-2 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur">
                        {text.length} / 5000
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setText(EXAMPLES.text)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Try an example message →
                      </button>
                      {text && (
                        <button
                          type="button"
                          onClick={() => setText("")}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </TabsContent>

                  {/* Image */}
                  <TabsContent value="image" className="mt-5">
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) handleFile(f);
                      }}
                      className={`group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                        dragOver
                          ? "border-primary bg-primary-soft/50 scale-[1.01]"
                          : imageDataUrl
                            ? "border-border bg-muted/20"
                            : "border-border bg-muted/30 hover:border-primary/60 hover:bg-primary-soft/20"
                      }`}
                    >
                      {imageDataUrl ? (
                        <>
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-muted-foreground shadow-soft transition-colors hover:bg-background hover:text-foreground"
                            aria-label="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <img
                            src={imageDataUrl}
                            alt="preview"
                            className="max-h-56 rounded-lg shadow-elevated"
                          />
                          <p className="mt-4 text-xs font-medium text-foreground">{imageName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">Click anywhere to replace</p>
                        </>
                      ) : (
                        <>
                          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary transition-transform group-hover:scale-110">
                            <Upload className="h-6 w-6" />
                          </div>
                          <p className="mt-4 font-display text-base font-semibold">
                            Drop a screenshot or click to upload
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            WhatsApp chats, emails, offer letters, websites
                          </p>
                          <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                            PNG · JPG · WEBP · up to 8MB
                          </p>
                        </>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFile(f);
                        }}
                      />
                    </div>
                  </TabsContent>

                  {/* URL */}
                  <TabsContent value="url" className="mt-5">
                    <div className="relative">
                      <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://suspicious-internship-site.example"
                        className="h-14 rounded-xl border-border bg-background/60 pl-11 pr-4 text-base shadow-inner focus-visible:ring-2 focus-visible:ring-primary/40"
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setUrl(EXAMPLES.url)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Try a suspicious URL →
                      </button>
                      {url && (
                        <button
                          type="button"
                          onClick={() => setUrl("")}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                      We analyze URL structure, domain patterns, and known scam indicators. We do
                      not crawl arbitrary sites.
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Action bar */}
                <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
                  <p className="text-xs text-muted-foreground">
                    By analyzing, you confirm the content is not private personal data.
                  </p>
                  <Button
                    onClick={() => mutation.mutate()}
                    disabled={!canSubmit}
                    size="lg"
                    className="h-11 rounded-xl px-6 shadow-soft transition-all hover:shadow-elevated"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-4 w-4" /> Analyze with AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Results column */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24">
                {mutation.isPending && <LoadingState />}
                {!mutation.isPending && !result && <EmptyState />}
                {!mutation.isPending && result && <AnalysisResults result={result} />}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function LoadingState() {
  const steps = [
    "Parsing content",
    "Cross-referencing scam patterns",
    "Scoring risk indicators",
    "Drafting forensic report",
  ];
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-elevated backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="relative grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <div>
          <p className="font-display text-lg font-semibold">Analyzing…</p>
          <p className="text-sm text-muted-foreground">Gemini is reviewing the evidence</p>
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3 text-sm text-muted-foreground">
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
              style={{ animationDelay: `${i * 150}ms` }}
            />
            {s}
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 animate-[shimmer_1.6s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
        <BarChart3 className="h-7 w-7" />
      </div>
      <p className="mt-5 font-display text-lg font-semibold">Your report appears here</p>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Submit content on the left and we'll surface a risk score, red flags, and a clear action
        guide.
      </p>
      <div className="mt-6 grid w-full max-w-xs grid-cols-3 gap-2 text-[11px] font-medium text-muted-foreground">
        <div className="rounded-lg border border-border bg-background/60 p-2">Risk score</div>
        <div className="rounded-lg border border-border bg-background/60 p-2">Red flags</div>
        <div className="rounded-lg border border-border bg-background/60 p-2">Next steps</div>
      </div>
    </div>
  );
}
