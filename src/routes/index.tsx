import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Link2,
  Lock,
  Shield,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Academic Scam Shield · Don't Get Played. Get It Checked." },
      {
        name: "description",
        content:
          "Instantly verify suspicious internships, scholarships, recruiter messages, screenshots and websites with AI. No login required.",
      },
      { property: "og:title", content: "AI Academic Scam Shield" },
      {
        property: "og:description",
        content:
          "AI-powered detection for fake internships, scholarships, phishing recruiters and academic credential scams.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex-1">
        {/* ───────────────────────── HERO ───────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Background layers */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-hero-gradient" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-soft opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
          <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 md:grid-cols-[1.05fr_1fr] md:py-28 lg:px-8">
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary backdrop-blur">
                <Sparkles className="h-3 w-3" /> Powered by Google Gemini
              </span>
              <h1 className="mt-6 font-display text-[2.5rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-[3.75rem]">
                Don't get played.
                <br />
                <span className="text-gradient-brand">Get it checked.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg sm:leading-relaxed">
                The AI safety net for students. Verify suspicious internships,
                scholarships, recruiter DMs, offer letters and shady websites in
                seconds — before they cost you money or your identity.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild size="lg" className="h-12 rounded-xl px-6 text-base shadow-elevated">
                  <Link to="/analyze">
                    Analyze Now <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 rounded-xl px-6 text-base">
                  <Link to="/community">
                    <Users className="mr-1 h-4 w-4" /> Community Reports
                  </Link>
                </Button>
              </div>

              {/* Trust strip */}
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" /> No login required
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-success" /> Verdict in seconds
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-success" /> Private by design
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-success" /> 100% free for students
                </span>
              </div>
            </div>

            {/* Floating preview card */}
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-danger/15 blur-2xl" />
              <div className="relative rounded-3xl border border-border/70 bg-card/95 p-6 shadow-elevated backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Live Analysis
                    </p>
                    <h3 className="mt-1 truncate font-display text-lg font-bold">
                      "Paid Internship at Microsoft" — Telegram DM
                    </h3>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-danger-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-danger">
                    <AlertTriangle className="h-3 w-3" /> Scam
                  </span>
                </div>

                <div className="mt-6 flex items-center gap-5">
                  <div className="relative h-28 w-28 shrink-0">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" stroke="var(--color-border)" strokeWidth="8" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="var(--color-danger)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 42}
                        strokeDashoffset={2 * Math.PI * 42 * 0.08}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-display text-2xl font-extrabold text-danger">92</span>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Risk Score
                      </span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 space-y-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Primary Red Flags
                    </p>
                    {["Upfront registration fee", "Non-corporate recruiter email", "Burner short-link domain"].map(
                      (f) => (
                        <div key={f} className="flex items-center gap-2 text-sm">
                          <XCircle className="h-4 w-4 shrink-0 text-danger" />
                          <span className="truncate">{f}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-border/60 bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">AI Verdict — </span>
                  Matches known academic credential phishing patterns. Avoid sharing personal
                  documents or making any payment.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────────────────────── SOCIAL PROOF / STATS ───────────────────────── */}
        <section className="border-y border-border/60 bg-card/40">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden bg-border/60 sm:grid-cols-4">
            {[
              { k: "12K+", v: "Scams flagged" },
              { k: "98%", v: "Detection accuracy" },
              { k: "<3s", v: "Avg. analysis time" },
              { k: "Free", v: "Always & forever" },
            ].map((s) => (
              <div key={s.v} className="bg-background px-6 py-8 text-center">
                <div className="font-display text-3xl font-extrabold text-gradient-brand">{s.k}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────────── FEATURES ───────────────────────── */}
        <section className="relative bg-background">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Detection Engine
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-[2.75rem]">
                Built to outsmart modern scams
              </h2>
              <p className="mt-4 text-muted-foreground sm:text-lg">
                Multi-modal analysis combines text, image, and URL intelligence so nothing
                sophisticated slips through.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: FileText,
                  title: "Text Analysis",
                  body: "Paste job descriptions, recruiter emails, or offer letters. Linguistic AI detects predatory phrasing instantly.",
                },
                {
                  icon: ImageIcon,
                  title: "Screenshot OCR",
                  body: "Drop screenshots from LinkedIn, WhatsApp, or Telegram. Vision AI reads and judges visual evidence.",
                  featured: true,
                },
                {
                  icon: Link2,
                  title: "URL Verification",
                  body: "Scan domains for spoofed universities, burner shorteners, and known phishing infrastructure.",
                },
                {
                  icon: Brain,
                  title: "Gemini AI Engine",
                  body: "Google Gemini cross-references global academic scam trends in real time, not stale rules.",
                },
                {
                  icon: Users,
                  title: "Community Signal",
                  body: "Live alerts from students who have already encountered the same predatory offer.",
                },
                {
                  icon: ShieldCheck,
                  title: "AI-Verified Reports",
                  body: "Every community submission is auto-verified by AI so you can trust the signal.",
                },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className={
                      "group relative overflow-hidden rounded-2xl border p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated " +
                      (f.featured
                        ? "border-primary/40 bg-gradient-to-br from-primary to-primary/85 text-primary-foreground"
                        : "border-border/70 bg-card")
                    }
                  >
                    {f.featured && (
                      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
                    )}
                    <div
                      className={
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 " +
                        (f.featured ? "bg-white/15" : "bg-primary-soft")
                      }
                    >
                      <Icon className={"h-5 w-5 " + (f.featured ? "text-primary-foreground" : "text-primary")} />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-bold tracking-tight">{f.title}</h3>
                    <p
                      className={
                        "mt-2 text-sm leading-relaxed " +
                        (f.featured ? "text-primary-foreground/90" : "text-muted-foreground")
                      }
                    >
                      {f.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ───────────────────────── HOW IT WORKS ───────────────────────── */}
        <section className="relative overflow-hidden border-t border-border/60 bg-primary-soft/30">
          <div className="pointer-events-none absolute inset-0 bg-grid-soft opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary backdrop-blur">
                Workflow
              </span>
              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-[2.75rem]">
                Three steps to safety
              </h2>
              <p className="mt-4 text-muted-foreground sm:text-lg">
                A streamlined process that delivers instant clarity on any academic opportunity.
              </p>
            </div>

            <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-6">
              {/* connector line */}
              <div className="pointer-events-none absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
              {[
                {
                  icon: Upload,
                  title: "Upload or paste",
                  body: "Drop a screenshot, paste a recruiter message, or share a suspicious URL.",
                },
                {
                  icon: Brain,
                  title: "AI analyzes",
                  body: "Gemini scans for predatory cues, verified fraud signatures and structural red flags.",
                  active: true,
                },
                {
                  icon: Shield,
                  title: "Get a verdict",
                  body: "Receive a detailed risk score, flagged issues, and a clear action guide.",
                },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="relative flex flex-col items-center text-center">
                    <div
                      className={
                        "relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl shadow-soft transition-transform " +
                        (s.active
                          ? "bg-primary text-primary-foreground ring-8 ring-primary/15"
                          : "border border-border bg-card text-primary")
                      }
                    >
                      <Icon className="h-6 w-6" />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 font-display text-lg font-bold tracking-tight">{s.title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ───────────────────────── CTA ───────────────────────── */}
        <section className="relative bg-background py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-foreground to-foreground/90 px-8 py-14 text-center shadow-elevated sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-danger/25 blur-3xl" />

              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-background backdrop-blur">
                  <Shield className="h-3 w-3" /> Stay protected
                </span>
                <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-background sm:text-4xl md:text-5xl">
                  Don't be the next student who falls for it.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-background/75">
                  Check any opportunity in seconds. No account. No catch. Just clarity.
                </p>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <Button asChild size="lg" className="h-12 rounded-xl bg-background px-6 text-base text-foreground hover:bg-background/90">
                    <Link to="/analyze">
                      Start Your First Scan <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border-white/20 bg-transparent px-6 text-base text-background hover:bg-white/10 hover:text-background"
                  >
                    <Link to="/community">Browse Community Reports</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
