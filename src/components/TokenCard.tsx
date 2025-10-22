import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Token } from "@/hooks/useTokens";
import { formatDistanceToNow } from "date-fns";

interface TokenCardProps {
  token: Token;
  showTrending?: boolean;
}

export const TokenCard = ({ token, showTrending = false }: TokenCardProps) => {
  return (
    <Card className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all hover:glow-effect cursor-pointer">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
            {token.image_url ? (
              <img
                src={token.image_url}
                alt={token.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl">🪙</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{token.name}</h3>
            <p className="text-muted-foreground">${token.symbol}</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {token.description}
        </p>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Supply</span>
            <span className="font-semibold">
              {Number(token.total_supply).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Created</span>
            <span className="font-semibold">
              {formatDistanceToNow(new Date(token.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>

        <Button className="w-full glow-effect-cyan">View Token</Button>
      </div>
    </Card>
  );
};
