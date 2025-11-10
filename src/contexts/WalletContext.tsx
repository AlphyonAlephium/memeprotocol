import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import { ethers, JsonRpcProvider } from "ethers";
import { WalletSelector, EIP6963ProviderDetail } from "@/components/WalletSelector";

const SEI_RPC_URL = "https://evm-rpc.atlantic-2.seinetwork.io/";

interface WalletContextState {
  address: string | null;
  balance: string | null;
  openWalletModal: () => void;
  disconnectWallet: () => void;
  getSigner: () => Promise<ethers.JsonRpcSigner | null>; // Kept for consistency
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discoveredProviders, setDiscoveredProviders] = useState<EIP6963ProviderDetail[]>([]);

  // THIS IS OUR ONE, CORRECTLY CONFIGURED PROVIDER. WE WILL USE THIS FOR EVERYTHING.
  const [staticProvider] = useState<JsonRpcProvider>(
    () => new JsonRpcProvider(SEI_RPC_URL, undefined, { staticNetwork: true }),
  );

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
        // We only store the address, not the whole provider object
      }
    } catch (error) {
      console.error("User denied account access:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const getSigner = async (): Promise<ethers.JsonRpcSigner | null> => {
    if (!address) return null;
    try {
      // THE FIX: Get the signer directly from our one staticProvider.
      // It will use the connected account from the user's wallet.
      return await staticProvider.getSigner(address);
    } catch (error) {
      console.error("Could not get signer:", error);
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
