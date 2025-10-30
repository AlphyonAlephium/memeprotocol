import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Rocket, AlertCircle, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";
import { useTokenCreation } from "@/hooks/useTokenCreation";
import { supabase } from "@/integrations/supabase/client";

const CreateToken = () => {
  const navigate = useNavigate();
  const { isConnected, address, balance, connectWallet, isConnecting } = useWallet();
  const { createToken, isCreating } = useTokenCreation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    image: "",
    supply: "1000000000",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // SEO: set title, description, and canonical link
  useEffect(() => {
    document.title = "Create Meme Token | Launchpad";
    const ensureTag = (selector: string, create: () => Element) => {
      const el = document.querySelector(selector);
      if (el) return el as HTMLElement;
      const created = create();
      document.head.appendChild(created);
      return created as HTMLElement;
    };

    const metaDesc = ensureTag('meta[name="description"]', () => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      return m;
    });
    metaDesc.setAttribute(
      "content",
      "Create and launch a meme token on Sei. Upload an image, set supply and details, then deploy in minutes."
    );

    const canonical = ensureTag('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    });
    canonical.setAttribute("href", window.location.href);
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setFormData({ ...formData, image: URL.createObjectURL(file) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!imageFile) {
      toast.error("Please upload a token image");
      return;
    }

    setIsUploading(true);
    try {
      // Upload image to Supabase storage
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${address}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("token-images")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Failed to upload image");
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("token-images")
        .getPublicUrl(filePath);

      // Create token with uploaded image URL
      const result = await createToken({
        name: formData.name,
        symbol: formData.symbol,
        imageUrl: publicUrl,
        description: formData.description,
        supply: formData.supply,
      });

      if (result.success && result.tokenId && result.tokenAddress) {
        toast.success("Token created successfully! Redirecting to management page...");
        // Redirect to manage page after short delay
        setTimeout(() => {
          navigate(`/manage/${result.tokenId}/${result.tokenAddress}`);
        }, 1500);
      }
    } catch (error) {
      // Error already handled in useTokenCreation
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-neon-pink bg-clip-text text-transparent">
                  Launch Your Meme Token
                </h1>
                <p className="text-muted-foreground">
                  Create and launch your token on Sei's CLOB for just 20 SEI
                </p>
              </div>
              {!isConnected ? (
                <Button
                  onClick={connectWallet} 
                  disabled={isConnecting}
                  className="shadow-lg shadow-primary/25"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </Button>
              ) : (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Connected</p>
                  <p className="font-mono text-sm">{address?.slice(0, 8)}...{address?.slice(-6)}</p>
                  <p className="text-accent font-bold">{balance} SEI</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 hover:border-primary/40 transition-all">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Token Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., DogeCoin 2.0"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="symbol">Token Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="e.g., DOGE2"
                    value={formData.symbol}
                    onChange={(e) =>
                      setFormData({ ...formData, symbol: e.target.value.toUpperCase() })
                    }
                    className="mt-2"
                    maxLength={10}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="supply">Total Supply</Label>
                  <Input
                    id="supply"
                    type="number"
                    placeholder="e.g., 1000000000"
                    value={formData.supply}
                    onChange={(e) =>
                      setFormData({ ...formData, supply: e.target.value })
                    }
                    className="mt-2"
                    min="1"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Total number of tokens to create
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell the world about your meme token..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-2 min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <Label>Token Image</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      {formData.image ? (
                        <div className="relative">
                          <img
                            src={formData.image}
                            alt={`${formData.name || 'Token'} image preview`}
                            loading="lazy"
                            className="w-32 h-32 mx-auto object-cover rounded-lg mb-2"
                          />
                          <p className="text-sm text-primary">Click to change image</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                <div className="bg-card/30 backdrop-blur-md border border-border/30 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Creation Fee: 20 SEI</p>
                    <p className="text-muted-foreground">
                      This fee goes directly to the platform. All tokens will be minted to your wallet.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-lg h-14 shadow-lg shadow-primary/25"
                  aria-busy={isCreating || isUploading}
                  disabled={!isConnected || isCreating || !formData.name || !formData.symbol || !formData.description || !imageFile || isCreating || isUploading}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  {isUploading ? "Uploading..." : isCreating ? "Creating..." : isConnected ? "Create Token" : "Connect Wallet to Create"}
                </Button>
              </form>
            </Card>

            <Card className="p-8 hover:border-primary/40 transition-all">
              <h3 className="text-2xl font-bold mb-6">Preview</h3>
              <div className="space-y-6">
                <div className="aspect-square rounded-2xl bg-card/30 backdrop-blur-md border border-border/30 flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt={`${formData.name || 'Token'} image preview`}
                      loading="lazy"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="text-6xl">🚀</div>
                  )}
                </div>

                <div>
                  <h4 className="text-2xl font-bold mb-1">
                    {formData.name || "Your Token Name"}
                  </h4>
                  <p className="text-accent font-semibold">
                    ${formData.symbol || "SYMBOL"}
                  </p>
                </div>

                <p className="text-muted-foreground">
                  {formData.description || "Your token description will appear here..."}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card/30 backdrop-blur-md border border-border/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Supply</p>
                    <p className="text-lg font-bold">{parseInt(formData.supply || "0").toLocaleString()}</p>
                  </div>
                  <div className="bg-card/30 backdrop-blur-md border border-border/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Blockchain</p>
                    <p className="text-lg font-bold">Sei</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateToken;
