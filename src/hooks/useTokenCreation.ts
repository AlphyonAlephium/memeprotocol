import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logs } from "@cosmjs/stargate";

interface TokenCreationParams {
  /* ... same as before ... */
}

export const useTokenCreation = () => {
  const { client, address } = useWallet();
  const [isCreating, setIsCreating] = useState(false);

  const createToken = async (params: TokenCreationParams) => {
    if (!client || !address) throw new Error("Wallet not connected");

    setIsCreating(true);
    try {
      const msg = {
        create_token: {
          name: params.name,
          symbol: params.symbol,
          total_supply: params.supply,
          logo_url: params.imageUrl,
        },
      };
      const factoryFunds = [{ denom: "usei", amount: TOKEN_CREATION_FEE }];

      console.log(`✅ Executing with client from @sei-js/core and "auto" fee...`);
      // The "auto" fee will work correctly with the client from @sei-js/core
      const result = await client.execute(address, CONTRACTS.tokenFactory, msg, "auto", undefined, factoryFunds);

      if (result.code !== 0) throw new Error(`Transaction failed with code ${result.code}: ${result.rawLog}`);

      const parsedLogs = logs.parseRawLog(result.rawLog);
      const contractAddress = logs.findAttribute(parsedLogs, "wasm", "new_token_contract").value;
      const transactionHash = result.transactionHash;

      console.log("✅ Token created successfully:", { contractAddress, transactionHash });

      // ... (database logic is the same)
    } catch (error: any) {
      console.error("Token creation failed:", error);
      toast.error(error.message || "Failed to create token");
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return { createToken, isCreating };
};
