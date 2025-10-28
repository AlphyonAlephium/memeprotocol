import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";
import AddLiquidityForm from "@/components/AddLiquidityForm";

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
  const { tokenId, tokenAddress } = useParams();
  const { address } = useWallet();
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);

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
                {tokenAddress && (
                  <p className="text-xs text-muted-foreground mt-1 font-mono">
                    {tokenAddress}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Token Info Card */}
            <Card className="lg:col-span-1 p-8 hover:border-primary/40 transition-all">
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
            <div className="lg:col-span-2">
              <AddLiquidityForm 
                tokenSymbol={token.symbol}
                tokenName={token.name}
                isOwner={isOwner}
              />
            </div>
          </div>

          {/* Additional Management Features (Future) */}
          <div className="mt-8 grid md:grid-cols-3 gap-8">
            <Card className="p-8 opacity-50">
              <h3 className="font-semibold mb-2">Trading Analytics</h3>
              <p className="text-sm text-muted-foreground">View volume, price charts, and holder distribution</p>
              <p className="text-xs text-accent mt-4">Coming Soon</p>
            </Card>
            
            <Card className="p-8 opacity-50">
              <h3 className="font-semibold mb-2">Market Graduation</h3>
              <p className="text-sm text-muted-foreground">Move to Sei's native CLOB when market cap threshold is reached</p>
              <p className="text-xs text-accent mt-4">Coming Soon</p>
            </Card>
            
            <Card className="p-8 opacity-50">
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
