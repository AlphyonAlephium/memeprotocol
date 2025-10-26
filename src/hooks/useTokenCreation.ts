import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE, SEI_CONFIG } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice, calculateFee } from "@cosmjs/stargate";

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

    const wallet = window.compass || window.fin || window.leap;
    if (!wallet) {
      throw new Error("Wallet provider (e.g., Compass) not found on window object.");
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

        // --- THE STABLE SURGICAL STRIKE (V9) ---
        
        // 1. Get a fresh signer directly from the wallet extension.
        const offlineSigner = await wallet.getOfflineSignerAuto(SEI_CONFIG.chainId);

        // 2. Create a NEW, temporary client.
        console.log("✅ Creating a temporary client...");
        const tempClient = await SigningCosmWasmClient.connectWithSigner(
          SEI_CONFIG.rpcEndpoint,
          offlineSigner,
          {
            // We still provide the gas price, even if it's sometimes ignored.
            gasPrice: GasPrice.fromString("3.5usei")
          }
        );
        console.log("✅ Temporary client created successfully.");

        // 3. Manually calculate the fee to prevent any miscalculation.
        const gasLimit = 2000000;
        const fee = calculateFee(gasLimit, "3.5usei");
        const factoryFunds = [{ denom: "usei", amount: TOKEN_CREATION_FEE }];

        // 4. Use the NEW temporary client to execute the transaction with the manual fee.
        console.log(`✅ Executing with temporary client and manual fee: ${JSON.stringify(fee)}`);
        const result = await tempClient.execute(
          address,
          CONTRACTS.tokenFactory,
          msg,
          fee,        // Pass the manually calculated fee object
          undefined,  // Memo
          factoryFunds
        );
        
        // --- END OF THE FIX ---

        // Check for transaction failure
        if (result.code !== 0) {
            throw new Error(`Transaction failed with code ${result.code}: ${result.rawLog}`);
        }

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

// Type declarations for wallet extensions
declare global {
  interface Window {
    compass?: any;
    fin?: any;
    leap?: any;
  }
}