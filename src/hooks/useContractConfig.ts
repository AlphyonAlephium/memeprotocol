import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { CONTRACTS } from "@/config/contracts";
import { toast } from "sonner";

export const useContractConfig = () => {
  const { client, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const queryConfig = async () => {
    if (!client) {
      throw new Error("Wallet not connected");
    }

    try {
      const result = await client.queryContractSmart(
        CONTRACTS.tokenFactory,
        { config: {} }
      );
      console.log("Contract config:", result);
      return result;
    } catch (error: any) {
      console.error("Failed to query config:", error);
      throw error;
    }
  };

  const updateConfig = async (newOwner: string) => {
    if (!client || !address) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    try {
      const msg = {
        update_config: {
          owner: newOwner,
        },
      };

      const result = await client.execute(
        address,
        CONTRACTS.tokenFactory,
        msg,
        "auto"
      );

      toast.success(`Config updated! TX: ${result.transactionHash.slice(0, 8)}...`);
      return result;
    } catch (error: any) {
      console.error("Failed to update config:", error);
      toast.error(error.message || "Failed to update config");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    queryConfig,
    updateConfig,
    isLoading,
  };
};
