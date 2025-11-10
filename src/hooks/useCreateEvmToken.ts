import { useState } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";

import { useWallet } from "@/contexts/WalletContext";
import { MEME_TOKEN_CONTRACT_ADDRESS } from "@/config/evm";
import MemeTokenAbi from "@/config/MemeToken.json";

interface CreateTokenArgs {
  amount: number;
}

export const useCreateEvmToken = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { getSigner, address } = useWallet();

  const createToken = async ({ amount }: CreateTokenArgs) => {
    if (!address) {
      toast.error("Wallet not connected.");
      return;
    }

    setIsCreating(true);
    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error("Wallet signer not available.");
      }

      const contract = new ethers.Contract(MEME_TOKEN_CONTRACT_ADDRESS, MemeTokenAbi, signer);
      const amountToMint = ethers.parseUnits(amount.toString(), 18);

      toast.info("Sending transaction to mint tokens...");
      const tx = await contract.mint(address, amountToMint);

      toast.info("Waiting for transaction confirmation...", { id: "mint-tx" });
      await tx.wait();

      toast.success("Successfully minted tokens!", { id: "mint-tx" });
    } catch (error: any) {
      console.error("Failed to mint tokens:", error);
      const reason = error.reason || error.message || "An unknown error occurred.";
      toast.error(`Failed to mint tokens: ${reason}`);
    } finally {
      setIsCreating(false);
    }
  };

  return { createToken, isCreating };
};
