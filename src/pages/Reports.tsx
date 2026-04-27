import MainLayout from "@/components/MainLayout";
import { FileText } from "lucide-react";

const REPORT_TYPES = [
  { title: "Monthly Summary", desc: "Income and expenses broken down by month" },
  { title: "Category Report", desc: "Spending analysis by category" },
  { title: "Income Statement", desc: "All income sources over a period" },
  { title: "Net Worth Report", desc: "Balance trends over time" },
];

const ReportsPage = () => {
  return (
    <MainLayout title="Reports">
      <div className="animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Download and view financial reports
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {REPORT_TYPES.map(({ title, desc }) => (
            <div
              key={title}
              className="bg-card border border-border rounded-lg p-5 flex gap-4 items-start hover:border-foreground/30 transition-colors cursor-default"
            >
              <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                <span className="inline-block mt-2 text-xs border border-border rounded px-2 py-0.5 text-muted-foreground">
                  Coming Soon
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-dashed border-border rounded-lg px-6 py-12 text-center">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No Reports Yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Report generation will be available in a future update
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
