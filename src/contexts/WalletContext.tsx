import { createContext, useContext, useState, useEffect, ReactNode } from "react";
// We now import EVERYTHING from the one, correct library.
import { getSigningCosmWasmClient } from "@sei-js/core";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
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
      const wallet = window.compass || window.fin || window.leap;
      if (!wallet) throw new Error("No Sei wallet detected!");

      // The rest of this function is now simplified, as the library handles the complexity.
      const offlineSigner = await wallet.getOfflineSignerAuto(SEI_CONFIG.chainId);
      const accounts = await offlineSigner.getAccounts();
      const userAddress = accounts[0].address;

      console.log("✅ Using official @sei-js/core helper to create client...");
      const signingClient = await getSigningCosmWasmClient(SEI_CONFIG.rpcEndpoint, offlineSigner);
      
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

  const disconnectWallet = () => { /* ... same as before ... */ };
  useEffect(() => { /* ... same as before ... */ }, []);

  return (
    <WalletContext.Provider value={{ address, isConnected: !!address, client, balance, connectWallet, disconnectWallet, isConnecting }}>
      {children}
    </Wallet.Provider>
  );
};

export const useWallet = () => { /* ... same as before ... */ };

declare global { /* ... same as before ... */ }