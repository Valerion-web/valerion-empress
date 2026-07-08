import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/app-context";
import { EmployeeDashboard } from "@/features/dashboards/employee-dashboard";
import { ManagerDashboard } from "@/features/dashboards/manager-dashboard";
import { HRDashboard } from "@/features/dashboards/hr-dashboard";
import { AdminDashboard } from "@/features/dashboards/admin-dashboard";

export const Route = createFileRoute("/_app/dashboard")({ component: Dashboard });

function Dashboard() {
  const { user } = useApp();
  if (!user) return null;
  if (user.role === "employee") return <EmployeeDashboard />;
  if (user.role === "manager") return <ManagerDashboard />;
  if (user.role === "hr") return <HRDashboard />;
  return <AdminDashboard />;
}
