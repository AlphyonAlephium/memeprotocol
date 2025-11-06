import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ethers } from 'ethers';

export interface WalletContextState {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  isConnected: boolean;
  balance: string;
  isConnecting: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  setWalletConnection: (provider: ethers.BrowserProvider, address: string) => void;
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [showSelector, setShowSelector] = useState<boolean>(false);

  const fetchBalance = async (userAddress: string, browserProvider: ethers.BrowserProvider) => {
    try {
      const balanceWei = await browserProvider.getBalance(userAddress);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(balanceEth);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const connectWallet = () => {
    setShowSelector(true);
  };

  const setWalletConnection = async (browserProvider: ethers.BrowserProvider, userAddress: string) => {
    setAddress(userAddress);
    setProvider(browserProvider);
    await fetchBalance(userAddress, browserProvider);
    console.log("Wallet connected:", userAddress);
  };

  const disconnectWallet = () => {
    setAddress(null);
    setProvider(null);
    setBalance("0");
    console.log("Wallet disconnected");
  };

  useEffect(() => {
    if (provider && address) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          fetchBalance(accounts[0], provider);
        } else {
          disconnectWallet();
        }
      };

      const providerInstance = provider.provider as any;
      if (providerInstance?.on) {
        providerInstance.on('accountsChanged', handleAccountsChanged);

        return () => {
          providerInstance.removeListener?.('accountsChanged', handleAccountsChanged);
        };
      }
    }
  }, [provider, address]);

  const isConnected = !!address;

  const value: WalletContextState = {
    address,
    provider,
    isConnected,
    balance,
    isConnecting,
    connectWallet,
    disconnectWallet,
    setWalletConnection,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
      {/* Dynamically import WalletSelector to avoid circular deps */}
      {showSelector && (
        <WalletSelectorLoader 
          onClose={() => setShowSelector(false)}
          onConnect={setWalletConnection}
        />
      )}
    </WalletContext.Provider>
  );
};

// Lazy load WalletSelector component
const WalletSelectorLoader = ({ onClose, onConnect }: { onClose: () => void; onConnect: (provider: ethers.BrowserProvider, address: string) => void }) => {
  const [WalletSelector, setWalletSelector] = useState<any>(null);

  useEffect(() => {
    import('@/components/WalletSelector').then(module => {
      setWalletSelector(() => module.WalletSelector);
    });
  }, []);

  if (!WalletSelector) return null;

  return <WalletSelector open={true} onClose={onClose} onConnect={onConnect} />;
};

export const useWallet = (): WalletContextState => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

declare global {
  interface Window {
    ethereum?: any;
  }
}
