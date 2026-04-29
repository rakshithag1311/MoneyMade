import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncomes } from "@/hooks/useIncomes";
import { 
  FileText, 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  Calendar,
  Plus,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, isWithinInterval } from "date-fns";

type DateFilter = "this-month" | "last-month" | "this-year" | "last-year" | "all-time";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

const ReportsPage = () => {
  const navigate = useNavigate();
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { incomes, isLoading: incomesLoading } = useIncomes();
  const [dateFilter, setDateFilter] = useState<DateFilter>("this-month");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const isLoading = expensesLoading || incomesLoading;

  // Get date range based on filter
  const getDateRange = (filter: DateFilter) => {
    const now = new Date();
    switch (filter) {
      case "this-month":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "last-month":
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case "this-year":
        return { start: startOfYear(now), end: endOfYear(now) };
      case "last-year":
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        return { start: startOfYear(lastYear), end: endOfYear(lastYear) };
      case "all-time":
        return { start: new Date(2000, 0, 1), end: new Date(2100, 0, 1) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const dateRange = getDateRange(dateFilter);

  // Filter data by date range
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.created_at || expense.date || new Date());
      const inRange = isWithinInterval(expenseDate, dateRange);
      const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
      return inRange && matchesCategory;
    });
  }, [expenses, dateRange, categoryFilter]);

  const filteredIncomes = useMemo(() => {
    if (!incomes) return [];
    return incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return isWithinInterval(incomeDate, dateRange);
    });
  }, [incomes, dateRange]);

  // Calculate totals
  const totalIncome = useMemo(() => 
    filteredIncomes.reduce((sum, income) => sum + Number(income.amount), 0),
    [filteredIncomes]
  );

  const totalExpenses = useMemo(() => 
    filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
    [filteredExpenses]
  );

  const savings = totalIncome - totalExpenses;

  // Get unique categories
  const categories = useMemo(() => {
    if (!expenses) return [];
    const uniqueCategories = [...new Set(expenses.map(e => e.category))];
    return uniqueCategories.filter(Boolean);
  }, [expenses]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    filteredExpenses.forEach(expense => {
      const category = expense.category || "Uncategorized";
      categoryMap.set(category, (categoryMap.get(category) || 0) + Number(expense.amount));
    });
    
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
        percentage: totalExpenses > 0 ? ((value / totalExpenses) * 100).toFixed(1) : "0"
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredExpenses, totalExpenses]);

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, { income: number; expenses: number }>();
    
    filteredIncomes.forEach(income => {
      const month = format(new Date(income.date), "MMM yyyy");
      const current = monthMap.get(month) || { income: 0, expenses: 0 };
      monthMap.set(month, { ...current, income: current.income + Number(income.amount) });
    });

    filteredExpenses.forEach(expense => {
      const month = format(new Date(expense.created_at || expense.date || new Date()), "MMM yyyy");
      const current = monthMap.get(month) || { income: 0, expenses: 0 };
      monthMap.set(month, { ...current, expenses: current.expenses + Number(expense.amount) });
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        income: Number(data.income.toFixed(2)),
        expenses: Number(data.expenses.toFixed(2)),
        savings: Number((data.income - data.expenses).toFixed(2))
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  }, [filteredIncomes, filteredExpenses]);

  // Net worth trend (cumulative savings over time)
  const netWorthData = useMemo(() => {
    const allTransactions = [
      ...filteredIncomes.map(i => ({ date: new Date(i.date), amount: Number(i.amount), type: 'income' })),
      ...filteredExpenses.map(e => ({ date: new Date(e.created_at || e.date || new Date()), amount: -Number(e.amount), type: 'expense' }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    let cumulative = 0;
    const netWorthMap = new Map<string, number>();

    allTransactions.forEach(transaction => {
      cumulative += transaction.amount;
      const month = format(transaction.date, "MMM yyyy");
      netWorthMap.set(month, cumulative);
    });

    return Array.from(netWorthMap.entries())
      .map(([month, netWorth]) => ({
        month,
        netWorth: Number(netWorth.toFixed(2))
      }));
  }, [filteredIncomes, filteredExpenses]);

  const hasData = (expenses && expenses.length > 0) || (incomes && incomes.length > 0);

  if (isLoading) {
    return (
      <MainLayout title="Reports">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!hasData) {
    return (
      <MainLayout title="Reports">
        <div className="animate-fade-in">
          <div className="border border-dashed border-border rounded-lg px-6 py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No data available</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add income or expenses to see your financial reports
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/income")} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Income
              </Button>
              <Button onClick={() => navigate("/expenses")} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Expense
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Reports">
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Financial Reports</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Comprehensive analysis of your finances
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>

            {categories.length > 0 && (
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className={`${savings >= 0 ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900' : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900'} border rounded-lg p-4`}>
                <p className="text-sm text-muted-foreground mb-1">Savings</p>
                <p className={`text-2xl font-bold ${savings >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  ${savings.toFixed(2)}
                </p>
              </div>
            </div>

            {monthlyData.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Category Report */}
        {categoryData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {categoryData.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${category.value.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{category.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Income Statement */}
        {filteredIncomes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Income Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredIncomes.map(income => (
                  <div key={income.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{income.source}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(income.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      +${Number(income.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg mt-4">
                  <p className="text-sm font-semibold">Total Income</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    ${totalIncome.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Net Worth Report */}
        {netWorthData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Net Worth Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Current Net Worth</p>
                <p className={`text-3xl font-bold ${netWorthData[netWorthData.length - 1]?.netWorth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${netWorthData[netWorthData.length - 1]?.netWorth.toFixed(2) || '0.00'}
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={netWorthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="netWorth" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Net Worth"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
