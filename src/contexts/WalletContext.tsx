import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSigningCosmWasmClient } from "@sei-js/core";
import { SigningCosmWasmClient, CosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate"; // This is needed to create the gas price object
import { SEI_CONFIG } from "@/config/contracts";
import { toast } from "sonner";

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
      if (!wallet) throw new Error("No Sei wallet detected!");

      const offlineSigner = await wallet.getOfflineSignerAuto(SEI_CONFIG.chainId);
      const accounts = await offlineSigner.getAccounts();
      const userAddress = accounts[0].address;

      // --- THE FINAL FIX: Add Gas Price to Client Options ---
      const clientOptions: CosmWasmClientOptions = {
        gasPrice: GasPrice.fromString("3.5usei"),
      };

      console.log("✅ Using @sei-js/core helper with explicit gas price for auto-estimation...");
      const signingClient = await getSigningCosmWasmClient(SEI_CONFIG.rpcEndpoint, offlineSigner, clientOptions);
      // --- END OF FINAL FIX ---

      setAddress(userAddress);
      setClient(signingClient);

      const bal = await signingClient.getBalance(userAddress, "usei");
      setBalance((Number(bal.amount) / 1_000_000).toFixed(2));
      localStorage.setItem("wallet_connected", "true");
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      toast.error(`Wallet Connection Failed: ${error.message}`);
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
