import { useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Other"];

const Expenses = () => {
  const { expenses, isLoading, addExpense, deleteExpense } = useExpenses();
  const [showAdd, setShowAdd] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");

  const handleAdd = async () => {
    if (!desc || !amount) return;
    try {
      await addExpense.mutateAsync({
        description: desc,
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        category,
      });
      setDesc("");
      setAmount("");
      setCategory("Other");
      setShowAdd(false);
      toast.success("Expense added");
    } catch (e) {
      toast.error("Failed to add expense");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success("Expense deleted");
    } catch (e) {
      toast.error("Failed to delete expense");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const expensesList = expenses || [];
  const total = expensesList.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold text-foreground">Expenses</h1>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        {showAdd && (
          <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-3 animate-fade-in">
            <Input
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Input
              type="number"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    category === c
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <Button onClick={handleAdd} className="w-full">
              Save Expense
            </Button>
          </div>
        )}

        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <span className="text-muted-foreground text-sm">Total</span>
          <p className="text-xl font-heading font-bold text-foreground">
            ₹{total.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="space-y-2">
          {expensesList.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No expenses yet. Tap "Add" to get started.
            </p>
          )}
          {expensesList.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between bg-card border border-border rounded-lg p-4"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{exp.description}</p>
                <p className="text-xs text-muted-foreground">
                  {exp.category} · {new Date(exp.date).toLocaleDateString("en-IN")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-heading font-semibold text-foreground">
                  ₹{exp.amount.toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Expenses;
