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
      toast.error("Please connect your wallet first.");
      return;
    }

    setIsCreating(true);
    try {
      const signer = await getSigner();
      if (!signer) {
        throw new Error("Wallet signer could not be obtained.");
      }

      const contract = new ethers.Contract(MEME_TOKEN_CONTRACT_ADDRESS, MemeTokenAbi, signer);
      const amountToMint = ethers.parseUnits(amount.toString(), 18);

      toast.info("Sending transaction to mint tokens...");

      // --- THE FIX IS HERE ---
      // We are overriding the automatic gas estimation with a manual limit.
      // 200,000 is a safe, standard limit for a simple mint function.
      const tx = await contract.mint(address, amountToMint, { gasLimit: 200000 });
      // --- END OF FIX ---

      toast.info("Waiting for transaction confirmation...", { id: "mint-tx" });
      await tx.wait();

      toast.success("Successfully minted tokens!", { id: "mint-tx" });
    } catch (error: any) {
      console.error("Failed to mint tokens:", error);
      // Let's add more detailed error logging
      const reason = error.reason || error.data?.message || error.message || "An unknown error occurred.";
      toast.error(`Failed to mint tokens: ${reason}`);
    } finally {
      setIsCreating(false);
    }
  };

  return { createToken, isCreating };
};
