import SubPageLayout from "@/components/SubPageLayout";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/hooks/useProfile";
import { Loader2 } from "lucide-react";

const SettingsPage = () => {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <SubPageLayout title="Account Settings">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </SubPageLayout>
    );
  }

  const username = profile?.username || "User";
  const email = user?.email || "";

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
          Account data is securely stored on your Supabase backend.
        </p>
      </div>
    </SubPageLayout>
  );
};

export default SettingsPage;
