import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { SEI_CONFIG } from "@/config/contracts";
import { toast } from "sonner";

// This is a special debug file. It does not create tokens.
// Its only purpose is to prove if file changes are being loaded.

export const useTokenCreation = () => {
  const { address } = useWallet();
  const [isCreating, setIsCreating] = useState(false);

  const createToken = async (params: any) => {
    if (!address) {
      toast.error("DEBUG: Wallet not connected.");
      return;
    }

    setIsCreating(true);

    // --- START OF THE DEBUG TEST ---

    console.clear(); // Clear the console to make the message obvious.
    
    const debugVersion = "V10_DEBUG_ONLY";
    const timestamp = new Date().toISOString();

    console.log("======================================================");
    console.log("✅ DEBUG TEST INITIATED");
    console.log(`✅ If you see this message, the file is up to date.`);
    console.log(`✅ Version: ${debugVersion}`);
    console.log(`✅ Timestamp: ${timestamp}`);
    console.log("======================================================");

    // We will also check the gasPrice from the config file.
    try {
      const gasPriceFromConfig = SEI_CONFIG.gasPrice;
      console.log(`CHECKING CONFIG: The gasPrice in contracts.ts is: "${gasPriceFromConfig}"`);
      if (gasPriceFromConfig === "3.5usei") {
        console.log("RESULT: The config file is CORRECT.");
        toast.success("DEBUG: Config file is correct!");
      } else {
        console.error(`RESULT: The config file is WRONG. Expected "3.5usei", but found "${gasPriceFromConfig}".`);
        toast.error("DEBUG: Config file is WRONG!");
      }
    } catch (e) {
      console.error("Could not read SEI_CONFIG from contracts.ts. This is a major build error.");
    }
    
    // --- END OF THE DEBUG TEST ---

    // We stop the process here. No transaction will be sent.
    setTimeout(() => {
      setIsCreating(false);
      toast.info("Debug test complete. No transaction was sent. Check the console.");
    }, 1000);

  };

  return {
    createToken,
    isCreating,
  };
};