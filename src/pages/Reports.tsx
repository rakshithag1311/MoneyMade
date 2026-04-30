import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/MainLayout";
import { useExpenses } from "@/hooks/useExpenses";
import { useIncomes } from "@/hooks/useIncomes";
import { useAuth } from "@/lib/auth";
import { 
  FileText, 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  Calendar,
  Plus,
  Loader2,
  Download,
  Cloud
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
import { generateMonthlyReport, downloadReport, getReportBlob } from "@/lib/reportGenerator";
import { uploadToGoogleDrive, checkGoogleDriveAccess } from "@/lib/googleDrive";
import { toast } from "sonner";

type DateFilter = "this-month" | "last-month" | "this-year" | "last-year" | "all-time";

// Grayscale colors for charts
const COLORS = ['#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3'];

const ReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { incomes, isLoading: incomesLoading } = useIncomes();
  const [dateFilter, setDateFilter] = useState<DateFilter>("this-month");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasGoogleDrive, setHasGoogleDrive] = useState(false);

  const isLoading = expensesLoading || incomesLoading;

  // Check Google Drive access on mount
  useMemo(async () => {
    const hasAccess = await checkGoogleDriveAccess();
    setHasGoogleDrive(hasAccess);
  }, []);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      // Prepare report data
      const reportData = {
        incomes: filteredIncomes,
        expenses: filteredExpenses,
        totalIncome,
        totalExpenses,
        savings,
        categoryData,
        dateRange: getDateRangeLabel(dateFilter),
        userName: user?.user_metadata?.full_name || user?.email || 'User'
      };

      // Generate PDF
      const doc = generateMonthlyReport(reportData);
      const fileName = `MoneyMade_Report_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`;

      // Check if user has Google Drive access
      if (hasGoogleDrive) {
        // Try to upload to Google Drive
        const blob = getReportBlob(doc);
        const result = await uploadToGoogleDrive(blob, fileName);

        if (result.success) {
          toast.success('Report saved to Google Drive!', {
            description: 'Your monthly report has been uploaded to your Google Drive.',
            duration: 5000
          });
          
          // Also download locally
          downloadReport(doc, fileName);
        } else {
          // Fallback to local download
          toast.warning('Saved locally', {
            description: result.error || 'Could not upload to Google Drive. Report downloaded to your device.',
            duration: 5000
          });
          downloadReport(doc, fileName);
        }
      } else {
        // Just download locally
        downloadReport(doc, fileName);
        toast.success('Report downloaded!', {
          description: 'Your monthly report has been saved to your device.',
          duration: 3000
        });
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report', {
        description: error.message || 'Please try again.',
        duration: 4000
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getDateRangeLabel = (filter: DateFilter): string => {
    const now = new Date();
    switch (filter) {
      case "this-month":
        return format(now, 'MMMM yyyy');
      case "last-month":
        return format(subMonths(now, 1), 'MMMM yyyy');
      case "this-year":
        return format(now, 'yyyy');
      case "last-year":
        return format(new Date(now.getFullYear() - 1, 0, 1), 'yyyy');
      case "all-time":
        return 'All Time';
      default:
        return format(now, 'MMMM yyyy');
    }
  };

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
        <div className="flex items-center justify-center h-64 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin text-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!hasData) {
    return (
      <MainLayout title="Reports">
        <div className="animate-fade-in">
          <div className="border border-dashed border-border rounded-lg px-6 py-16 text-center transition-all duration-300 hover:border-foreground/30">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No data available</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Add income or expenses to see your financial reports
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate("/income")} className="gap-2 transition-all duration-200 hover:scale-105">
                <Plus className="w-4 h-4" />
                Add Income
              </Button>
              <Button onClick={() => navigate("/expenses")} variant="outline" className="gap-2 transition-all duration-200 hover:scale-105">
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
          
          {/* Download Button and Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Download Report Button */}
            <Button
              onClick={handleDownloadReport}
              disabled={isDownloading || !hasData}
              className="bg-black hover:bg-gray-800 text-white gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  {hasGoogleDrive ? <Cloud className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                  Download Monthly Report
                </>
              )}
            </Button>

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
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{totalIncome.toFixed(2)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border border-gray-400 dark:border-gray-600 rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{totalExpenses.toFixed(2)}
                </p>
              </div>
              <div className={`bg-gradient-to-br ${savings >= 0 ? 'from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800' : 'from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700'} border ${savings >= 0 ? 'border-gray-500 dark:border-gray-500' : 'border-gray-600 dark:border-gray-400'} rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:shadow-md`}>
                <p className="text-sm text-muted-foreground mb-1">Savings</p>
                <p className={`text-2xl font-bold ${savings >= 0 ? 'text-foreground' : 'text-gray-700 dark:text-gray-300'}`}>
                  ₹{savings.toFixed(2)}
                </p>
              </div>
            </div>

            {monthlyData.length > 0 && (
              <div className="transition-all duration-500 animate-fade-in">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#666666" />
                    <XAxis dataKey="month" stroke="#333333" />
                    <YAxis stroke="#333333" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #333333',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => `₹${value}`}
                    />
                    <Legend />
                    <Bar dataKey="income" fill="#1a1a1a" name="Income" animationDuration={1000} />
                    <Bar dataKey="expenses" fill="#666666" name="Expenses" animationDuration={1000} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Report */}
        {categoryData.length > 0 && (
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="transition-all duration-500 animate-fade-in">
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
                        animationDuration={1000}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `₹${value}`} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {categoryData.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg transition-all duration-300 hover:scale-102 hover:shadow-md animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded transition-transform duration-300 hover:scale-125" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">₹{category.value.toFixed(2)}</p>
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
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Income Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredIncomes.map((income, index) => (
                  <div key={income.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg transition-all duration-300 hover:scale-102 hover:shadow-md animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <div>
                      <p className="text-sm font-medium">{income.source}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(income.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      +₹{Number(income.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 border border-gray-400 dark:border-gray-600 rounded-lg mt-4 transition-all duration-300 hover:shadow-lg">
                  <p className="text-sm font-semibold">Total Income</p>
                  <p className="text-lg font-bold text-foreground">
                    ₹{totalIncome.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Net Worth Report */}
        {netWorthData.length > 0 && (
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Net Worth Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg transition-all duration-300 hover:shadow-md">
                <p className="text-sm text-muted-foreground mb-1">Current Net Worth</p>
                <p className={`text-3xl font-bold ${netWorthData[netWorthData.length - 1]?.netWorth >= 0 ? 'text-foreground' : 'text-gray-600 dark:text-gray-400'} transition-all duration-300`}>
                  ₹{netWorthData[netWorthData.length - 1]?.netWorth.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="transition-all duration-500 animate-fade-in">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={netWorthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#666666" />
                    <XAxis dataKey="month" stroke="#333333" />
                    <YAxis stroke="#333333" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #333333',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => `₹${value}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="netWorth" 
                      stroke="#1a1a1a" 
                      strokeWidth={3}
                      name="Net Worth"
                      animationDuration={1500}
                      dot={{ fill: '#000000', r: 4 }}
                      activeDot={{ r: 6, fill: '#333333' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
