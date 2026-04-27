import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  CartesianGrid, Legend,
} from "recharts";
import { useIncomes } from "@/hooks/useIncomes";
import { useExpenses } from "@/hooks/useExpenses";
import MainLayout from "@/components/MainLayout";
import { Loader2 } from "lucide-react";
import { format, parseISO, startOfMonth } from "date-fns";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-md px-3 py-2 text-xs shadow-sm">
      {label && <p className="font-medium text-foreground mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="text-muted-foreground">
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const { incomes, isLoading: loadingIncome } = useIncomes();
  const { expenses, isLoading: loadingExpense } = useExpenses();

  // ── 1. Income vs Expenses (simple bar) ──────────────────────────
  const summaryData = useMemo(() => {
    const totalIncome = (incomes ?? []).reduce((s, i) => s + i.amount, 0);
    const totalExpenses = (expenses ?? []).reduce((s, e) => s + e.amount, 0);
    return [
      { name: "Income", value: totalIncome },
      { name: "Expenses", value: totalExpenses },
      { name: "Balance", value: totalIncome - totalExpenses },
    ];
  }, [incomes, expenses]);

  // ── 2. Monthly Trend (income + expense per month) ────────────────
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; income: number; expenses: number }> = {};

    (incomes ?? []).forEach((i) => {
      const key = format(startOfMonth(parseISO(i.date)), "MMM yy");
      if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 };
      map[key].income += i.amount;
    });

    (expenses ?? []).forEach((e) => {
      const key = format(startOfMonth(parseISO(e.date)), "MMM yy");
      if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 };
      map[key].expenses += e.amount;
    });

    return Object.values(map).sort(
      (a, b) => new Date("01 " + a.month).getTime() - new Date("01 " + b.month).getTime()
    );
  }, [incomes, expenses]);

  // ── 3. Top Expense Categories (pie) ─────────────────────────────
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    (expenses ?? []).forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // ── 4. Cumulative Savings (area) ─────────────────────────────────
  const savingsData = useMemo(() => {
    const events: { date: string; delta: number }[] = [
      ...(incomes ?? []).map((i) => ({ date: i.date, delta: i.amount })),
      ...(expenses ?? []).map((e) => ({ date: e.date, delta: -e.amount })),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let running = 0;
    return events.map((ev) => {
      running += ev.delta;
      return {
        date: format(parseISO(ev.date), "dd MMM"),
        balance: running,
      };
    });
  }, [incomes, expenses]);

  // Gray shades for pie slices
  const PIE_COLORS = ["#111", "#444", "#666", "#888", "#aaa", "#ccc", "#ddd"];

  const isLoading = loadingIncome || loadingExpense;
  const hasData =
    (incomes ?? []).length > 0 || (expenses ?? []).length > 0;

  if (isLoading) {
    return (
      <MainLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Analytics">
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visual breakdown of your financial data
          </p>
        </div>

        {!hasData ? (
          <div className="border border-dashed border-border rounded-lg px-6 py-16 text-center">
            <p className="text-sm font-medium text-foreground">No data yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add income or expenses to see your analytics charts
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* ── Chart 1: Income vs Expenses ── */}
            <div className="bg-card border border-border rounded-lg p-5">
              <p className="text-sm font-heading font-semibold text-foreground mb-4">
                Income vs Expenses
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={summaryData} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)}
                    tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(0,0%,93%)" }} />
                  <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
                    {summaryData.map((_, i) => (
                      <Cell key={i} fill={i === 2 ? "#888" : i === 0 ? "#111" : "#444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ── Chart 2: Monthly Trend ── */}
            <div className="bg-card border border-border rounded-lg p-5">
              <p className="text-sm font-heading font-semibold text-foreground mb-4">
                Monthly Trend
              </p>
              {monthlyData.length === 0 ? (
                <div className="flex items-center justify-center h-[220px] text-xs text-muted-foreground">
                  Not enough data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)}
                      tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={52}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: "hsl(0,0%,45%)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#111"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#111" }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      name="Expenses"
                      stroke="#888"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      dot={{ r: 3, fill: "#888" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── Chart 3: Top Categories ── */}
            <div className="bg-card border border-border rounded-lg p-5">
              <p className="text-sm font-heading font-semibold text-foreground mb-4">
                Expense by Category
              </p>
              {categoryData.length === 0 ? (
                <div className="flex items-center justify-center h-[220px] text-xs text-muted-foreground">
                  No expense data
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={220}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="hsl(var(--background))"
                      >
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <ul className="flex-1 space-y-2 text-xs min-w-0">
                    {categoryData.map((cat, i) => (
                      <li key={cat.name} className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="text-muted-foreground truncate">{cat.name}</span>
                        <span className="ml-auto font-medium text-foreground flex-shrink-0">
                          {fmt(cat.value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── Chart 4: Running Balance ── */}
            <div className="bg-card border border-border rounded-lg p-5">
              <p className="text-sm font-heading font-semibold text-foreground mb-4">
                Running Balance
              </p>
              {savingsData.length === 0 ? (
                <div className="flex items-center justify-center h-[220px] text-xs text-muted-foreground">
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={savingsData}>
                    <defs>
                      <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#111" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#111" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,88%)" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v) => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)}
                      tick={{ fill: "hsl(0,0%,45%)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={52}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="balance"
                      name="Balance"
                      stroke="#111"
                      strokeWidth={2}
                      fill="url(#balanceGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#111" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
