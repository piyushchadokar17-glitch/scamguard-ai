import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { BarChart3, FileText, Image as ImageIcon, Link2, Loader2, Upload } from "lucide-react";
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
      { name: "description", content: "Paste text, upload a screenshot, or submit a URL to instantly check it for academic scam indicators." },
    ],
  }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const analyze = useServerFn(analyzeContent);
  const [tab, setTab] = useState<"text" | "image" | "url">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      if (tab === "text") {
        if (text.trim().length < 5) throw new Error("Please paste at least a few words to analyze.");
        return analyze({ data: { type: "text", content: text } });
      }
      if (tab === "url") {
        if (!url.trim()) throw new Error("Please enter a URL.");
        return analyze({ data: { type: "url", content: url } });
      }
      if (!imageDataUrl) throw new Error("Please upload a screenshot.");
      return analyze({ data: { type: "image", content: imageName ?? "screenshot", imageDataUrl } });
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

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1 bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Analyze Suspicious Content</h1>
            <p className="mt-2 text-muted-foreground">Paste text, upload images, or provide URLs for immediate AI forensic analysis.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text"><FileText className="mr-1.5 h-4 w-4" /> Text</TabsTrigger>
                  <TabsTrigger value="image"><ImageIcon className="mr-1.5 h-4 w-4" /> Screenshot</TabsTrigger>
                  <TabsTrigger value="url"><Link2 className="mr-1.5 h-4 w-4" /> URL</TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="mt-5">
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste the suspicious email, message, internship offer, or transcript here…"
                    className="min-h-[260px] resize-none rounded-xl bg-muted/40"
                    maxLength={5000}
                  />
                  <div className="mt-2 text-right text-xs text-muted-foreground">{text.length} / 5000</div>
                </TabsContent>

                <TabsContent value="image" className="mt-5">
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                    className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary hover:bg-primary-soft/30"
                  >
                    {imageDataUrl ? (
                      <>
                        <img src={imageDataUrl} alt="preview" className="max-h-48 rounded-lg shadow-soft" />
                        <p className="mt-3 text-xs text-muted-foreground">{imageName} · click to replace</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-muted-foreground" />
                        <p className="mt-3 text-sm font-medium">Drop screenshot or click to upload</p>
                        <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, JPEG, WEBP · max 8MB</p>
                      </>
                    )}
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="url" className="mt-5">
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://suspicious-internship-site.example"
                    className="rounded-xl"
                  />
                  <p className="mt-3 text-xs text-muted-foreground">
                    We analyze the URL structure, domain reputation patterns and any provided context. We do not crawl arbitrary sites.
                  </p>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} size="lg" className="rounded-xl">
                  {mutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</>
                  ) : (
                    <><BarChart3 className="mr-2 h-4 w-4" /> Analyze with AI</>
                  )}
                </Button>
              </div>
            </div>

            {/* Results */}
            <div>
              {mutation.isPending && (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-4 font-display text-lg font-semibold">Forensic analysis in progress…</p>
                  <p className="mt-1 text-sm text-muted-foreground">Gemini is cross-referencing scam patterns.</p>
                </div>
              )}
              {!mutation.isPending && !result && (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground/60" />
                  <p className="mt-4 font-display text-lg font-semibold">Results will appear here</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">Submit content on the left to see a risk score, red flags, and an AI forensic breakdown.</p>
                </div>
              )}
              {result && <AnalysisResults result={result} />}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
