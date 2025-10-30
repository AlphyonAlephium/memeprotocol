import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, TrendingUp, Zap, Shield } from "lucide-react";
import { NewTokensSection } from "@/components/NewTokensSection";
import { TrendingTokensSection } from "@/components/TrendingTokensSection";
import { AnimatedText } from "@/components/AnimatedText";

const Index = () => {
  const features = [
    {
      icon: Rocket,
      title: "Launch in Seconds",
      description: "Create your meme token for just 20 SEI and launch instantly on Sei's CLOB",
    },
    {
      icon: TrendingUp,
      title: "Trade on Native CLOB",
      description: "Leverage Sei's blazing-fast Central Limit Order Book for seamless trading",
    },
    {
      icon: Zap,
      title: "Zero Gas Fees",
      description: "Enjoy near-instant transactions with minimal fees on the Sei blockchain",
    },
    {
      icon: Shield,
      title: "Fully Decentralized",
      description: "Non-custodial trading with complete control over your assets",
    },
  ];

  const stats = [
    { label: "Tokens Launched", value: "1,234" },
    { label: "24h Volume", value: "567K SEI" },
    { label: "Active Traders", value: "8,901" },
    { label: "Total Trades", value: "45.6K" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <AnimatedText 
                text="Launch Your Meme Token in Minutes"
                className="bg-gradient-to-r from-white via-neon-cyan to-neon-pink bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]"
              />
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 mb-12 max-w-2xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "1s", animationFillMode: "both" }}>
              Create, trade, and launch tokens instantly on Sei's blazing-fast CLOB
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/create">
                <Button size="lg" className="text-lg px-10 py-7 shadow-lg shadow-primary/25">
                  <Rocket className="mr-2 h-5 w-5" />
                  Create Token
                </Button>
              </Link>
              <Link to="/markets">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7">
                  Explore Markets
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border/30 bg-card/20 backdrop-blur-md">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose MemeMarket?
            </h2>
            <p className="text-lg text-muted-foreground/70 max-w-2xl mx-auto">
              The fastest platform for meme token creation and trading on Sei
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-8 hover:border-primary/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground/70 leading-relaxed">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Newly Launched Tokens */}
        <NewTokensSection />

        {/* Trending Tokens */}
        <TrendingTokensSection />

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="p-12 hover:border-primary/40 transition-all">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Go Viral?
              </h2>
              <p className="text-lg text-muted-foreground/70 mb-8">
                Join creators launching the next generation of meme tokens
              </p>
              <Link to="/create">
                <Button size="lg" className="text-lg px-10 py-7 shadow-lg shadow-primary/25">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Creating Now
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-8 bg-card/10 backdrop-blur-md">
        <div className="container mx-auto px-4 text-center text-muted-foreground/50 text-sm">
          <p>© 2025 MemeMarket Protocol. Built on Sei.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
