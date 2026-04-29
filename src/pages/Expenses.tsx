import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { useExpenses, type Expense } from "@/hooks/useExpenses";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"];
const today = () => new Date().toISOString().split("T")[0];
const fmt = (n: number) => "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2 });

interface FormState {
  title: string;
  amount: string;
  category: string;
  date: string;
}
const emptyForm = (): FormState => ({
  title: "",
  amount: "",
  category: "Other",
  date: today(),
});

const CategoryPills = ({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (c: string) => void;
}) => (
  <div className="flex flex-wrap gap-1.5">
    {CATEGORIES.map((c) => (
      <button
        key={c}
        type="button"
        onClick={() => onChange(c)}
        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
          selected === c
            ? "bg-foreground text-background border-foreground"
            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
        }`}
      >
        {c}
      </button>
    ))}
  </div>
);

const ExpensesPage = () => {
  const { expenses, isLoading, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm());
  const [filterCat, setFilterCat] = useState<string>("All");

  const handleAdd = async () => {
    if (!form.amount) return;
    try {
      await addExpense.mutateAsync({
        title: form.title.trim() || undefined,
        amount: parseFloat(form.amount),
        category: form.category,
        date: new Date(form.date).toISOString(),
      });
      setForm(emptyForm());
      setShowAdd(false);
      toast.success("Expense added");
    } catch (error: any) {
      toast.error(error?.message || "Failed to add expense");
    }
  };

  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setEditForm({
      title: exp.title || exp.description || exp.category || "",
      amount: String(exp.amount),
      category: exp.category,
      date: (exp.created_at || exp.date || new Date().toISOString()).split("T")[0],
    });
  };

  const handleUpdate = async () => {
    if (!editingId || !editForm.amount) return;
    try {
      await updateExpense.mutateAsync({
        id: editingId,
        title: editForm.title.trim(),
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        date: new Date(editForm.date).toISOString(),
      });
      setEditingId(null);
      toast.success("Expense updated");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update expense");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast.success("Expense deleted");
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  const list = expenses ?? [];
  const filtered = filterCat === "All" ? list : list.filter((e) => e.category === filterCat);
  const total = list.reduce((s, e) => s + e.amount, 0);

  if (isLoading) {
    return (
      <MainLayout title="Expenses">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Expenses">
      <div className="animate-fade-in space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Expenses</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Total: {fmt(total)}</p>
          </div>
          <button
            id="add-expense-btn"
            onClick={() => {
              setShowAdd(!showAdd);
              setForm(emptyForm());
            }}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="bg-card border border-border rounded-lg p-5 space-y-3 animate-fade-in">
            <h2 className="text-sm font-heading font-semibold text-foreground">New Expense</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                <input
                  id="expense-title"
                  type="text"
                  placeholder="e.g. Grocery shopping"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Amount (₹)</label>
                <input
                  id="expense-amount"
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
                <input
                  id="expense-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Category</label>
                <CategoryPills selected={form.category} onChange={(c) => setForm({ ...form, category: c })} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleAdd}
                disabled={addExpense.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {addExpense.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save
              </button>
              <button
                onClick={() => setShowAdd(false)}
                className="flex items-center gap-2 px-4 py-2 border border-border text-muted-foreground rounded-md text-sm font-medium hover:text-foreground hover:border-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          {["All", ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                filterCat === c
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-lg px-6 py-14 text-center">
            <p className="text-muted-foreground text-sm">
              {list.length === 0
                ? 'No expenses yet. Click "Add Expense" to get started.'
                : "No expenses in this category."}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
            {filtered.map((exp) =>
              editingId === exp.id ? (
                <div key={exp.id} className="p-4 space-y-3 bg-accent/30 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="Title"
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
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
                    <div className="sm:col-span-2">
                      <CategoryPills
                        selected={editForm.category}
                        onChange={(c) => setEditForm({ ...editForm, category: c })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      disabled={updateExpense.isPending}
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
                  key={exp.id}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-accent/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{exp.title || exp.category}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {exp.category} ·{" "}
                      {new Date(exp.created_at ?? exp.date ?? new Date().toISOString()).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <span className="text-sm font-heading font-semibold text-foreground">
                      {fmt(exp.amount)}
                    </span>
                    <button
                      onClick={() => startEdit(exp)}
                      className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
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

export default ExpensesPage;
