import { CreateTokenForm } from "@/components/CreateTokenForm";
import { Header } from "@/components/Header";
import { useWallet } from "@/contexts/WalletContext";
import { useCreateEvmToken } from "@/hooks/useCreateEvmToken"; // Import the NEW hook

const CreateToken = () => {
  const { address } = useWallet();

  // Instantiate the NEW hook for EVM token creation
  const { createToken, isCreating } = useCreateEvmToken();

  // Define the new submit handler
  const handleCreateToken = async (data: {
    name: string;
    symbol: string;
    description: string;
    amount: number;
    image: File | null;
  }) => {
    console.log("Creating EVM token with data:", data);
    // We only need the 'amount' to call the mint function
    await createToken({ amount: data.amount });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-2">Create Your Meme Token</h1>
          <p className="text-gray-500 text-center mb-8">
            Fill out the form below to mint new tokens from the MemeToken contract.
          </p>
          {address ? (
            <CreateTokenForm
              // Pass the NEW handler and state to the form
              onSubmit={handleCreateToken}
              isCreating={isCreating}
            />
          ) : (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <p className="text-lg font-semibold">Please Connect Your Wallet</p>
              <p className="text-gray-600 mt-2">You need to connect an EVM-compatible wallet to proceed.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateToken;
