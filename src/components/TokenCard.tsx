import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Token } from "@/hooks/useTokens";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface TokenCardProps {
  token: Token;
  showTrending?: boolean;
}

export const TokenCard = ({ token, showTrending = false }: TokenCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 hover:border-primary/40 transition-all cursor-pointer group">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden">
            {token.image_url ? (
              <img
                src={token.image_url}
                alt={token.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">🪙</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{token.name}</h3>
            <p className="text-sm text-muted-foreground/60">${token.symbol}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground/70 line-clamp-2">
          {token.description}
        </p>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground/60">Price</span>
            <span className="font-medium text-primary">
              ${(Math.random() * 0.01).toFixed(6)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground/60">24h Change</span>
            <span className={`font-medium ${Math.random() > 0.5 ? 'text-green-400' : 'text-red-400'}`}>
              {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 20).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground/60">Supply</span>
            <span className="font-medium">
              {Number(token.total_supply).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground/60">Created</span>
            <span className="font-medium text-xs">
              {formatDistanceToNow(new Date(token.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <Button 
          className="w-full bg-primary/90 hover:bg-primary mt-1"
          onClick={() => navigate(`/trade/${token.id}`)}
        >
          Trade
        </Button>
      </div>
    </Card>
  );
};
