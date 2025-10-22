import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useContractConfig } from "@/hooks/useContractConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ContractConfig = () => {
  const { address, isConnected, connectWallet } = useWallet();
  const { queryConfig, updateConfig, isLoading } = useContractConfig();
  const [config, setConfig] = useState<any>(null);
  const [newOwner, setNewOwner] = useState("");

  const handleQueryConfig = async () => {
    try {
      const result = await queryConfig();
      setConfig(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateConfig = async () => {
    if (!newOwner) {
      return;
    }
    try {
      await updateConfig(newOwner);
      await handleQueryConfig(); // Refresh config
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Contract Configuration</h1>

      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>Connect your wallet to manage contract configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connectWallet}>Connect Wallet</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Query Current Configuration</CardTitle>
              <CardDescription>Check the current contract settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleQueryConfig} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Query Config"
                )}
              </Button>

              {config && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-mono text-sm">
                    <strong>Owner:</strong> {config.owner || "(empty - this is the problem!)"}
                  </p>
                  <p className="font-mono text-sm">
                    <strong>CW20 Code ID:</strong> {config.cw20_code_id}
                  </p>
                  <p className="font-mono text-sm">
                    <strong>Creation Fee:</strong> {config.creation_fee} usei
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Contract Owner</CardTitle>
              <CardDescription>
                Set the owner address to fix the "addr_validate errored: Input is empty" error
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Owner Address</label>
                <Input
                  placeholder="sei1..."
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Use your current address: <span className="font-mono">{address}</span>
                </p>
              </div>

              <Button
                onClick={handleUpdateConfig}
                disabled={isLoading || !newOwner}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Owner"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContractConfig;
