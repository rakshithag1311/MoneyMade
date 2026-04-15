import { useState, useEffect } from "react";
import { getBalance, setBalance, getTotalExpenses, getCurrentUsername } from "@/lib/storage";
import { Pencil } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const Dashboard = () => {
  const [balance, setBalanceState] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const username = getCurrentUsername() || "User";

  useEffect(() => {
    setBalanceState(getBalance());
    setTotalExpenses(getTotalExpenses());
  }, []);

  const handleSaveBalance = () => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      setBalance(val);
      setBalanceState(val);
    }
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-6 animate-fade-in">
        <div className="mb-8">
          <p className="text-muted-foreground text-sm">Welcome back,</p>
          <h1 className="text-2xl font-heading font-bold text-foreground">{username}</h1>
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
