import { createFileRoute } from "@tanstack/react-router";
import { Plus, MessageSquare, BookOpen } from "lucide-react";
import { PageHeader, LuxeCard, SectionTitle, StatCard, Chip } from "@/components/layout/primitives";
import { TICKETS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/helpdesk")({ component: Helpdesk });

function Helpdesk() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Support"
        title="Helpdesk"
        subtitle="A single concierge for IT, HR, facilities and finance requests."
        actions={<button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury inline-flex items-center gap-2"><Plus className="size-4" /> New ticket</button>}
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard index={0} label="Open tickets" value={12} accent="warning" />
        <StatCard index={1} label="In progress" value={8} accent="info" />
        <StatCard index={2} label="Resolved · week" value={47} accent="success" />
        <StatCard index={3} label="Avg resolution" value="4h 12m" delta="-32m" accent="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LuxeCard className="lg:col-span-2">
          <SectionTitle title="Recent tickets" />
          <div className="space-y-2">
            {TICKETS.map((t) => (
              <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-muted/40 transition">
                <div className="size-10 rounded-xl gradient-primary grid place-items-center text-primary-foreground"><MessageSquare className="size-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground">{t.id}</span>
                    <span className="font-medium truncate">{t.subject}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">by {t.requester} · updated {t.updated} ago</div>
                </div>
                <Chip tone={t.priority === "High" ? "destructive" : t.priority === "Medium" ? "warning" : "info"}>{t.priority}</Chip>
                <Chip tone={t.status === "Open" ? "warning" : t.status === "Resolved" || t.status === "Closed" ? "success" : "info"}>{t.status}</Chip>
              </div>
            ))}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle title="Knowledge base" action={<button className="text-xs text-gold font-medium">All articles</button>} />
          <div className="space-y-2">
            {[
              "How to request a new laptop",
              "Setting up your @valerion mail on iPhone",
              "Booking an Atelier meeting room",
              "Expense claim & reimbursement",
              "Requesting business travel",
            ].map((a) => (
              <div key={a} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer">
                <BookOpen className="size-4 text-gold shrink-0 mt-0.5" />
                <div className="text-sm">{a}</div>
              </div>
            ))}
          </div>
        </LuxeCard>
      </div>
    </div>
  );
}
