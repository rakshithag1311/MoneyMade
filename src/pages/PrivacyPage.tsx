import SubPageLayout from "@/components/SubPageLayout";

const PrivacyPage = () => (
  <SubPageLayout title="Privacy">
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Data Storage</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          All your data is stored locally on your device using browser storage. No data is sent to any external server.
        </p>
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-foreground mb-2">Your Control</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You can clear all your data at any time by clearing your browser's local storage or logging out.
        </p>
      </div>
    </div>
  </SubPageLayout>
);

export default PrivacyPage;
