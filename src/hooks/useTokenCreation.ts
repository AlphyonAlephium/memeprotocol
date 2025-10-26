import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logs, StdFee, Coin } from "@cosmjs/stargate";

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

        // --- THE UNIFIED FEE SOLUTION ---

        // 1. Define the separate costs.
        const networkFeeAmount = 1_400_000; // The network requires ~1.35 SEI for gas. We use 1.4 for safety.
        const contractFeeAmount = parseInt(TOKEN_CREATION_FEE); // The 10 SEI fee for the factory contract.

        // 2. Combine them into a SINGLE funds array. This is what we pass to the contract.
        const totalFunds: Coin[] = [
          {
            denom: "usei",
            amount: (networkFeeAmount + contractFeeAmount).toString(),
          },
        ];

        // 3. Create a fee object that ONLY specifies the gas limit.
        // We do NOT specify an amount here, as the wallet will derive it from the totalFunds.
        const gasOnlyFee: StdFee = {
          amount: [], // Leave this empty!
          gas: "400000", // A safe gas limit for this transaction.
        };

        console.log(`✅ FINAL SOLUTION: Sending a single unified fund of ${totalFunds[0].amount} usei.`);
        console.log(`✅ Fee object only specifies gas limit: ${gasOnlyFee.gas}`);

        // 4. Execute the transaction.
        // We pass totalFunds as the funds. The wallet will see this as the total cost.
        // We pass gasOnlyFee as the fee. The client uses this to set the gas limit.
        const result = await client.execute(address, CONTRACTS.tokenFactory, msg, gasOnlyFee, undefined, totalFunds);

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
