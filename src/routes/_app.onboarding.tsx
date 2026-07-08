import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Circle, FileText, ShieldCheck, GraduationCap, Laptop2, Building2, Gift, Sparkles } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle, Chip } from "@/components/layout/primitives";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/onboarding")({ component: Onboarding });

const steps = [
  { icon: FileText, name: "Document Upload", desc: "Passport, tax ID, bank details", done: true },
  { icon: ShieldCheck, name: "Identity Verification", desc: "Video KYC via Onfido", done: true },
  { icon: Building2, name: "Department Assignment", desc: "Haute Couture · Milan atelier", done: true },
  { icon: Laptop2, name: "Equipment Allocation", desc: "MacBook Pro · iPhone · Studio Display", done: false, current: true },
  { icon: GraduationCap, name: "Welcome Training", desc: "5 modules · brand, craft, systems", done: false },
  { icon: Gift, name: "Welcome Kit", desc: "Signature notebook, atelier tote, badge", done: false },
];

function Onboarding() {
  const done = steps.filter(s => s.done).length;
  const progress = (done / steps.length) * 100;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Welcome to the House"
        title="Onboarding"
        subtitle="A curated first-100-days journey for every new member of the Valerion family."
      />

      <LuxeCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Overall progress</div>
            <div className="font-display text-4xl font-semibold mt-1">{Math.round(progress)}%</div>
            <div className="text-xs text-muted-foreground mt-1">{done} of {steps.length} steps completed</div>
          </div>
          <div className="flex-1 min-w-64 max-w-lg">
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full gradient-gold" />
            </div>
          </div>
          <button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury">Continue journey</button>
        </div>
      </LuxeCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LuxeCard className="lg:col-span-2">
          <SectionTitle title="Your journey" description="A guided experience designed by People & Culture" />
          <div className="relative pl-8 space-y-4 before:content-[''] before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-border">
            {steps.map((s, i) => (
              <motion.div key={s.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="relative">
                <span className={`absolute -left-8 top-1 size-7 rounded-full grid place-items-center border-2 ${
                  s.done ? "bg-success border-success text-success-foreground" : s.current ? "bg-gold border-gold text-gold-foreground" : "bg-card border-border text-muted-foreground"
                }`}>
                  {s.done ? <CheckCircle2 className="size-4" /> : <s.icon className="size-3.5" />}
                </span>
                <div className={`p-4 rounded-2xl border ${s.current ? "border-gold bg-gold/5" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium flex items-center gap-2">{s.name} {s.current && <Chip tone="gold">In progress</Chip>}</div>
                    {s.done && <Chip tone="success">Complete</Chip>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </LuxeCard>

        <div className="space-y-4">
          <LuxeCard>
            <div className="rounded-2xl gradient-hero p-5 text-white -m-5 mb-4">
              <Sparkles className="size-6 text-gold" />
              <div className="font-display text-2xl mt-2">Welcome kit</div>
              <div className="text-white/70 text-sm mt-1">Curated for you by the Milan atelier.</div>
            </div>
            <ul className="text-sm space-y-2">
              <li className="flex items-center gap-2"><Circle className="size-3 text-gold" /> Leather-bound notebook</li>
              <li className="flex items-center gap-2"><Circle className="size-3 text-gold" /> Signature atelier tote</li>
              <li className="flex items-center gap-2"><Circle className="size-3 text-gold" /> Personalised name badge</li>
              <li className="flex items-center gap-2"><Circle className="size-3 text-gold" /> Milan neighbourhood guide</li>
            </ul>
          </LuxeCard>
          <LuxeCard>
            <SectionTitle title="Your buddy" />
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full gradient-primary grid place-items-center text-primary-foreground font-semibold">AR</div>
              <div>
                <div className="font-medium">Alessandro Rossi</div>
                <div className="text-xs text-muted-foreground">Head of Atelier</div>
              </div>
            </div>
            <button className="mt-4 w-full h-10 rounded-xl border text-sm font-medium hover:bg-muted">Book a coffee</button>
          </LuxeCard>
        </div>
      </div>
    </div>
  );
}
