import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { ethers, JsonRpcProvider } from "ethers";

// THE RPC ENDPOINT FOR THE SEI TESTNET
const SEI_RPC_URL = "https://evm-rpc.atlantic-2.seinetwork.io/";

// Define the shape of the context state
interface WalletContextState {
  address: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  provider: JsonRpcProvider | null; // This will be our stable, configured provider
  getSigner: () => Promise<ethers.JsonRpcSigner | null>; // Function to get a signer
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [address, setAddress] = useState<string | null>(null);

  // Create a stable, configured JSON RPC Provider. This solves the ENS issue.
  const [provider] = useState<JsonRpcProvider>(
    () => new JsonRpcProvider(SEI_RPC_URL, undefined, { staticNetwork: true }),
  );

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          console.log("Wallet connected:", accounts[0]);
        }
      } catch (error) {
        console.error("User denied account access or error occurred:", error);
      }
    } else {
      alert("Please install an EVM-compatible wallet like MetaMask.");
    }
  };

  const getSigner = async (): Promise<ethers.JsonRpcSigner | null> => {
    if (typeof window.ethereum === "undefined") return null;
    // We get a fresh signer each time, which is best practice
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    return await browserProvider.getSigner();
  };

  const disconnectWallet = () => {
    setAddress(null);
    console.log("Wallet disconnected");
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setAddress(accounts.length > 0 ? accounts[0] : null);
      };
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  return (
    <WalletContext.Provider value={{ address, connectWallet, disconnectWallet, provider, getSigner }}>
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
    ethereum?: any;
  }
}
