import { createFileRoute } from "@tanstack/react-router";
import { FileBarChart2, Download, FileText, Filter } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle, Chip } from "@/components/layout/primitives";

export const Route = createFileRoute("/_app/reports")({ component: Reports });

const reports = [
  { name: "Attendance summary", category: "Attendance", updated: "Today", format: "Excel", size: "2.4 MB" },
  { name: "Payroll — November 2025", category: "Payroll", updated: "Nov 30", format: "PDF", size: "1.2 MB" },
  { name: "Leave utilisation Q3", category: "Leave", updated: "Oct 4", format: "PDF", size: "820 KB" },
  { name: "Recruitment funnel — YTD", category: "Recruitment", updated: "Today", format: "Excel", size: "3.1 MB" },
  { name: "Performance calibration Q3", category: "Performance", updated: "Sep 22", format: "PDF", size: "4.6 MB" },
  { name: "Headcount by department", category: "Employee", updated: "Today", format: "Excel", size: "540 KB" },
  { name: "Diversity & inclusion — H2", category: "Employee", updated: "Nov 10", format: "PDF", size: "2.2 MB" },
  { name: "Training completion — mandatory", category: "Learning", updated: "Nov 28", format: "Excel", size: "1.8 MB" },
];

function Reports() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documentation"
        title="Reports"
        subtitle="Every recurring workforce report — one click from your inbox."
        actions={<button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury inline-flex items-center gap-2"><FileBarChart2 className="size-4" /> Build report</button>}
      />

      <LuxeCard>
        <div className="flex flex-wrap items-center gap-2">
          {["All","Attendance","Payroll","Leave","Recruitment","Performance","Employee","Learning"].map((f, i) => (
            <button key={f} className={`h-9 px-3 rounded-full text-xs font-medium ${i === 0 ? "gradient-gold text-gold-foreground shadow-gold" : "border hover:bg-muted"}`}>{f}</button>
          ))}
          <button className="ml-auto h-9 px-3 rounded-lg border text-xs inline-flex items-center gap-2"><Filter className="size-3.5" /> Advanced</button>
        </div>
      </LuxeCard>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {reports.map((r, i) => (
          <div key={r.name} className="rounded-2xl border p-4 card-lift">
            <div className="flex items-start justify-between">
              <div className="size-11 rounded-xl gradient-primary grid place-items-center text-primary-foreground"><FileText className="size-5" /></div>
              <Chip tone="gold">{r.format}</Chip>
            </div>
            <div className="mt-4 font-semibold text-sm">{r.name}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{r.category} · {r.size} · updated {r.updated}</div>
            <button className="mt-4 w-full h-9 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold inline-flex items-center justify-center gap-2"><Download className="size-3.5" /> Download</button>
          </div>
        ))}
      </div>

      <LuxeCard>
        <SectionTitle title="Scheduled reports" description="Delivered automatically to stakeholders" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                {["Report","Recipients","Frequency","Next run","Format"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {[
                { r: "Weekly leadership pulse", rec: "Executive Committee", f: "Weekly · Mon 08:00", next: "Dec 8", fmt: "PDF" },
                { r: "Monthly payroll digest", rec: "Finance, HR", f: "Monthly · 1st", next: "Jan 1", fmt: "Excel" },
                { r: "Quarterly board deck", rec: "Board of Directors", f: "Quarterly", next: "Jan 15", fmt: "PDF" },
                { r: "Boutique performance", rec: "Retail directors", f: "Weekly · Fri", next: "Dec 5", fmt: "Excel" },
              ].map((s) => (
                <tr key={s.r} className="border-t hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{s.r}</td>
                  <td className="px-5 py-3 text-muted-foreground">{s.rec}</td>
                  <td className="px-5 py-3">{s.f}</td>
                  <td className="px-5 py-3 text-muted-foreground">{s.next}</td>
                  <td className="px-5 py-3"><Chip tone="gold">{s.fmt}</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LuxeCard>
    </div>
  );
}
