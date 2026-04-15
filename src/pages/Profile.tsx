import { useNavigate } from "react-router-dom";
import { getCurrentEmail, getCurrentUsername, clearUser } from "@/lib/storage";
import { ChevronRight, Settings, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const menuItems = [
  { label: "Account Settings", icon: Settings, path: "/settings" },
  { label: "Notifications", icon: Bell, path: "/notifications" },
  { label: "Privacy", icon: Shield, path: "/privacy" },
  { label: "Help & Support", icon: HelpCircle, path: "/help" },
];

const Profile = () => {
  const navigate = useNavigate();
  const username = getCurrentUsername() || "User";
  const email = getCurrentEmail() || "";

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-6 animate-fade-in">
        <h1 className="text-2xl font-heading font-bold text-foreground mb-8">Profile</h1>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
            <span className="text-xl font-heading font-bold text-foreground">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-heading font-semibold text-foreground">{username}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-card transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-destructive/10 transition-colors mt-4"
        >
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="text-sm text-destructive font-medium">Log Out</span>
        </button>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
