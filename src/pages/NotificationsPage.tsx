import SubPageLayout from "@/components/SubPageLayout";

const NotificationsPage = () => (
  <SubPageLayout title="Notifications">
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
        <span className="text-sm text-foreground">Push Notifications</span>
        <span className="text-xs text-muted-foreground">Coming soon</span>
      </div>
      <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
        <span className="text-sm text-foreground">Email Alerts</span>
        <span className="text-xs text-muted-foreground">Coming soon</span>
      </div>
      <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
        <span className="text-sm text-foreground">Expense Reminders</span>
        <span className="text-xs text-muted-foreground">Coming soon</span>
      </div>
    </div>
  </SubPageLayout>
);

export default NotificationsPage;
