import { createFileRoute } from "@tanstack/react-router";
import { LogOut, FileCheck, Package, MessageSquare, Award } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle, Chip } from "@/components/layout/primitives";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/exit")({ component: Exit });

const checklist = [
  { name: "Return of assets", icon: Package },
  { name: "Knowledge transfer document", icon: FileCheck },
  { name: "Exit interview", icon: MessageSquare },
  { name: "Final settlement", icon: FileCheck },
  { name: "Reference letter", icon: Award },
];

function Exit() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Farewell"
        title="Exit management"
        subtitle="A dignified departure — the Valerion way."
        actions={<button className="h-10 px-4 rounded-xl border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 inline-flex items-center gap-2"><LogOut className="size-4" /> Initiate exit</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LuxeCard className="lg:col-span-2">
          <SectionTitle title="Exit checklist" />
          <div className="space-y-2">
            {checklist.map((c, i) => (
              <motion.div key={c.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl border">
                <div className="size-10 rounded-xl bg-muted grid place-items-center"><c.icon className="size-5 text-muted-foreground" /></div>
                <div className="flex-1">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground">Owner: People & Culture</div>
                </div>
                <Chip>Pending</Chip>
              </motion.div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Recent alumni · 90 days" />
          <div className="space-y-3">
            {[
              { name: "Rania Sultan", role: "Boutique Associate", when: "2w ago" },
              { name: "Diego Fernández", role: "Analyst", when: "1m ago" },
              { name: "Silas Reyes", role: "Coordinator", when: "2m ago" },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-muted grid place-items-center text-xs font-semibold">{p.name.split(" ").map(n=>n[0]).join("")}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{p.role} · {p.when}</div>
                </div>
                <Chip tone="gold">Alumni</Chip>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>
    </div>
  );
}
