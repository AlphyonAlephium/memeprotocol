import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { GasPrice } from "@cosmjs/stargate";
import { SEI_CONFIG } from "@/config/contracts";

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
      // Check if Compass, Fin, or Leap wallet is installed
      if (!window.compass && !window.fin && !window.leap) {
        const message = "No Sei wallet detected! Please install one of these:\n\n• Compass Wallet\n• Fin Wallet\n• Leap Wallet";
        alert(message);
        window.open("https://www.compasswallet.io/", "_blank");
        throw new Error(message);
      }

      // Try wallets in order of preference
      const wallet = window.compass || window.fin || window.leap;
      const walletName = window.compass ? "Compass" : window.fin ? "Fin" : "Leap";
      
      console.log(`Attempting to connect with ${walletName} wallet...`);
      
      await wallet.enable(SEI_CONFIG.chainId);
      const offlineSigner = await wallet.getOfflineSignerAuto(SEI_CONFIG.chainId);
      const accounts = await offlineSigner.getAccounts();

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const userAddress = accounts[0].address;
      
      const signingClient = await SigningCosmWasmClient.connectWithSigner(
        SEI_CONFIG.rpcEndpoint,
        offlineSigner,
        {
          gasPrice: GasPrice.fromString(SEI_CONFIG.gasPrice) as any,
        }
      );

      setAddress(userAddress);
      setClient(signingClient);

      // Fetch balance
      const bal = await signingClient.getBalance(userAddress, "usei");
      setBalance((Number(bal.amount) / 1_000_000).toFixed(2));

      localStorage.setItem("wallet_connected", "true");
      console.log("Wallet connected successfully!");
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      if (error.message && !error.message.includes("No Sei wallet")) {
        alert("Wallet connection failed: " + error.message);
      }
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

  // Auto-reconnect if previously connected
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
      value={{
        address,
        isConnected: !!address,
        client,
        balance,
        connectWallet,
        disconnectWallet,
        isConnecting,
      }}
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

// Type declarations for wallet extensions
declare global {
  interface Window {
    compass?: any;
    fin?: any;
    leap?: any;
  }
}
