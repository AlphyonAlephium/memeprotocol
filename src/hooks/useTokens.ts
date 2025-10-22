import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Token {
  id: string;
  created_at: string;
  name: string;
  symbol: string;
  description: string;
  image_url: string;
  contract_address: string | null;
  transaction_hash: string | null;
  total_supply: string;
  creator_address: string;
}

export const useNewTokens = (limit = 6) => {
  return useQuery({
    queryKey: ["new-tokens", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tokens")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Token[];
    },
  });
};

export const useTrendingTokens = (limit = 6) => {
  return useQuery({
    queryKey: ["trending-tokens", limit],
    queryFn: async () => {
      // For now, we'll fetch recent tokens as "trending"
      // In the future, you could add a views/trades column to sort by
      const { data, error } = await supabase
        .from("tokens")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Token[];
    },
  });
};
