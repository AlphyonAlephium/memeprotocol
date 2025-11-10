import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { WalletSelector, EIP6963ProviderDetail } from "@/components/WalletSelector";

import { SEI_TESTNET_CHAIN_ID as REQUIRED_CHAIN_ID_HEX } from "@/config/evm";
const REQUIRED_CHAIN_ID =
  typeof REQUIRED_CHAIN_ID_HEX === "string"
    ? parseInt(REQUIRED_CHAIN_ID_HEX, 16)
    : Number(REQUIRED_CHAIN_ID_HEX);

export interface WalletContextState {
  address: string | null;
  balance: string | null;
  network: string | null;
  chainId: number | null;
  openWalletModal: () => void;
  disconnectWallet: () => void;
  getSigner: () => Promise<ethers.Signer | null>;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [discoveredProviders, setDiscoveredProviders] = useState<EIP6963ProviderDetail[]>([]);
  const [selectedWalletProvider, setSelectedWalletProvider] = useState<any | null>(null);

  useEffect(() => {
    if (address && selectedWalletProvider) {
      const fetchBalance = async () => {
        try {
          const browserProvider = new ethers.BrowserProvider(selectedWalletProvider, "any");
          const balanceBigInt = await browserProvider.getBalance(address);
          setBalance(parseFloat(ethers.formatEther(balanceBigInt)).toFixed(4));
        } catch (err) {
          console.error("Failed to fetch balance:", err);
        }
      };
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [address, selectedWalletProvider]);

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
        
        // Detect network
        const chainIdHex = await providerDetail.provider.request({ method: "eth_chainId" });
        const chainIdNum = parseInt(chainIdHex, 16);
        setChainId(chainIdNum);
        
        const networkName = chainIdNum === REQUIRED_CHAIN_ID ? "Sei EVM Testnet" : `Chain ${chainIdNum}`;
        setNetwork(networkName);
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
      if (Number(network.chainId) !== REQUIRED_CHAIN_ID) {
        const requiredHex = "0x" + REQUIRED_CHAIN_ID.toString(16);
        toast.error(`Please switch your wallet to Sei EVM Testnet (Chain ID: ${REQUIRED_CHAIN_ID} / ${requiredHex})`);
        return null;
      }
      return await browserProvider.getSigner();
    } catch (error) {
      console.error("Failed to get signer:", error);
      return null;
    }
  };

  return (
    <WalletContext.Provider value={{ address, balance, network, chainId, openWalletModal, disconnectWallet, getSigner, isConnecting }}>
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
