import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useExpenses } from "@/hooks/useExpenses";
import { Pencil, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

const Dashboard = () => {
  const { profile, isLoading: isLoadingProfile, updateBalance } = useProfile();
  const { expenses, isLoading: isLoadingExpenses } = useExpenses();
  
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const handleSaveBalance = async () => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      try {
        await updateBalance.mutateAsync(val);
        toast.success("Balance updated");
      } catch (e: any) {
        console.error(e);
        toast.error(e.message || "Failed to update balance");
      }
    }
    setEditing(false);
  };

  if (isLoadingProfile || isLoadingExpenses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const balance = profile?.balance || 0;
  const username = profile?.username || "User";
  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-6 animate-fade-in">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Welcome back,</p>
            <h1 className="text-2xl font-heading font-bold text-foreground">{username}</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <div className={`w-2 h-2 rounded-full ${(!isLoadingProfile && profile) ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
            {(!isLoadingProfile && profile) ? 'Connected' : 'Connecting...'}
          </div>
        </div>

        {/* Total Balance */}
        <div className="bg-card border border-border rounded-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">Total Balance</span>
            <button
              onClick={() => {
                setEditValue(String(balance));
                setEditing(true);
              }}
              className="p-1.5 rounded-md hover:bg-accent transition-colors"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {editing ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-heading font-bold text-foreground">₹</span>
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveBalance()}
                autoFocus
                className="text-2xl font-heading font-bold text-foreground bg-transparent border-b border-foreground outline-none w-full"
              />
              <button
                onClick={handleSaveBalance}
                className="text-sm text-foreground bg-accent px-3 py-1 rounded-md"
              >
                Save
              </button>
            </div>
          ) : (
            <p className="text-3xl font-heading font-bold text-foreground">
              ₹{balance.toLocaleString("en-IN")}
            </p>
          )}
        </div>

        {/* Total Expenses */}
        <div className="bg-card border border-border rounded-lg p-6">
          <span className="text-muted-foreground text-sm">Total Expenses</span>
          <p className="text-3xl font-heading font-bold text-destructive mt-2">
            ₹{totalExpenses.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Dashboard;
