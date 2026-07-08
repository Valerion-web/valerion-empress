import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Award, Clock, TrendingUp, Play, CheckCircle2 } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle, StatCard, Chip } from "@/components/layout/primitives";
import { COURSES } from "@/lib/mock-data";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/learning")({ component: Learning });

function Learning() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Learning & Development"
        title="Valerion Academy"
        subtitle="Curated learning journeys — from craft heritage to leadership."
        actions={<button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury">Browse catalogue</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard index={0} label="Enrolled" value={COURSES.length} icon={<GraduationCap className="size-5" />} accent="gold" />
        <StatCard index={1} label="Completed" value={1} delta="This year" icon={<CheckCircle2 className="size-5" />} accent="success" />
        <StatCard index={2} label="Learning hours" value="42h" delta="+8h this month" icon={<Clock className="size-5" />} accent="primary" />
        <StatCard index={3} label="Certificates" value={7} icon={<Award className="size-5" />} accent="info" />
      </div>

      <LuxeCard>
        <SectionTitle title="Continue learning" description="Pick up where you left off" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {COURSES.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl border overflow-hidden card-lift group">
              <div className="h-32 gradient-hero relative">
                <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_50%,color-mix(in_oklab,var(--gold)_40%,transparent),transparent_50%)]" />
                <div className="absolute top-3 left-3"><Chip tone="gold">{c.category}</Chip></div>
                <div className="absolute bottom-3 right-3 size-10 rounded-full gradient-gold grid place-items-center shadow-gold group-hover:scale-110 transition"><Play className="size-4 text-gold-foreground fill-current" /></div>
              </div>
              <div className="p-4">
                <div className="font-semibold">{c.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{c.provider} · {c.duration}</div>
                <div className="mt-4 flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{c.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${c.progress}%` }} transition={{ duration: 0.7 }} className="h-full gradient-gold" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </LuxeCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LuxeCard>
          <SectionTitle title="Learning insights" />
          <div className="space-y-3">
            {[
              { label: "Consistency", value: "24 days", icon: TrendingUp },
              { label: "Avg session", value: "38 min", icon: Clock },
              { label: "Quiz average", value: "94%", icon: Award },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl border">
                <div className="size-10 rounded-lg bg-gold/10 text-gold grid place-items-center"><s.icon className="size-5" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="font-display text-lg font-semibold">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard className="lg:col-span-2">
          <SectionTitle title="Recent certificates" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {["GDPR & Data Ethics","Client Concierge Excellence","Digital Craft — Adobe Suite","Fire Safety at Ateliers"].map((c, i) => (
              <div key={c} className="p-4 rounded-2xl border flex items-center gap-3">
                <div className="size-12 rounded-xl gradient-gold grid place-items-center shadow-gold"><Award className="size-6 text-gold-foreground" /></div>
                <div>
                  <div className="text-sm font-semibold">{c}</div>
                  <div className="text-[11px] text-muted-foreground">Issued {["Aug 2025","May 2025","Feb 2025","Jan 2025"][i]} · Valerion Academy</div>
                </div>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>
    </div>
  );
}
