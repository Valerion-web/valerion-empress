import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Wallet, TrendingUp, Receipt } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle, StatCard, Chip } from "@/components/layout/primitives";
import { PAYROLL_TREND } from "@/lib/mock-data";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/_app/payroll")({ component: Payroll });

function Payroll() {
  const payslips = ["November 2025","October 2025","September 2025","August 2025","July 2025","June 2025"];
  const composition = [
    { label: "Base salary", value: 9200, tone: "primary" },
    { label: "Performance bonus", value: 1200, tone: "gold" },
    { label: "Meal allowance", value: 320, tone: "info" },
    { label: "Transport", value: 180, tone: "info" },
    { label: "Income tax", value: -2358, tone: "destructive" },
    { label: "Social security", value: -1420, tone: "destructive" },
    { label: "Pension", value: -280, tone: "warning" },
  ];
  const net = composition.reduce((a, c) => a + c.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compensation"
        title="Payroll"
        subtitle="Salary, allowances, deductions and tax — beautifully accounted for."
        actions={<button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury inline-flex items-center gap-2"><Download className="size-4" /> Download payslip</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard index={0} label="Net pay · Nov" value="€ 6,842" delta="+2.1%" icon={<Wallet className="size-5" />} accent="gold" />
        <StatCard index={1} label="YTD gross" value="€ 92.1K" icon={<TrendingUp className="size-5" />} accent="primary" />
        <StatCard index={2} label="YTD tax" value="€ 26.4K" icon={<Receipt className="size-5" />} accent="info" />
        <StatCard index={3} label="Bonus · Q3" value="€ 4,200" delta="Paid Oct 25" icon={<FileText className="size-5" />} accent="success" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <LuxeCard className="xl:col-span-2">
          <SectionTitle title="Payroll trend · 12 months" description="Company-wide composition" />
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={PAYROLL_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `€${(v/1_000_000).toFixed(1)}M`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} formatter={(v: number) => `€${v.toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="base" stackId="a" fill="var(--primary)" />
                <Bar dataKey="bonus" stackId="a" fill="var(--gold)" />
                <Bar dataKey="tax" stackId="a" fill="var(--info)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </LuxeCard>

        <LuxeCard>
          <div className="rounded-2xl gradient-hero p-5 -m-5 mb-4 text-white">
            <div className="text-xs opacity-70 uppercase tracking-wider">November 2025 · Payslip</div>
            <div className="mt-3 flex items-baseline gap-2">
              <div className="font-display text-4xl">€ {net.toLocaleString()}</div>
              <div className="text-xs opacity-70">net</div>
            </div>
          </div>
          <div className="space-y-2">
            {composition.map((c) => (
              <div key={c.label} className="flex items-center justify-between text-sm py-1.5 border-b border-border/60 last:border-0">
                <span className="text-muted-foreground">{c.label}</span>
                <span className={`font-mono font-medium ${c.value < 0 ? "text-destructive" : ""}`}>€ {c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LuxeCard>
          <SectionTitle title="Payslip history" />
          <div className="space-y-2">
            {payslips.map((p, i) => (
              <div key={p} className="flex items-center justify-between p-3 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg gradient-primary grid place-items-center text-primary-foreground"><FileText className="size-5" /></div>
                  <div>
                    <div className="text-sm font-medium">{p}</div>
                    <div className="text-[11px] text-muted-foreground">Issued {["Nov 30","Oct 31","Sep 30","Aug 31","Jul 31","Jun 30"][i]}, 2025</div>
                  </div>
                </div>
                <button className="h-9 px-3 rounded-lg border text-xs font-medium hover:bg-muted inline-flex items-center gap-1"><Download className="size-3.5" /> PDF</button>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Bank & tax details" />
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl border">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Salary account</div>
              <div className="mt-1.5 font-mono">IT60 X054 2811 1010 0000 0123 456</div>
              <div className="text-[11px] text-muted-foreground">UniCredit · Milan</div>
            </div>
            <div className="p-4 rounded-xl border">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Tax code</div>
              <div className="mt-1.5 font-mono">MRCLNE85M52F205X</div>
              <div className="text-[11px] text-muted-foreground">Italian resident · 43% marginal rate</div>
            </div>
            <div className="p-4 rounded-xl border flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Pension plan</div>
                <div className="text-sm font-medium mt-1">Fondo Cometa · 5% match</div>
              </div>
              <Chip tone="success">Active</Chip>
            </div>
          </div>
        </LuxeCard>
      </div>
    </div>
  );
}
