import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow, title, subtitle, actions,
}: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="flex flex-wrap items-end justify-between gap-4 mb-6"
    >
      <div className="min-w-0">
        {eyebrow && <div className="text-[11px] uppercase tracking-[0.18em] text-gold font-semibold mb-2">{eyebrow}</div>}
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

export function StatCard({
  label, value, delta, icon, accent = "primary", index = 0,
}: {
  label: string; value: string | number; delta?: string; icon?: ReactNode;
  accent?: "primary" | "gold" | "success" | "info" | "warning"; index?: number;
}) {
  const accents: Record<string, string> = {
    primary: "from-primary/10 to-transparent text-primary",
    gold: "from-gold/15 to-transparent text-gold",
    success: "from-success/10 to-transparent text-success",
    info: "from-info/10 to-transparent text-info",
    warning: "from-warning/15 to-transparent text-warning",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative overflow-hidden rounded-2xl border bg-card p-5 card-lift"
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", accents[accent])} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</div>
          <div className="mt-2 font-display text-3xl font-semibold tracking-tight">{value}</div>
          {delta && (
            <div className="mt-1.5 text-xs font-medium text-success flex items-center gap-1">
              <span>↑</span> {delta}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("size-11 rounded-xl bg-background/60 backdrop-blur grid place-items-center", accents[accent])}>
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function LuxeCard({ children, className, index = 0 }: { children: ReactNode; className?: string; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className={cn("rounded-2xl border bg-card p-5 shadow-sm", className)}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ title, action, description }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "gold" | "success" | "warning" | "info" | "destructive" }) {
  const tones: Record<string, string> = {
    default: "bg-muted text-foreground",
    gold: "bg-gold/15 text-gold border-gold/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/15 text-warning border-warning/20",
    info: "bg-info/10 text-info border-info/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-0.5 text-[11px] font-medium", tones[tone])}>
      {children}
    </span>
  );
}
