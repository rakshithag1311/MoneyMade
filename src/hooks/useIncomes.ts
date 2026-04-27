import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface Income {
  id: string;
  user_id: string;
  source: string;
  amount: number;
  date: string;
}

export const useIncomes = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: incomes, isLoading } = useQuery({
    queryKey: ["incomes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("incomes")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching incomes:", error);
        return [];
      }
      return data as Income[];
    },
    enabled: !!user,
  });

  const addIncome = useMutation({
    mutationFn: async (income: Omit<Income, "id" | "user_id">) => {
      if (!user) throw new Error("User not authenticated");
      const { data, error } = await supabase
        .from("incomes")
        .insert([{ ...income, user_id: user.id }])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes", user?.id] });
    },
  });

  const updateIncome = useMutation({
    mutationFn: async ({ id, ...income }: Omit<Income, "user_id">) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("incomes")
        .update(income)
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes", user?.id] });
    },
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("incomes")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incomes", user?.id] });
    },
  });

  return { incomes, isLoading, addIncome, updateIncome, deleteIncome };
};
