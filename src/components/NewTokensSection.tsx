import { useNewTokens } from "@/hooks/useTokens";
import { TokenCard } from "@/components/TokenCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";

export const NewTokensSection = () => {
  const { data: tokens, isLoading } = useNewTokens(6);

  return (
    <section className="container mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-3xl font-bold">Newly Launched</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Discover the latest tokens created on our platform
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[320px] rounded-lg" />
          ))}
        </div>
      ) : tokens && tokens.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <TokenCard key={token.id} token={token} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">
            No tokens created yet. Be the first to launch!
          </p>
        </div>
      )}
    </section>
  );
};
