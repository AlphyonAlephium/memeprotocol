import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useContractConfig } from "@/hooks/useContractConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ContractConfig = () => {
  const { address, isConnected, connectWallet } = useWallet();
  const { queryConfig, updateConfig, isLoading } = useContractConfig();
  const [config, setConfig] = useState<any>(null);

  const handleQueryConfig = async () => {
    try {
      const result = await queryConfig();
      setConfig(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateConfig = async () => {
    if (!address) {
      return;
    }
    try {
      await updateConfig(address);
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
                Set your wallet as the owner to fix the "addr_validate errored: Input is empty" error
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your wallet address will be set as owner:</p>
                <p className="font-mono text-sm font-medium">{address}</p>
              </div>

              <Button
                onClick={handleUpdateConfig}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Set Me as Owner"
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
