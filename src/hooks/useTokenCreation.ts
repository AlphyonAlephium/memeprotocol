import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE, DEFAULT_TOKEN_SUPPLY } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TokenCreationParams {
  name: string;
  symbol: string;
  imageUrl: string;
  description: string;
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
        // Prepare the contract execution message
        const msg = {
          create_meme_token: {
            name: params.name,
            symbol: params.symbol,
            total_supply: DEFAULT_TOKEN_SUPPLY,
            image_url: params.imageUrl,
            description: params.description,
          },
        };

        // Execute the contract with 20 SEI payment
        const result = await client.execute(
          address,
          CONTRACTS.tokenFactory,
          msg,
          "auto",
          undefined,
          [{ denom: "usei", amount: TOKEN_CREATION_FEE }]
        );

        contractAddress = result.logs[0]?.events
          .find((e) => e.type === "wasm")
          ?.attributes.find((a) => a.key === "token_address")?.value || null;
        
        transactionHash = result.transactionHash;
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
          total_supply: DEFAULT_TOKEN_SUPPLY,
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
