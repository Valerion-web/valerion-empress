import { createFileRoute } from "@tanstack/react-router";
import { Users, MapPin, TrendingUp } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle } from "@/components/layout/primitives";
import { DEPARTMENTS } from "@/lib/mock-data";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/departments")({ component: Departments });

function Departments() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organisation"
        title="Departments"
        subtitle="The living architecture of House of Valerion — from ateliers to boutiques."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DEPARTMENTS.map((d, i) => (
          <motion.div key={d.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-2xl border overflow-hidden card-lift">
            <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${d.color}, color-mix(in oklab, ${d.color} 60%, black))` }}>
              <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.4),transparent_50%)]" />
              <div className="absolute bottom-3 left-4 text-white">
                <div className="text-[10px] uppercase tracking-wider opacity-70">Department</div>
                <div className="font-display text-lg font-semibold">{d.name}</div>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="font-semibold">{d.headcount}</span>
                  <span className="text-muted-foreground text-xs">people</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-success"><TrendingUp className="size-3" /> +4</div>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-xs">
                <div className="size-6 rounded-full gradient-primary grid place-items-center text-primary-foreground text-[10px] font-semibold">{d.lead.split(" ").map(n=>n[0]).join("")}</div>
                <span className="text-muted-foreground">Led by</span>
                <span className="font-medium">{d.lead}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <LuxeCard>
        <SectionTitle title="Regional presence" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { city: "Milan", hq: true, count: 142 },
            { city: "Paris", count: 68 },
            { city: "New York", count: 54 },
            { city: "London", count: 47 },
            { city: "Tokyo", count: 32 },
            { city: "Dubai", count: 20 },
          ].map((c) => (
            <div key={c.city} className="p-4 rounded-2xl border text-center">
              <MapPin className={`size-5 mx-auto ${c.hq ? "text-gold" : "text-muted-foreground"}`} />
              <div className="mt-2 font-display text-lg font-semibold">{c.city}</div>
              {c.hq && <div className="text-[10px] uppercase tracking-wider text-gold font-semibold">Headquarters</div>}
              <div className="text-xs text-muted-foreground mt-1">{c.count} people</div>
            </div>
          ))}
        </div>
      </LuxeCard>
    </div>
  );
}
