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

      // Explicitly check if getSigner returned null
      if (!signer) {
        // A toast error would have already been shown in getSigner if the network was wrong
        throw new Error(
          "Wallet signer could not be obtained. Check if your wallet is connected and on the correct network.",
        );
      }

      const contract = new ethers.Contract(MEME_TOKEN_CONTRACT_ADDRESS, MemeTokenAbi, signer);
      const amountToMint = ethers.parseUnits(amount.toString(), 18);

      toast.info("Sending transaction to mint tokens...");
      // Use the connected address directly, not as a parameter that might be resolved
      const tx = await contract.mint(await signer.getAddress(), amountToMint);

      toast.info("Waiting for transaction confirmation...", { id: "mint-tx" });
      await tx.wait();

      toast.success("Successfully minted tokens!", { id: "mint-tx" });
    } catch (error: any) {
      console.error("Failed to mint tokens:", error);
      toast.error(`Failed to mint tokens: ${error.reason || error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  return { createToken, isCreating };
};
