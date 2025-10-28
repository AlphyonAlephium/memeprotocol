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
    <Card className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all card-shadow backdrop-blur-sm cursor-pointer hover-glow">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden flex-shrink-0">
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
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold truncate">{token.name}</h3>
            <p className="text-xs text-muted-foreground">{token.symbol}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {token.description}
        </p>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground text-xs">Price</span>
            <span className="font-semibold">
              ${(Math.random() * 0.01).toFixed(6)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground text-xs">24h Change</span>
            <span className={`font-semibold ${Math.random() > 0.5 ? 'text-success' : 'text-destructive'}`}>
              {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 20).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground text-xs">Supply</span>
            <span className="font-medium">
              {Number(token.total_supply).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground text-xs">Created</span>
            <span className="font-medium text-xs">
              {formatDistanceToNow(new Date(token.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <Button 
          className="w-full h-9 text-sm hover-glow"
          onClick={() => navigate(`/trade/${token.id}`)}
        >
          Trade
        </Button>
      </div>
    </Card>
  );
};
