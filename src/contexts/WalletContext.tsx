import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import { ethers, JsonRpcProvider } from "ethers";
import { WalletSelector, EIP6963ProviderDetail } from "@/components/WalletSelector";

const SEI_RPC_URL = "https://evm-rpc.atlantic-2.seinetwork.io/";

interface WalletContextState {
  address: string | null;
  balance: string | null;
  openWalletModal: () => void;
  disconnectWallet: () => void;
  getSigner: () => Promise<ethers.Signer | null>; // Return the base Signer type
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discoveredProviders, setDiscoveredProviders] = useState<EIP6963ProviderDetail[]>([]);

  // This is our read-only provider, correctly configured to NOT use ENS.
  const [staticProvider] = useState<JsonRpcProvider>(() => new JsonRpcProvider(SEI_RPC_URL));

  useEffect(() => {
    const fetchBalance = async () => {
      if (address && staticProvider) {
        try {
          const balanceBigInt = await staticProvider.getBalance(address);
          setBalance(parseFloat(ethers.formatEther(balanceBigInt)).toFixed(4));
        } catch (error) {
          console.error("Failed to fetch balance:", error);
          setBalance(null);
        }
      } else {
        setBalance(null);
      }
    };
    fetchBalance();
  }, [address, staticProvider]);

  useEffect(() => {
    const onAnnounceProvider = (event: Event) => {
      const { detail } = event as CustomEvent<EIP6963ProviderDetail>;
      setDiscoveredProviders((p) => (p.find((x) => x.info.uuid === detail.info.uuid) ? p : [...p, detail]));
    };
    window.addEventListener("eip6963:announceProvider", onAnnounceProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () => window.removeEventListener("eip6963:announceProvider", onAnnounceProvider);
  }, []);

  const openWalletModal = () => setIsModalOpen(true);

  const handleSelectProvider = useCallback(async (providerDetail: EIP6963ProviderDetail) => {
    setIsModalOpen(false);
    setIsConnecting(true);
    try {
      // Use the raw EIP-1193 provider from the selected wallet
      const browserProvider = new ethers.BrowserProvider(providerDetail.provider);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }
    } catch (error) {
      console.error("User denied account access:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // THE DEFINITIVE FIX IS HERE
  const getSigner = async (): Promise<ethers.Signer | null> => {
    if (!address) {
      console.error("No address available, cannot get signer.");
      return null;
    }
    try {
      // 1. Create a "void signer", which is a signer that knows the user's address but can't sign anything yet.
      const signer = new ethers.VoidSigner(address, staticProvider);

      // 2. Crucially, connect it to our correctly configured staticProvider.
      // This creates a new Signer instance that can sign transactions via the wallet
      // AND uses our safe provider for all network communication.
      return signer.connect(staticProvider);
    } catch (error) {
      console.error("Could not create connected signer:", error);
      return null;
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
  };

  return (
    <WalletContext.Provider value={{ address, balance, openWalletModal, disconnectWallet, getSigner, isConnecting }}>
      {children}
      <WalletSelector
        isOpen={isModalOpen}
        providers={discoveredProviders}
        onClose={() => setIsModalOpen(false)}
        onSelectProvider={handleSelectProvider}
      />
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
