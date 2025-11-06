import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ethers } from 'ethers';

// Explicitly export the interface
export interface WalletContextState {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  isConnected: boolean;
  balance: string;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
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

  const fetchBalance = async (userAddress: string, browserProvider: ethers.BrowserProvider) => {
    try {
      const balanceWei = await browserProvider.getBalance(userAddress);
      const balanceEth = ethers.formatEther(balanceWei);
      setBalance(balanceEth);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setIsConnecting(true);
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        setAddress(userAddress);

        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);
        
        await fetchBalance(userAddress, browserProvider);
        
        console.log("Wallet connected:", userAddress);
      } catch (error) {
        console.error("User denied account access or error occurred:", error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      console.log('MetaMask, Compass, or other EVM wallet is not installed!');
      alert('Please install an EVM-compatible wallet like MetaMask or Compass.');
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setProvider(null);
    setBalance("0");
    console.log("Wallet disconnected");
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(browserProvider);
          fetchBalance(accounts[0], browserProvider);
        } else {
          disconnectWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const isConnected = !!address;

  const value: WalletContextState = {
    address,
    provider,
    isConnected,
    balance,
    isConnecting,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
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
