import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, TrendingUp, PlusCircle, User, Wallet, LogOut } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

const Header = () => {
  const location = useLocation();
  const { address, balance, network, openWalletModal, disconnectWallet, isConnecting } = useWallet();

  const isActive = (path: string) => location.pathname === path;

  const handleDisconnect = () => {
    disconnectWallet();
    toast.success("Wallet disconnected successfully");
  };

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          {/* Logo etc. */}
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-all">
            <Rocket className="w-4 h-4 text-primary" />
          </div>
          <span className="text-lg font-semibold text-foreground">MemeMarket</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">{/* Nav Links */}</nav>

        {!address ? (
          <Button
            variant="default"
            className="bg-primary/90 hover:bg-primary"
            onClick={openWalletModal}
            disabled={isConnecting}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            {/* Network Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary">{network || "Unknown Network"}</span>
            </div>
            
            {/* Balance Display */}
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-sm font-medium">{balance ? `${balance} SEI` : "..."}</p>
            </div>
            
            {/* Disconnect Button */}
            <Button variant="secondary" onClick={handleDisconnect} title="Disconnect" className="font-mono">
              <LogOut className="w-4 h-4 mr-2" />
              {address.slice(0, 6)}...{address.slice(-4)}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
