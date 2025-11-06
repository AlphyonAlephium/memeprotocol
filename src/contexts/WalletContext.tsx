import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ethers } from 'ethers';

// Define the shape of the context state
interface WalletContextState {
  address: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  provider: ethers.BrowserProvider | null;
}

// Create the context with a default undefined value
const WalletContext = createContext<WalletContextState | undefined>(undefined);

// Define the props for the provider component
interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  // Function to connect to the user's EVM wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        setAddress(userAddress);

        // Initialize ethers provider
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);
        
        console.log("Wallet connected:", userAddress);

      } catch (error) {
        console.error("User denied account access or error occurred:", error);
      }
    } else {
      console.log('MetaMask, Compass, or other EVM wallet is not installed!');
      alert('Please install an EVM-compatible wallet like MetaMask or Compass.');
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setProvider(null);
    console.log("Wallet disconnected");
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(browserProvider);
        } else {
          // If accounts array is empty, it means the user has disconnected.
          disconnectWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Cleanup listener on component unmount
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);


  return (
    <WalletContext.Provider value={{ address, connectWallet, disconnectWallet, provider }}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Add window.ethereum to the global Window interface
declare global {
  interface Window {
    ethereum?: any;
  }
}