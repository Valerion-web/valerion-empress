import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, LuxeCard, SectionTitle, StatCard, Chip } from "@/components/layout/primitives";
import { HEADCOUNT_TREND, ATTENDANCE_TREND, PAYROLL_TREND, DEPARTMENTS, LIFECYCLE } from "@/lib/mock-data";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/analytics")({ component: Analytics });

function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        subtitle="Interactive intelligence across the workforce, ateliers and boutiques."
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard index={0} label="Headcount" value="363" delta="+8.2% YoY" accent="primary" />
        <StatCard index={1} label="Hire velocity" value="6.4 d" delta="-1.8d" accent="gold" />
        <StatCard index={2} label="Engagement" value="4.6 / 5" delta="+0.2" accent="success" />
        <StatCard index={3} label="Attrition" value="4.1%" accent="warning" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <LuxeCard>
          <SectionTitle title="Employee growth" />
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={HEADCOUNT_TREND}>
                <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--gold)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--gold)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="headcount" stroke="var(--gold)" strokeWidth={2.5} fill="url(#ag)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Department distribution" />
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={DEPARTMENTS} dataKey="headcount" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {DEPARTMENTS.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Attendance vs remote" />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={ATTENDANCE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="present" stroke="var(--gold)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="remote" stroke="var(--info)" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Payroll composition" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={PAYROLL_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `€${(v/1_000_000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} formatter={(v: number) => `€${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="base" stackId="a" fill="var(--primary)" />
                <Bar dataKey="bonus" stackId="a" fill="var(--gold)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>
      </div>

      <LuxeCard>
        <SectionTitle title="Employee lifecycle" description="From candidate to alumnus — the Valerion journey" />
        <div className="relative overflow-x-auto scrollbar-luxe pb-2">
          <div className="flex items-center gap-2 min-w-max px-1">
            {LIFECYCLE.map((s, i) => {
              const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[s.icon] ?? Icons.Circle;
              return (
                <div key={s.stage} className="flex items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex flex-col items-center text-center w-32"
                  >
                    <div className={`size-14 rounded-2xl grid place-items-center shadow-luxury ${i < 4 ? "gradient-gold" : "gradient-primary"} text-primary-foreground`}>
                      <Icon className="size-6" />
                    </div>
                    <div className="mt-2 text-xs font-semibold">{s.stage}</div>
                    <Chip tone={i < 4 ? "gold" : "info"}>{["12%","8%","6%","10%","54%","22%","4%","18%","100%","2%"][i]}</Chip>
                  </motion.div>
                  {i < LIFECYCLE.length - 1 && (
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: i * 0.06 + 0.1 }} className="h-px w-6 origin-left bg-gradient-to-r from-gold/60 to-primary/40" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </LuxeCard>
    </div>
  );
}
