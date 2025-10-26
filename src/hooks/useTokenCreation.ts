import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logs, StdFee, calculateFee } from "@cosmjs/stargate";
import { toUtf8 } from "@cosmjs/encoding";

interface TokenCreationParams {
  name: string;
  symbol: string;
  imageUrl: string;
  description: string;
  supply: string;
}

export const useTokenCreation = () => {
  const { client, address } = useWallet();
  const [isCreating, setIsCreating] = useState(false);

  const createToken = async (params: TokenCreationParams) => {
    if (!client || !address) {
      throw new Error("Wallet not connected");
    }

    setIsCreating(true);
    try {
      let contractAddress = null;
      let transactionHash = null;

      if (CONTRACTS.tokenFactory !== "sei1...") {
        const msg = {
          create_token: {
            name: params.name,
            symbol: params.symbol,
            total_supply: params.supply,
            logo_url: params.imageUrl,
          },
        };

        const factoryFunds = [{ denom: "usei", amount: TOKEN_CREATION_FEE }];

        // --- THE SIMULATE AND EXECUTE STRATEGY ---

        // 1. SIMULATE the transaction to get the exact gas required.
        console.log("✅ Step 1/2: Simulating transaction to get exact gas requirement...");
        const gasUsed = await client.simulate(address, [
          {
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: {
              sender: address,
              contract: CONTRACTS.tokenFactory,
              msg: toUtf8(JSON.stringify(msg)),
              funds: factoryFunds,
            },
          },
        ]);

        console.log(`✅ Gas needed: ${gasUsed}`);

        // 2. EXECUTE the transaction with a perfect, dynamically calculated fee.
        // We use the gas from the simulation, add a 20% safety margin, and calculate the fee with our correct gas price.
        const fee = calculateFee(Math.round(gasUsed * 1.2), "3.5usei");

        console.log(`✅ Step 2/2: Executing transaction with dynamically calculated fee: ${JSON.stringify(fee)}`);
        const result = await client.execute(address, CONTRACTS.tokenFactory, msg, fee, undefined, factoryFunds);

        // --- END OF THE FIX ---

        if (result.code !== 0) {
          throw new Error(`Transaction failed with code ${result.code}: ${result.rawLog}`);
        }

        const parsedLogs = logs.parseRawLog(result.rawLog);
        contractAddress = logs.findAttribute(parsedLogs, "wasm", "new_token_contract").value;
        transactionHash = result.transactionHash;

        console.log("✅ Token created successfully:", { contractAddress, transactionHash });
      }

      // ... (rest of the function is the same)
      const { data: tokenData, error: dbError } = await supabase
        .from("tokens")
        .insert({
          creator_address: address,
          name: params.name,
          symbol: params.symbol,
          description: params.description,
          image_url: params.imageUrl,
          contract_address: contractAddress,
          transaction_hash: transactionHash,
          total_supply: params.supply,
        })
        .select()
        .single();
      if (dbError) {
        console.error("DB Error:", dbError);
        throw dbError;
      }
      toast.success(`Token deployed! TX: ${transactionHash?.slice(0, 8)}...`);
      return { success: true, transactionHash, tokenAddress: contractAddress, tokenId: tokenData.id };
    } catch (error: any) {
      console.error("Token creation failed:", error);
      toast.error(error.message || "Failed to create token");
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createToken,
    isCreating,
  };
};
