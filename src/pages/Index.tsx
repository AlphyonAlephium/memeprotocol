import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Rocket, TrendingUp, Zap, Shield, ArrowRight } from "lucide-react";
import { MemeTokenAnimation } from "@/components/MemeTokenAnimation";
import { NewTokensSection } from "@/components/NewTokensSection";
import { TrendingTokensSection } from "@/components/TrendingTokensSection";

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
        <section className="relative overflow-hidden min-h-[500px] flex items-center">
          <MemeTokenAnimation />
          <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Launch Your
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {" "}Meme Token{" "}
                </span>
                on Sei
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
                Create and trade meme tokens on Sei's blazing-fast CLOB
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/create">
                  <Button size="lg" className="bg-primary/90 hover:bg-primary text-base px-8 h-12">
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch Token (20 SEI)
                  </Button>
                </Link>
                <Link to="/markets">
                  <Button size="lg" variant="secondary" className="text-base px-8 h-12 bg-secondary/50 hover:bg-secondary">
                    Explore Markets
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border/50 bg-card/20 backdrop-blur">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Why Choose MemeMarket?
            </h2>
            <p className="text-base text-muted-foreground/70 max-w-2xl mx-auto">
              The fastest platform for meme token creation and trading on Sei
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-5 bg-gradient-card border-border/50 hover:border-primary/30 transition-all card-shadow backdrop-blur"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground/70">{feature.description}</p>
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
        <section className="container mx-auto px-4 py-16">
          <Card className="p-10 bg-gradient-card border-primary/20 card-shadow backdrop-blur">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Go Viral?
              </h2>
              <p className="text-base text-muted-foreground/70 mb-6">
                Join creators launching the next generation of meme tokens
              </p>
              <Link to="/create">
                <Button size="lg" className="bg-primary/90 hover:bg-primary text-base px-10 h-12">
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Creating Now
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground/50 text-sm">
          <p>© 2025 MemeMarket Protocol. Built on Sei.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
