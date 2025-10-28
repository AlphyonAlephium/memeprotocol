import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, Clock, Copy, Check, Settings } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserTokens } from "@/hooks/useUserTokens";

const Profile = () => {
  const { isConnected, address, balance, connectWallet, isConnecting } = useWallet();
  const [copied, setCopied] = useState(false);
  const { data: userTokens, isLoading: tokensLoading } = useUserTokens(address);

  const mockHoldings = [
    { symbol: "DOGE2", amount: "1,500,000", value: "675 SEI", change: "+23.5%" },
    { symbol: "PEPEMAX", amount: "3,200,000", value: "384 SEI", change: "+12.8%" },
    { symbol: "MCAT", amount: "850,000", value: "756 SEI", change: "-5.2%" },
  ];

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Address copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="p-12 bg-gradient-card border-border text-center">
              <Wallet className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Connect your Sei wallet to view your profile, holdings, and created tokens
              </p>
              <Button 
                size="lg" 
                className="shadow-lg shadow-primary/25" 
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <Wallet className="w-5 h-5 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="p-10 mb-10 hover:border-primary/40 transition-all">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl">
                  🚀
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 font-mono break-all">
                    {address?.slice(0, 12)}...{address?.slice(-8)}
                  </h1>
                  <p className="text-muted-foreground mb-4">Sei Network Trader</p>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Wallet Balance</p>
                      <p className="text-2xl font-bold text-accent">{balance} SEI</p>
                    </div>
                    <div className="border-l border-border pl-4">
                      <p className="text-sm text-muted-foreground">Network</p>
                      <p className="text-2xl font-bold">Atlantic-2</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="secondary" onClick={copyAddress} className="gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Address"}
              </Button>
            </div>
          </Card>

          <Tabs defaultValue="holdings" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="holdings" className="gap-2">
                <Wallet className="w-4 h-4" />
                Holdings
              </TabsTrigger>
              <TabsTrigger value="created" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Created Tokens
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <Clock className="w-4 h-4" />
                Open Orders
              </TabsTrigger>
            </TabsList>

            <TabsContent value="holdings" className="space-y-4">
              {mockHoldings.map((holding, index) => (
                <Card
                  key={index}
                  className="p-8 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-1">${holding.symbol}</h3>
                      <p className="text-muted-foreground">
                        {holding.amount} tokens
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-accent mb-1">
                        {holding.value}
                      </p>
                      <p
                        className={
                          holding.change.startsWith("+")
                            ? "text-success"
                            : "text-destructive"
                        }
                      >
                        {holding.change}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="created" className="space-y-4">
              {tokensLoading ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">Loading your tokens...</p>
                </Card>
              ) : userTokens && userTokens.length > 0 ? (
                userTokens.map((token) => (
                  <Card
                    key={token.id}
                    className="p-8 hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={token.image_url}
                          alt={token.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            {token.name} (${token.symbol})
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Supply: {parseInt(token.total_supply).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Link to={`/manage/${token.id}/${token.contract_address}`}>
                        <Button variant="secondary" className="gap-2">
                          <Settings className="w-4 h-4" />
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-lg mb-4">No tokens created yet</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Create your first memecoin and start building your community
                  </p>
                  <Link to="/create">
                    <Button className="shadow-lg shadow-primary/25">
                      Create Token
                    </Button>
                  </Link>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="orders">
              <Card className="p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg mb-4">No open orders</p>
                <p className="text-sm text-muted-foreground">
                  Start trading on the{" "}
                  <Link to="/markets" className="text-primary underline">
                    Markets page
                  </Link>
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Profile;
