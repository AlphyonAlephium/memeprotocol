import { useState } from "react";
import { ethers, JsonRpcProvider } from "ethers"; // Import JsonRpcProvider
import { toast } from "sonner";

import { useWallet } from "@/contexts/WalletContext";
import { MEME_TOKEN_CONTRACT_ADDRESS } from "@/config/evm";
import MemeTokenAbi from "@/config/MemeToken.json";

// The RPC endpoint for the Sei testnet
const SEI_RPC_URL = "https://evm-rpc.atlantic-2.seinetwork.io/";

interface CreateTokenArgs {
  amount: number;
}

export const useCreateEvmToken = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { address } = useWallet();

  const createToken = async ({ amount }: CreateTokenArgs) => {
    if (!address) {
      toast.error("Wallet not connected. Please connect your wallet first.");
      return;
    }

    if (typeof window.ethereum === "undefined") {
      toast.error("EVM wallet (e.g., MetaMask) not found.");
      return;
    }

    setIsCreating(true);
    try {
      // 1. Create a specific JSON RPC Provider for Sei, disabling ENS.
      const provider = new JsonRpcProvider(SEI_RPC_URL, undefined, { staticNetwork: true });

      // 2. Get the signer from the browser's wallet provider.
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();

      // 3. Create a contract instance connected to the signer.
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
