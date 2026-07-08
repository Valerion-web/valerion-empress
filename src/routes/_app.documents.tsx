import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download, Upload, Search } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle, Chip } from "@/components/layout/primitives";
import { DOCUMENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/documents")({ component: Documents });

function Documents() {
  const categories = ["All","Contracts","Payroll","Performance","Benefits","Identity","Training"];
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Vault"
        title="Documents"
        subtitle="Your personal encrypted vault — contracts, payslips, certificates and identity."
        actions={<button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury inline-flex items-center gap-2"><Upload className="size-4" /> Upload</button>}
      />

      <LuxeCard>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input placeholder="Search documents…" className="w-full h-10 pl-10 pr-3 rounded-xl bg-muted/60 border border-transparent focus:border-gold focus:bg-card outline-none text-sm" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c, i) => (
              <button key={c} className={`h-9 px-3 rounded-full text-xs font-medium ${i === 0 ? "gradient-gold text-gold-foreground shadow-gold" : "border hover:bg-muted"}`}>{c}</button>
            ))}
          </div>
        </div>
      </LuxeCard>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {DOCUMENTS.map((d) => (
          <div key={d.name} className="rounded-2xl border p-4 card-lift flex items-center gap-4">
            <div className="size-12 rounded-xl gradient-primary grid place-items-center text-primary-foreground shrink-0"><FileText className="size-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{d.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{d.category} · {d.size} · {d.updated}</div>
              <div className="mt-2 flex items-center gap-2">
                <Chip tone="gold">{d.category}</Chip>
                <Chip tone="success">Encrypted</Chip>
              </div>
            </div>
            <button className="size-10 grid place-items-center rounded-lg border hover:bg-muted"><Download className="size-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
