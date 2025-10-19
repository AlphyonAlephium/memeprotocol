# 🚀 Sei Token Factory - Complete Deployment Guide

This guide will walk you through deploying your meme token factory to Sei testnet.

## Prerequisites

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustup target add wasm32-unknown-unknown
```

### 2. Install Docker (for optimization)
- **Mac**: Download from https://www.docker.com/products/docker-desktop
- **Linux**: `sudo apt-get install docker.io`
- **Windows**: Download from https://www.docker.com/products/docker-desktop

### 3. Install Sei CLI
```bash
# Download the latest seid binary
wget https://github.com/sei-protocol/sei-chain/releases/download/v5.7.5/seid-5.7.5-linux-amd64.tar.gz
tar -xzf seid-5.7.5-linux-amd64.tar.gz
sudo mv seid /usr/local/bin/

# Verify installation
seid version
```

### 4. Create Wallet & Get Testnet Funds
```bash
# Create a new wallet
seid keys add mywallet

# IMPORTANT: Save the mnemonic phrase shown! You'll need it to recover your wallet.

# View your address
seid keys show mywallet -a

# Get testnet SEI from faucet (use your address from above)
# Go to: https://atlantic-2.faucet.seinetwork.io/
# Enter your address and request tokens
```

## Step 1: Build the Smart Contract

```bash
# Navigate to the contract directory
cd contracts/token-factory

# Build the contract
cargo wasm

# Optimize the contract (reduces size for deployment)
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/code/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer:0.16.0
```

The optimized contract will be in `artifacts/token_factory.wasm`

## Step 2: Deploy CW20 Base Contract First

We need to deploy a CW20 base contract that our factory will use to create tokens.

```bash
# Download the CW20 base contract
wget https://github.com/CosmWasm/cw-plus/releases/download/v1.1.0/cw20_base.wasm

# Store the CW20 base contract
seid tx wasm store cw20_base.wasm \
  --from mywallet \
  --chain-id atlantic-2 \
  --node https://rpc.atlantic-2.seinetwork.io \
  --gas 5000000 \
  --gas-prices 0.1usei \
  --broadcast-mode block

# Note the CODE_ID from the output (look for "code_id" in the logs)
# Example output: code_id: 1234
```

## Step 3: Deploy Token Factory Contract

```bash
# Store the token factory contract
seid tx wasm store artifacts/token_factory.wasm \
  --from mywallet \
  --chain-id atlantic-2 \
  --node https://rpc.atlantic-2.seinetwork.io \
  --gas 5000000 \
  --gas-prices 0.1usei \
  --broadcast-mode block

# Note the CODE_ID (different from CW20's code_id)
# Example: code_id: 1235
```

## Step 4: Instantiate Token Factory

Replace `CW20_CODE_ID` with the code_id from Step 2, and `FACTORY_CODE_ID` with the code_id from Step 3.

```bash
# Instantiate the factory
seid tx wasm instantiate FACTORY_CODE_ID \
  '{"cw20_code_id":CW20_CODE_ID,"creation_fee":"20000000"}' \
  --from mywallet \
  --chain-id atlantic-2 \
  --node https://rpc.atlantic-2.seinetwork.io \
  --gas 500000 \
  --gas-prices 0.1usei \
  --label "Meme Token Factory" \
  --admin $(seid keys show mywallet -a) \
  --broadcast-mode block

# Note the CONTRACT_ADDRESS from the output
# Example: _contract_address: sei1abc123def456...
```

## Step 5: Update Frontend Configuration

Edit `src/config/contracts.ts`:

```typescript
export const CONTRACTS = {
  tokenFactory: "sei1YOUR_CONTRACT_ADDRESS_FROM_STEP_4", // Replace this!
  marketRegistrar: "sei1...", // Leave empty for now
};
```

## Step 6: Test Your Deployment

### Test from CLI:
```bash
# Create a test token
seid tx wasm execute YOUR_CONTRACT_ADDRESS \
  '{"create_token":{"name":"Test Doge","symbol":"TDOGE","total_supply":"1000000000","image_url":"https://example.com/doge.png","description":"Test token"}}' \
  --from mywallet \
  --amount 20000000usei \
  --chain-id atlantic-2 \
  --node https://rpc.atlantic-2.seinetwork.io \
  --gas 1000000 \
  --gas-prices 0.1usei \
  --broadcast-mode block

# Query all tokens
seid query wasm contract-state smart YOUR_CONTRACT_ADDRESS \
  '{"token_list":{"limit":10}}' \
  --chain-id atlantic-2 \
  --node https://rpc.atlantic-2.seinetwork.io
```

### Test from Frontend:
1. Connect your wallet extension (Compass, Fin, or Leap)
2. Go to the "Create Token" page
3. Fill out the form and click "Create Token"
4. Approve the transaction in your wallet

## Troubleshooting

### "out of gas" error
Increase the gas amount: `--gas 2000000`

### "insufficient funds" error
Make sure you have testnet SEI from the faucet

### "contract not found" error
Double-check your contract address in `src/config/contracts.ts`

### Contract deployment fails
- Ensure Docker is running for optimization
- Try building without optimization first: `cargo wasm`

## Useful Commands

```bash
# Check your balance
seid query bank balances $(seid keys show mywallet -a) \
  --chain-id atlantic-2 \
  --node https://rpc.atlantic-2.seinetwork.io

# Query contract config
seid query wasm contract-state smart YOUR_CONTRACT_ADDRESS \
  '{"config":{}}' \
  --chain-id atlantic-2 \
  --node https://rpc.atlantic-2.seinetwork.io

# Query stats
seid query wasm contract-state smart YOUR_CONTRACT_ADDRESS \
  '{"stats":{}}' \
  --chain-id atlantic-2 \
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
