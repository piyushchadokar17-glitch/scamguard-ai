import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Flag,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
} from "lucide-react";
import type { AnalysisResult } from "@/lib/analyze.functions";
import { cn } from "@/lib/utils";

type Verdict = AnalysisResult["verdict"];

const verdictTheme: Record<
  Verdict,
  {
    label: string;
    headline: string;
    icon: typeof ShieldCheck;
    color: string; // css var
    text: string; // tailwind text class
    chipBg: string;
    ringSoft: string;
    gradient: string;
  }
> = {
  SAFE: {
    label: "Looks Safe",
    headline: "No significant threat detected",
    icon: ShieldCheck,
    color: "var(--color-success)",
    text: "text-success",
    chipBg: "bg-success-soft",
    ringSoft: "ring-success/20",
    gradient:
      "linear-gradient(135deg, color-mix(in oklab, var(--color-success) 16%, transparent), transparent 60%)",
  },
  SUSPICIOUS: {
    label: "Suspicious",
    headline: "Proceed with caution",
    icon: ShieldQuestion,
    color: "var(--color-warning)",
    text: "text-warning-foreground",
    chipBg: "bg-warning-soft",
    ringSoft: "ring-warning/30",
    gradient:
      "linear-gradient(135deg, color-mix(in oklab, var(--color-warning) 22%, transparent), transparent 60%)",
  },
  SCAM: {
    label: "Scam Detected",
    headline: "Critical risk identified",
    icon: ShieldAlert,
    color: "var(--color-danger)",
    text: "text-danger",
    chipBg: "bg-danger-soft",
    ringSoft: "ring-danger/30",
    gradient:
      "linear-gradient(135deg, color-mix(in oklab, var(--color-danger) 22%, transparent), transparent 60%)",
  },
};

function RiskRing({ score, color }: { score: number; color: string }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <div className="relative h-36 w-36 shrink-0 sm:h-40 sm:w-40">
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-60"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 65%)` }}
        aria-hidden
      />
      <svg className="relative h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} stroke="var(--color-border)" strokeWidth="7" fill="none" />
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke={color}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display text-4xl font-extrabold tabular-nums leading-none sm:text-5xl"
          style={{ color }}
        >
          {score}
        </span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Risk / 100
        </span>
      </div>
    </div>
  );
}

function RiskScale({ score, color }: { score: number; color: string }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="mt-5">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, var(--color-success), var(--color-warning) 55%, var(--color-danger))`,
          }}
        />
        <div
          className="absolute top-1/2 h-4 w-1 -translate-y-1/2 rounded-full border border-background shadow"
          style={{ left: `calc(${pct}% - 2px)`, background: color }}
          aria-hidden
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <span>Safe</span>
        <span>Suspicious</span>
        <span>Scam</span>
      </div>
    </div>
  );
}

export function AnalysisResults({ result }: { result: AnalysisResult }) {
  const v = verdictTheme[result.verdict];
  const Icon = v.icon;

  return (
    <div className="space-y-5">
      {/* Verdict Hero */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card shadow-elevated ring-1",
          v.ringSoft,
        )}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: v.gradient }} aria-hidden />
        <div
          className="absolute left-0 top-0 h-full w-1.5"
          style={{ background: v.color }}
          aria-hidden
        />
        <div className="relative p-6 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" /> Gemini Analysis
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-sm",
                v.chipBg,
                v.text,
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {v.label}
            </span>
          </div>

          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
            <RiskRing score={result.riskScore} color={v.color} />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Verdict
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {v.headline}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {result.explanation || "No additional explanation provided."}
              </p>
              <RiskScale score={result.riskScore} color={v.color} />
            </div>
          </div>
        </div>
      </div>

      {/* Red Flags */}
      {result.redFlags.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-danger-soft text-danger">
                <Flag className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-base font-bold leading-tight">Red Flags</h4>
                <p className="text-xs text-muted-foreground">Signals that triggered the alert</p>
              </div>
            </div>
            <span className="rounded-full bg-danger-soft px-2.5 py-1 text-xs font-bold text-danger">
              {result.redFlags.length}
            </span>
          </div>
          <ol className="space-y-2.5">
            {result.redFlags.map((f, i) => (
              <li
                key={i}
                className="group flex gap-3 rounded-xl border border-danger/15 bg-danger-soft/40 p-3.5 transition-colors hover:bg-danger-soft/70"
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-danger text-[11px] font-bold text-danger-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{f.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-foreground/75">
                    {f.explanation}
                  </p>
                </div>
                <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-danger/70 transition-transform group-hover:scale-110" />
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* AI Explanation */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card p-6 shadow-soft">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mb-4 flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display text-base font-bold leading-tight">AI Forensic Breakdown</h4>
            <p className="text-xs text-muted-foreground">How Gemini reasoned about this case</p>
          </div>
        </div>
        <p className="relative border-l-2 border-primary/30 pl-4 text-sm leading-relaxed text-foreground/85">
          {result.explanation}
        </p>
      </div>

      {/* Action Guide */}
      {result.recommendedActions.length > 0 && (
        <div
          className="relative overflow-hidden rounded-2xl border border-border p-6 shadow-soft"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 10%, var(--color-card)), var(--color-card))",
          }}
        >
          <div className="mb-4 flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-display text-base font-bold leading-tight">What you should do</h4>
              <p className="text-xs text-muted-foreground">Recommended next steps</p>
            </div>
          </div>
          <ul className="space-y-2.5">
            {result.recommendedActions.map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border bg-background/70 p-3 backdrop-blur transition-colors hover:border-primary/40"
              >
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm leading-relaxed text-foreground">{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
