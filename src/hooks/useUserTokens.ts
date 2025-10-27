import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Token } from "./useTokens";

export const useUserTokens = (creatorAddress: string | null) => {
  return useQuery({
    queryKey: ["user-tokens", creatorAddress],
    queryFn: async () => {
      if (!creatorAddress) return [];
      
      const { data, error } = await supabase
        .from("tokens")
        .select("*")
        .eq("creator_address", creatorAddress)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Token[];
    },
    enabled: !!creatorAddress,
  });
};
