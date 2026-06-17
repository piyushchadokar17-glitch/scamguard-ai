import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  AlertOctagon,
  BadgeCheck,
  ExternalLink,
  Loader2,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { cn } from "@/lib/utils";
import { listCommunityReports, submitCommunityReport } from "@/lib/analyze.functions";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Scam Reports · Scam Shield" },
      {
        name: "description",
        content:
          "Browse verified scam reports submitted by students and researchers. Every report is AI-verified.",
      },
    ],
  }),
  component: CommunityPage,
});

const SCAM_TYPES = [
  "Fake Internship",
  "Fake Scholarship",
  "Phishing Site",
  "Predatory Journal",
  "Fake Recruiter",
  "Fake Offer Letter",
  "WhatsApp Scam",
  "Other",
];

const QUICK_FILTERS = ["All", ...SCAM_TYPES];

function riskTone(score: number | null | undefined) {
  if (score == null) return { label: "Unscored", className: "bg-muted text-muted-foreground" };
  if (score >= 75) return { label: "High Risk", className: "bg-danger-soft text-danger" };
  if (score >= 40)
    return { label: "Suspicious", className: "bg-warning-soft text-warning-foreground" };
  return { label: "Low Risk", className: "bg-success-soft text-success" };
}

function CommunityPage() {
  const list = useServerFn(listCommunityReports);
  const submit = useServerFn(submitCommunityReport);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["community-reports"],
    queryFn: () => list(),
  });

  const [form, setForm] = useState({
    companyName: "",
    website: "",
    scamType: "Fake Internship",
    description: "",
    evidenceUrl: "",
  });

  const mutation = useMutation({
    mutationFn: () => submit({ data: form }),
    onSuccess: () => {
      toast.success("Report submitted and AI-verified");
      qc.invalidateQueries({ queryKey: ["community-reports"] });
      setOpen(false);
      setForm({
        companyName: "",
        website: "",
        scamType: "Fake Internship",
        description: "",
        evidenceUrl: "",
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleSubmit() {
    if (isSubmitting || mutation.isPending) return;
    setIsSubmitting(true);
    try {
      await mutation.mutateAsync();
    } catch {
      // Error already handled by onError above
    } finally {
      setIsSubmitting(false);
    }
  }

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    const matchesQ =
      !q ||
      r.company_name.toLowerCase().includes(q) ||
      (r.website ?? "").toLowerCase().includes(q) ||
      r.scam_type.toLowerCase().includes(q);
    const matchesFilter = activeFilter === "All" || r.scam_type === activeFilter;
    return matchesQ && matchesFilter;
  });

  const stats = useMemo(() => {
    const total = reports.length;
    const verified = reports.filter((r) => r.ai_verified).length;
    const contributors = reports.reduce((sum, r) => sum + (r.report_count ?? 1), 0);
    return { total, verified, contributors };
  }, [reports]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1 bg-hero-gradient">
        {/* Hero */}
        <section className="border-b border-border/60 bg-grid-soft">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 sm:flex sm:flex-wrap sm:justify-between">
              <div className="min-w-0 max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  Community-powered
                </span>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">
                  Scams reported. <span className="text-gradient-brand">Verified by AI.</span>
                </h1>
                <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                  A living database of fake internships, phishing sites and predatory recruiters —
                  submitted by students, validated by Gemini.
                </p>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="shrink-0 rounded-xl shadow-elevated">
                    <AlertOctagon className="mr-2 h-4 w-4" />
                    Report a Scam
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Report a Scam</DialogTitle>
                    <DialogDescription>
                      Help protect other students. Your report will be auto-verified by AI.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <Label>Company / Organization Name</Label>
                      <Input
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        placeholder="e.g. Global Research Index"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Website (optional)</Label>
                      <Input
                        value={form.website}
                        onChange={(e) => setForm({ ...form, website: e.target.value })}
                        placeholder="example.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Scam Type</Label>
                      <Select
                        value={form.scamType}
                        onValueChange={(v) => setForm({ ...form, scamType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SCAM_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="What happened? What red flags did you notice?"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Evidence URL (optional)</Label>
                      <Input
                        value={form.evidenceUrl}
                        onChange={(e) => setForm({ ...form, evidenceUrl: e.target.value })}
                        placeholder="Link to screenshot or post"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting || mutation.isPending}
                      className="rounded-xl"
                    >
                      {isSubmitting || mutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                        </>
                      ) : (
                        "Submit Report"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats strip */}
            <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6">
              {[
                { label: "Total Reports", value: stats.total, icon: ShieldAlert },
                { label: "AI Verified", value: stats.verified, icon: BadgeCheck },
                { label: "Contributors", value: stats.contributors, icon: Users },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur sm:p-5"
                >
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate">{label}</span>
                  </div>
                  <div className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                    {value.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Search + filters */}
        <section className="sticky top-[57px] z-30 border-b border-border/60 bg-background/85 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by company, website, or scam type…"
                  className="h-11 rounded-xl border-border/70 pl-10 pr-10 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:pb-0">
                {QUICK_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={cn(
                      "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                      activeFilter === f
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-semibold">
              {isLoading
                ? "Loading reports…"
                : `${filtered.length} ${filtered.length === 1 ? "report" : "reports"}`}
            </h2>
            {!isLoading && activeFilter !== "All" && (
              <button
                onClick={() => setActiveFilter("All")}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-2xl border border-border bg-card/60"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-14 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-4 font-display text-base font-semibold">No matching reports</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different keyword, or be the first to report this one.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => {
                const tone = riskTone(r.ai_risk_score);
                return (
                  <article
                    key={r.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated"
                  >
                    {/* Top accent bar */}
                    <div
                      className={cn(
                        "h-1 w-full",
                        (r.ai_risk_score ?? 0) >= 75
                          ? "bg-danger"
                          : (r.ai_risk_score ?? 0) >= 40
                            ? "bg-warning"
                            : "bg-success",
                      )}
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-display text-base font-bold leading-tight">
                            {r.company_name}
                          </h3>
                          {r.website && (
                            <a
                              href={
                                r.website.startsWith("http") ? r.website : `https://${r.website}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="mt-0.5 inline-flex max-w-full items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <span className="truncate">{r.website}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          )}
                        </div>
                        {r.ai_verified ? (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success/30 bg-success-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
                            <BadgeCheck className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-warning/30 bg-warning-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-warning-foreground">
                            <Sparkles className="h-3 w-3" /> Review
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                          {r.scam_type}
                        </span>
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                            tone.className,
                          )}
                        >
                          {tone.label}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground/80">
                        {r.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" /> {r.report_count} reported
                        </span>
                        {r.ai_risk_score != null && (
                          <span className="font-display font-bold text-foreground">
                            {r.ai_risk_score}
                            <span className="text-xs font-medium text-muted-foreground">/100</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
