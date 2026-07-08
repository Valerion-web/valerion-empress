import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle, Chip } from "@/components/layout/primitives";
import { PROJECTS } from "@/lib/mock-data";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/projects")({ component: Projects });

function Projects() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Delivery"
        title="Projects"
        subtitle="Cross-functional initiatives shaping the House."
        actions={<button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury inline-flex items-center gap-2"><Plus className="size-4" /> New project</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PROJECTS.map((p, i) => (
          <motion.div key={p.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border p-6 card-lift">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-xl font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-1">Led by {p.lead} · {p.team} contributors</div>
              </div>
              <Chip tone={p.status === "At Risk" ? "warning" : "success"}>{p.status}</Chip>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline justify-between text-xs mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{p.progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 0.8, delay: i * 0.05 }} className="h-full gradient-gold" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
              <div><div className="text-muted-foreground">Deadline</div><div className="font-medium mt-0.5">{p.deadline}</div></div>
              <div><div className="text-muted-foreground">Milestones</div><div className="font-medium mt-0.5">6 / 8</div></div>
              <div><div className="text-muted-foreground">Budget</div><div className="font-medium mt-0.5 text-gradient-gold font-display">€ 1.2M</div></div>
            </div>

            <div className="mt-5 flex items-center -space-x-2">
              {Array.from({ length: Math.min(6, p.team) }).map((_, k) => (
                <div key={k} className="size-8 rounded-full gradient-primary border-2 border-card grid place-items-center text-primary-foreground text-[10px] font-semibold">
                  {["EM","AR","SB","CD","LP","YN"][k]}
                </div>
              ))}
              {p.team > 6 && <div className="size-8 rounded-full bg-muted border-2 border-card grid place-items-center text-[10px] font-semibold">+{p.team - 6}</div>}
            </div>
          </motion.div>
        ))}
      </div>

      <LuxeCard>
        <SectionTitle title="Delivery timeline" />
        <div className="space-y-3">
          {PROJECTS.map((p, i) => (
            <div key={p.name} className="flex items-center gap-4">
              <div className="w-56 shrink-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-[11px] text-muted-foreground">{p.deadline}</div>
              </div>
              <div className="flex-1 h-6 rounded-full bg-muted relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 0.8, delay: i * 0.05 }}
                  className={`h-full ${p.status === "At Risk" ? "bg-warning" : "gradient-gold"} flex items-center px-3 text-[11px] font-semibold text-gold-foreground`}
                >
                  {p.progress}%
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </LuxeCard>
    </div>
  );
}
