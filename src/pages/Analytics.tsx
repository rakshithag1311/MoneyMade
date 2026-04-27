import MainLayout from "@/components/MainLayout";
import { BarChart2 } from "lucide-react";

const AnalyticsPage = () => {
  return (
    <MainLayout title="Analytics">
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visual breakdown of your financial data
          </p>
        </div>

        {/* Placeholder sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["Income vs Expenses", "Monthly Trend", "Top Categories", "Savings Rate"].map(
            (title) => (
              <div
                key={title}
                className="bg-card border border-border rounded-lg p-6 flex flex-col items-center justify-center gap-3 min-h-[180px]"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground text-center">
                  Charts will appear here
                </p>
              </div>
            )
          )}
        </div>

        <div className="border border-dashed border-border rounded-lg px-6 py-12 text-center">
          <BarChart2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Coming Soon</p>
          <p className="text-xs text-muted-foreground mt-1">
            Analytics charts and insights will be available here
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
