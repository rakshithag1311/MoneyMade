import { Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useIncomes } from "@/hooks/useIncomes";
import { useExpenses } from "@/hooks/useExpenses";
import MainLayout from "@/components/MainLayout";

const StatCard = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) => (
  <div className="bg-card border border-border rounded-lg p-5">
    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
      {label}
    </p>
    <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </div>
);

type TxType = "income" | "expense";

interface Transaction {
  id: string;
  label: string;
  amount: number;
  date: string;
  type: TxType;
  sub: string;
}

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

const Dashboard = () => {
  const { profile, isLoading: loadingProfile } = useProfile();
  const { incomes, isLoading: loadingIncomes } = useIncomes();
  const { expenses, isLoading: loadingExpenses } = useExpenses();

  if (loadingProfile || loadingIncomes || loadingExpenses) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  const totalIncome = (incomes ?? []).reduce((s, i) => s + i.amount, 0);
  const totalExpenses = (expenses ?? []).reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Build recent transactions list (last 8)
  const incomeRows: Transaction[] = (incomes ?? []).map((i) => ({
    id: i.id,
    label: i.source,
    amount: i.amount,
    date: i.date,
    type: "income",
    sub: "Income",
  }));
  const expenseRows: Transaction[] = (expenses ?? []).map((e) => ({
    id: e.id,
    label: e.description,
    amount: e.amount,
    date: e.date,
    type: "expense",
    sub: e.category,
  }));
  const recentTx = [...incomeRows, ...expenseRows]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const username = profile?.username || "User";

  return (
    <MainLayout title="Dashboard">
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-2xl font-heading font-bold text-foreground mt-0.5">
            {username}
          </h1>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Balance"
            value={fmt(balance)}
            sub={balance >= 0 ? "Surplus" : "Deficit"}
          />
          <StatCard
            label="Total Income"
            value={fmt(totalIncome)}
            sub={`${(incomes ?? []).length} entries`}
          />
          <StatCard
            label="Total Expenses"
            value={fmt(totalExpenses)}
            sub={`${(expenses ?? []).length} entries`}
          />
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-base font-heading font-semibold text-foreground mb-3">
            Recent Transactions
          </h2>
          {recentTx.length === 0 ? (
            <div className="bg-card border border-border rounded-lg px-6 py-12 text-center">
              <p className="text-muted-foreground text-sm">
                No transactions yet. Add income or expenses to get started.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
              {recentTx.map((tx) => (
                <div
                  key={tx.id + tx.type}
                  className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-1.5 h-8 rounded-full flex-shrink-0 ${
                        tx.type === "income" ? "bg-foreground" : "bg-muted-foreground"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {tx.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.sub} ·{" "}
                        {new Date(tx.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-heading font-semibold ml-4 flex-shrink-0 ${
                      tx.type === "income"
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {fmt(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
