import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface Expense {
  id: string;
  user_id: string;
  title?: string;
  description?: string;
  amount: number;
  category: string;
  created_at?: string;
  date?: string;
}

export type ExpenseInput = Omit<Expense, "id" | "user_id">;
export type ExpenseUpdateInput = Omit<Expense, "user_id">;

const ensureProfileExists = async (user: any) => {
  const email = user?.email ?? `${user?.id}@moneymade.local`;
  const username =
    user?.user_metadata?.username ?? email?.split?.("@")?.[0] ?? "User";
  const full_name = user?.user_metadata?.full_name ?? user?.user_metadata?.fullName ?? null;

  const basePayload: Record<string, any> = {
    id: user.id,
    email,
    username,
    full_name,
    balance: 0,
  };

  const attemptUpsert = async (payload: Record<string, any>) => {
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    if (error) throw error;
  };

  let payload = { ...basePayload };
  for (let i = 0; i < 3; i++) {
    try {
      await attemptUpsert(payload);
      return;
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      const match =
        msg.match(/Could not find the '([^']+)' column of 'profiles'/) ||
        msg.match(/Could not find the '([^']+)' column/);
      if (match?.[1]) {
        const missingCol = match[1];
        if (missingCol in payload) {
          delete payload[missingCol];
          continue;
        }
      }

      const missingBalance =
        msg.includes('balance does not exist') || msg.includes('column "balance" does not exist');
      if (missingBalance && payload.balance !== undefined) {
        delete payload.balance;
        continue;
      }

      const missingUsername =
        msg.includes('username does not exist') || msg.includes('column "username" does not exist');
      if (missingUsername && payload.username !== undefined) {
        delete payload.username;
        continue;
      }

      const missingFullName =
        msg.includes('full_name does not exist') || msg.includes('column "full_name" does not exist');
      if (missingFullName && payload.full_name !== undefined) {
        delete payload.full_name;
        continue;
      }

      throw e;
    }
  }
};

const tryInsertExpense = async (expense: ExpenseInput, userId: string) => {
  const attempt = async (payload: Record<string, any>) => {
    const { data, error } = await supabase
      .from("expenses")
      .insert([payload])
      .select();
    if (error) throw error;
    return data as Expense[];
  };

  try {
    return await attempt({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      user_id: userId,
      created_at: expense.date ?? new Date().toISOString(),
    });
  } catch (error: any) {
    const msg = String(error?.message ?? "");

    const titleMissing =
      msg.includes('Could not find the \'title\' column') ||
      msg.includes('column "title" does not exist');

    const createdAtMissing =
      msg.includes('column "created_at" does not exist') ||
      msg.includes('created_at does not exist');

    // If title doesn't exist, retry without it (keep other fields).
    if (titleMissing && !createdAtMissing) {
      return await attempt({
        amount: expense.amount,
        category: expense.category,
        user_id: userId,
        created_at: expense.date ?? new Date().toISOString(),
      });
    }

    // If created_at doesn't exist, retry using date instead.
    if (createdAtMissing && !titleMissing) {
      return await attempt({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        user_id: userId,
        date: expense.date ?? new Date().toISOString(),
      });
    }

    // If both title and created_at are missing, use date and omit title.
    if (titleMissing && createdAtMissing) {
      return await attempt({
        amount: expense.amount,
        category: expense.category,
        user_id: userId,
        date: expense.date ?? new Date().toISOString(),
      });
    }

    throw error;
  }
};

const tryUpdateExpense = async (payload: ExpenseUpdateInput, userId: string) => {
  const attempt = async (updatePayload: Record<string, any>) => {
    const { error } = await supabase
      .from("expenses")
      .update(updatePayload)
      .eq("id", payload.id)
      .eq("user_id", userId);
    if (error) throw error;
  };

  try {
    await attempt({
      title: payload.title,
      amount: payload.amount,
      category: payload.category,
      created_at: payload.date ?? new Date().toISOString(),
    });
  } catch (error: any) {
    const msg = String(error?.message ?? "");

    const titleMissing =
      msg.includes('Could not find the \'title\' column') ||
      msg.includes('column "title" does not exist');

    const createdAtMissing =
      msg.includes('column "created_at" does not exist') ||
      msg.includes('created_at does not exist');

    if (titleMissing && !createdAtMissing) {
      await attempt({
        amount: payload.amount,
        category: payload.category,
        created_at: payload.date ?? new Date().toISOString(),
      });
      return;
    }

    if (createdAtMissing && !titleMissing) {
      await attempt({
        title: payload.title,
        amount: payload.amount,
        category: payload.category,
        date: payload.date ?? new Date().toISOString(),
      });
      return;
    }

    if (titleMissing && createdAtMissing) {
      await attempt({
        amount: payload.amount,
        category: payload.category,
        date: payload.date ?? new Date().toISOString(),
      });
      return;
    }

    throw error;
  }
};

export const useExpenses = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching expenses:", error);
        return [];
      }

      const sorted = (data as Expense[]).sort((a, b) => {
        const aDate = new Date(a.created_at ?? a.date ?? 0).getTime();
        const bDate = new Date(b.created_at ?? b.date ?? 0).getTime();
        return bDate - aDate;
      });

      return sorted;
    },
    enabled: !!user,
  });

  const addExpense = useMutation({
    mutationFn: async (expense: ExpenseInput) => {
      if (!user) throw new Error("User not authenticated");
      // Prevent FK failures when `profiles` row isn't created yet.
      await ensureProfileExists(user);
      return await tryInsertExpense(expense, user.id);
    },
    onError: (error) => {
      console.error("Error adding expense:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", user?.id] });
    },
  });

  const updateExpense = useMutation({
    mutationFn: async (expense: ExpenseUpdateInput) => {
      if (!user) throw new Error("User not authenticated");
      await ensureProfileExists(user);
      await tryUpdateExpense(expense, user.id);
    },
    onError: (error) => {
      console.error("Error updating expense:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", user?.id] });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onError: (error) => {
      console.error("Error deleting expense:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", user?.id] });
    },
  });

  return { expenses, isLoading, addExpense, updateExpense, deleteExpense };
};
