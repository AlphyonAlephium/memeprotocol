import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import { ethers, JsonRpcProvider } from "ethers";
import { toast } from "sonner";
import { WalletSelector, EIP6963ProviderDetail } from "@/components/WalletSelector";

const SEI_RPC_URL = "https://evm-rpc.atlantic-2.seinetwork.io/";
const SEI_TESTNET_CHAIN_ID = 1328;

interface WalletContextState {
  address: string | null;
  balance: string | null;
  openWalletModal: () => void;
  disconnectWallet: () => void;
  getSigner: () => Promise<ethers.Signer | null>;
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

  const [staticProvider] = useState(() => new JsonRpcProvider(SEI_RPC_URL));

  useEffect(() => {
    if (address && staticProvider) {
      staticProvider
        .getBalance(address)
        .then((balanceBigInt) => {
          setBalance(parseFloat(ethers.formatEther(balanceBigInt)).toFixed(4));
        })
        .catch((err) => console.error("Failed to fetch balance:", err));
    } else {
      setBalance(null);
    }
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
  const disconnectWallet = () => {
    setAddress(null);
    setSelectedWalletProvider(null);
  };

  const handleSelectProvider = useCallback(async (providerDetail: EIP6963ProviderDetail) => {
    setIsModalOpen(false);
    setIsConnecting(true);
    try {
      const accounts = await providerDetail.provider.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setSelectedWalletProvider(providerDetail.provider);
      }
    } catch (error) {
      console.error("User denied account access:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const getSigner = async (): Promise<ethers.Signer | null> => {
    if (!selectedWalletProvider) return null;
    try {
      const browserProvider = new ethers.BrowserProvider(selectedWalletProvider, "any");
      const network = await browserProvider.getNetwork();
      if (Number(network.chainId) !== SEI_TESTNET_CHAIN_ID) {
        toast.error(`Please switch your wallet to the Sei Testnet (Chain ID: ${SEI_TESTNET_CHAIN_ID})`);
        return null;
      }
      return await browserProvider.getSigner();
    } catch (error) {
      console.error("Failed to get signer:", error);
      return null;
    }
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
