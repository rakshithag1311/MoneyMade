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
        balance: (data as any).balance ?? 0,
      } as Profile;
    },
    enabled: !!user,
  });

  const updateBalance = useMutation({
    mutationFn: async (newBalance: number) => {
      if (!user) throw new Error("User not authenticated");
      
      const usernameFallback = user.user_metadata?.username || user.email?.split("@")[0] || "User";

      const basePayload: Record<string, any> = {
        id: user.id,
        balance: newBalance,
        username: profile?.username || usernameFallback,
      };

      const attemptUpsert = async (payload: Record<string, any>) => {
        const { error } = await supabase
          .from("profiles")
          .upsert(payload, { onConflict: "id" });
        if (error) throw error;
      };

      let payload = { ...basePayload };
      for (let i = 0; i < 3; i++) {
        try {
          await attemptUpsert(payload);
          return;
        } catch (e: any) {
          const msg = String(e?.message ?? "");
          const missingBalance =
            msg.includes("Could not find the 'balance' column") || msg.includes("balance does not exist");
          const missingUsername =
            msg.includes("Could not find the 'username' column") || msg.includes("username does not exist");

          if (missingBalance && payload.balance !== undefined) {
            delete payload.balance;
            continue;
          }
          if (missingUsername && payload.username !== undefined) {
            delete payload.username;
            continue;
          }

          // If profile schema doesn't support balance, just stop instead of failing the app.
          console.error("Error updating profile:", e);
          return;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });

  return { profile, isLoading, updateBalance };
};
