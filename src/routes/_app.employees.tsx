import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Filter, Plus, Download, MoreHorizontal, Mail, Phone, MapPin } from "lucide-react";
import { PageHeader, LuxeCard, Chip } from "@/components/layout/primitives";
import { EMPLOYEES, DEPARTMENTS } from "@/lib/mock-data";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/employees")({ component: Employees });

function Employees() {
  const [view, setView] = useState<"grid" | "table">("grid");
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("All");
  const filtered = EMPLOYEES.filter((e) =>
    (dept === "All" || e.department === dept) &&
    (query === "" || e.name.toLowerCase().includes(query.toLowerCase()) || e.title.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Employee directory"
        subtitle={`${EMPLOYEES.length} colleagues across ${DEPARTMENTS.length} departments and 6 cities.`}
        actions={
          <>
            <button className="h-10 px-4 rounded-xl border border-input text-sm font-medium hover:bg-muted inline-flex items-center gap-2"><Download className="size-4" /> Export</button>
            <button className="h-10 px-4 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold shadow-luxury inline-flex items-center gap-2"><Plus className="size-4" /> Add employee</button>
          </>
        }
      />

      <LuxeCard>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or title…" className="w-full h-10 pl-10 pr-3 rounded-xl bg-muted/60 border border-transparent focus:border-gold focus:bg-card outline-none text-sm" />
          </div>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="h-10 rounded-xl border border-input bg-card px-3 text-sm outline-none">
            <option>All</option>
            {DEPARTMENTS.map((d) => <option key={d.name}>{d.name}</option>)}
          </select>
          <button className="h-10 px-3 rounded-xl border border-input text-sm inline-flex items-center gap-2"><Filter className="size-4" /> Filters</button>
          <div className="ml-auto flex rounded-xl border overflow-hidden">
            {(["grid","table"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-3 h-10 text-xs font-medium ${view === v ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{v}</button>
            ))}
          </div>
        </div>
      </LuxeCard>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="rounded-2xl border bg-card p-5 card-lift"
            >
              <div className="flex items-start justify-between">
                <div className="size-14 rounded-2xl gradient-primary grid place-items-center text-primary-foreground font-semibold shadow-luxury">{e.avatar}</div>
                <button className="size-8 grid place-items-center rounded-lg hover:bg-muted"><MoreHorizontal className="size-4" /></button>
              </div>
              <div className="mt-4 font-semibold">{e.name}</div>
              <div className="text-xs text-muted-foreground">{e.title}</div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                <MapPin className="size-3" /> {e.location}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Chip tone="gold">{e.department.split(" ")[0]}</Chip>
                <Chip tone={e.status === "Active" ? "success" : e.status === "Remote" ? "info" : "default"}>{e.status}</Chip>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs">
                <div>
                  <div className="text-muted-foreground">Performance</div>
                  <div className="font-display text-lg text-gradient-gold font-semibold">{e.performance.toFixed(1)}</div>
                </div>
                <div className="flex gap-1">
                  <button className="size-8 grid place-items-center rounded-lg border hover:bg-muted"><Mail className="size-3.5" /></button>
                  <button className="size-8 grid place-items-center rounded-lg border hover:bg-muted"><Phone className="size-3.5" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <LuxeCard className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                {["Name","Department","Title","Location","Status","Joined","Performance"].map((h) => <th key={h} className="px-5 py-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t hover:bg-muted/40 transition">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full gradient-primary grid place-items-center text-primary-foreground text-xs font-semibold">{e.avatar}</div>
                      <div>
                        <div className="font-medium">{e.name}</div>
                        <div className="text-[11px] text-muted-foreground">{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">{e.department}</td>
                  <td className="px-5 py-3 text-muted-foreground">{e.title}</td>
                  <td className="px-5 py-3">{e.location}</td>
                  <td className="px-5 py-3"><Chip tone={e.status === "Active" ? "success" : "info"}>{e.status}</Chip></td>
                  <td className="px-5 py-3 text-muted-foreground">{e.joined}</td>
                  <td className="px-5 py-3"><span className="font-display font-semibold text-gradient-gold">{e.performance.toFixed(1)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </LuxeCard>
      )}
    </div>
  );
}
