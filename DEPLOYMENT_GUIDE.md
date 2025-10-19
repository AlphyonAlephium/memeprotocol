# 🚀 Sei Token Factory - Windows Deployment Guide

This guide walks you through deploying your meme token factory to Sei testnet **using Windows with VS Code**.

## ⚠️ IMPORTANT: You Need ALL Contract Files

**DO NOT** just copy `contract.rs`! You need the entire `contracts/token-factory` directory structure:

```
contracts/
└── token-factory/
    ├── Cargo.toml              # Rust dependencies
    ├── .cargo/
    │   └── config              # Build configuration
    └── src/
        ├── lib.rs              # Library entry point
        ├── contract.rs         # Main contract logic
        ├── error.rs            # Error definitions
        ├── msg.rs              # Message types
        └── state.rs            # State management
```

**All these files are already in your Lovable project!** Just follow the steps below.

---

## Prerequisites

### 1. Install Rust (Windows)

Open PowerShell and run:

```powershell
# Download and install Rust
Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "$env:TEMP\rustup-init.exe"
& "$env:TEMP\rustup-init.exe" -y

# Restart PowerShell, then add WebAssembly target
rustup target add wasm32-unknown-unknown

# Verify installation
rustc --version
cargo --version
```

### 2. Install Docker Desktop (Windows)

1. Download from: https://www.docker.com/products/docker-desktop
2. Install and restart your computer
3. Open Docker Desktop and ensure it's running

### 3. Install Sei CLI (Windows)

```powershell
# Download Sei CLI for Windows
Invoke-WebRequest -Uri "https://github.com/sei-protocol/sei-chain/releases/download/v5.7.5/seid-5.7.5-windows-amd64.exe" -OutFile "$env:USERPROFILE\seid.exe"

# Add to PATH (run as Administrator)
$oldPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$oldPath;$env:USERPROFILE", "User")

# Verify installation (restart PowerShell first)
seid version
```

### 4. Create Wallet & Get Testnet Funds

```powershell
# Create a new wallet
seid keys add mywallet

# ⚠️ CRITICAL: Save the mnemonic phrase shown! Write it down securely.

# View your address
seid keys show mywallet -a

# Copy your address and get testnet SEI
# Open browser: https://atlantic-2.faucet.seinetwork.io/
# Paste your address and request tokens
```

---

## Step 1: Open Project in VS Code

```powershell
# Navigate to your Lovable project directory
cd C:\path\to\your\lovable-project

# Open in VS Code
code .
```

**In VS Code Terminal (Ctrl + `)**, verify the contract files exist:

```powershell
ls contracts\token-factory\src
# Should show: contract.rs, error.rs, lib.rs, msg.rs, state.rs
```

---

## Step 2: Build the Smart Contract

In **VS Code Terminal**:

```powershell
# Navigate to contract directory
cd contracts\token-factory

# Build the contract
cargo wasm

# This creates: target\wasm32-unknown-unknown\release\token_factory.wasm
```

### Optimize with Docker (Required for Deployment)

```powershell
# Make sure Docker Desktop is running!

# Run optimizer (from contracts/token-factory directory)
docker run --rm -v "${PWD}:/code" `
  --mount type=volume,source=token_factory_cache,target=/code/target `
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry `
  cosmwasm/optimizer:0.16.0

# Optimized contract will be in: artifacts\token_factory.wasm
```

---

## Step 3: Deploy CW20 Base Contract

```powershell
# Download CW20 base contract
Invoke-WebRequest -Uri "https://github.com/CosmWasm/cw-plus/releases/download/v1.1.0/cw20_base.wasm" -OutFile "cw20_base.wasm"

# Store CW20 base contract
seid tx wasm store cw20_base.wasm `
  --from mywallet `
  --chain-id atlantic-2 `
  --node https://rpc.atlantic-2.seinetwork.io `
  --gas 5000000 `
  --gas-prices 0.1usei `
  --broadcast-mode block

# ⚠️ SAVE THE CODE_ID from output!
# Look for: "code_id":"1234"
```

---

## Step 4: Deploy Token Factory Contract

```powershell
# Store token factory contract
seid tx wasm store artifacts\token_factory.wasm `
  --from mywallet `
  --chain-id atlantic-2 `
  --node https://rpc.atlantic-2.seinetwork.io `
  --gas 5000000 `
  --gas-prices 0.1usei `
  --broadcast-mode block

# ⚠️ SAVE THIS CODE_ID too (different from CW20's)
# Look for: "code_id":"1235"
```

---

## Step 5: Instantiate Token Factory

Replace `1234` with CW20 code_id, and `1235` with Factory code_id:

```powershell
# Get your wallet address
$MY_ADDRESS = seid keys show mywallet -a

# Instantiate factory (replace 1234 and 1235 with YOUR code IDs!)
seid tx wasm instantiate 1235 `
  '{\"cw20_code_id\":1234,\"creation_fee\":\"20000000\"}' `
  --from mywallet `
  --chain-id atlantic-2 `
  --node https://rpc.atlantic-2.seinetwork.io `
  --gas 500000 `
  --gas-prices 0.1usei `
  --label "Meme Token Factory" `
  --admin $MY_ADDRESS `
  --broadcast-mode block

# ⚠️ SAVE THE CONTRACT_ADDRESS from output!
# Look for: "_contract_address":"sei1abc123def456..."
```

---

## Step 6: Update Frontend Configuration

In **VS Code**, edit `src/config/contracts.ts`:

```typescript
export const CONTRACTS = {
  tokenFactory: "sei1YOUR_CONTRACT_ADDRESS_HERE", // Paste your address!
  marketRegistrar: "sei1...", // Leave empty for now
};
```

---

## Step 7: Test Your Deployment

```powershell
# Create a test token (replace YOUR_CONTRACT_ADDRESS)
seid tx wasm execute YOUR_CONTRACT_ADDRESS `
  '{\"create_token\":{\"name\":\"Test Doge\",\"symbol\":\"TDOGE\",\"total_supply\":\"1000000000\",\"image_url\":\"https://example.com/doge.png\",\"description\":\"Test meme token\"}}' `
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

---

## Troubleshooting

### ❌ "cargo: command not found"
- Restart PowerShell after installing Rust
- Run: `rustup default stable`

### ❌ "docker: command not found"  
- Ensure Docker Desktop is running
- Restart VS Code after installing Docker

### ❌ "out of gas"
- Increase gas: `--gas 2000000`

### ❌ "insufficient funds"
- Get more testnet SEI from faucet: https://atlantic-2.faucet.seinetwork.io/

### ❌ Build errors
- Delete `target` folder and rebuild: `cargo clean && cargo wasm`

---

## Useful Commands

```powershell
# Check balance
seid query bank balances $(seid keys show mywallet -a) `
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
