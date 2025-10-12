import { useState, useRef } from "react";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Rocket, AlertCircle, Wallet, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";
import { useTokenCreation } from "@/hooks/useTokenCreation";
import { supabase } from "@/integrations/supabase/client";

const CreateToken = () => {
  const { isConnected, address, balance, connectWallet, isConnecting } = useWallet();
  const { createToken, isCreating } = useTokenCreation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    image: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
      });

      if (result.success) {
        // Reset form
        setFormData({
          name: "",
          symbol: "",
          description: "",
          image: "",
        });
        setImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
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
      <main className="container mx-auto px-4 py-8">
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
                  className="glow-effect-cyan"
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

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-card border-border">
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
                    className="mt-2 bg-secondary border-border"
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
                    className="mt-2 bg-secondary border-border"
                    maxLength={10}
                    required
                  />
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
                    className="mt-2 bg-secondary border-border min-h-[120px]"
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
                            alt="Token preview" 
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

                <div className="bg-secondary/50 border border-border rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold mb-1">Creation Fee: 20 SEI</p>
                    <p className="text-muted-foreground">
                      This fee goes directly to the platform. Total supply of 1B tokens
                      will be minted to your wallet.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full glow-effect text-lg h-12"
                  disabled={!isConnected || !formData.name || !formData.symbol || !formData.description || !imageFile || isCreating || isUploading}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  {isUploading ? "Uploading..." : isCreating ? "Creating..." : isConnected ? "Create Token" : "Connect Wallet to Create"}
                </Button>
              </form>
            </Card>

            <Card className="p-6 bg-gradient-card border-border">
              <h3 className="text-xl font-bold mb-4">Preview</h3>
              <div className="space-y-6">
                <div className="aspect-square rounded-2xl bg-secondary flex items-center justify-center">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Token preview"
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
                  <div className="bg-secondary rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-1">Total Supply</p>
                    <p className="text-lg font-bold">1,000,000,000</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-4">
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
