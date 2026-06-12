import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Brain, FileText, Image as ImageIcon, Link2, Shield, Sparkles, Upload, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Academic Scam Shield · Don't Get Played. Get It Checked." },
      { name: "description", content: "Instantly verify suspicious internships, scholarships, recruiter messages, screenshots and websites with AI. No login required." },
      { property: "og:title", content: "AI Academic Scam Shield" },
      { property: "og:description", content: "AI-powered detection for fake internships, scholarships, phishing recruiters and academic credential scams." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-hero-gradient">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24 lg:px-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" /> AI-Powered Verification
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                AI Academic <span className="text-gradient-brand">Scam Shield</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Don't Get Played. Get It Checked. Our advanced AI analyzes suspicious internship offers, predatory scholarships, fake recruiters and shady websites to keep students and researchers safe.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-xl">
                  <Link to="/analyze">Analyze Now <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-xl">
                  <Link to="/community"><Users className="mr-1 h-4 w-4" /> Community Reports</Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-success" /> No login required</span>
                <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-success" /> Instant verdict</span>
                <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-success" /> Powered by Gemini</span>
              </div>
            </div>

            {/* Preview card */}
            <div className="relative">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold">Analysis Result</h3>
                    <p className="text-xs text-muted-foreground">Job Posting ID: #REF-88921</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-3 py-1 text-xs font-bold uppercase text-danger">
                    <AlertTriangle className="h-3 w-3" /> Scam
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-5">
                  <div className="relative h-24 w-24">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" stroke="var(--color-border)" strokeWidth="8" fill="none" />
                      <circle cx="50" cy="50" r="42" stroke="var(--color-danger)" strokeWidth="8" fill="none"
                              strokeLinecap="round" strokeDasharray={2 * Math.PI * 42} strokeDashoffset={2 * Math.PI * 42 * 0.08} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-xl font-bold text-danger">92%</span>
                      <span className="text-[9px] font-semibold uppercase text-muted-foreground">Risk</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-semibold">Primary Red Flags:</p>
                    {["Upfront Registration Fee", "Non-Institutional Recruiter", "Burner Domain"].map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs">
                        <XCircle className="h-3.5 w-3.5 text-danger" /> {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 rounded-xl bg-muted/60 p-3 text-xs italic text-muted-foreground">
                  "Verdict: This listing matches known academic credential phishing patterns. High risk of identity theft."
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/60 bg-background">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Advanced Detection Engine</h2>
              <p className="mt-3 text-muted-foreground">Multiple analysis vectors so you never fall for a sophisticated predatory offer again.</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                { icon: FileText, title: "Text Analysis", body: "Paste job descriptions, recruiter emails, or offer letters to detect linguistic patterns of academic fraud." },
                { icon: ImageIcon, title: "Screenshot OCR", body: "Upload images from LinkedIn, WhatsApp, or Telegram. Our AI reads and evaluates visual content.", featured: true },
                { icon: Link2, title: "URL Verification", body: "Scan website domains for spoofed universities, burner domains and known phishing patterns." },
                { icon: Brain, title: "Gemini AI Engine", body: "Leveraging Google Gemini to cross-reference global academic scam trends in real time." },
                { icon: Users, title: "Community-Led", body: "Real-time alerts from other students who have encountered similar predatory behavior." },
                { icon: Shield, title: "AI Verification", body: "Every community report is auto-verified by AI so you can trust the signal." },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className={
                      "group rounded-2xl border p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated " +
                      (f.featured ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")
                    }
                  >
                    <div className={"flex h-11 w-11 items-center justify-center rounded-xl " + (f.featured ? "bg-white/15" : "bg-primary-soft")}>
                      <Icon className={"h-5 w-5 " + (f.featured ? "text-primary-foreground" : "text-primary")} />
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold">{f.title}</h3>
                    <p className={"mt-2 text-sm " + (f.featured ? "text-primary-foreground/85" : "text-muted-foreground")}>{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-primary-soft/40">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Three Steps to Safety</h2>
              <p className="mt-3 text-muted-foreground">Our streamlined process provides instant clarity on any academic opportunity.</p>
            </div>
            <div className="relative mt-14 grid gap-10 md:grid-cols-3">
              <div className="absolute left-0 right-0 top-7 hidden h-px bg-border md:block" />
              {[
                { icon: Upload, title: "1. Upload or Paste", body: "Drop your internship offer, scholarship URL, or email content into our secure analyzer." },
                { icon: Brain, title: "2. AI Analysis", body: "Our Gemini-powered engine scans for predatory linguistic cues and verified fraud signatures." },
                { icon: Shield, title: "3. Instant Verdict", body: "Receive a detailed Risk Score and report, helping you make informed decisions with confidence." },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="relative flex flex-col items-center text-center">
                    <div className={"relative z-10 flex h-14 w-14 items-center justify-center rounded-full " + (i === 1 ? "bg-primary text-primary-foreground" : "bg-card text-primary border border-border")}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold">{s.title}</h3>
                    <p className="mt-2 max-w-xs text-sm text-muted-foreground">{s.body}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-12 text-center">
              <Button asChild size="lg" className="rounded-xl">
                <Link to="/analyze">Start Your First Scan</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
