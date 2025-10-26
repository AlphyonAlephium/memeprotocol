import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { SEI_CONFIG } from "@/config/contracts";

// --- THE DEFINITIVE IMPORTS ---
import { Registry } from "@cosmjs/proto-signing";
import { defaultRegistryTypes, AminoTypes, GasPrice } from "@cosmjs/stargate";
import { cosmwasmProtoRegistry, wasmTypes } from "@cosmjs/cosmwasm-stargate";
// This is the missing piece: the Amino types specific to the Sei network.
import { seiprotocol } from "@sei-js/proto";

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

      // --- THE COMPLETE AND CORRECT CLIENT CREATION ---

      // 1. Create a registry with all Protobuf types (default + cosmwasm).
      const registry = new Registry([...defaultRegistryTypes, ...cosmwasmProtoRegistry]);

      // 2. Create an Amino type converter that understands both CosmWasm and Sei messages.
      const aminoTypes = new AminoTypes({
        ...wasmTypes,
        ...seiprotocol.seichain.dex.AminoConverter,
        ...seiprotocol.seichain.oracle.AminoConverter,
        // Add other Sei modules here if needed in the future
      });

      // 3. Create the client with the complete registry, complete amino types, and correct gas price.
      console.log("✅ Creating client with full Sei-compatible configuration...");
      const signingClient = await SigningCosmWasmClient.connectWithSigner(SEI_CONFIG.rpcEndpoint, offlineSigner, {
        registry: registry,
        aminoTypes: aminoTypes,
        gasPrice: GasPrice.fromString("3.5usei"),
      });
      console.log("✅ Sei-compatible client created successfully.");

      // --- END OF FIX ---

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
