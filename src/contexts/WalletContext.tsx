import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import { ethers, JsonRpcProvider } from "ethers";
import { WalletSelector, EIP6963ProviderDetail } from "@/components/WalletSelector";

const SEI_RPC_URL = "https://evm-rpc.atlantic-2.seinetwork.io/";

interface WalletContextState {
  address: string | null;
  balance: string | null;
  openWalletModal: () => void;
  disconnectWallet: () => void;
  getSigner: () => Promise<ethers.JsonRpcSigner | null>;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discoveredProviders, setDiscoveredProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [selectedWalletProvider, setSelectedWalletProvider] = useState<any | null>(null);

  // Provider for READ-ONLY operations (like getBalance). This prevents the ENS error for reads.
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
      const accounts = await providerDetail.provider.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        // We MUST store the chosen wallet's provider object to create a signer later
        setSelectedWalletProvider(providerDetail.provider);
      }
    } catch (error) {
      console.error("User denied account access:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const getSigner = async (): Promise<ethers.JsonRpcSigner | null> => {
    // THE REAL FIX:
    // We check for the provider object that the user selected from the modal.
    if (!selectedWalletProvider) {
      console.error("No wallet provider selected.");
      return null;
    }
    try {
      // Create a NEW BrowserProvider INSTANCE using the SELECTED wallet provider.
      // This is the only way to get a signer that can talk to the user's wallet.
      const browserProvider = new ethers.BrowserProvider(selectedWalletProvider);
      // This will now succeed because it's connected to the actual wallet.
      return await browserProvider.getSigner();
    } catch (error) {
      console.error("Could not get signer:", error);
      return null;
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setSelectedWalletProvider(null);
  };

  // This effect listens for account changes from the connected wallet
  useEffect(() => {
    if (selectedWalletProvider && selectedWalletProvider.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        } else {
          disconnectWallet();
        }
      };
      selectedWalletProvider.on("accountsChanged", handleAccountsChanged);
      return () => {
        selectedWalletProvider.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [selectedWalletProvider]);

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
