import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, Download } from "lucide-react";
import { PageHeader, LuxeCard, Chip } from "@/components/layout/primitives";
import { AUDIT_LOGS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/audit")({ component: Audit });

const extended = Array.from({ length: 8 }).flatMap((_, k) =>
  AUDIT_LOGS.map((l, i) => ({ ...l, id: `${k}-${i}`, time: `${11 + k}:${String((i * 7) % 60).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}` }))
);

function Audit() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Governance"
        title="Audit logs"
        subtitle="Immutable, timestamped record of every meaningful action in the platform."
        actions={<button className="h-10 px-4 rounded-xl border text-sm font-medium hover:bg-muted inline-flex items-center gap-2"><Download className="size-4" /> Export CSV</button>}
      />

      <LuxeCard>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search by user, action, target, IP…" className="w-full h-10 pl-10 pr-3 rounded-xl bg-muted/60 border border-transparent focus:border-gold focus:bg-card outline-none text-sm" />
          </div>
          {["Today","7 days","30 days","Custom"].map((r, i) => (
            <button key={r} className={`h-10 px-3 rounded-lg text-xs font-medium ${i === 1 ? "gradient-gold text-gold-foreground shadow-gold" : "border hover:bg-muted"}`}>{r}</button>
          ))}
          <button className="h-10 px-3 rounded-lg border text-xs inline-flex items-center gap-1"><Filter className="size-3.5" /> Filter</button>
        </div>
      </LuxeCard>

      <LuxeCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto max-h-[70vh] scrollbar-luxe">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 sticky top-0">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                {["Time","User","Action","Target","IP","Severity"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {extended.map((l, i) => (
                <tr key={l.id} className="border-t hover:bg-muted/40">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.time}</td>
                  <td className="px-5 py-3 font-medium">{l.user}</td>
                  <td className="px-5 py-3">{l.action}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.target}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.ip}</td>
                  <td className="px-5 py-3"><Chip tone={i % 9 === 0 ? "warning" : i % 5 === 0 ? "info" : "success"}>{i % 9 === 0 ? "Warning" : i % 5 === 0 ? "Info" : "OK"}</Chip></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LuxeCard>
    </div>
  );
}
