import { createFileRoute } from "@tanstack/react-router";
import { Plus, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle, Chip, StatCard } from "@/components/layout/primitives";
import { LEAVE_TYPES, LEAVE_REQUESTS, HOLIDAYS } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export const Route = createFileRoute("/_app/leave")({ component: Leave });

function Leave() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Time off"
        title="Leave management"
        subtitle="Balance, request and approve time off — with an approval workflow across manager, HR and finance."
        actions={<button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury inline-flex items-center gap-2"><Plus className="size-4" /> Request leave</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {LEAVE_TYPES.map((l, i) => (
          <StatCard key={l.type} index={i} label={`${l.type} leave`} value={`${l.total - l.used} days`} delta={`${l.used} used`} accent={i === 0 ? "gold" : i === 1 ? "warning" : i === 2 ? "info" : "success"} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <LuxeCard>
          <SectionTitle title="Leave breakdown" />
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={LEAVE_TYPES} dataKey="used" nameKey="type" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {LEAVE_TYPES.map((l, i) => <Cell key={i} fill={l.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {LEAVE_TYPES.map((l) => (
              <div key={l.type} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 rounded-full" style={{ background: l.color }} />
                <span>{l.type}</span>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard className="xl:col-span-2">
          <SectionTitle title="Approval workflow" description="Employee → Manager → HR → Final" />
          <div className="grid grid-cols-4 gap-2">
            {["Employee","Manager","HR","Final"].map((s, i) => (
              <motion.div key={s} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`p-4 rounded-2xl border text-center ${i <= 1 ? "border-gold bg-gold/5" : ""}`}>
                <div className={`mx-auto size-9 rounded-full grid place-items-center text-xs font-bold ${i <= 1 ? "gradient-gold text-gold-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
                <div className="text-sm font-medium mt-2">{s}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{i === 0 ? "Submitted" : i === 1 ? "Reviewing" : "Pending"}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6">
            <SectionTitle title="Holiday calendar" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {HOLIDAYS.map((h) => (
                <div key={h.name} className="p-3 rounded-xl border text-center">
                  <div className="text-[10px] uppercase tracking-wider text-gold font-semibold">{h.date}</div>
                  <div className="text-xs font-medium mt-1">{h.name}</div>
                </div>
              ))}
            </div>
          </div>
        </LuxeCard>
      </div>

      <LuxeCard>
        <SectionTitle title="Leave requests" action={<div className="flex gap-2">{["All","Pending","Approved"].map((t) => <Chip key={t}>{t}</Chip>)}</div>} />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                {["Employee","Type","From","To","Days","Status","Actions"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {LEAVE_REQUESTS.map((r) => (
                <tr key={r.id} className="border-t hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{r.employee}</td>
                  <td className="px-5 py-3">{r.type}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.from}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r.to}</td>
                  <td className="px-5 py-3">{r.days}</td>
                  <td className="px-5 py-3"><Chip tone={r.status === "Approved" ? "success" : "warning"}>{r.status}</Chip></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      <button className="size-8 grid place-items-center rounded-lg bg-success/10 text-success hover:bg-success/20"><CheckCircle2 className="size-4" /></button>
                      <button className="size-8 grid place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"><XCircle className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LuxeCard>
    </div>
  );
}
