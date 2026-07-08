import { createFileRoute } from "@tanstack/react-router";
import { Laptop, Smartphone, Monitor, Tablet, Headphones, Package, Plus } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle, StatCard, Chip } from "@/components/layout/primitives";
import { ASSETS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/assets")({ component: Assets });

const iconFor = (t: string) => ({ Laptop, Phone: Smartphone, Monitor, Tablet, Headphones }[t] ?? Package);

function Assets() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Equipment"
        title="Asset management"
        subtitle="Every device assigned to every colleague — tracked, maintained, returned."
        actions={<button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury inline-flex items-center gap-2"><Plus className="size-4" /> Assign asset</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard index={0} label="Total assets" value="1,284" accent="primary" icon={<Package className="size-5" />} />
        <StatCard index={1} label="Assigned" value="1,102" delta="86%" accent="gold" icon={<Laptop className="size-5" />} />
        <StatCard index={2} label="In stock" value={148} accent="success" icon={<Package className="size-5" />} />
        <StatCard index={3} label="Maintenance" value={34} accent="warning" icon={<Package className="size-5" />} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { t: "Laptop", n: 412, icon: Laptop },
          { t: "Phone", n: 386, icon: Smartphone },
          { t: "Monitor", n: 248, icon: Monitor },
          { t: "Tablet", n: 122, icon: Tablet },
          { t: "Headphones", n: 116, icon: Headphones },
        ].map((c) => (
          <div key={c.t} className="p-4 rounded-2xl border card-lift">
            <div className="size-10 rounded-lg gradient-primary grid place-items-center text-primary-foreground"><c.icon className="size-5" /></div>
            <div className="mt-3 font-display text-2xl font-semibold">{c.n}</div>
            <div className="text-xs text-muted-foreground">{c.t}</div>
          </div>
        ))}
      </div>

      <LuxeCard>
        <SectionTitle title="Assigned devices" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                {["ID","Type","Model","Assigned To","Assigned On","Status"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {ASSETS.map((a) => {
                const Icon = iconFor(a.type);
                return (
                  <tr key={a.id} className="border-t hover:bg-muted/40">
                    <td className="px-5 py-3 font-mono text-xs">{a.id}</td>
                    <td className="px-5 py-3"><div className="flex items-center gap-2"><Icon className="size-4 text-muted-foreground" /> {a.type}</div></td>
                    <td className="px-5 py-3 font-medium">{a.model}</td>
                    <td className="px-5 py-3 text-muted-foreground">{a.assignedTo}</td>
                    <td className="px-5 py-3 text-muted-foreground">{a.assignedDate}</td>
                    <td className="px-5 py-3"><Chip tone={a.status === "Assigned" ? "gold" : "success"}>{a.status}</Chip></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </LuxeCard>
    </div>
  );
}
