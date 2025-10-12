import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE, DEFAULT_TOKEN_SUPPLY } from "@/config/contracts";
import { toast } from "sonner";

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

    if (CONTRACTS.tokenFactory === "sei1...") {
      toast.error("Contract not configured. Please deploy contracts first.");
      throw new Error("Token factory contract address not configured");
    }

    setIsCreating(true);
    try {
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
        "auto", // Auto-calculate gas
        undefined,
        [{ denom: "usei", amount: TOKEN_CREATION_FEE }] // 20 SEI fee
      );

      // Parse the transaction result to get the new token address
      const newTokenAddress = result.logs[0]?.events
        .find((e) => e.type === "wasm")
        ?.attributes.find((a) => a.key === "token_address")?.value;

      toast.success(`Token created successfully! TX: ${result.transactionHash}`);

      return {
        success: true,
        transactionHash: result.transactionHash,
        tokenAddress: newTokenAddress,
        blockHeight: result.height,
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
