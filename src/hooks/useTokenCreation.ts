import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE, DEFAULT_TOKEN_SUPPLY, PLATFORM_OWNER, SEI_CONFIG } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GasPrice, calculateFee } from "@cosmjs/stargate";

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

      // If contracts are deployed, interact with blockchain
      if (CONTRACTS.tokenFactory !== "sei1...") {
        const msg = {
          create_token: {
            name: params.name,
            symbol: params.symbol,
            total_supply: params.supply,
            logo_url: params.imageUrl,
          },
        };

        // Compute fee from chain gas price to satisfy min gas price
        const gasLimit = 500000;
        const fee = calculateFee(gasLimit, GasPrice.fromString(SEI_CONFIG.gasPrice));

        const result = await client.execute(
          address,
          CONTRACTS.tokenFactory,
          msg,
          fee,
          "",
          [{ denom: "usei", amount: TOKEN_CREATION_FEE }] // 10 SEI factory fee to contract
        );

        // Parse the new token contract address from logs
        contractAddress = result.logs[0]?.events
          .find((e) => e.type === "wasm")
          ?.attributes.find((a) => a.key === "new_token_contract")?.value || null;
        
        transactionHash = result.transactionHash;
        
        console.log("Token created:", { contractAddress, transactionHash });
      }

      // Store token metadata in database
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
        console.error("Database error:", dbError);
        toast.error("Failed to save token metadata");
        throw dbError;
      }

      toast.success(
        contractAddress 
          ? `Token deployed! TX: ${transactionHash?.slice(0, 8)}...`
          : "Token metadata saved! Deploy contracts to launch on-chain"
      );

      return {
        success: true,
        transactionHash,
        tokenAddress: contractAddress,
        tokenId: tokenData.id,
      };
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