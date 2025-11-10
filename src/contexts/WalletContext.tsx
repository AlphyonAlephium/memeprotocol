import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import { ethers, JsonRpcProvider } from "ethers";
import { WalletSelector, EIP6963ProviderDetail } from "@/components/WalletSelector";

const SEI_RPC_URL = "https://evm-rpc.atlantic-2.seinetwork.io/";

interface WalletContextState {
  address: string | null;
  balance: string | null; // ADDED: To hold the balance
  openWalletModal: () => void;
  disconnectWallet: () => void;
  provider: JsonRpcProvider | null;
  getSigner: () => Promise<ethers.JsonRpcSigner | null>;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null); // ADDED: Balance state
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discoveredProviders, setDiscoveredProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any | null>(null);

  const [provider] = useState<JsonRpcProvider>(
    () => new JsonRpcProvider(SEI_RPC_URL, undefined, { staticNetwork: true }),
  );

  // ADDED: useEffect to fetch balance when address changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (address && provider) {
        try {
          const balanceBigInt = await provider.getBalance(address);
          // Format from Wei (the smallest unit) to Ether (the main unit)
          const balanceString = ethers.formatEther(balanceBigInt);
          // Format to a nice, readable number (e.g., 4 decimal places)
          setBalance(parseFloat(balanceString).toFixed(4));
        } catch (error) {
          console.error("Failed to fetch balance:", error);
          setBalance(null); // Clear balance on error
        }
      } else {
        setBalance(null); // Clear balance if not connected
      }
    };

    fetchBalance();
  }, [address, provider]); // This effect runs whenever the address changes

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
    // ADDED: Pass `balance` in the context value
    <WalletContext.Provider
      value={{ address, balance, openWalletModal, disconnectWallet, provider, getSigner, isConnecting }}
    >
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
