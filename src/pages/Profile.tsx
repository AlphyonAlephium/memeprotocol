import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, Clock } from "lucide-react";

const Profile = () => {
  const mockHoldings = [
    { symbol: "DOGE2", amount: "1,500,000", value: "675 SEI", change: "+23.5%" },
    { symbol: "PEPEMAX", amount: "3,200,000", value: "384 SEI", change: "+12.8%" },
    { symbol: "MCAT", amount: "850,000", value: "756 SEI", change: "-5.2%" },
  ];

  const mockCreated = [
    { name: "RocketShiba", symbol: "RSHIB", holders: 234, volume: "2.3M SEI" },
    { name: "MoonDoge", symbol: "MDOGE", holders: 156, volume: "1.5M SEI" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 bg-gradient-card border-border mb-8 glow-effect">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl">
                  👤
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">sei1abc...xyz789</h1>
                  <p className="text-muted-foreground mb-4">Meme Trader</p>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Portfolio Value</p>
                      <p className="text-2xl font-bold text-accent">1,815 SEI</p>
                    </div>
                    <div className="border-l border-border pl-4">
                      <p className="text-sm text-muted-foreground">Tokens Created</p>
                      <p className="text-2xl font-bold">2</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="secondary">Copy Address</Button>
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
                  className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all"
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
              {mockCreated.map((token, index) => (
                <Card
                  key={index}
                  className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-1">
                        {token.name} (${token.symbol})
                      </h3>
                      <p className="text-muted-foreground">
                        {token.holders} holders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Volume
                      </p>
                      <p className="text-xl font-bold text-accent">
                        {token.volume}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="orders">
              <Card className="p-12 bg-gradient-card border-border text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">No open orders</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Profile;
