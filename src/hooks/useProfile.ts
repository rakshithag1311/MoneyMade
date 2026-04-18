import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface Profile {
  id: string;
  username: string;
  balance: number;
}

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        // Still return fallback data on error to keep UI functional
      }
      
      const usernameFallback = user.user_metadata?.username || user.email?.split("@")[0] || "User";
      
      if (!data) {
        return {
          id: user.id,
          username: usernameFallback,
          balance: 0,
        } as Profile;
      }
      
      return {
        ...data,
        username: data.username || usernameFallback,
      } as Profile;
    },
    enabled: !!user,
  });

  const updateBalance = useMutation({
    mutationFn: async (newBalance: number) => {
      if (!user) throw new Error("User not authenticated");
      
      const usernameFallback = user.user_metadata?.username || user.email?.split("@")[0] || "User";

      const { error } = await supabase
        .from("profiles")
        .upsert({ 
          id: user.id, 
          balance: newBalance,
          username: profile?.username || usernameFallback 
        }, { onConflict: 'id' });

      if (error) {
        console.error("Error updating balance:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  return { profile, isLoading, updateBalance };
};
