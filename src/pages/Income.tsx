import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { useIncomes, type Income } from "@/hooks/useIncomes";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";

const today = () => new Date().toISOString().split("T")[0];
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

interface FormState {
  source: string;
  amount: string;
  date: string;
}
const emptyForm = (): FormState => ({ source: "", amount: "", date: today() });

const IncomePage = () => {
  const { incomes, isLoading, addIncome, updateIncome, deleteIncome } = useIncomes();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());

  const handleAdd = async () => {
    if (!form.source.trim() || !form.amount) return;
    try {
      await addIncome.mutateAsync({
        source: form.source.trim(),
        amount: parseFloat(form.amount),
        date: new Date(form.date).toISOString(),
      });
      setForm(emptyForm());
      setShowAdd(false);
      toast.success("Income added");
    } catch {
      toast.error("Failed to add income");
    }
  };

  const startEdit = (inc: Income) => {
    setEditingId(inc.id);
    setEditForm({
      source: inc.source,
      amount: String(inc.amount),
      date: inc.date.split("T")[0],
    });
  };

  const handleUpdate = async () => {
    if (!editingId || !editForm.source.trim() || !editForm.amount) return;
    try {
      await updateIncome.mutateAsync({
        id: editingId,
        source: editForm.source.trim(),
        amount: parseFloat(editForm.amount),
        date: new Date(editForm.date).toISOString(),
      });
      setEditingId(null);
      toast.success("Income updated");
    } catch {
      toast.error("Failed to update income");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIncome.mutateAsync(id);
      toast.success("Income deleted");
    } catch {
      toast.error("Failed to delete income");
    }
  };

  const total = (incomes ?? []).reduce((s, i) => s + i.amount, 0);

  if (isLoading) {
    return (
      <MainLayout title="Income">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Income">
      <div className="animate-fade-in space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Income</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Total: {fmt(total)}
            </p>
          </div>
          <button
            id="add-income-btn"
            onClick={() => { setShowAdd(!showAdd); setForm(emptyForm()); }}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Income
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="bg-card border border-border rounded-lg p-5 space-y-3 animate-fade-in">
            <h2 className="text-sm font-heading font-semibold text-foreground">
              New Income Entry
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Source
                </label>
                <input
                  id="income-source"
                  type="text"
                  placeholder="e.g. Salary, Freelance"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Amount (₹)
                </label>
                <input
                  id="income-amount"
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Date
                </label>
                <input
                  id="income-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAdd}
                disabled={addIncome.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {addIncome.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Save
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="flex items-center gap-2 px-4 py-2 border border-border text-muted-foreground rounded-md text-sm font-medium hover:text-foreground hover:border-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {(incomes ?? []).length === 0 ? (
          <div className="bg-card border border-border rounded-lg px-6 py-14 text-center">
            <p className="text-muted-foreground text-sm">
              No income entries yet. Click "Add Income" to get started.
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
            {(incomes ?? []).map((inc) =>
              editingId === inc.id ? (
                <div key={inc.id} className="p-4 space-y-3 bg-accent/30 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={editForm.source}
                      onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                      placeholder="Source"
                      className="px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                    <input
                      type="number"
                      value={editForm.amount}
                      onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                      placeholder="Amount"
                      className="px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      disabled={updateIncome.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background rounded-md text-xs font-medium hover:opacity-80 disabled:opacity-50 transition-opacity"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-muted-foreground rounded-md text-xs font-medium hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={inc.id}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-accent/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{inc.source}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(inc.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className="text-sm font-heading font-semibold text-foreground">
                      {fmt(inc.amount)}
                    </span>
                    <button
                      onClick={() => startEdit(inc)}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(inc.id)}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default IncomePage;
