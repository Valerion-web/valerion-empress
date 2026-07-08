import { createFileRoute } from "@tanstack/react-router";
import { Plus, MapPin, Users, Calendar } from "lucide-react";
import { PageHeader, LuxeCard, StatCard, SectionTitle, Chip } from "@/components/layout/primitives";
import { OPEN_POSITIONS, CANDIDATES, RECRUITMENT_FUNNEL } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/recruitment")({ component: Recruitment });

const stages = ["Applied", "Screening", "Interview", "Offer", "Hired"];

function Recruitment() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Talent"
        title="Recruitment"
        subtitle="Attract, evaluate and welcome the artisans of tomorrow."
        actions={<button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury inline-flex items-center gap-2"><Plus className="size-4" /> New job</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard index={0} label="Open positions" value={OPEN_POSITIONS.length} delta="+2 this month" accent="gold" />
        <StatCard index={1} label="Total applicants" value="581" delta="+124 this week" accent="primary" />
        <StatCard index={2} label="Interviews · week" value={17} accent="info" />
        <StatCard index={3} label="Offers · pending" value={5} accent="warning" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <LuxeCard className="xl:col-span-2">
          <SectionTitle title="Hiring pipeline" description="Candidates by stage" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={RECRUITMENT_FUNNEL} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="var(--gold)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Source performance" />
          <div className="space-y-3">
            {[
              { s: "LinkedIn", v: 42, pct: 76 },
              { s: "Referrals", v: 28, pct: 92 },
              { s: "Careers site", v: 61, pct: 54 },
              { s: "Agencies", v: 18, pct: 68 },
            ].map((s) => (
              <div key={s.s}>
                <div className="flex justify-between text-xs mb-1"><span className="font-medium">{s.s}</span><span className="text-muted-foreground">{s.v} · {s.pct}% quality</span></div>
                <div className="h-2 rounded-full bg-muted overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 0.7 }} className="h-full gradient-gold" /></div>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>

      <LuxeCard>
        <SectionTitle title="Open positions" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {OPEN_POSITIONS.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="p-4 rounded-2xl border card-lift">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{p.dept}</div>
                </div>
                <Chip tone={p.status === "Active" ? "gold" : "info"}>{p.status}</Chip>
              </div>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {p.location}</span>
                <span className="inline-flex items-center gap-1"><Users className="size-3" /> {p.applicants}</span>
                <span className="inline-flex items-center gap-1"><Calendar className="size-3" /> {p.posted}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </LuxeCard>

      <LuxeCard>
        <SectionTitle title="Candidate pipeline (Kanban)" description="Drag to advance stages" />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {stages.map((stage) => {
            const items = CANDIDATES.filter((c) => c.stage === stage || (stage === "Applied" && !CANDIDATES.some(x => x.stage === "Applied") && c.stage === "Screening"));
            return (
              <div key={stage} className="rounded-2xl bg-muted/40 p-3">
                <div className="flex items-center justify-between px-1 mb-3">
                  <div className="text-xs uppercase tracking-wider font-semibold">{stage}</div>
                  <Chip>{items.length}</Chip>
                </div>
                <div className="space-y-2">
                  {items.map((c) => (
                    <div key={c.name} className="p-3 rounded-xl bg-card border shadow-sm hover:shadow-luxury transition cursor-grab">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-full gradient-gold grid place-items-center text-gold-foreground text-[11px] font-bold">
                          {c.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">{c.role}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">{c.source}</span>
                        <span className="font-display font-semibold text-gradient-gold">{c.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </LuxeCard>
    </div>
  );
}
