import { motion } from "framer-motion";
import {
  Clock, Calendar, Wallet, TrendingUp, GraduationCap, Bell, CheckCircle2,
  Circle, Users2, FileText, PartyPopper, Play, Coffee, LogIn, LogOut, Sparkles,
} from "lucide-react";
import { PageHeader, StatCard, LuxeCard, SectionTitle, Chip } from "@/components/layout/primitives";
import { useApp } from "@/lib/app-context";
import { ANNOUNCEMENTS, EMPLOYEES, HOLIDAYS, LEAVE_TYPES, TASKS, COURSES } from "@/lib/mock-data";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export function EmployeeDashboard() {
  const { user } = useApp();
  const hoursData = Array.from({ length: 7 }).map((_, i) => ({ d: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i], h: 6 + (i * 1.4) % 4 }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Good afternoon · Milan`}
        title={`Welcome back, ${user?.name.split(" ")[0]}.`}
        subtitle="Here is your day at a glance. Your atelier is ready — go make something beautiful."
        actions={
          <>
            <button className="h-10 px-4 rounded-xl border border-input bg-card text-sm font-medium hover:bg-muted transition inline-flex items-center gap-2">
              <Coffee className="size-4" /> Break
            </button>
            <button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury inline-flex items-center gap-2">
              <LogOut className="size-4" /> Clock out
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard index={0} label="Clock in" value="09:12" delta="On time" icon={<LogIn className="size-5" />} accent="gold" />
        <StatCard index={1} label="Working hours" value="6h 48m" delta="+22m vs avg" icon={<Clock className="size-5" />} accent="primary" />
        <StatCard index={2} label="Break time" value="42m" icon={<Coffee className="size-5" />} accent="info" />
        <StatCard index={3} label="Overtime · month" value="8h 20m" delta="+3h" icon={<TrendingUp className="size-5" />} accent="success" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <LuxeCard className="xl:col-span-2">
          <SectionTitle title="This week" description="Hours logged across the atelier week" action={<Chip tone="gold">42h / 40h</Chip>} />
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hoursData}>
                <defs>
                  <linearGradient id="hoursG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="h" stroke="var(--gold)" strokeWidth={2.5} fill="url(#hoursG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Profile completion" />
          <div className="flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer>
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ v: 86, fill: "var(--gold)" }]} startAngle={90} endAngle={-270}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "var(--muted)" }} dataKey="v" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <div className="font-display text-4xl font-semibold">86%</div>
              <div className="text-xs text-muted-foreground mt-1">3 items remaining</div>
              <button className="mt-3 text-xs text-gold font-medium hover:underline">Complete profile →</button>
            </div>
          </div>
        </LuxeCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LuxeCard>
          <SectionTitle title="Leave balance" />
          <div className="space-y-4">
            {LEAVE_TYPES.map((l) => {
              const pct = ((l.total - l.used) / l.total) * 100;
              return (
                <div key={l.type}>
                  <div className="flex items-baseline justify-between text-sm mb-1.5">
                    <span className="font-medium">{l.type}</span>
                    <span className="text-muted-foreground text-xs">{l.total - l.used} / {l.total} days</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full" style={{ backgroundColor: l.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Upcoming holidays" />
          <div className="space-y-3">
            {HOLIDAYS.map((h) => (
              <div key={h.name} className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-gold/10 text-gold grid place-items-center font-display text-xs font-semibold">
                  {h.date.split(" ")[1]}
                </div>
                <div>
                  <div className="text-sm font-medium">{h.name}</div>
                  <div className="text-xs text-muted-foreground">{h.date}</div>
                </div>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Payslip" action={<Chip tone="gold">November</Chip>} />
          <div className="rounded-2xl gradient-primary p-5 text-primary-foreground">
            <div className="text-xs opacity-70">Net pay</div>
            <div className="font-display text-3xl mt-1">€ 6,842.10</div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div><div className="opacity-60">Gross</div><div className="font-medium mt-0.5">€ 9,200.00</div></div>
              <div><div className="opacity-60">Tax</div><div className="font-medium mt-0.5">€ 2,357.90</div></div>
            </div>
          </div>
          <button className="mt-4 w-full h-10 rounded-xl border border-input text-sm font-medium hover:bg-muted flex items-center justify-center gap-2">
            <FileText className="size-4" /> Download payslip
          </button>
        </LuxeCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LuxeCard className="lg:col-span-2">
          <SectionTitle title="Assigned tasks" description={`${TASKS.filter(t => !t.done).length} open · ${TASKS.filter(t => t.done).length} completed`} action={<button className="text-xs text-gold font-medium">View all</button>} />
          <div className="space-y-2">
            {TASKS.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition group">
                {t.done ? <CheckCircle2 className="size-5 text-success shrink-0" /> : <Circle className="size-5 text-muted-foreground shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
                  <div className="text-xs text-muted-foreground">Due {t.due}</div>
                </div>
                <Chip tone={t.priority === "High" ? "destructive" : t.priority === "Medium" ? "warning" : "info"}>{t.priority}</Chip>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Announcements" />
          <div className="space-y-4">
            {ANNOUNCEMENTS.map((a) => (
              <div key={a.title} className="border-l-2 border-gold pl-3">
                <Chip tone="gold">{a.tag}</Chip>
                <div className="text-sm font-semibold mt-1.5">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.body}</div>
                <div className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">— {a.author}</div>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LuxeCard>
          <SectionTitle title="Performance" />
          <div className="flex items-end gap-3">
            <div className="font-display text-5xl font-semibold text-gradient-gold">4.6</div>
            <div className="text-sm text-muted-foreground pb-2">/ 5.0</div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Q3 2025 · Exceeds expectations</div>
          <Progress value={92} className="mt-4" />
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            {[{ k: "Craft", v: 4.8 }, { k: "Team", v: 4.5 }, { k: "Impact", v: 4.6 }].map((s) => (
              <div key={s.k} className="p-2.5 rounded-xl bg-muted/60">
                <div className="font-display text-lg font-semibold">{s.v}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.k}</div>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Learning" action={<Chip tone="gold">{COURSES.length} enrolled</Chip>} />
          <div className="space-y-3">
            {COURSES.slice(0, 3).map((c) => (
              <div key={c.title} className="p-3 rounded-xl border hover:bg-muted/50 transition">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-gold/10 text-gold grid place-items-center shrink-0"><GraduationCap className="size-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.title}</div>
                    <div className="text-[11px] text-muted-foreground">{c.provider} · {c.duration}</div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full gradient-gold" style={{ width: `${c.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Team" />
          <div className="space-y-3">
            {EMPLOYEES.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center gap-3">
                <div className="size-9 rounded-full gradient-primary grid place-items-center text-primary-foreground text-xs font-semibold">{e.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{e.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{e.title}</div>
                </div>
                <span className={`size-2 rounded-full ${e.status === "Active" ? "bg-success" : e.status === "Remote" ? "bg-info" : "bg-muted-foreground"}`} />
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>

      <LuxeCard>
        <SectionTitle title="Activity timeline" description="Last 24 hours across your workspace" />
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border">
          {[
            { t: "Sparkles", c: "gold", title: "Design review approved", desc: "Alessandro signed off Autumn/Winter mood board.", time: "12m ago" },
            { t: "Bell", c: "info", title: "Meeting invite", desc: "Client fitting — Maison Deveraux, Friday 15:00.", time: "1h ago" },
            { t: "PartyPopper", c: "gold", title: "Anniversary", desc: "Congratulate Sofia on 5 years at Valerion.", time: "3h ago" },
            { t: "Play", c: "success", title: "Course started", desc: "You began 'Advanced Pattern Making'.", time: "Yesterday" },
          ].map((a, i) => {
            const IconMap = { Sparkles, Bell, PartyPopper, Play, Users2 } as const;
            const Icon = IconMap[a.t as keyof typeof IconMap] ?? Sparkles;
            return (
              <div key={i} className="relative">
                <span className={`absolute -left-6 top-1 size-4 rounded-full grid place-items-center bg-card border-2 ${a.c === "gold" ? "border-gold" : a.c === "info" ? "border-info" : "border-success"}`}>
                  <Icon className={`size-2.5 ${a.c === "gold" ? "text-gold" : a.c === "info" ? "text-info" : "text-success"}`} />
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.desc}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground shrink-0">{a.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </LuxeCard>
    </div>
  );
}
