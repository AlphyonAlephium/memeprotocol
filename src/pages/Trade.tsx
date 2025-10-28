import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowDownUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Token } from "@/hooks/useTokens";

export default function Trade() {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");

  const { data: token, isLoading } = useQuery({
    queryKey: ["token", tokenId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tokens")
        .select("*")
        .eq("id", tokenId)
        .single();

      if (error) throw error;
      return data as Token;
    },
    enabled: !!tokenId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <p className="text-center">Token not found</p>
        </div>
      </div>
    );
  }

  const mockPrice = (Math.random() * 0.01).toFixed(6);
  const mockChange = Math.random() > 0.5;
  const mockChangeValue = (Math.random() * 20).toFixed(2);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Markets
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Token Info */}
          <Card className="lg:col-span-2 p-8 hover:border-primary/40 transition-all">
            <div className="flex items-start gap-6 mb-8">
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                {token.image_url ? (
                  <img
                    src={token.image_url}
                    alt={token.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">🪙</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{token.name}</h1>
                  <span className="text-xl text-muted-foreground">
                    ${token.symbol}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">{token.description}</p>
                <div className="flex gap-6 flex-wrap">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold text-primary">${mockPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">24h Change</p>
                    <p
                      className={`text-2xl font-bold ${
                        mockChange ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {mockChange ? "+" : "-"}
                      {mockChangeValue}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Supply</p>
                    <p className="text-2xl font-bold">
                      {Number(token.total_supply).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Chart Placeholder */}
            <div className="bg-secondary/20 rounded-lg h-64 flex items-center justify-center">
              <p className="text-muted-foreground">
                Price chart coming soon (SEI DEX integration)
              </p>
            </div>
          </Card>

          {/* Trading Panel */}
          <Card className="p-8 h-fit sticky top-4 hover:border-primary/40 transition-all">
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    You Pay (SEI)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Balance: 0 SEI
                  </p>
                </div>

                <div className="flex justify-center">
                  <ArrowDownUp className="w-6 h-6 text-muted-foreground" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    You Receive ({token.symbol})
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={
                      buyAmount
                        ? (Number(buyAmount) / Number(mockPrice)).toFixed(2)
                        : ""
                    }
                    readOnly
                    className="text-lg bg-secondary/50"
                  />
                </div>

                <Button className="w-full shadow-lg shadow-primary/25" size="lg">
                  Buy {token.symbol}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  SEI DEX integration coming soon
                </p>
              </TabsContent>

              <TabsContent value="sell" className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    You Pay ({token.symbol})
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Balance: 0 {token.symbol}
                  </p>
                </div>

                <div className="flex justify-center">
                  <ArrowDownUp className="w-6 h-6 text-muted-foreground" />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    You Receive (SEI)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={
                      sellAmount
                        ? (Number(sellAmount) * Number(mockPrice)).toFixed(6)
                        : ""
                    }
                    readOnly
                    className="text-lg bg-secondary/50"
                  />
                </div>

                <Button className="w-full shadow-lg shadow-primary/25" size="lg">
                  Sell {token.symbol}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  SEI DEX integration coming soon
                </p>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
