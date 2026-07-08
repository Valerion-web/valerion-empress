import { createFileRoute } from "@tanstack/react-router";
import { Target, Star, TrendingUp, Award } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle, StatCard, Chip } from "@/components/layout/primitives";
import { EMPLOYEES } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/_app/performance")({ component: Performance });

const kpis = [
  { subject: "Craft", A: 92 },
  { subject: "Client focus", A: 88 },
  { subject: "Innovation", A: 78 },
  { subject: "Teamwork", A: 95 },
  { subject: "Leadership", A: 72 },
  { subject: "Discipline", A: 90 },
];
const goals = [
  { g: "Launch A/W'26 mood board", progress: 82, due: "Feb 14" },
  { g: "Mentor 2 junior artisans", progress: 60, due: "Ongoing" },
  { g: "Complete Sustainability certification", progress: 40, due: "Apr 30" },
  { g: "Reduce cutting waste by 15%", progress: 74, due: "Q1'26" },
];
const trend = Array.from({length:8}).map((_,i)=>({q:`Q${(i%4)+1} '${23+Math.floor(i/4)}`,score:3.8+(i*0.12)}));

function Performance() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Growth"
        title="Performance"
        subtitle="Goals, KPIs, reviews and promotions — a continuous conversation about craft."
        actions={<button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury">Start review</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard index={0} label="Overall score" value="4.6" delta="+0.2 QoQ" icon={<Star className="size-5" />} accent="gold" />
        <StatCard index={1} label="Active goals" value={goals.length} icon={<Target className="size-5" />} accent="primary" />
        <StatCard index={2} label="Reviews pending" value={7} icon={<TrendingUp className="size-5" />} accent="warning" />
        <StatCard index={3} label="Promotions · YTD" value={12} icon={<Award className="size-5" />} accent="success" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <LuxeCard>
          <SectionTitle title="Competency map" />
          <div className="h-72">
            <ResponsiveContainer>
              <RadarChart data={kpis}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <PolarRadiusAxis stroke="var(--border)" tick={false} />
                <Radar dataKey="A" stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>

        <LuxeCard className="xl:col-span-2">
          <SectionTitle title="Performance trend · 8 quarters" />
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <XAxis dataKey="q" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis domain={[3,5]} stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="score" stroke="var(--gold)" strokeWidth={3} dot={{ r: 5, fill: "var(--gold)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LuxeCard>
          <SectionTitle title="Active goals" />
          <div className="space-y-4">
            {goals.map((g, i) => (
              <div key={g.g}>
                <div className="flex items-baseline justify-between text-sm mb-1.5">
                  <span className="font-medium">{g.g}</span>
                  <span className="text-xs text-muted-foreground">Due {g.due}</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 0.8, delay: i * 0.05 }} className="h-full gradient-gold" />
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">{g.progress}% complete</div>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Top performers" />
          <div className="space-y-3">
            {EMPLOYEES.slice().sort((a,b) => b.performance - a.performance).slice(0,5).map((e, i) => (
              <div key={e.id} className="flex items-center gap-3">
                <div className={`size-8 rounded-lg grid place-items-center text-xs font-bold ${i === 0 ? "gradient-gold text-gold-foreground" : "bg-muted"}`}>{i+1}</div>
                <div className="size-9 rounded-full gradient-primary grid place-items-center text-primary-foreground text-xs font-semibold">{e.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{e.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{e.title}</div>
                </div>
                <div className="font-display text-lg font-semibold text-gradient-gold">{e.performance.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>

      <LuxeCard>
        <SectionTitle title="Manager feedback · Q3 2025" />
        <div className="p-5 rounded-2xl border-l-4 border-gold bg-gold/5">
          <p className="text-sm leading-relaxed italic">
            "Elena delivered exceptional craftsmanship on the Autumn/Winter capsule. Her attention to bias-cut detail elevated the entire collection. She continues to mentor with generosity and rigour — a defining voice in the atelier."
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full gradient-primary grid place-items-center text-primary-foreground text-xs font-semibold">AR</div>
              <div>
                <div className="text-sm font-medium">Alessandro Rossi</div>
                <div className="text-[11px] text-muted-foreground">Head of Atelier · Sep 12, 2025</div>
              </div>
            </div>
            <Chip tone="gold">Exceeds expectations</Chip>
          </div>
        </div>
      </LuxeCard>
    </div>
  );
}
