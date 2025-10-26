import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE, SEI_CONFIG } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";

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

        // --- THE "AUTO" FEE STRATEGY (BEST PRACTICE) ---
        
        // 1. Get a fresh signer directly from the wallet extension.
        const offlineSigner = await wallet.getOfflineSignerAuto(SEI_CONFIG.chainId);

        // 2. Create a NEW, temporary client with the CORRECT gas price.
        // This is still necessary to ensure the "auto" calculation uses the right price.
        console.log("✅ Creating a temporary client with correct gas price for 'auto' estimation...");
        const tempClient = await SigningCosmWasmClient.connectWithSigner(
          SEI_CONFIG.rpcEndpoint,
          offlineSigner,
          {
            gasPrice: GasPrice.fromString("3.5usei") // Correct gas price is crucial for "auto"
          }
        );
        console.log("✅ Temporary client created successfully.");

        // 3. Define the funds that go to the contract.
        const factoryFunds = [{ denom: "usei", amount: TOKEN_CREATION_FEE }];

        // 4. Execute the transaction, passing "auto" as the fee parameter.
        console.log("✅ Executing transaction with 'auto' fee estimation...");
        const result = await tempClient.execute(
          address,
          CONTRACTS.tokenFactory,
          msg,
          "auto",     // <--- THE BEST PRACTICE
          undefined,I am sorry, but the response I was generating was cut off. I will continue and provide the complete code block.

Here is the complete and final version of the `useTokenCreation.ts` file using the `"auto"` fee estimation strategy.

````typescript name=useTokenCreation.ts
import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS, TOKEN_CREATION_FEE, SEI_CONFIG } from "@/config/contracts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";

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

        // --- THE "AUTO" FEE STRATEGY (BEST PRACTICE) ---
        
        // 1. Get a fresh signer directly from the wallet extension.
        const offlineSigner = await wallet.getOfflineSignerAuto(SEI_CONFIG.chainId);

        // 2. Create a NEW, temporary client with the CORRECT gas price.
        // This is still necessary to ensure the "auto" calculation uses the right price.
        console.log("✅ Creating a temporary client with correct gas price for 'auto' estimation...");
        const tempClient = await SigningCosmWasmClient.connectWithSigner(
          SEI_CONFIG.rpcEndpoint,
          offlineSigner,
          {
            gasPrice: GasPrice.fromString("3.5usei") // Correct gas price is crucial for "auto"
          }
        );
        console.log("✅ Temporary client created successfully.");

        // 3. Define the funds that go to the contract.
        const factoryFunds = [{ denom: "usei", amount: TOKEN_CREATION_FEE }];

        // 4. Execute the transaction, passing "auto" as the fee parameter.
        console.log("✅ Executing transaction with 'auto' fee estimation...");
        const result = await tempClient.execute(
          address,
          CONTRACTS.tokenFactory,
          msg,
          "auto",     // <--- THE BEST PRACTICE
          undefined,  // Memo
          factoryFunds
        );
        
        // --- END OF THE FIX ---

        contractAddress = result.logs[0]?.events
          .find((e) => e.type === "wasm")
          ?.attributes.find((a) => a.key === "new_token_contract")?.value || null;
        
        transactionHash = result.transactionHash;
        
        console.log("Token created:", { contractAddress, transactionHash });
      }

      // ... (rest of the function remains the same)
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

declare global {
  interface Window {
    compass?: any;
    fin?: any;
    leap?: any;
  }
}