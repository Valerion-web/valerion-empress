import { motion } from "framer-motion";
import { Users, Clock, CalendarCheck, Briefcase, FolderKanban, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { PageHeader, StatCard, LuxeCard, SectionTitle, Chip } from "@/components/layout/primitives";
import { EMPLOYEES, LEAVE_REQUESTS, PROJECTS, OPEN_POSITIONS, CANDIDATES, ATTENDANCE_TREND } from "@/lib/mock-data";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";

export function ManagerDashboard() {
  const team = EMPLOYEES.slice(0, 12);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Team overview"
        title="Your atelier, at a glance."
        subtitle="12 direct reports · 4 pending approvals · 3 active projects."
        actions={<button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury">Weekly stand-up</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard index={0} label="Team members" value={12} delta="+2 this quarter" icon={<Users className="size-5" />} accent="primary" />
        <StatCard index={1} label="Attendance today" value="10 / 12" delta="83% present" icon={<Clock className="size-5" />} accent="success" />
        <StatCard index={2} label="Pending approvals" value={4} icon={<CalendarCheck className="size-5" />} accent="warning" />
        <StatCard index={3} label="Open positions" value={3} delta="47 applicants" icon={<Briefcase className="size-5" />} accent="gold" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <LuxeCard className="xl:col-span-2">
          <SectionTitle title="Team attendance · last 12 months" description="Presence vs. remote days" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={ATTENDANCE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="present" fill="var(--gold)" radius={[6,6,0,0]} />
                <Bar dataKey="remote" fill="var(--info)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Pending approvals" action={<Chip tone="warning">{LEAVE_REQUESTS.filter(r => r.status === "Pending").length}</Chip>} />
          <div className="space-y-3">
            {LEAVE_REQUESTS.filter(r => r.status === "Pending").map((r) => (
              <div key={r.id} className="p-3 rounded-xl border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{r.employee}</div>
                    <div className="text-[11px] text-muted-foreground">{r.type} · {r.from} → {r.to} · {r.days}d</div>
                  </div>
                  <div className="flex gap-1">
                    <button className="size-8 grid place-items-center rounded-lg bg-success/10 text-success hover:bg-success/20 transition"><CheckCircle2 className="size-4" /></button>
                    <button className="size-8 grid place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition"><XCircle className="size-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LuxeCard>
          <SectionTitle title="Direct reports" action={<button className="text-xs text-gold font-medium">Directory</button>} />
          <div className="grid grid-cols-2 gap-2">
            {team.map((e) => (
              <motion.div key={e.id} whileHover={{ y: -2 }} className="p-3 rounded-xl border hover:border-gold/50 hover:bg-muted/50 transition">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-full gradient-primary grid place-items-center text-primary-foreground text-[11px] font-semibold">{e.avatar}</div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{e.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{e.title}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <Chip tone={e.status === "Active" ? "success" : e.status === "Remote" ? "info" : "default"}>{e.status}</Chip>
                  <span className="text-muted-foreground">★ {e.performance.toFixed(1)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </LuxeCard>

        <div className="space-y-4">
          <LuxeCard>
            <SectionTitle title="Active projects" />
            <div className="space-y-3">
              {PROJECTS.slice(0, 3).map((p) => (
                <div key={p.name}>
                  <div className="flex items-baseline justify-between text-sm mb-1">
                    <span className="font-medium">{p.name}</span>
                    <Chip tone={p.status === "At Risk" ? "warning" : "success"}>{p.status}</Chip>
                  </div>
                  <div className="text-[11px] text-muted-foreground mb-1.5">{p.team} people · due {p.deadline}</div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 0.8 }} className="h-full gradient-gold" />
                  </div>
                </div>
              ))}
            </div>
          </LuxeCard>
          <LuxeCard>
            <SectionTitle title="Team performance trend" />
            <div className="h-40">
              <ResponsiveContainer>
                <LineChart data={ATTENDANCE_TREND.slice(-6).map((a,i) => ({ ...a, score: 3.8 + (i * 0.12) }))}>
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis domain={[3, 5]} stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="var(--gold)" strokeWidth={2.5} dot={{ fill: "var(--gold)", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </LuxeCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LuxeCard>
          <SectionTitle title="Recruitment pipeline" description="Open roles in your team" action={<button className="text-xs text-gold font-medium">Post role</button>} />
          <div className="space-y-2">
            {OPEN_POSITIONS.slice(0, 4).map((p) => (
              <div key={p.title} className="flex items-center justify-between p-3 rounded-xl border hover:bg-muted/40 transition">
                <div>
                  <div className="text-sm font-medium">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground">{p.location} · {p.applicants} applicants</div>
                </div>
                <Chip tone={p.status === "Active" ? "success" : "info"}>{p.status}</Chip>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Top candidates" />
          <div className="space-y-2">
            {CANDIDATES.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl border">
                <div className="size-10 rounded-full gradient-gold grid place-items-center text-gold-foreground text-xs font-bold">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{c.role} · {c.source}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-semibold text-gradient-gold">{c.score}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Fit</div>
                </div>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>
    </div>
  );
}
