import { Server, Database, ShieldCheck, Activity, Users, Zap, GitBranch, Mail } from "lucide-react";
import { PageHeader, StatCard, LuxeCard, SectionTitle, Chip } from "@/components/layout/primitives";
import { AUDIT_LOGS } from "@/lib/mock-data";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export function AdminDashboard() {
  const perf = Array.from({ length: 24 }).map((_, i) => ({ t: `${i}:00`, cpu: 25 + Math.sin(i / 2) * 15 + Math.random() * 8, mem: 55 + Math.cos(i / 3) * 10 }));
  const services = [
    { name: "API Gateway", status: "Operational", latency: "42ms", uptime: "99.99%" },
    { name: "Payroll Engine", status: "Operational", latency: "128ms", uptime: "99.97%" },
    { name: "Auth Service (SAML)", status: "Operational", latency: "18ms", uptime: "100%" },
    { name: "Notification Bus", status: "Degraded", latency: "412ms", uptime: "99.82%" },
    { name: "Document Vault", status: "Operational", latency: "88ms", uptime: "99.98%" },
    { name: "Analytics Warehouse", status: "Operational", latency: "220ms", uptime: "99.95%" },
  ];
  const integrations = [
    { name: "Workday", type: "HRIS", status: "Connected" },
    { name: "Slack", type: "Messaging", status: "Connected" },
    { name: "Okta", type: "SSO/SAML", status: "Connected" },
    { name: "Stripe", type: "Payments", status: "Connected" },
    { name: "DocuSign", type: "Signatures", status: "Connected" },
    { name: "Greenhouse", type: "ATS", status: "Syncing" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Platform command"
        title="System health & governance."
        subtitle="Monitor infrastructure, roles, integrations and audit trails across the Valerion platform."
        actions={<button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury inline-flex items-center gap-2"><ShieldCheck className="size-4" /> Security scan</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard index={0} label="System users" value="412" icon={<Users className="size-5" />} accent="primary" />
        <StatCard index={1} label="Active sessions" value="284" delta="Live" icon={<Activity className="size-5" />} accent="success" />
        <StatCard index={2} label="API calls · today" value="1.42M" delta="+8.4%" icon={<Zap className="size-5" />} accent="gold" />
        <StatCard index={3} label="Uptime · 30d" value="99.97%" icon={<Server className="size-5" />} accent="info" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <LuxeCard className="xl:col-span-2">
          <SectionTitle title="Server performance · 24h" description="CPU and memory utilisation across the cluster" />
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={perf}>
                <defs>
                  <linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--gold)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--gold)" stopOpacity={0} /></linearGradient>
                  <linearGradient id="mem" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--info)" stopOpacity={0.3} /><stop offset="100%" stopColor="var(--info)" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="t" stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="cpu" stroke="var(--gold)" strokeWidth={2} fill="url(#cpu)" />
                <Area type="monotone" dataKey="mem" stroke="var(--info)" strokeWidth={2} fill="url(#mem)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Roles & permissions" />
          <div className="space-y-2">
            {[
              { role: "Super Admin", count: 3, tone: "destructive" as const },
              { role: "HR Admin", count: 12, tone: "gold" as const },
              { role: "Manager", count: 48, tone: "info" as const },
              { role: "Employee", count: 349, tone: "success" as const },
            ].map((r) => (
              <div key={r.role} className="flex items-center justify-between p-3 rounded-xl border">
                <div className="text-sm font-medium">{r.role}</div>
                <Chip tone={r.tone}>{r.count} users</Chip>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full h-10 rounded-xl border text-sm font-medium hover:bg-muted">Manage permission matrix</button>
        </LuxeCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LuxeCard>
          <SectionTitle title="Services status" />
          <div className="space-y-2">
            {services.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-xl border">
                <div className="flex items-center gap-3">
                  <span className={`size-2 rounded-full ${s.status === "Operational" ? "bg-success" : "bg-warning"} shadow-[0_0_10px_currentColor]`} />
                  <div>
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.latency} · {s.uptime}</div>
                  </div>
                </div>
                <Chip tone={s.status === "Operational" ? "success" : "warning"}>{s.status}</Chip>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Integrations" action={<button className="text-xs text-gold font-medium">Add</button>} />
          <div className="grid grid-cols-2 gap-2">
            {integrations.map((i) => (
              <div key={i.name} className="p-3 rounded-xl border">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg gradient-gold grid place-items-center text-gold-foreground text-xs font-bold">
                    {i.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{i.name}</div>
                    <div className="text-[10px] text-muted-foreground">{i.type}</div>
                  </div>
                </div>
                <Chip tone={i.status === "Connected" ? "success" : "info"}>{i.status}</Chip>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LuxeCard>
          <SectionTitle title="Database" />
          <div className="space-y-3">
            {[
              { k: "Storage", v: "1.24 TB / 4 TB", pct: 31 },
              { k: "Connections", v: "82 / 500", pct: 16 },
              { k: "Replication lag", v: "12 ms", pct: 8 },
              { k: "Backup", v: "Fresh · 2h ago", pct: 100 },
            ].map((s) => (
              <div key={s.k}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{s.k}</span>
                  <span className="font-medium">{s.v}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full gradient-gold" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Templates" />
          <div className="space-y-2 text-sm">
            {[
              { icon: Mail, name: "Offer letter · v4", uses: 42 },
              { icon: Mail, name: "Welcome email · Milan", uses: 28 },
              { icon: GitBranch, name: "Onboarding workflow", uses: 152 },
              { icon: Mail, name: "Anniversary card", uses: 89 },
            ].map((t) => (
              <div key={t.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60">
                <t.icon className="size-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{t.name}</div>
                </div>
                <span className="text-[11px] text-muted-foreground">{t.uses}</span>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Security" />
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10">
              <ShieldCheck className="size-5 text-success" />
              <div>
                <div className="font-medium">Encryption enabled</div>
                <div className="text-[11px] text-muted-foreground">AES-256 at rest · TLS 1.3</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gold/10">
              <Database className="size-5 text-gold" />
              <div>
                <div className="font-medium">2FA enforced</div>
                <div className="text-[11px] text-muted-foreground">412 / 412 users</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-info/10">
              <Activity className="size-5 text-info" />
              <div>
                <div className="font-medium">3 sessions flagged</div>
                <div className="text-[11px] text-muted-foreground">Unfamiliar geo · review</div>
              </div>
            </div>
          </div>
        </LuxeCard>
      </div>

      <LuxeCard>
        <SectionTitle title="Recent audit logs" action={<button className="text-xs text-gold font-medium">View all</button>} />
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b">
                <th className="px-5 py-2 font-medium">Time</th>
                <th className="px-5 py-2 font-medium">User</th>
                <th className="px-5 py-2 font-medium">Action</th>
                <th className="px-5 py-2 font-medium">Target</th>
                <th className="px-5 py-2 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_LOGS.map((l, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/40 transition">
                  <td className="px-5 py-3 font-mono text-xs">{l.time}</td>
                  <td className="px-5 py-3">{l.user}</td>
                  <td className="px-5 py-3">{l.action}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.target}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{l.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LuxeCard>
    </div>
  );
}
