import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE, SEI_CONFIG } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { calculateFee, GasPrice } from "@cosmjs/stargate";
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
        // --- THE MANUAL SIGN-AND-BROADCAST STRATEGY ---

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

        // 2. Manually construct the fee object with absolute precision.
        const gasLimit = 2000000;
        const gasPrice = "3.5usei";
        const fee = calculateFee(gasLimit, gasPrice);

        console.log("✅ Bypassing .execute(). Manually signing and broadcasting with fee:", JSON.stringify(fee));
        console.log("✅ Message being sent:", JSON.stringify(executeContractMsg));

        // 3. Use the low-level signAndBroadcast method.
        // This gives the library no room to override our settings.
        const result = await client.signAndBroadcast(
          address,
          [executeContractMsg], // The message must be in an array
          fee,
          "Create token via manual broadcast" // Memo
        );
        
        // --- END OF THE FIX ---

        // Check if the transaction failed at the broadcast level
        if (result.code !== 0) {
            throw new Error(`Transaction failed with code ${result.code}: ${result.rawLog}`);
        }

        // Parse logs from the successful transaction
        const logs = JSON.parse(result.rawLog || '[]');
        contractAddress = logs[0]?.events
          .find((e: any) => e.type === "wasm")
          ?.attributes.find((a: any) => a.key === "new_token_contract")?.value || null;
        
        transactionHash = result.transactionHash;
        
        console.log("Token created:", { contractAddress, transactionHash });
      }

      // ... (rest of the function is the same)
      const { data: tokenData, error: dbError } = await supabase.from("tokens").insert({
        creator_address: address, name: params.name, symbol: params.symbol, description: params.description,
        image_url: params.imageUrl, contract_address: contractAddress, transaction_hash: transactionHash,
        total_supply: params.supply,
      }).select().single();
      if (dbError) { console.error("DB Error:", dbError); throw dbError; }
      toast.success(contractAddress ? `Token deployed! TX: ${transactionHash?.slice(0, 8)}...` : "Token metadata saved!");
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