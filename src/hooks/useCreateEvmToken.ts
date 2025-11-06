import { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'sonner';

import { useWallet } from '@/contexts/WalletContext';
import { MEME_TOKEN_CONTRACT_ADDRESS } from '@/config/evm';
import MemeTokenAbi from '@/config/MemeToken.json';

// The arguments the hook's function will take
interface CreateTokenArgs {
  amount: number;
}

export const useCreateEvmToken = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { provider, address } = useWallet();

  const createToken = async ({ amount }: CreateTokenArgs) => {
    // Ensure wallet is connected
    if (!provider || !address) {
      toast.error('Wallet not connected. Please connect your wallet first.');
      return;
    }

    setIsCreating(true);
    try {
      // Get the wallet signer
      const signer = await provider.getSigner();

      // Create a contract instance
      const contract = new ethers.Contract(
        MEME_TOKEN_CONTRACT_ADDRESS,
        MemeTokenAbi,
        signer
      );

      // The amount needs to be converted to the correct unit (with 18 decimals)
      const amountToMint = ethers.parseUnits(amount.toString(), 18);

      // Call the 'mint' function on the smart contract
      toast.info('Sending transaction to mint tokens...');
      const tx = await contract.mint(address, amountToMint);

      // Wait for the transaction to be confirmed on the blockchain
      toast.info('Waiting for transaction confirmation...', { id: 'mint-tx' });
      await tx.wait();

      toast.success('Successfully minted tokens!', { id: 'mint-tx' });
      
    } catch (error: any) {
      console.error('Failed to mint tokens:', error);
      // Try to provide a more user-friendly error message
      const reason = error.reason || error.message || 'An unknown error occurred.';
      toast.error(`Failed to mint tokens: ${reason}`);
    } finally {
      setIsCreating(false);
    }
  };

  return { createToken, isCreating };
};
