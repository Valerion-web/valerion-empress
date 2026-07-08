import { Users, UserPlus, UserMinus, Wallet, GraduationCap, Heart } from "lucide-react";
import { PageHeader, StatCard, LuxeCard, SectionTitle, Chip } from "@/components/layout/primitives";
import { DEPARTMENTS, HEADCOUNT_TREND, PAYROLL_TREND, RECRUITMENT_FUNNEL, ATTENDANCE_TREND, LEAVE_REQUESTS } from "@/lib/mock-data";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";

export function HRDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workforce intelligence"
        title="People & culture cockpit."
        subtitle="A live view of the Valerion workforce across regions, departments and lifecycle stages."
        actions={
          <>
            <button className="h-10 px-4 rounded-xl border border-input text-sm font-medium hover:bg-muted">Export</button>
            <button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury">Publish report</button>
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-6 gap-4">
        <StatCard index={0} label="Total employees" value="363" delta="+8.2% YoY" icon={<Users className="size-5" />} accent="primary" />
        <StatCard index={1} label="Active today" value="342" delta="94.2%" icon={<Users className="size-5" />} accent="success" />
        <StatCard index={2} label="New joiners · Q4" value="24" delta="+6 vs Q3" icon={<UserPlus className="size-5" />} accent="gold" />
        <StatCard index={3} label="Attrition · YTD" value="4.1%" icon={<UserMinus className="size-5" />} accent="warning" />
        <StatCard index={4} label="Payroll · month" value="€ 2.4M" delta="+1.2%" icon={<Wallet className="size-5" />} accent="info" />
        <StatCard index={5} label="Satisfaction" value="4.6" delta="+0.2" icon={<Heart className="size-5" />} accent="gold" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <LuxeCard className="xl:col-span-2">
          <SectionTitle title="Headcount & hiring · trailing 12 months" />
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={HEADCOUNT_TREND}>
                <defs>
                  <linearGradient id="hc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient>
                  <linearGradient id="hr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--gold)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--gold)" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="headcount" stroke="var(--primary)" strokeWidth={2.5} fill="url(#hc)" />
                <Area type="monotone" dataKey="hires" stroke="var(--gold)" strokeWidth={2} fill="url(#hr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Department distribution" />
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={DEPARTMENTS} dataKey="headcount" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {DEPARTMENTS.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {DEPARTMENTS.slice(0, 6).map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="size-2 rounded-full" style={{ background: d.color }} />
                <span className="truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LuxeCard>
          <SectionTitle title="Recruitment funnel" />
          <div className="space-y-2">
            {RECRUITMENT_FUNNEL.map((s, i) => {
              const max = RECRUITMENT_FUNNEL[0].value;
              const pct = (s.value / max) * 100;
              return (
                <div key={s.stage}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{s.stage}</span>
                    <span className="text-muted-foreground">{s.value.toLocaleString()}</span>
                  </div>
                  <div className="h-8 rounded-lg bg-muted overflow-hidden relative">
                    <div className="h-full gradient-gold flex items-center px-3 text-xs font-semibold text-gold-foreground" style={{ width: `${pct}%`, opacity: 1 - i * 0.12 }}>
                      {((s.value / max) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </LuxeCard>

        <LuxeCard className="lg:col-span-2">
          <SectionTitle title="Payroll composition" />
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={PAYROLL_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `€${(v/1_000_000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} formatter={(v: number) => `€${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="base" stackId="a" fill="var(--primary)" radius={[0,0,0,0]} />
                <Bar dataKey="bonus" stackId="a" fill="var(--gold)" radius={[0,0,0,0]} />
                <Bar dataKey="tax" stackId="a" fill="var(--info)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LuxeCard>
          <SectionTitle title="Attendance overview" />
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={ATTENDANCE_TREND}>
                <defs><linearGradient id="att" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--success)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--success)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="present" stroke="var(--success)" strokeWidth={2.5} fill="url(#att)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Pending approvals" action={<Chip tone="warning">{LEAVE_REQUESTS.filter(r => r.status === "Pending").length}</Chip>} />
          <div className="space-y-2">
            {LEAVE_REQUESTS.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border">
                <div>
                  <div className="text-sm font-medium">{r.employee}</div>
                  <div className="text-[11px] text-muted-foreground">{r.type} · {r.from} → {r.to} · {r.days}d</div>
                </div>
                <Chip tone={r.status === "Pending" ? "warning" : "success"}>{r.status}</Chip>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>

      <LuxeCard>
        <SectionTitle title="Organisation chart" description="Departments & headcount leadership" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DEPARTMENTS.map((d) => (
            <div key={d.name} className="rounded-2xl border p-4 hover:shadow-luxury transition">
              <div className="size-9 rounded-lg grid place-items-center text-white text-xs font-semibold mb-3" style={{ background: d.color }}>
                {d.name.split(" ").map(x => x[0]).slice(0,2).join("")}
              </div>
              <div className="text-sm font-semibold">{d.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Led by {d.lead}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-2xl font-semibold">{d.headcount}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">people</span>
              </div>
            </div>
          ))}
        </div>
      </LuxeCard>
    </div>
  );
}
