import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, ArrowRight, Fingerprint } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { ROLES, type Role } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({ component: Login });

const roleCards: { role: Role; title: string; desc: string }[] = [
  { role: "employee", title: "Employee", desc: "Personal dashboard, attendance, leaves, payslips, learning." },
  { role: "manager", title: "Manager", desc: "Team overview, approvals, performance and recruitment pipeline." },
  { role: "hr", title: "HR Admin", desc: "Workforce analytics, payroll, recruitment funnel, culture." },
  { role: "admin", title: "Super Admin", desc: "Users, roles, integrations, audit logs, system health." },
];

function Login() {
  const { login, user } = useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role>("employee");

  useEffect(() => { if (user) navigate({ to: "/dashboard", replace: true }); }, [user, navigate]);

  const handleSignIn = () => { login(selected); navigate({ to: "/dashboard" }); };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr] bg-background">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--gold)_50%,transparent),transparent_45%),radial-gradient(circle_at_80%_70%,color-mix(in_oklab,var(--secondary)_60%,transparent),transparent_50%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="size-11 rounded-xl gradient-gold grid place-items-center shadow-gold">
            <span className="font-display font-bold text-primary text-xl">V</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-lg">House of</div>
            <div className="font-display text-xl text-gradient-gold font-semibold">Valerion</div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/80">
            <Sparkles className="size-3 text-gold" /> Enterprise HR Suite · v4.2
          </div>
          <h1 className="font-display text-5xl xl:text-6xl leading-tight font-semibold max-w-xl">
            Where <span className="text-gradient-gold italic">craft</span> meets<br />people intelligence.
          </h1>
          <p className="text-white/70 max-w-md leading-relaxed">
            The private HR platform of House of Valerion — unifying atelier, boutique and corporate teams across
            Milan, Paris, New York, London, Tokyo and Dubai.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4 max-w-md">
            {[
              { k: "363", v: "Colleagues" },
              { k: "12", v: "Countries" },
              { k: "24/7", v: "Concierge" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3">
                <div className="font-display text-2xl text-gradient-gold font-semibold">{s.k}</div>
                <div className="text-[11px] uppercase tracking-wider text-white/60">{s.v}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-white/50">
          <ShieldCheck className="size-3.5" /> ISO 27001 · SOC 2 Type II · GDPR
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-col justify-center p-6 md:p-14">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl gradient-gold grid place-items-center"><span className="font-display font-bold text-primary text-lg">V</span></div>
            <div className="font-display text-lg">House of <span className="text-gradient-gold font-semibold">Valerion</span></div>
          </div>

          <div className="text-[11px] uppercase tracking-[0.18em] text-gold font-semibold mb-3">Sign in</div>
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-2">Welcome back.</h2>
          <p className="text-muted-foreground mb-8">Choose your access profile to enter the portal.</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {roleCards.map((c) => (
              <button
                key={c.role}
                onClick={() => setSelected(c.role)}
                className={cn(
                  "text-left rounded-2xl border p-4 transition group",
                  selected === c.role ? "border-gold bg-gold/5 shadow-gold" : "border-border hover:border-foreground/20 hover:bg-muted/40"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-semibold">{c.title}</div>
                  <div className={cn("size-4 rounded-full border-2 transition", selected === c.role ? "border-gold bg-gold" : "border-muted-foreground/30")} />
                </div>
                <div className="text-[11px] text-muted-foreground line-clamp-2">{c.desc}</div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Corporate email</label>
              <input defaultValue={ROLES[selected].email} className="mt-1 w-full h-11 rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:border-gold transition" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <input type="password" defaultValue="••••••••••" className="mt-1 w-full h-11 rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:border-gold transition" />
            </div>
          </div>

          <button
            onClick={handleSignIn}
            className="mt-6 w-full h-11 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition"
          >
            Enter portal <ArrowRight className="size-4" />
          </button>

          <button className="mt-3 w-full h-11 rounded-xl border border-input text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted transition">
            <Fingerprint className="size-4" /> Sign in with SSO
          </button>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            Protected by SAML 2.0 · Trouble signing in? <a className="text-gold hover:underline">Contact concierge</a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
