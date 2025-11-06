import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CreateTokenFormProps {
  onSubmit: (data: {
    name: string;
    symbol: string;
    description: string;
    amount: number;
    image: File | null;
  }) => void;
  isCreating: boolean;
}

export const CreateTokenForm = ({ onSubmit, isCreating }: CreateTokenFormProps) => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      symbol,
      description,
      amount: Number(amount),
      image,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Details</CardTitle>
        <CardDescription>Enter the details for your new meme token</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Token Name</Label>
            <Input
              id="name"
              placeholder="e.g., Doge Coin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symbol">Token Symbol</Label>
            <Input
              id="symbol"
              placeholder="e.g., DOGE"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your token..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Mint</Label>
            <Input
              id="amount"
              type="number"
              placeholder="e.g., 1000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Token Image (Optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? "Creating Token..." : "Create Token"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
