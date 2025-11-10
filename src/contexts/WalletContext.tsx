import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from "react";
import { ethers, JsonRpcProvider, Network } from "ethers"; // Import Network
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

  // Read-only provider for fetching balance
  const [staticProvider] = useState(() => new JsonRpcProvider(SEI_RPC_URL));

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
        setSelectedWalletProvider(providerDetail.provider);
      }
    } catch (error) {
      console.error("User denied account access:", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // THE FINAL, CORRECT IMPLEMENTATION OF getSigner
  const getSigner = async (): Promise<ethers.Signer | null> => {
    if (!selectedWalletProvider) {
      console.error("Cannot get signer: No wallet provider selected.");
      return null;
    }
    try {
      // 1. Create a new BrowserProvider connected to the user's chosen wallet.
      const browserProvider = new ethers.BrowserProvider(selectedWalletProvider);

      // 2. VERIFY the network. This is a crucial step.
      const network = await browserProvider.getNetwork();
      if (Number(network.chainId) !== SEI_TESTNET_CHAIN_ID) {
        toast.error(`Please switch your wallet to the Sei Testnet (Chain ID: ${SEI_TESTNET_CHAIN_ID})`);
        throw new Error("Wrong network");
      }

      // 3. Get the signer from the correctly configured provider.
      return await browserProvider.getSigner();
    } catch (error) {
      console.error("Failed to get signer:", error);
      return null;
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setSelectedWalletProvider(null);
  };

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
