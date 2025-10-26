import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SigningCosmWasmClient, CosmWasmClientOptions } from "@cosmjs/cosmwasm-stargate";
import { GasPrice, Registry, AminoTypes, defaultRegistryTypes } from "@cosmjs/stargate";
import { cosmwasmProtoRegistry, wasmTypes } from "@cosmjs/cosmwasm-stargate";
import { SEI_CONFIG } from "@/config/contracts";
import { toast } from "sonner";

// This context uses only official @cosmjs libraries

interface WalletContextType {
  /* ... same as before ... */
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

      // Build a PURE CosmJS client from scratch
      const registry = new Registry([...defaultRegistryTypes, ...cosmwasmProtoRegistry]);
      const aminoTypes = new AminoTypes({ ...wasmTypes });
      const clientOptions: CosmWasmClientOptions = {
        gasPrice: GasPrice.fromString("3.5usei"),
      };

      console.log("✅ Creating a PURE CosmJS client. No @sei-js libraries are being used.");
      const signingClient = await SigningCosmWasmClient.connectWithSigner(SEI_CONFIG.rpcEndpoint, offlineSigner, {
        registry,
        aminoTypes,
        ...clientOptions,
      });

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
    /* ... same as before ... */
  };
  useEffect(() => {
    /* ... same as before ... */
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
  /* ... same as before ... */
};
declare global {
  /* ... same as before ... */
}
