import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
}

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
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching expenses:", error);
        return [];
      }
      return data as Expense[];
    },
    enabled: !!user,
  });

  const addExpense = useMutation({
    mutationFn: async (expense: Omit<Expense, "id" | "user_id">) => {
      if (!user) throw new Error("User not authenticated");
      
      console.log("Adding expense for user:", user.id, expense);
      
      const { data, error } = await supabase.from("expenses").insert([
        {
          ...expense,
          user_id: user.id,
        },
      ]).select();

      if (error) {
        console.error("Supabase error adding expense:", error);
        throw error;
      }
      return data;
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

      if (error) {
        console.error("Supabase error deleting expense:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", user?.id] });
    },
  });

  return { expenses, isLoading, addExpense, deleteExpense };
};
