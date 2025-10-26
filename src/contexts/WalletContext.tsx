import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// Import the correct helper function from the sei-js library
import { getSigningCosmWasmClient } from "@sei-js/cosmjs";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { SEI_CONFIG } from "@/config/contracts";

// ... (Interface and context creation are the same)
interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  client: SigningCosmWasmClient | null;
  balance: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
}
const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [client, setClient] = useState<SigningCosmWasmClient | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const wallet = window.compass || window.fin || window.leap;
      if (!wallet) {
        throw new Error("No Sei wallet detected!");
      }

      await wallet.enable(SEI_CONFIG.chainId);
      const offlineSigner = await wallet.getOfflineSignerAuto(SEI_CONFIG.chainId);
      const accounts = await offlineSigner.getAccounts();
      const userAddress = accounts[0].address;

      // --- THE CORE FIX ---
      // Use the official `getSigningCosmWasmClient` helper from `@sei-js/cosmjs`.
      // We pass the RPC endpoint and the signer. We will handle the fee options in the transaction itself.
      console.log("✅ Creating client with the official @sei-js/cosmjs helper...");
      const signingClient = await getSigningCosmWasmClient(SEI_CONFIG.rpcEndpoint, offlineSigner);
      console.log("✅ Client created successfully.");
      // --- END OF CORE FIX ---

      setAddress(userAddress);
      setClient(signingClient);

      const bal = await signingClient.getBalance(userAddress, "usei");
      setBalance((Number(bal.amount) / 1_000_000).toFixed(2));

      localStorage.setItem("wallet_connected", "true");
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setClient(null);
    setBalance(null);
    localStorage.removeItem("wallet_connected");
  };

  useEffect(() => {
    const wasConnected = localStorage.getItem("wallet_connected");
    if (wasConnected === "true") {
      connectWallet().catch(() => {
        localStorage.removeItem("wallet_connected");
      });
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{ address, isConnected: !!address, client, balance, connectWallet, disconnectWallet, isConnecting }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

declare global {
  interface Window {
    compass?: any;
    fin?: any;
    leap?: any;
  }
}
