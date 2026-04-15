import SubPageLayout from "@/components/SubPageLayout";

const HelpPage = () => (
  <SubPageLayout title="Help & Support">
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">How to use Money Made</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Track your finances by setting your total balance on the Dashboard and adding expenses on the Expenses page. All amounts are in ₹.
        </p>
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Edit Balance</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Tap the pencil icon on the Dashboard to update your total balance at any time.
        </p>
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Manage Expenses</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Add expenses with a description, amount, and category. Delete any expense by tapping the trash icon.
        </p>
      </div>
    </div>
  </SubPageLayout>
);

export default HelpPage;
