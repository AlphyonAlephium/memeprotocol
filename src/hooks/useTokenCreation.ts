import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StdFee } from "@cosmjs/stargate";

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

        // --- THE RAW, EXPLICIT FEE OBJECT ---
        // We will not use any helpers. We will build the fee object manually.

        const gasLimit = "3000000"; // The gas limit the network seems to require.
        const feeAmount = "10500000"; // The exact fee amount the network required in the last error.

        const explicitFee: StdFee = {
          amount: [
            {
              denom: "usei",
              amount: feeAmount,
            },
          ],
          gas: gasLimit,
        };

        console.log(`✅ EXECUTING WITH RAW FEE OBJECT: ${JSON.stringify(explicitFee)}`);

        const result = await client.execute(address, CONTRACTS.tokenFactory, msg, explicitFee, undefined, factoryFunds);

        // Extract contract address from events
        const wasmEvent = result.events.find(e => e.type === "wasm");
        if (wasmEvent) {
          const addressAttr = wasmEvent.attributes.find(a => a.key === "new_token_contract");
          contractAddress = addressAttr?.value || null;
        }
        transactionHash = result.transactionHash;

        console.log("✅ Token created successfully:", { contractAddress, transactionHash });
      }

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
