import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ethers } from "ethers";

interface WalletOption {
  name: string;
  icon: string;
  provider: any;
  detected: boolean;
}

interface WalletSelectorProps {
  open: boolean;
  onClose: () => void;
  onConnect: (provider: ethers.BrowserProvider, address: string) => void;
}

export const WalletSelector = ({ open, onClose, onConnect }: WalletSelectorProps) => {
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      detectWallets();
    }
  }, [open]);

  const detectWallets = () => {
    const detectedWallets: WalletOption[] = [];

    // Check for MetaMask
    if (window.ethereum?.isMetaMask) {
      detectedWallets.push({
        name: "MetaMask",
        icon: "🦊",
        provider: window.ethereum,
        detected: true,
      });
    }

    // Check for Compass (Sei wallet) - Compass exposes EVM provider differently
    if (window.compass?.ethereum) {
      detectedWallets.push({
        name: "Compass",
        icon: "🧭",
        provider: window.compass.ethereum,
        detected: true,
      });
    }

    // Check for Coinbase Wallet
    if (window.ethereum?.isCoinbaseWallet) {
      detectedWallets.push({
        name: "Coinbase Wallet",
        icon: "🔵",
        provider: window.ethereum,
        detected: true,
      });
    }

    // Check for other injected providers
    if (window.ethereum && !window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet) {
      detectedWallets.push({
        name: "Injected Wallet",
        icon: "👛",
        provider: window.ethereum,
        detected: true,
      });
    }

    // Add popular wallets as download options if not detected
    if (!detectedWallets.some(w => w.name === "MetaMask")) {
      detectedWallets.push({
        name: "MetaMask",
        icon: "🦊",
        provider: null,
        detected: false,
      });
    }

    if (!detectedWallets.some(w => w.name === "Compass")) {
      detectedWallets.push({
        name: "Compass",
        icon: "🧭",
        provider: null,
        detected: false,
      });
    }

    setWallets(detectedWallets);
  };

  const handleConnect = async (wallet: WalletOption) => {
    if (!wallet.detected) {
      const downloadLinks: Record<string, string> = {
        MetaMask: "https://metamask.io/download/",
        Compass: "https://compasswallet.io/",
      };
      
      if (downloadLinks[wallet.name]) {
        window.open(downloadLinks[wallet.name], "_blank");
        toast.info(`Please install ${wallet.name} to continue`);
      }
      return;
    }

    setConnecting(wallet.name);
    try {
      const accounts = await wallet.provider.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const browserProvider = new ethers.BrowserProvider(wallet.provider);
        onConnect(browserProvider, accounts[0]);
        toast.success(`Connected to ${wallet.name}`);
        onClose();
      }
    } catch (error: any) {
      console.error("Connection error:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to the Sei network
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant={wallet.detected ? "outline" : "ghost"}
              className="w-full h-auto py-4 px-6 justify-start gap-4 text-left"
              onClick={() => handleConnect(wallet)}
              disabled={connecting !== null}
            >
              <span className="text-3xl">{wallet.icon}</span>
              <div className="flex-1">
                <p className="font-semibold">{wallet.name}</p>
                <p className="text-xs text-muted-foreground">
                  {wallet.detected ? "Detected" : "Not installed - Click to download"}
                </p>
              </div>
              {connecting === wallet.name && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Make sure you're connected to the Sei network
        </p>
      </DialogContent>
    </Dialog>
  );
};

// Extend window interface for wallet providers
declare global {
  interface Window {
    ethereum?: any;
    compass?: {
      ethereum?: any;
    };
  }
}
