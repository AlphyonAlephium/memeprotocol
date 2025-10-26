import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logs } from "@cosmjs/stargate";

interface TokenCreationParams {
  name: string;
  symbol: string;
  supply: string;
  imageUrl: string;
  description?: string;
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

      console.log(`✅ Executing with cosmwasm client and "auto" fee...`);
      const result = await client.execute(
        address,
        CONTRACTS.tokenFactory,
        msg,
        "auto",
        undefined,
        factoryFunds
      );

      // Extract data from logs
      const contractAttr = logs.findAttribute(result.logs, "wasm", "new_token_contract");
      const contractAddress = contractAttr?.value;
      const transactionHash = result.transactionHash;

      if (!contractAddress) {
        console.error("Missing new_token_contract attribute in logs", result.logs);
        throw new Error("Token contract address not found in transaction logs");
      }

      console.log("✅ Token created successfully:", { contractAddress, transactionHash });

      // Best-effort DB insert (non-blocking for UX)
      try {
        await supabase.from("tokens").insert({
          name: params.name,
          symbol: params.symbol,
          total_supply: params.supply,
          logo_url: params.imageUrl,
          contract_address: contractAddress,
          tx_hash: transactionHash,
          description: params.description ?? null,
        } as any);
      } catch (dbErr) {
        console.warn("Database insert failed (non-blocking):", dbErr);
      }

      toast.success("Token created successfully");
      return { success: true, contractAddress, transactionHash } as const;
    } catch (error: any) {
      console.error("Token creation failed:", error);
      toast.error(error?.message || "Failed to create token");
      return { success: false, error: error?.message ?? "Failed" } as const;
    } finally {
      setIsCreating(false);
    }
  };

  return { createToken, isCreating };
};
