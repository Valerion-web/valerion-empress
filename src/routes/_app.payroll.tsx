import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CheckCircle2, Download, Edit3, FileText, Search, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, LuxeCard, SectionTitle, StatCard, Chip } from "@/components/layout/primitives";
import { useApp } from "@/lib/app-context";
import {
  clearPayrollSession,
  createPayrollRecord,
  deletePayrollRecord,
  exportPayrollCsv,
  exportPayrollExcel,
  exportPayrollPdf,
  getMyPayroll,
  getPayrollDashboard,
  getPayrollList,
  getStoredPayrollSession,
  processPayrollRecord,
  signInPayroll,
  updatePayrollRecord,
  type PayrollRecord,
} from "@/lib/payroll-service";

export const Route = createFileRoute("/_app/payroll")({ component: Payroll });

const emptyDraft = {
  userId: "",
  basicSalary: "",
  allowances: "",
  deductions: "",
  bonus: "",
  month: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
  paymentStatus: "PENDING",
  paymentDate: new Date().toISOString(),
};

function Payroll() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [authReady, setAuthReady] = useState(Boolean(getStoredPayrollSession()));

  const effectiveRole = useMemo(() => {
    if (user?.role === "hr" || user?.role === "admin") return "hr";
    return "employee";
  }, [user]);

  const signInMutation = useMutation({
    mutationFn: () => signInPayroll(effectiveRole),
    onSuccess: () => {
      setAuthReady(true);
      toast.success(`Signed in as ${effectiveRole === "hr" ? "HR" : "Employee"}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!authReady && !signInMutation.isPending) {
      signInMutation.mutate();
    }
  }, [authReady, signInMutation]);

  useEffect(() => {
    return () => {
      clearPayrollSession();
    };
  }, []);

  const dashboardQuery = useQuery({
    queryKey: ["payroll-dashboard", effectiveRole],
    queryFn: () => getPayrollDashboard(),
    enabled: authReady,
  });

  const listQuery = useQuery({
    queryKey: ["payroll-list", page, search, monthFilter, yearFilter, statusFilter],
    queryFn: () => getPayrollList({ page, limit: 8, search, month: monthFilter, year: yearFilter }),
    enabled: authReady && effectiveRole === "hr",
  });

  const myPayrollQuery = useQuery({
    queryKey: ["my-payroll", page],
    queryFn: () => getMyPayroll(getStoredPayrollSession()?.userId ?? "", page, 8),
    enabled: authReady && effectiveRole === "employee",
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createPayrollRecord({
        userId: draft.userId,
        basicSalary: Number(draft.basicSalary),
        allowances: Number(draft.allowances),
        deductions: Number(draft.deductions),
        bonus: Number(draft.bonus),
        month: Number(draft.month),
        year: Number(draft.year),
        paymentStatus: draft.paymentStatus,
        paymentDate: draft.paymentDate,
      }),
    onSuccess: () => {
      setDraft(emptyDraft);
      queryClient.invalidateQueries({ queryKey: ["payroll-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-list"] });
      toast.success("Payroll record created");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: Record<string, string | number> }) =>
      updatePayrollRecord(id, {
        basicSalary: changes.basicSalary ? Number(changes.basicSalary) : undefined,
        allowances: changes.allowances ? Number(changes.allowances) : undefined,
        deductions: changes.deductions ? Number(changes.deductions) : undefined,
        bonus: changes.bonus ? Number(changes.bonus) : undefined,
        paymentStatus:
          typeof changes.paymentStatus === "string" ? changes.paymentStatus : undefined,
      }),
    onSuccess: () => {
      setEditingRecord(null);
      setDraft(emptyDraft);
      queryClient.invalidateQueries({ queryKey: ["payroll-list"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-dashboard"] });
      toast.success("Payroll record updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePayrollRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-list"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-dashboard"] });
      toast.success("Payroll record deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const processMutation = useMutation({
    mutationFn: (id: string) => processPayrollRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-list"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-dashboard"] });
      toast.success("Payroll marked as paid");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const records = useMemo(
    () =>
      effectiveRole === "hr"
        ? (listQuery.data?.payrolls ?? [])
        : (myPayrollQuery.data?.payrolls ?? []),
    [effectiveRole, listQuery.data?.payrolls, myPayrollQuery.data?.payrolls],
  );
  const totalRecords =
    effectiveRole === "hr" ? (listQuery.data?.total ?? 0) : (myPayrollQuery.data?.total ?? 0);
  const isLoading =
    signInMutation.isPending ||
    (!authReady && !dashboardQuery.data) ||
    (effectiveRole === "hr" ? listQuery.isLoading : myPayrollQuery.isLoading);

  const visibleRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        !search ||
        `${record.user?.firstName ?? ""} ${record.user?.lastName ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesMonth = !monthFilter || String(record.month) === monthFilter;
      const matchesYear = !yearFilter || String(record.year) === yearFilter;
      const matchesStatus =
        statusFilter === "all" || record.paymentStatus.toLowerCase() === statusFilter;
      return matchesSearch && matchesMonth && matchesYear && matchesStatus;
    });
  }, [records, monthFilter, search, statusFilter, yearFilter]);

  const summary = [
    {
      label: "Total payroll",
      value: `€ ${Math.round(dashboardQuery.data?.totalPayroll ?? 0).toLocaleString()}`,
      accent: "primary" as const,
      icon: <Wallet className="size-5" />,
    },
    {
      label: "Pending",
      value: dashboardQuery.data?.pendingPayrolls ?? 0,
      accent: "warning" as const,
      icon: <FileText className="size-5" />,
    },
    {
      label: "Avg. salary",
      value: `€ ${Math.round(dashboardQuery.data?.averageSalary ?? 0).toLocaleString()}`,
      accent: "info" as const,
      icon: <Wallet className="size-5" />,
    },
    {
      label: "Peak payout",
      value: `€ ${Math.round(dashboardQuery.data?.maxSalary ?? 0).toLocaleString()}`,
      accent: "success" as const,
      icon: <CheckCircle2 className="size-5" />,
    },
  ];

  const startEditing = (record: PayrollRecord) => {
    setEditingRecord(record);
    setDraft({
      userId: record.userId,
      basicSalary: String(record.basicSalary),
      allowances: String(record.allowances),
      deductions: String(record.deductions),
      bonus: String(record.bonus),
      month: String(record.month),
      year: String(record.year),
      paymentStatus: record.paymentStatus,
      paymentDate: record.paymentDate ?? new Date().toISOString(),
    });
  };

  const submit = () => {
    if (!draft.userId || !draft.basicSalary) {
      toast.error("Please provide an employee and base salary");
      return;
    }

    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, changes: draft });
    } else {
      createMutation.mutate();
    }
  };

  const removeRecord = (id: string) => {
    if (window.confirm("Delete this payroll record?")) {
      deleteMutation.mutate(id);
    }
  };

  const exportVisible = () => {
    if (visibleRecords.length === 0) return;
    exportPayrollCsv(visibleRecords);
    exportPayrollExcel(visibleRecords);
    exportPayrollPdf(visibleRecords);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compensation"
        title="Payroll Management"
        subtitle="View salary records, manage payouts, and export payroll reports from the connected backend."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportVisible}
              className="h-10 rounded-xl border px-4 text-sm font-medium hover:bg-muted inline-flex items-center gap-2"
            >
              <Download className="size-4" /> Export
            </button>
          </div>
        }
      />

      {dashboardQuery.isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {dashboardQuery.error?.message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((item, index) => (
          <StatCard
            key={item.label}
            index={index}
            label={item.label}
            value={item.value}
            icon={item.icon}
            accent={item.accent}
          />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <LuxeCard>
          <SectionTitle
            title="Payroll trend"
            description="Net pay totals by month for the current cycle"
          />
          <div className="h-72">
            {dashboardQuery.data?.monthlySummary?.length ? (
              <ResponsiveContainer>
                <BarChart data={dashboardQuery.data.monthlySummary}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="month"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `€${Number(value).toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                    formatter={(value: number) => `€${value.toLocaleString()}`}
                  />
                  <Bar dataKey="total" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No payroll trend data yet.
              </div>
            )}
          </div>
        </LuxeCard>

        <LuxeCard>
          <SectionTitle
            title={effectiveRole === "hr" ? "Payroll actions" : "Your latest payslip"}
            description={
              effectiveRole === "hr"
                ? "Create or update payroll records for the team"
                : "Stay on top of your latest salary information"
            }
          />
          {effectiveRole === "hr" ? (
            <div className="space-y-3">
              <div className="rounded-xl border p-3 text-sm text-muted-foreground">
                Create a new payroll record or edit an existing one, then mark it as paid once the
                transfer is complete.
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={draft.userId}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, userId: event.target.value }))
                  }
                  className="h-10 rounded-xl border bg-background px-3 text-sm"
                  placeholder="Employee ID"
                />
                <input
                  type="number"
                  value={draft.basicSalary}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, basicSalary: event.target.value }))
                  }
                  className="h-10 rounded-xl border bg-background px-3 text-sm"
                  placeholder="Basic salary"
                />
                <input
                  type="number"
                  value={draft.allowances}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, allowances: event.target.value }))
                  }
                  className="h-10 rounded-xl border bg-background px-3 text-sm"
                  placeholder="Allowances"
                />
                <input
                  type="number"
                  value={draft.deductions}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, deductions: event.target.value }))
                  }
                  className="h-10 rounded-xl border bg-background px-3 text-sm"
                  placeholder="Deductions"
                />
                <input
                  type="number"
                  value={draft.bonus}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, bonus: event.target.value }))
                  }
                  className="h-10 rounded-xl border bg-background px-3 text-sm"
                  placeholder="Bonus"
                />
                <select
                  value={draft.paymentStatus}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, paymentStatus: event.target.value }))
                  }
                  className="h-10 rounded-xl border bg-background px-3 text-sm"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                </select>
                <input
                  type="number"
                  value={draft.month}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, month: event.target.value }))
                  }
                  className="h-10 rounded-xl border bg-background px-3 text-sm"
                  placeholder="Month"
                />
                <input
                  type="number"
                  value={draft.year}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, year: event.target.value }))
                  }
                  className="h-10 rounded-xl border bg-background px-3 text-sm"
                  placeholder="Year"
                />
              </div>
              <button
                onClick={submit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="h-10 w-full rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                {editingRecord ? "Save changes" : "Create payroll record"}
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-xl border p-3">
                Your most recent payslip is available below with the current status and net payment
                amount.
              </div>
              <div className="rounded-xl border p-3">
                {records[0]
                  ? `Latest period: ${records[0].month}/${records[0].year} • ${records[0].paymentStatus}`
                  : "No payroll data available yet."}
              </div>
            </div>
          )}
        </LuxeCard>
      </div>

      <LuxeCard>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            title={effectiveRole === "hr" ? "Payroll ledger" : "Your payroll history"}
            description={
              effectiveRole === "hr"
                ? "Search, filter, and manage salary entries for the team"
                : "Recent payroll records for your account"
            }
          />
          {effectiveRole === "hr" ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  className="h-10 rounded-xl border bg-background pl-9 pr-3 text-sm"
                  placeholder="Search employee"
                />
              </label>
              <input
                type="number"
                value={monthFilter}
                onChange={(event) => {
                  setMonthFilter(event.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-xl border bg-background px-3 text-sm"
                placeholder="Month"
              />
              <input
                type="number"
                value={yearFilter}
                onChange={(event) => {
                  setYearFilter(event.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-xl border bg-background px-3 text-sm"
                placeholder="Year"
              />
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className="h-10 rounded-xl border bg-background px-3 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Loading payroll data…
          </div>
        ) : visibleRecords.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No payroll records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Employee</th>
                  <th className="px-3 py-3">Period</th>
                  <th className="px-3 py-3">Net salary</th>
                  <th className="px-3 py-3">Status</th>
                  {effectiveRole === "hr" ? <th className="px-3 py-3">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={record.id} className="border-t">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
                          <FileText className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {record.user
                              ? `${record.user.firstName} ${record.user.lastName}`
                              : "Employee"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {record.user?.email ?? "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {record.month}/{record.year}
                    </td>
                    <td className="px-3 py-3">€ {record.netSalary.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <Chip tone={record.paymentStatus === "PAID" ? "success" : "warning"}>
                        {record.paymentStatus}
                      </Chip>
                    </td>
                    {effectiveRole === "hr" ? (
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => startEditing(record)}
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-muted inline-flex items-center gap-1"
                          >
                            <Edit3 className="size-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => processMutation.mutate(record.id)}
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-muted inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="size-3.5" /> Pay
                          </button>
                          <button
                            onClick={() => removeRecord(record.id)}
                            className="rounded-lg border px-2 py-1 text-xs hover:bg-muted inline-flex items-center gap-1"
                          >
                            <Trash2 className="size-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
          <div>
            Showing {visibleRecords.length} of {totalRecords} records
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="h-9 rounded-lg border px-3 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={visibleRecords.length < 8}
              onClick={() => setPage((value) => value + 1)}
              className="h-9 rounded-lg border px-3 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </LuxeCard>
    </div>
  );
}
