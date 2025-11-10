import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// This interface is the standard for a discovered EVM provider
export interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: any; // The actual EIP-1193 provider object
}

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  providers: EIP6963ProviderDetail[];
  onSelectProvider: (provider: EIP6963ProviderDetail) => void;
}

export const WalletSelector: React.FC<WalletSelectorProps> = ({ isOpen, onClose, providers, onSelectProvider }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose a Wallet</DialogTitle>
          <DialogDescription>Select one of the available wallets to connect to the application.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {providers.length > 0 ? (
            providers.map((p) => (
              <button
                key={p.info.uuid}
                onClick={() => onSelectProvider(p)}
                className="flex items-center w-full p-3 border rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img src={p.info.icon} alt={p.info.name} className="w-8 h-8 mr-4" />
                <span className="text-lg font-semibold">{p.info.name}</span>
              </button>
            ))
          ) : (
            <div className="text-center p-4 border-2 border-dashed rounded-lg">
              <p className="text-gray-600">No EVM wallets detected.</p>
              <p className="text-sm text-gray-400 mt-2">
                Please install an EVM-compatible wallet like MetaMask or Compass.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
