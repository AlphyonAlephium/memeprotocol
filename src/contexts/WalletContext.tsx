import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import { ethers, JsonRpcProvider } from "ethers";
import { WalletSelector, EIP6963ProviderDetail } from "@/components/WalletSelector";

const SEI_RPC_URL = "https://evm-rpc.atlantic-2.seinetwork.io/";

interface WalletContextState {
  address: string | null;
  openWalletModal: () => void;
  disconnectWallet: () => void;
  provider: JsonRpcProvider | null;
  getSigner: () => Promise<ethers.JsonRpcSigner | null>;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discoveredProviders, setDiscoveredProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);

  const [provider] = useState<JsonRpcProvider>(
    () => new JsonRpcProvider(SEI_RPC_URL, undefined, { staticNetwork: true }),
  );

  useEffect(() => {
    const onAnnounceProvider = (event: Event) => {
      const { detail } = event as CustomEvent<EIP6963ProviderDetail>;
      setDiscoveredProviders((prev) => {
        if (prev.find((p) => p.info.uuid === detail.info.uuid)) return prev;
        return [...prev, detail];
      });
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
        setSelectedProvider(() => providerDetail.provider);
      }
    } catch (error) {
      console.error("User denied account access:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const getSigner = async (): Promise<ethers.JsonRpcSigner | null> => {
    if (!selectedProvider) return null;
    const browserProvider = new ethers.BrowserProvider(selectedProvider);
    return await browserProvider.getSigner();
  };

  const disconnectWallet = () => {
    setAddress(null);
    setSelectedProvider(null);
  };

  useEffect(() => {
    if (selectedProvider && selectedProvider.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        setAddress(accounts.length > 0 ? accounts[0] : null);
      };
      selectedProvider.on("accountsChanged", handleAccountsChanged);
      return () => {
        selectedProvider.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [selectedProvider]);

  return (
    <WalletContext.Provider value={{ address, openWalletModal, disconnectWallet, provider, getSigner, isConnecting }}>
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
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
