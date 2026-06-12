import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AlertOctagon, BadgeCheck, Loader2, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { listCommunityReports, submitCommunityReport } from "@/lib/analyze.functions";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community Scam Reports · Scam Shield" },
      { name: "description", content: "Browse verified scam reports submitted by students and researchers. Every report is AI-verified." },
    ],
  }),
  component: CommunityPage,
});

const SCAM_TYPES = ["Fake Internship", "Fake Scholarship", "Phishing Site", "Predatory Journal", "Fake Recruiter", "Fake Offer Letter", "WhatsApp Scam", "Other"];

function CommunityPage() {
  const list = useServerFn(listCommunityReports);
  const submit = useServerFn(submitCommunityReport);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["community-reports"],
    queryFn: () => list(),
  });

  const [form, setForm] = useState({ companyName: "", website: "", scamType: "Fake Internship", description: "", evidenceUrl: "" });

  const mutation = useMutation({
    mutationFn: () => submit({ data: form }),
    onSuccess: () => {
      toast.success("Report submitted and AI-verified");
      qc.invalidateQueries({ queryKey: ["community-reports"] });
      setOpen(false);
      setForm({ companyName: "", website: "", scamType: "Fake Internship", description: "", evidenceUrl: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.company_name.toLowerCase().includes(q) || (r.website ?? "").toLowerCase().includes(q) || r.scam_type.toLowerCase().includes(q);
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1 bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">Community Reports</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">Explore verified reports from fellow researchers and students to stay protected against academic fraud.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-xl"><AlertOctagon className="mr-2 h-4 w-4" /> Report Scam</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Report a Scam</DialogTitle>
                  <DialogDescription>Help protect other students. Your report will be auto-verified by AI.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label>Company / Organization Name</Label>
                    <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="e.g. Global Research Index" />
                  </div>
                  <div>
                    <Label>Website (optional)</Label>
                    <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="example.com" />
                  </div>
                  <div>
                    <Label>Scam Type</Label>
                    <Select value={form.scamType} onValueChange={(v) => setForm({ ...form, scamType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SCAM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What happened? What red flags did you notice?" rows={4} />
                  </div>
                  <div>
                    <Label>Evidence URL (optional)</Label>
                    <Input value={form.evidenceUrl} onChange={(e) => setForm({ ...form, evidenceUrl: e.target.value })} placeholder="Link to screenshot or post" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="rounded-xl">
                    {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</> : "Submit Report"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company name, URL, or scam type…" className="rounded-xl pl-9" />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">No reports match your search.</div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((r) => (
                <article key={r.id} className="rounded-2xl border-l-4 border-danger border-border bg-card p-5 shadow-soft transition-all hover:shadow-elevated">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-bold">{r.company_name}</h3>
                      {r.website && <a href={r.website.startsWith("http") ? r.website : `https://${r.website}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{r.website}</a>}
                    </div>
                    {r.ai_verified ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-bold uppercase text-success"><BadgeCheck className="h-3 w-3" /> AI Verified</span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-bold uppercase text-warning-foreground">Needs Review</span>
                    )}
                  </div>
                  <div className="mt-3 inline-block rounded-md bg-muted px-2.5 py-1 text-xs">
                    <span className="font-semibold">Type:</span> {r.scam_type}
                  </div>
                  <p className="mt-3 text-sm text-foreground/80">{r.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {r.report_count} reported</span>
                    {r.ai_risk_score != null && <span className="font-semibold text-danger">Risk: {r.ai_risk_score}%</span>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
