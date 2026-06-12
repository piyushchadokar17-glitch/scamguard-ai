import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, ShieldQuestion, Sparkles } from "lucide-react";
import type { AnalysisResult } from "@/lib/analyze.functions";
import { cn } from "@/lib/utils";

function RiskRing({ score, verdict }: { score: number; verdict: AnalysisResult["verdict"] }) {
  const color =
    verdict === "SAFE" ? "var(--color-success)" :
    verdict === "SUSPICIOUS" ? "var(--color-warning)" :
    "var(--color-danger)";
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" stroke="var(--color-border)" strokeWidth="8" fill="none" />
        <circle
          cx="50" cy="50" r="42" stroke={color} strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Risk</span>
      </div>
    </div>
  );
}

const verdictStyles: Record<AnalysisResult["verdict"], { label: string; icon: typeof ShieldCheck; cls: string; soft: string }> = {
  SAFE: { label: "Looks Safe", icon: ShieldCheck, cls: "text-success", soft: "bg-success-soft border-success/30" },
  SUSPICIOUS: { label: "Suspicious", icon: ShieldQuestion, cls: "text-warning-foreground", soft: "bg-warning-soft border-warning/30" },
  SCAM: { label: "Scam Detected", icon: ShieldAlert, cls: "text-danger", soft: "bg-danger-soft border-danger/30" },
};

export function AnalysisResults({ result }: { result: AnalysisResult }) {
  const v = verdictStyles[result.verdict];
  const Icon = v.icon;
  return (
    <div className="space-y-5">
      <div className={cn("rounded-2xl border-l-4 p-6 shadow-soft", v.soft)}
           style={{ borderLeftColor: result.verdict === "SAFE" ? "var(--color-success)" : result.verdict === "SUSPICIOUS" ? "var(--color-warning)" : "var(--color-danger)" }}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Analysis Results</h3>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide", v.cls)}>
            <Icon className="h-3.5 w-3.5" />
            {v.label}
          </span>
        </div>
        <div className="mt-5 flex items-center gap-6">
          <RiskRing score={result.riskScore} verdict={result.verdict} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{result.verdict === "SCAM" ? "Critical Risk Identified" : result.verdict === "SUSPICIOUS" ? "Proceed With Caution" : "No Significant Threat Detected"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{result.explanation || "No additional explanation provided."}</p>
          </div>
        </div>
      </div>

      {result.redFlags.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-danger-soft">
              <AlertTriangle className="h-4 w-4 text-danger" />
            </div>
            <h4 className="font-display text-base font-bold">Critical Red Flags</h4>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.redFlags.map((f, i) => (
              <div key={i} className="rounded-xl border border-danger/20 bg-danger-soft/60 p-4">
                <p className="text-sm font-semibold text-danger">{f.title}</p>
                <p className="mt-1 text-xs text-foreground/80">{f.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-display text-base font-bold">AI Forensic Breakdown</h4>
        </div>
        <p className="text-sm leading-relaxed text-foreground/80">{result.explanation}</p>
      </div>

      {result.recommendedActions.length > 0 && (
        <div className="rounded-2xl border border-border bg-primary-soft/40 p-6 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h4 className="font-display text-base font-bold">Recommended Actions</h4>
          </div>
          <ul className="space-y-2">
            {result.recommendedActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
