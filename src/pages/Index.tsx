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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden min-h-[600px] flex items-center">
          <MemeTokenAnimation />
          <div className="absolute inset-0 bg-gradient-hero opacity-30" />
          <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in">
                Launch Your
                <span className="bg-gradient-to-r from-primary via-accent to-neon-pink bg-clip-text text-transparent">
                  {" "}Meme Empire{" "}
                </span>
                on Sei
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
                Create, trade, and dominate with the fastest meme token launchpad built on Sei's native CLOB
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
                <Link to="/create">
                  <Button size="lg" className="glow-effect text-lg px-8 h-14">
                    <Rocket className="w-5 h-5 mr-2" />
                    Launch Token (20 SEI)
                  </Button>
                </Link>
                <Link to="/markets">
                  <Button size="lg" variant="secondary" className="text-lg px-8 h-14">
                    Explore Markets
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-card/30 backdrop-blur">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-accent mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
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
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The most powerful platform for meme token creation and trading on Sei
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all hover:glow-effect"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
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
          <Card className="p-12 bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30 glow-effect">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Go Viral?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join thousands of creators launching the next generation of meme tokens
              </p>
              <Link to="/create">
                <Button size="lg" className="glow-effect-cyan text-lg px-12 h-14">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Creating Now
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 MemeMarket Protocol. Built on Sei.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
