# 🚀 Sei Token Factory - Windows Deployment Guide

This guide will walk you through deploying your meme token factory to Sei testnet using Windows and Visual Studio Code.

## Prerequisites

### 1. Install Rust
1. Download and run rustup-init.exe from: https://rustup.rs/
2. Follow the installation prompts (press Enter to proceed with default installation)
3. Open a new PowerShell window and run:
```powershell
rustup target add wasm32-unknown-unknown
```
4. Verify installation:
```powershell
rustc --version
cargo --version
```

### 2. Install Docker Desktop (for optimization)
1. Download Docker Desktop for Windows: https://www.docker.com/products/docker-desktop
2. Install and restart your computer
3. Open Docker Desktop and ensure it's running
4. Verify installation in PowerShell:
```powershell
docker --version
```

### 3. Install Sei CLI
1. Download the Windows seid binary from: https://github.com/sei-protocol/sei-chain/releases/download/v5.7.5/seid-5.7.5-windows-amd64.zip
2. Extract the zip file
3. Create a folder: `C:\sei\bin`
4. Move `seid.exe` to `C:\sei\bin`
5. Add to PATH:
   - Press Windows key, search "Environment Variables"
   - Click "Environment Variables" button
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add: `C:\sei\bin`
   - Click OK on all dialogs
6. Open a new PowerShell window and verify:
```powershell
seid version
```

### 4. Create Wallet & Get Testnet Funds
Open PowerShell and run:
```powershell
# Create a new wallet
seid keys add mywallet

# IMPORTANT: Save the mnemonic phrase shown! You'll need it to recover your wallet.

# View your address
seid keys show mywallet -a

# Get testnet SEI from faucet (use your address from above)
# Go to: https://atlantic-2.faucet.seinetwork.io/
# Enter your address and request tokens
```

