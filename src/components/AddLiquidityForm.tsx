import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplets, TrendingUp, Wallet } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

interface AddLiquidityFormProps {
  tokenSymbol: string;
  tokenName: string;
  isOwner: boolean;
}

const AddLiquidityForm = ({ tokenSymbol, tokenName, isOwner }: AddLiquidityFormProps) => {
  const { address, balance, openWalletModal } = useWallet();
  const isConnected = !!address;
  const [tokenAmount, setTokenAmount] = useState("");
  const [seiAmount, setSeiAmount] = useState("");
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);

  // Calculate initial price dynamically
  const calculatePrice = () => {
    const token = parseFloat(tokenAmount);
    const sei = parseFloat(seiAmount);
    
    if (token > 0 && sei > 0) {
      const pricePerToken = sei / token;
      const tokensPerSei = token / sei;
      return {
        perToken: pricePerToken.toFixed(8),
        perSei: tokensPerSei.toLocaleString(undefined, { maximumFractionDigits: 2 })
      };
    }
    return null;
  };

  const price = calculatePrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
      toast.error("Please enter a valid token amount");
      return;
    }

    if (!seiAmount || parseFloat(seiAmount) <= 0) {
      toast.error("Please enter a valid SEI amount");
      return;
    }

    if (parseFloat(seiAmount) > parseFloat(balance)) {
      toast.error("Insufficient SEI balance");
      return;
    }

    setIsAddingLiquidity(true);
    try {
      // TODO: Implement bonding curve contract interaction
      toast.success(`Creating liquidity pool with ${tokenAmount} ${tokenSymbol} and ${seiAmount} SEI - Coming soon!`);
      setTokenAmount("");
      setSeiAmount("");
    } catch (error) {
      console.error("Error adding liquidity:", error);
      toast.error("Failed to create liquidity pool");
    } finally {
      setIsAddingLiquidity(false);
    }
  };

  if (!isOwner) {
    return (
      <Card className="p-8 bg-gradient-to-br from-primary/10 via-accent/10 to-neon-pink/10 border-primary/20">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <p className="text-destructive font-medium text-center">
            Only the token creator can add liquidity
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-10 hover:border-primary/40 transition-all">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-2xl bg-primary/20">
            <Droplets className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Add Initial Liquidity</h2>
            <p className="text-muted-foreground">Create the first trading pool for {tokenName}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-secondary/50 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-accent mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">How it works</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Your SEI and tokens create the initial liquidity pool</li>
                <li>• Price automatically adjusts based on supply/demand via bonding curve</li>
                <li>• Traders can buy/sell instantly without order books</li>
                <li>• You can add more liquidity anytime</li>
              </ul>
            </div>
          </div>
        </div>

        {!isConnected && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
            <p className="text-sm font-medium">Connect your wallet to add liquidity</p>
            <Button onClick={openWalletModal} className="shadow-lg shadow-primary/25">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Token Amount Input */}
            <div>
              <Label htmlFor="tokenAmount" className="text-base font-semibold">
                {tokenSymbol} Amount
              </Label>
              <Input
                id="tokenAmount"
                type="number"
                step="any"
                min="0"
                placeholder="e.g., 1000000"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                className="mt-2 bg-secondary border-border h-12 text-base"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                How many {tokenSymbol} tokens to add
              </p>
            </div>

            {/* SEI Amount Input */}
            <div>
              <Label htmlFor="seiAmount" className="text-base font-semibold">
                SEI Amount
              </Label>
              <Input
                id="seiAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g., 100"
                value={seiAmount}
                onChange={(e) => setSeiAmount(e.target.value)}
                className="mt-2 bg-secondary border-border h-12 text-base"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your balance: {balance} SEI
              </p>
            </div>
          </div>

          {/* Price Display */}
          {price && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
              <p className="text-sm font-medium mb-3">Initial Price</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Price per {tokenSymbol}</p>
                  <p className="text-lg font-bold text-primary">{price.perToken} SEI</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tokens per SEI</p>
                  <p className="text-lg font-bold text-accent">{price.perSei} {tokenSymbol}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                This initial ratio determines the starting price. The bonding curve will adjust prices automatically as trades occur.
              </p>
            </div>
          )}

          {/* Minimum Recommendation */}
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <p className="text-sm font-medium mb-1">💡 Recommendation</p>
            <p className="text-xs text-muted-foreground">
              We recommend at least 10 SEI for initial liquidity to ensure smooth trading and minimize price impact for early buyers.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
                  className="w-full text-lg h-14 shadow-lg shadow-primary/25"
                  disabled={!isConnected || isAddingLiquidity || !tokenAmount || !seiAmount}
                >
            <Droplets className="w-6 h-6 mr-2" />
            {isAddingLiquidity ? "Creating Pool..." : "Create Liquidity Pool"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Once liquidity is added, your token will be tradeable on the platform
        </p>
      </div>
    </Card>
  );
};

export default AddLiquidityForm;
