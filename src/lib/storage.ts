// Per-user localStorage helpers using email as key

export function getCurrentEmail(): string | null {
  return localStorage.getItem("email");
}

export function getCurrentUsername(): string | null {
  return localStorage.getItem("username");
}

export function setUser(email: string, username: string) {
  localStorage.setItem("email", email);
  localStorage.setItem("username", username);
}

export function clearUser() {
  localStorage.removeItem("email");
  localStorage.removeItem("username");
}

export function isLoggedIn(): boolean {
  return !!getCurrentEmail();
}

// Balance
export function getBalance(): number {
  const email = getCurrentEmail();
  if (!email) return 0;
  return parseFloat(localStorage.getItem(email + "_balance") || "0");
}

export function setBalance(amount: number) {
  const email = getCurrentEmail();
  if (!email) return;
  localStorage.setItem(email + "_balance", String(amount));
}

// Expenses
export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

export function getExpenses(): Expense[] {
  const email = getCurrentEmail();
  if (!email) return [];
  return JSON.parse(localStorage.getItem(email + "_expenses") || "[]");
}

export function addExpense(expense: Omit<Expense, "id">) {
  const expenses = getExpenses();
  expenses.push({ ...expense, id: Date.now().toString() });
  const email = getCurrentEmail()!;
  localStorage.setItem(email + "_expenses", JSON.stringify(expenses));
}

export function deleteExpense(id: string) {
  const expenses = getExpenses().filter((e) => e.id !== id);
  const email = getCurrentEmail()!;
  localStorage.setItem(email + "_expenses", JSON.stringify(expenses));
}

export function getTotalExpenses(): number {
  return getExpenses().reduce((sum, e) => sum + e.amount, 0);
}
