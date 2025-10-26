import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE, SEI_CONFIG } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateFee } from "@cosmjs/stargate";
import { toUtf8 } from "@cosmjs/encoding";
import { logs } from "@cosmjs/stargate";

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
        // --- THE FINAL, ROBUST STRATEGY (V11) ---

        // 1. Manually construct the execution message.
        const msg = {
          create_token: {
            name: params.name,
            symbol: params.symbol,
            total_supply: params.supply,
            logo_url: params.imageUrl,
          },
        };

        const executeContractMsg = {
          typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
          value: {
            sender: address,
            contract: CONTRACTS.tokenFactory,
            msg: toUtf8(JSON.stringify(msg)),
            funds: [{ denom: "usei", amount: TOKEN_CREATION_FEE }],
          },
        };

        // 2. Manually construct the fee object with exact values needed
        const gasLimit = 2000000;
        const fee = {
          amount: [{ denom: "usei", amount: "7000000" }], // 2M gas * 3.5 = 7M usei
          gas: gasLimit.toString(),
        };

        console.log(
          "✅ V12: Manual fee construction with exact values:",
          JSON.stringify(fee),
        );

        // 3. Use the low-level signAndBroadcast method.
        const result = await client.signAndBroadcast(
          address,
          [executeContractMsg],
          fee,
          "Create token", // Memo
        );

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
