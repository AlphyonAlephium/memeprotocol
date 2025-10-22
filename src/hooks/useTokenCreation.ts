import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE, DEFAULT_TOKEN_SUPPLY, PLATFORM_OWNER } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
        // First, ensure contract owner is set to platform owner
        try {
          const configQuery = await client.queryContractSmart(
            CONTRACTS.tokenFactory,
            { config: {} }
          );
          
          // If owner is empty or invalid, update it
          if (!configQuery.owner || configQuery.owner.trim() === "") {
            console.log("Setting contract owner to platform owner...");
            const updateMsg = {
              update_config: {
                owner: PLATFORM_OWNER,
              },
            };
            
            await client.execute(
              address,
              CONTRACTS.tokenFactory,
              updateMsg,
              "auto"
            );
            
            toast.success("Contract configured successfully");
          }
        } catch (configError) {
          console.error("Config check/update failed:", configError);
          // Continue anyway - the actual token creation will fail with a better error if needed
        }
        // Prepare the contract execution message
        const msg = {
          create_token: {
            name: params.name,
            symbol: params.symbol,
            total_supply: params.supply,
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
