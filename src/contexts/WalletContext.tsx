import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SigningCosmWasmClient, CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { SEI_CONFIG } from "@/config/contracts";

// --- CORE FIX: IMPORT ALL NECESSARY COMPONENTS ---
import { Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes, AminoTypes, GasPrice } from "@cosmjs/stargate";
import { cosmwasmProtoRegistry, wasmTypes } from "@cosmjs/cosmwasm-stargate";

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
      if (!wallet) throw new Error("No Sei wallet detected!");

      await wallet.enable(SEI_CONFIG.chainId);
      const offlineSigner = await wallet.getOfflineSignerAuto(SEI_CONFIG.chainId);
      const accounts = await offlineSigner.getAccounts();
      const userAddress = accounts[0].address;

      // --- THE DEFINITIVE CLIENT CREATION ---

      // 1. Create a registry and add all the default and CosmWasm types.
      // This is what solves the "Unregistered type url" error.
      const registry = new Registry([...defaultRegistryTypes, ...cosmwasmProtoRegistry]);

      // 2. Create Amino types for wallet compatibility.
      const aminoTypes = new AminoTypes({ ...wasmTypes });

      // 3. Create the client with all the necessary options.
      console.log("✅ Creating client with full, manual configuration...");
      const signingClient = await SigningCosmWasmClient.connectWithSigner(SEI_CONFIG.rpcEndpoint, offlineSigner, {
        registry: registry,
        aminoTypes: aminoTypes,
        gasPrice: GasPrice.fromString("3.5usei"), // Set the correct gas price here.
      });
      console.log("✅ Client created successfully. All types registered.");

      // --- END OF DEFINITIVE FIX ---

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
  if (context === undefined) throw new Error("useWallet must be used within a WalletProvider");
  return context;
};

declare global {
  interface Window {
    compass?: any;
    fin?: any;
    leap?: any;
  }
}
