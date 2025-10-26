import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Droplets, TrendingUp, Wallet, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

interface Token {
  id: string;
  name: string;
  symbol: string;
  image_url: string;
  description: string;
  total_supply: string;
  contract_address: string;
  creator_address: string;
  created_at: string;
}

const ManageToken = () => {
  const { tokenId } = useParams();
  const { isConnected, address, balance, connectWallet } = useWallet();
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [liquidityAmount, setLiquidityAmount] = useState("");
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);

  useEffect(() => {
    if (tokenId) {
      fetchToken();
    }
  }, [tokenId]);

  const fetchToken = async () => {
    try {
      const { data, error } = await supabase
        .from("tokens")
        .select("*")
        .eq("id", tokenId)
        .single();

      if (error) throw error;
      setToken(data);
    } catch (error) {
      console.error("Error fetching token:", error);
      toast.error("Failed to load token details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLiquidity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!liquidityAmount || parseFloat(liquidityAmount) <= 0) {
      toast.error("Please enter a valid liquidity amount");
      return;
    }

    setIsAddingLiquidity(true);
    try {
      // TODO: Implement bonding curve contract interaction
      // For now, just show a placeholder message
      toast.success(`Adding ${liquidityAmount} SEI liquidity - Coming soon!`);
      setLiquidityAmount("");
    } catch (error) {
      console.error("Error adding liquidity:", error);
      toast.error("Failed to add liquidity");
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Token not found</h2>
            <Link to="/create">
              <Button>Create a Token</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isOwner = address?.toLowerCase() === token.creator_address.toLowerCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <Link to="/profile" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>

          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-neon-pink bg-clip-text text-transparent">
                  Manage Your Token
                </h1>
                <p className="text-muted-foreground">
                  Control panel for {token.name}
                </p>
              </div>
              {!isConnected && (
                <Button onClick={connectWallet} className="glow-effect-cyan">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Token Info Card */}
            <Card className="lg:col-span-1 p-6 bg-gradient-card border-border">
              <div className="space-y-6">
                <div className="aspect-square rounded-2xl bg-secondary overflow-hidden">
                  <img
                    src={token.image_url}
                    alt={token.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-1">{token.name}</h2>
                  <p className="text-accent font-semibold">${token.symbol}</p>
                </div>

                <p className="text-sm text-muted-foreground">
                  {token.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Supply</span>
                    <span className="font-semibold">{parseInt(token.total_supply).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Blockchain</span>
                    <span className="font-semibold">Sei</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="font-semibold text-accent">Active</span>
                  </div>
                </div>

                {token.contract_address && (
                  <a
                    href={`https://seitrace.com/address/${token.contract_address}?chain=atlantic-2`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    View on Explorer
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </Card>

            {/* Add Liquidity Section - Most Prominent */}
            <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-primary/10 via-accent/10 to-neon-pink/10 border-primary/20">
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-2xl bg-primary/20">
                    <Droplets className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Add Initial Liquidity</h2>
                    <p className="text-muted-foreground">Enable trading with a bonding curve</p>
                  </div>
                </div>

                {!isOwner ? (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-destructive font-medium">
                      Only the token creator can add liquidity
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-accent mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">How it works</h3>
                          <ul className="text-sm text-muted-foreground space-y-2">
                            <li>• Your SEI becomes the initial liquidity pool</li>
                            <li>• Price automatically adjusts based on supply/demand</li>
                            <li>• Traders can buy/sell instantly without order books</li>
                            <li>• You can add more liquidity anytime</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleAddLiquidity} className="space-y-6">
                      <div>
                        <Label htmlFor="liquidity" className="text-lg">SEI Amount</Label>
                        <Input
                          id="liquidity"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="e.g., 100"
                          value={liquidityAmount}
                          onChange={(e) => setLiquidityAmount(e.target.value)}
                          className="mt-2 bg-secondary border-border h-14 text-lg"
                          required
                        />
                        <div className="flex justify-between mt-2">
                          <p className="text-sm text-muted-foreground">
                            Minimum: 10 SEI recommended
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Your balance: {balance} SEI
                          </p>
                        </div>
                      </div>

                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm font-medium mb-2">Initial Price Calculation</p>
                        <p className="text-sm text-muted-foreground">
                          Starting price will be determined by the bonding curve formula based on your initial liquidity amount.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full glow-effect text-xl h-14"
                        disabled={!isConnected || isAddingLiquidity}
                      >
                        <Droplets className="w-6 h-6 mr-2" />
                        {isAddingLiquidity ? "Adding Liquidity..." : "Add Liquidity & Enable Trading"}
                      </Button>
                    </form>

                    <p className="text-xs text-muted-foreground text-center">
                      Once liquidity is added, your token will be tradeable on the platform
                    </p>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Additional Management Features (Future) */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gradient-card border-border opacity-50">
              <h3 className="font-semibold mb-2">Trading Analytics</h3>
              <p className="text-sm text-muted-foreground">View volume, price charts, and holder distribution</p>
              <p className="text-xs text-accent mt-4">Coming Soon</p>
            </Card>
            
            <Card className="p-6 bg-gradient-card border-border opacity-50">
              <h3 className="font-semibold mb-2">Market Graduation</h3>
              <p className="text-sm text-muted-foreground">Move to Sei's native CLOB when market cap threshold is reached</p>
              <p className="text-xs text-accent mt-4">Coming Soon</p>
            </Card>
            
            <Card className="p-6 bg-gradient-card border-border opacity-50">
              <h3 className="font-semibold mb-2">Community Tools</h3>
              <p className="text-sm text-muted-foreground">Airdrops, token burns, and holder rewards</p>
              <p className="text-xs text-accent mt-4">Coming Soon</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManageToken;
