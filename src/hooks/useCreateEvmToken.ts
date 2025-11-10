import { useState } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";

import { useWallet } from "@/contexts/WalletContext";
import { MEME_FACTORY_CONTRACT_ADDRESS } from "@/config/evm";
import MemeCoinFactoryAbi from "@/config/MemeCoinFactory.json"; // Note the updated import

// The hook now needs the desired name and symbol for the new coin
interface CreateCoinArgs {
  name: string;
  symbol: string;
}

export const useCreateMemeCoin = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { getSigner } = useWallet();

  const createCoin = async ({ name, symbol }: CreateCoinArgs) => {
    // Basic validation
    if (!name || !symbol) {
      toast.error("Coin name and symbol are required.");
      return;
    }

    setIsCreating(true);
    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error("Wallet signer could not be obtained.");
      }

      // Connect to the MemeCoinFactory contract
      const factoryContract = new ethers.Contract(MEME_FACTORY_CONTRACT_ADDRESS, MemeCoinFactoryAbi, signer);

      // The fee is 20 SEI. We use parseEther as it represents 18 decimals.
      const fee = ethers.parseEther("20");

      toast.info("Sending transaction to create new memecoin...");

      // Call the 'createMemeCoin' function and send the 20 SEI fee with the 'value' property
      const tx = await factoryContract.createMemeCoin(name, symbol, { value: fee });

      toast.info("Waiting for transaction confirmation...", { id: "create-coin-tx" });
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        toast.success(`Successfully created ${name} ($${symbol})!`, { id: "create-coin-tx" });
        // You could even parse the receipt logs here to get the new coin's address
      } else {
        throw new Error("Transaction failed after being confirmed.");
      }
    } catch (error: any) {
      console.error("Failed to create coin:", error);
      const reason = error.reason || error.data?.message || error.message || "An unknown error occurred.";
      toast.error(`Failed to create coin: ${reason}`);
    } finally {
      setIsCreating(false);
    }
  };

  return { createCoin, isCreating };
};
