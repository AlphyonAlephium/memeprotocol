import { useState } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Search } from "lucide-react";

const mockTokens = [
  {
    id: 1,
    name: "DogeCoin2.0",
    symbol: "DOGE2",
    price: "0.00045",
    change24h: 156.32,
    volume24h: "1,234,567",
    marketCap: "5,678,900",
    image: "🐕",
  },
  {
    id: 2,
    name: "PepeMax",
    symbol: "PEPEMAX",
    price: "0.00012",
    change24h: 89.45,
    volume24h: "987,654",
    marketCap: "3,456,789",
    image: "🐸",
  },
  {
    id: 3,
    name: "MoonCat",
    symbol: "MCAT",
    price: "0.00089",
    change24h: -12.34,
    volume24h: "765,432",
    marketCap: "2,345,678",
    image: "🐱",
  },
  {
    id: 4,
    name: "RocketShiba",
    symbol: "RSHIB",
    price: "0.00156",
    change24h: 234.56,
    volume24h: "2,345,678",
    marketCap: "8,901,234",
    image: "🚀",
  },
];

const Markets = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = mockTokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-neon-pink bg-clip-text text-transparent">
            Trending Meme Tokens
          </h1>
          <p className="text-muted-foreground">
            Discover and trade the hottest meme tokens on Sei
          </p>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>

        <div className="grid gap-4">
          {filteredTokens.map((token) => (
            <Card
              key={token.id}
              className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all hover:glow-effect cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-3xl">
                    {token.image}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{token.name}</h3>
                    <p className="text-muted-foreground">${token.symbol}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-8 items-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <p className="text-lg font-bold text-accent">
                      {token.price} SEI
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">24h Change</p>
                    <div className="flex items-center gap-1">
                      {token.change24h > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span className="text-success font-bold">
                            +{token.change24h}%
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-destructive" />
                          <span className="text-destructive font-bold">
                            {token.change24h}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Volume 24h</p>
                    <p className="font-semibold">{token.volume24h} SEI</p>
                  </div>
                  <div>
                    <Button className="w-full glow-effect-cyan">Trade</Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTokens.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No tokens found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Markets;
