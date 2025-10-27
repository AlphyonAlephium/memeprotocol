import { useNewTokens } from "@/hooks/useTokens";
import { TokenCard } from "@/components/TokenCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export const NewTokensSection = () => {
  const { data: tokens, isLoading } = useNewTokens(6);

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold">Newly Launched</h2>
        </div>
        <p className="text-base text-muted-foreground/70 max-w-2xl mx-auto">
          Discover the latest tokens created on our platform
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
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground/70">
            No tokens created yet. Be the first to launch!
          </p>
        </div>
      )}
    </section>
  );
};
