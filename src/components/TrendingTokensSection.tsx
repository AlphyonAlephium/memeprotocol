import { useTrendingTokens } from "@/hooks/useTokens";
import { TokenCard } from "@/components/TokenCard";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

export const TrendingTokensSection = () => {
  const { data: tokens, isLoading } = useTrendingTokens(6);

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <TrendingUp className="w-6 h-6 text-accent" />
          <h2 className="text-3xl md:text-4xl font-bold">Trending Now</h2>
        </div>
        <p className="text-base text-muted-foreground/70 max-w-2xl mx-auto">
          Hot tokens gaining traction in the community
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-lg" />
          ))}
        </div>
      ) : tokens && tokens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tokens.map((token) => (
            <TokenCard key={token.id} token={token} showTrending />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground/70">
            No trending tokens yet. Start creating to see them here!
          </p>
        </div>
      )}
    </section>
  );
};
