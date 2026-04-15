import SubPageLayout from "@/components/SubPageLayout";
import { getCurrentUsername, getCurrentEmail } from "@/lib/storage";

const SettingsPage = () => {
  const username = getCurrentUsername() || "User";
  const email = getCurrentEmail() || "";

  return (
    <SubPageLayout title="Account Settings">
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <label className="text-xs text-muted-foreground">Username</label>
          <p className="text-foreground font-medium">{username}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <label className="text-xs text-muted-foreground">Email</label>
          <p className="text-foreground font-medium">{email}</p>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Account settings are stored locally on this device.
        </p>
      </div>
    </SubPageLayout>
  );
};

export default SettingsPage;
