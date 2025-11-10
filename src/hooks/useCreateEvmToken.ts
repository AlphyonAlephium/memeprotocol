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

      // Get current network fee data and estimate gas precisely
      const provider = signer.provider as ethers.Provider;
      const feeData = await provider.getFeeData();

      const estimatedGas = await contract.mint.estimateGas(address, amountToMint);
      // add a 20% buffer
      const gasLimit = (estimatedGas * 120n) / 100n;

      // Build tx options compatible with legacy or EIP-1559
      const txOptions: any = { gasLimit };
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        txOptions.maxFeePerGas = feeData.maxFeePerGas;
        txOptions.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
      } else if (feeData.gasPrice) {
        txOptions.gasPrice = feeData.gasPrice;
      }

      // Optional: pre-check sufficient balance for gas
      const balance = await provider.getBalance(address);
      const gasPriceForCalc = (txOptions.maxFeePerGas ?? txOptions.gasPrice ?? 0n) as bigint;
      if (gasPriceForCalc > 0n) {
        const requiredWei = gasLimit * gasPriceForCalc;
        if (balance < requiredWei) {
          toast.error(
            `Insufficient funds for gas. Need ~${ethers.formatEther(requiredWei)} SEI, you have ${ethers.formatEther(balance)} SEI.`
          );
          return;
        }
      }

      toast.info("Sending transaction to mint tokens...");
      const tx = await contract.mint(address, amountToMint, txOptions);

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
