import { createFileRoute } from "@tanstack/react-router";
import { LogIn, LogOut, Coffee, Fingerprint, Clock } from "lucide-react";
import { PageHeader, LuxeCard, StatCard, SectionTitle, Chip } from "@/components/layout/primitives";
import { ATTENDANCE_TREND, EMPLOYEES } from "@/lib/mock-data";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_app/attendance")({ component: Attendance });

function Attendance() {
  const today = new Date();
  const monthDays = Array.from({ length: 30 }).map((_, i) => ({
    day: i + 1,
    state: [0,0,1,0,0,2,0,0,3,0,0,0,0,4,4,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0][i] || 0,
  }));
  const legend: Record<number, { name: string; className: string }> = {
    0: { name: "Present", className: "bg-success/25 border-success/40 text-success" },
    1: { name: "Remote", className: "bg-info/25 border-info/40 text-info" },
    2: { name: "Leave", className: "bg-gold/25 border-gold/40 text-gold" },
    3: { name: "Sick", className: "bg-destructive/20 border-destructive/40 text-destructive" },
    4: { name: "Weekend", className: "bg-muted border-border text-muted-foreground" },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Time & attendance"
        title="Attendance"
        subtitle="Live presence, shifts and overtime across the Valerion workforce."
        actions={
          <>
            <button className="h-10 px-4 rounded-xl border text-sm font-medium hover:bg-muted inline-flex items-center gap-2"><Coffee className="size-4" /> Break</button>
            <button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury inline-flex items-center gap-2"><Fingerprint className="size-4" /> Clock in / out</button>
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard index={0} label="Present today" value="342" delta="94.2%" icon={<LogIn className="size-5" />} accent="success" />
        <StatCard index={1} label="On leave" value="12" icon={<LogOut className="size-5" />} accent="gold" />
        <StatCard index={2} label="Late arrivals" value="4" icon={<Clock className="size-5" />} accent="warning" />
        <StatCard index={3} label="Avg hours · week" value="41.8" delta="+0.6h" icon={<Clock className="size-5" />} accent="primary" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <LuxeCard className="xl:col-span-2">
          <SectionTitle title="Attendance trend" description="Present · absent · remote — last 12 months" />
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={ATTENDANCE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="present" stroke="var(--success)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="remote" stroke="var(--info)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="absent" stroke="var(--destructive)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="My month" />
          <div className="grid grid-cols-7 gap-1.5">
            {["M","T","W","T","F","S","S"].map((d, i) => <div key={i} className="text-center text-[10px] uppercase tracking-wider text-muted-foreground">{d}</div>)}
            {monthDays.map((d) => (
              <div key={d.day} className={`aspect-square rounded-md border grid place-items-center text-[10px] font-medium ${legend[d.state].className} ${d.day === today.getDate() ? "ring-2 ring-gold ring-offset-1 ring-offset-background" : ""}`}>
                {d.day}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.values(legend).map((l) => (
              <div key={l.name} className="flex items-center gap-1.5 text-[11px]">
                <span className={`size-3 rounded ${l.className}`} />
                <span className="text-muted-foreground">{l.name}</span>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>

      <LuxeCard>
        <SectionTitle title="Live attendance · today" description="Biometric + geofence" />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                {["Employee","Department","Clock In","Clock Out","Hours","Status","Location"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {EMPLOYEES.slice(0, 10).map((e, i) => (
                <tr key={e.id} className="border-t hover:bg-muted/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full gradient-primary grid place-items-center text-primary-foreground text-xs font-semibold">{e.avatar}</div>
                      <span className="font-medium">{e.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{e.department}</td>
                  <td className="px-5 py-3 font-mono">{["08:52","09:04","09:12","09:18","09:22","08:44","09:31","09:07","08:58","09:15"][i]}</td>
                  <td className="px-5 py-3 font-mono text-muted-foreground">—</td>
                  <td className="px-5 py-3">{(6.5 + (i * 0.3)).toFixed(1)}h</td>
                  <td className="px-5 py-3"><Chip tone={i % 4 === 3 ? "info" : "success"}>{i % 4 === 3 ? "Remote" : "In Office"}</Chip></td>
                  <td className="px-5 py-3 text-muted-foreground">{e.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LuxeCard>
    </div>
  );
}
