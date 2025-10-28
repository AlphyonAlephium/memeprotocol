import { useState } from "react";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockTokens = [
  {
    id: 1,
    name: "DogeCoin2.0",
    symbol: "DOGE2",
    price: "0.00045",
    change24h: 156.32,
    volume24h: "1,234,567",
    liquidity: "3,456,789",
    image: "🐕",
  },
  {
    id: 2,
    name: "PepeMax",
    symbol: "PEPEMAX",
    price: "0.00012",
    change24h: 89.45,
    volume24h: "987,654",
    liquidity: "2,345,678",
    image: "🐸",
  },
  {
    id: 3,
    name: "MoonCat",
    symbol: "MCAT",
    price: "0.00089",
    change24h: -12.34,
    volume24h: "765,432",
    liquidity: "1,876,543",
    image: "🐱",
  },
  {
    id: 4,
    name: "RocketShiba",
    symbol: "RSHIB",
    price: "0.00156",
    change24h: 234.56,
    volume24h: "2,345,678",
    liquidity: "5,678,901",
    image: "🚀",
  },
];

const Markets = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredTokens = mockTokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Markets</h1>
          <p className="text-muted-foreground text-sm">
            Discover and trade meme tokens on Sei
          </p>
        </div>

        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-card/50 border-border h-11"
          />
        </div>

        <div className="bg-card/50 border border-border rounded-lg overflow-hidden backdrop-blur-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_120px_140px_140px_140px_100px] gap-6 px-6 py-4 border-b border-border bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div>Token</div>
            <div className="text-right">Price</div>
            <div className="text-right">24h Change</div>
            <div className="text-right">24h Volume</div>
            <div className="text-right">Liquidity</div>
            <div></div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-border/50">
            {filteredTokens.map((token) => (
              <div
                key={token.id}
                className="grid grid-cols-[1fr_120px_140px_140px_140px_100px] gap-6 px-6 py-5 data-table-row cursor-pointer"
                onClick={() => navigate(`/trade/${token.id}`)}
              >
                {/* Token Info */}
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-xl flex-shrink-0">
                    {token.image}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{token.name}</h3>
                    <p className="text-xs text-muted-foreground">{token.symbol}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right flex items-center justify-end">
                  <span className="text-sm font-medium">{token.price} SEI</span>
                </div>

                {/* 24h Change */}
                <div className="text-right flex items-center justify-end">
                  {token.change24h > 0 ? (
                    <div className="flex items-center gap-1.5 text-success">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-semibold">+{token.change24h}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-destructive">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm font-semibold">{token.change24h}%</span>
                    </div>
                  )}
                </div>

                {/* Volume */}
                <div className="text-right flex items-center justify-end">
                  <span className="text-sm">{token.volume24h} SEI</span>
                </div>

                {/* Liquidity */}
                <div className="text-right flex items-center justify-end">
                  <span className="text-sm">{token.liquidity} SEI</span>
                </div>

                {/* Action */}
                <div className="flex items-center justify-end">
                  <Button
                    size="sm"
                    className="h-8 text-xs px-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/trade/${token.id}`);
                    }}
                  >
                    Trade
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filteredTokens.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No tokens found
          </div>
        )}
      </main>
    </div>
  );
};

export default Markets;
