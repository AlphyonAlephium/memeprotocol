import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE, SEI_CONFIG } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
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
  const { address } = useWallet();
  const [isCreating, setIsCreating] = useState(false);

  const createToken = async (params: TokenCreationParams) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    setIsCreating(true);
    try {
      let contractAddress = null;
      let transactionHash = null;

      if (CONTRACTS.tokenFactory !== "sei1...") {
        // --- THE IN-PLACE CLIENT STRATEGY (V12) ---

        // 1. Get the wallet provider directly from the window, ignoring the context's client.
        const wallet = window.compass || window.fin || window.leap;
        if (!wallet) {
          throw new Error("Wallet provider (e.g., Compass) not found on window object.");
        }
        const offlineSigner = await wallet.getOfflineSignerAuto(SEI_CONFIG.chainId);

        // 2. Create a NEW, temporary client ON THE SPOT. This client is guaranteed to be clean.
        console.log("✅ V12 FINAL: Creating a temporary, in-place client...");
        const tempClient = await SigningCosmWasmClient.connectWithSigner(
          SEI_CONFIG.rpcEndpoint,
          offlineSigner,
          // We no longer set gas price here, as it's unreliable. We will define the fee manually.
        );

        // 3. Manually construct the message.
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

        // 4. Manually construct the fee with the PROVEN correct values.
        const fee = calculateFee(2000000, "3.5usei"); // This creates a 7,000,000usei fee object.
        console.log("✅ V12 FINAL: Broadcasting with in-place client and fee:", JSON.stringify(fee));

        // 5. Use the NEW temporary client to sign and broadcast.
        const result = await tempClient.signAndBroadcast(
          address,
          [executeContractMsg],
          fee,
          "Create token via in-place client",
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

declare global {
  interface Window {
    compass?: any;
    fin?: any;
    leap?: any;
  }
}
