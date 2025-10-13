# Smart Contracts

This directory contains the CosmWasm smart contracts for the Sei meme token platform.

## Contracts

### Token Factory (`token-factory/`)
Creates new CW20 meme tokens with a 20 SEI creation fee.

**Features:**
- Accepts 20 SEI payment to create tokens
- Instantiates new CW20 tokens with custom metadata
- Transfers creation fee to platform owner
- Tracks all created tokens
- Query token list and stats

**Messages:**
- `CreateToken` - Create a new meme token
- `UpdateConfig` - Update factory settings (owner only)

**Queries:**
- `Config` - Get factory configuration
- `TokenInfo` - Get info about a specific token
- `TokenList` - List all created tokens
- `Stats` - Get total token count

## Building

```bash
cd token-factory
cargo wasm
```

## Testing

```bash
cd token-factory
cargo test
```

## Deployment

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for complete deployment instructions.
