import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="p-12 text-center hover:border-primary/40 transition-all">
            <AlertCircle className="w-24 h-24 mx-auto mb-6 text-primary" />
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-neon-pink bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-muted-foreground/70 mb-8 text-lg">
              Oops! The page you're looking for doesn't exist.
            </p>
            <Link to="/">
              <Button size="lg" className="shadow-lg shadow-primary/25">
                <Home className="w-5 h-5 mr-2" />
                Return to Home
              </Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
