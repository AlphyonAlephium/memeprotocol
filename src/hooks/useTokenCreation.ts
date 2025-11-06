import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logs, StdFee } from "@cosmjs/stargate";
import { toUtf8 } from "@cosmjs/encoding";

interface TokenCreationParams {
  name: string;
  symbol: string;
  imageUrl: string;
  description: string;
  supply: string;
}

export const useTokenCreation = () => {
  const { address } = useWallet();
  const [isCreating, setIsCreating] = useState(false);

  const createToken = async (params: TokenCreationParams) => {
    // This hook is deprecated. Use useCreateEvmToken instead for EVM-based token creation
    throw new Error("useTokenCreation is deprecated. Please use useCreateEvmToken for EVM-based tokens.");
  };

  return {
    createToken,
    isCreating,
  };
};
