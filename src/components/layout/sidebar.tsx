import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Briefcase, Sparkles, Clock, CalendarDays, Wallet,
  TrendingUp, GraduationCap, Building2, Laptop, FolderKanban, LifeBuoy,
  FileBarChart2, PieChart, FileText, LogOut, Settings, ShieldCheck, ChevronsLeft,
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

const NAV = [
  { section: "Workspace", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/employees", label: "Employees", icon: Users },
    { to: "/recruitment", label: "Recruitment", icon: Briefcase },
    { to: "/onboarding", label: "Onboarding", icon: Sparkles },
  ]},
  { section: "Operations", items: [
    { to: "/attendance", label: "Attendance", icon: Clock },
    { to: "/leave", label: "Leave", icon: CalendarDays },
    { to: "/payroll", label: "Payroll", icon: Wallet },
    { to: "/performance", label: "Performance", icon: TrendingUp },
    { to: "/learning", label: "Learning", icon: GraduationCap },
  ]},
  { section: "Organisation", items: [
    { to: "/departments", label: "Departments", icon: Building2 },
    { to: "/assets", label: "Assets", icon: Laptop },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/helpdesk", label: "Helpdesk", icon: LifeBuoy },
  ]},
  { section: "Insights", items: [
    { to: "/reports", label: "Reports", icon: FileBarChart2 },
    { to: "/analytics", label: "Analytics", icon: PieChart },
    { to: "/documents", label: "Documents", icon: FileText },
  ]},
  { section: "System", items: [
    { to: "/exit", label: "Exit Management", icon: LogOut },
    { to: "/settings", label: "System Settings", icon: Settings },
    { to: "/audit", label: "Audit Logs", icon: ShieldCheck },
  ]},
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 76 : 268 }}
      transition={{ type: "spring", stiffness: 240, damping: 28 }}
      className="sticky top-0 h-screen shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col z-30"
    >
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border shrink-0">
        <div className="size-9 shrink-0 rounded-xl gradient-gold grid place-items-center shadow-gold">
          <span className="font-display font-bold text-sidebar text-lg">V</span>
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              className="overflow-hidden"
            >
              <div className="font-display text-[15px] leading-tight tracking-wide">House of</div>
              <div className="font-display text-[17px] leading-tight text-gradient-gold font-semibold">Valerion</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-luxe py-4 px-3 space-y-6">
        {NAV.map((group) => (
          <div key={group.section}>
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="px-3 mb-2 text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/50 font-medium"
                >
                  {group.section}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.to || pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gold"
                      />
                    )}
                    <Icon className="size-[18px] shrink-0" strokeWidth={1.75} />
                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}
                          className="truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="mx-3 mb-4 flex items-center justify-center gap-2 rounded-xl border border-sidebar-border/60 py-2.5 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition"
      >
        <ChevronsLeft className={cn("size-4 transition-transform", sidebarCollapsed && "rotate-180")} />
        {!sidebarCollapsed && <span>Collapse</span>}
      </button>
    </motion.aside>
  );
}
