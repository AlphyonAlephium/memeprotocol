import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, TrendingUp, PlusCircle, User, Wallet, LogOut } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

const Header = () => {
  const location = useLocation();
  const { isConnected, connectWallet, disconnectWallet, isConnecting, address, balance } = useWallet();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center glow-effect group-hover:scale-110 transition-transform">
            <Rocket className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MemeMarket
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/markets">
            <Button
              variant={isActive("/markets") ? "secondary" : "ghost"}
              className="gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Markets
            </Button>
          </Link>
          <Link to="/create">
            <Button
              variant={isActive("/create") ? "secondary" : "ghost"}
              className="gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Create Token
            </Button>
          </Link>
          <Link to="/profile">
            <Button
              variant={isActive("/profile") ? "secondary" : "ghost"}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
          </Link>
        </nav>

        {!isConnected ? (
          <Button variant="default" className="glow-effect" onClick={connectWallet} disabled={isConnecting}>
            <Wallet className="w-4 h-4 mr-2" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-sm font-medium">{balance} SEI</p>
            </div>
            <Button variant="secondary" onClick={disconnectWallet} title="Disconnect" className="font-mono">
              <LogOut className="w-4 h-4 mr-2" />
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