### 5. Open Project in VS Code
1. Open Visual Studio Code
2. Click File > Open Folder
3. Navigate to your project folder and select it
4. Open the integrated terminal: View > Terminal (or press Ctrl+`)

## Step 1: Build the Smart Contract

In VS Code's integrated terminal (PowerShell):

```powershell
# Navigate to the contract directory
cd contracts/token-factory

# Build the contract
cargo wasm

# Optimize the contract (reduces size for deployment)
# Note: Make sure Docker Desktop is running!
docker run --rm -v ${PWD}:/code `
  --mount type=volume,source="token-factory_cache",target=/code/target `
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry `
  cosmwasm/optimizer:0.16.0
```

The optimized contract will be in `artifacts/token_factory.wasm`

## Step 2: Deploy CW20 Base Contract First

We need to deploy a CW20 base contract that our factory will use to create tokens.

```powershell
# Download the CW20 base contract (using PowerShell)
Invoke-WebRequest -Uri "https://github.com/CosmWasm/cw-plus/releases/download/v1.1.0/cw20_base.wasm" -OutFile "cw20_base.wasm"

# Navigate back to project root if needed
cd ../..

# Store the CW20 base contract
seid tx wasm store cw20_base.wasm `
  --from mywallet `
  --chain-id atlantic-2 `
  --node https://rpc.atlantic-2.seinetwork.io `
  --gas 5000000 `
  --gas-prices 0.1usei `
  --broadcast-mode block

# Note the CODE_ID from the output (look for "code_id" in the logs)
# Example output: code_id: 1234
```

## Step 3: Deploy Token Factory Contract

```powershell
# Store the token factory contract
seid tx wasm store contracts/token-factory/artifacts/token_factory.wasm `
  --from mywallet `
  --chain-id atlantic-2 `
  --node https://rpc.atlantic-2.seinetwork.io `
  --gas 5000000 `
  --gas-prices 0.1usei `
  --broadcast-mode block

# Note the CODE_ID (different from CW20's code_id)
# Example: code_id: 1235
```

## Step 4: Instantiate Token Factory

Replace `CW20_CODE_ID` with the code_id from Step 2, and `FACTORY_CODE_ID` with the code_id from Step 3.

```powershell
# Get your wallet address first
$WALLET_ADDRESS = seid keys show mywallet -a

# Instantiate the factory (replace 1234 and 1235 with your actual code IDs)
seid tx wasm instantiate FACTORY_CODE_ID `
  '{\"cw20_code_id\":CW20_CODE_ID,\"creation_fee\":\"20000000\"}' `
  --from mywallet `
  --chain-id atlantic-2 `
  --node https://rpc.atlantic-2.seinetwork.io `
  --gas 500000 `
  --gas-prices 0.1usei `
  --label "Meme Token Factory" `
  --admin $WALLET_ADDRESS `
  --broadcast-mode block

# Note the CONTRACT_ADDRESS from the output
# Example: _contract_address: sei1abc123def456...
```

## Step 5: Update Frontend Configuration

In VS Code, open `src/config/contracts.ts` and update:

```typescript
export const CONTRACTS = {
  tokenFactory: "sei1YOUR_CONTRACT_ADDRESS_FROM_STEP_4", // Replace this!
  marketRegistrar: "sei1...", // Leave empty for now
};
```

## Step 6: Test Your Deployment

### Test from PowerShell:
```powershell
# Create a test token (replace YOUR_CONTRACT_ADDRESS)
seid tx wasm execute YOUR_CONTRACT_ADDRESS `
  '{\"create_token\":{\"name\":\"Test Doge\",\"symbol\":\"TDOGE\",\"total_supply\":\"1000000000\",\"image_url\":\"https://example.com/doge.png\",\"description\":\"Test token\"}}' `
  --from mywallet `
  --amount 20000000usei `
  --chain-id atlantic-2 `
  --node https://rpc.atlantic-2.seinetwork.io `
  --gas 1000000 `
  --gas-prices 0.1usei `
  --broadcast-mode block

# Query all tokens
seid query wasm contract-state smart YOUR_CONTRACT_ADDRESS `
  '{\"token_list\":{\"limit\":10}}' `
  --chain-id atlantic-2 `
  --node https://rpc.atlantic-2.seinetwork.io
```

### Test from Frontend:
1. In VS Code terminal, run the dev server:
```powershell
npm run dev
```
2. Open your browser to `http://localhost:8080`
3. Connect your wallet extension (Compass, Fin, or Leap)
4. Go to the "Create Token" page
5. Fill out the form and click "Create Token"
6. Approve the transaction in your wallet

## Troubleshooting

### "out of gas" error
Increase the gas amount: `--gas 2000000`

### "insufficient funds" error
Make sure you have testnet SEI from the faucet

### "contract not found" error
Double-check your contract address in `src/config/contracts.ts`

### Contract deployment fails
- Ensure Docker Desktop is running for optimization
- Try building without optimization first: `cargo wasm`

### PowerShell execution policy error
If you get "cannot be loaded because running scripts is disabled", run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Useful Commands

```powershell
# Check your balance
$WALLET_ADDRESS = seid keys show mywallet -a
seid query bank balances $WALLET_ADDRESS `
  --chain-id atlantic-2 `
  --node https://rpc.atlantic-2.seinetwork.io

# Query contract config
seid query wasm contract-state smart YOUR_CONTRACT_ADDRESS `
  '{\"config\":{}}' `
  --chain-id atlantic-2 `
  --node https://rpc.atlantic-2.seinetwork.io

# Query stats
seid query wasm contract-state smart YOUR_CONTRACT_ADDRESS `
  '{\"stats\":{}}' `
  --chain-id atlantic-2 `
  --node https://rpc.atlantic-2.seinetwork.io
```

## Next Steps

1. ✅ Test token creation thoroughly
2. 🔜 Deploy Market Registrar contract (for DEX integration)
3. 🔜 Move to mainnet (pacific-1) after testing

## Production Checklist

Before deploying to mainnet:
- [ ] Test all functionality on testnet
- [ ] Audit contract code
- [ ] Set appropriate gas limits
- [ ] Configure proper owner address
- [ ] Update creation fee if needed
- [ ] Test with multiple wallets
- [ ] Verify transaction costs

## Support

- Sei Discord: https://discord.gg/sei
- CosmWasm Discord: https://discord.gg/cosmwasm
- Contract issues: Check logs with `seid query tx TX_HASH`

---

**Need Help?** If you get stuck, share the error message and the step you're on.
