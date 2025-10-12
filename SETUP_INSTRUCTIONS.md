# Sei Token Creation Setup Instructions

## Frontend Integration Complete ✅

The frontend is now fully integrated with SeiJS for wallet connection and contract calls.

## What's Been Set Up

1. **Wallet Connection** (`src/contexts/WalletContext.tsx`)
   - Supports Compass, Fin, and Leap wallets
   - Auto-reconnect functionality
   - Balance display
   - Connection status management

2. **Token Creation Hook** (`src/hooks/useTokenCreation.ts`)
   - Handles contract execution
   - Sends 20 SEI creation fee
   - Parses transaction results
   - Error handling with toast notifications

3. **Contract Configuration** (`src/config/contracts.ts`)
   - Testnet (atlantic-2) configuration
   - Placeholder contract addresses
   - Fee and supply constants

4. **Updated Create Token Page**
   - Wallet connection button
   - Real-time balance display
   - Transaction execution
   - Loading states

## Next Steps Required

### 1. Deploy Smart Contracts

You need to deploy two CosmWasm contracts to Sei testnet:

#### A. Token Factory Contract
- Based on CW20-base standard
- Must accept 20 SEI creation fee
- Instantiate new CW20 tokens
- Transfer fee to platform owner

#### B. Market Registrar Contract  
- Register token/SEI pairs on Sei CLOB
- Use Sei DEX module bindings

**Resources:**
- Sei CosmWasm docs: https://docs.sei.io/dev-cosmwasm/
- CW20 standard: https://github.com/CosmWasm/cw-plus/tree/main/contracts/cw20-base
- Template repo: https://github.com/sei-protocol/sei-cosmwasm

### 2. Update Contract Addresses

After deploying, update these addresses in `src/config/contracts.ts`:

```typescript
export const CONTRACTS = {
  tokenFactory: "sei1YOUR_DEPLOYED_FACTORY_ADDRESS",
  marketRegistrar: "sei1YOUR_DEPLOYED_REGISTRAR_ADDRESS",
};
```

### 3. Test Wallet Connection

1. Install a Sei wallet extension:
   - [Compass Wallet](https://compasswallet.io/)
   - [Fin Wallet](https://finwallet.com/)
   - [Leap Wallet](https://leapwallet.io/)

2. Get testnet SEI from faucet:
   - https://atlantic-2.faucet.seinetwork.io/

3. Connect wallet on the Create Token page

### 4. Smart Contract Development Guide

**Quick Start for Rust/CosmWasm:**

```rust
// Example Token Factory execute handler
pub fn execute_create_token(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    name: String,
    symbol: String,
    total_supply: Uint128,
    image_url: String,
    description: String,
) -> Result<Response, ContractError> {
    // Verify 20 SEI payment
    let payment = must_pay(&info, "usei")?;
    if payment != Uint128::from(20_000_000u128) {
        return Err(ContractError::InvalidPayment {});
    }

    // Transfer fee to platform owner
    let platform_owner = PLATFORM_OWNER.load(deps.storage)?;
    let send_msg = BankMsg::Send {
        to_address: platform_owner.to_string(),
        amount: vec![Coin {
            denom: "usei".to_string(),
            amount: payment,
        }],
    };

    // Instantiate new CW20 token
    let instantiate_msg = WasmMsg::Instantiate {
        admin: Some(info.sender.to_string()),
        code_id: CW20_CODE_ID,
        msg: to_json_binary(&Cw20InstantiateMsg {
            name,
            symbol,
            decimals: 6,
            initial_balances: vec![Cw20Coin {
                address: info.sender.to_string(),
                amount: total_supply,
            }],
            // ... other fields
        })?,
        funds: vec![],
        label: format!("meme-token-{}", symbol),
    };

    Ok(Response::new()
        .add_message(send_msg)
        .add_message(instantiate_msg)
        .add_attribute("action", "create_meme_token")
        .add_attribute("creator", info.sender)
        .add_attribute("symbol", symbol))
}
```

### 5. Testing Flow

1. **Local Testing**: Use `cw-multi-test` for unit tests
2. **Testnet Deployment**: Deploy to atlantic-2
3. **Frontend Testing**: Update contract addresses and test full flow
4. **Mainnet**: After thorough testing, deploy to pacific-1

### 6. Additional Features to Implement

- **Image Upload to IPFS**: Integrate Pinata or nft.storage for decentralized image hosting
- **Transaction History**: Query past token creations from blockchain events
- **Token Trading**: Implement CLOB order placement UI
- **Social Sharing**: Auto-generate tweets after token creation

## Support

- Sei Discord: https://discord.gg/sei
- CosmWasm Discord: https://discord.gg/cosmwasm
- Sei Documentation: https://docs.sei.io

## Current Status

✅ Frontend wallet integration complete
✅ Contract call infrastructure ready
⏳ Smart contracts need to be deployed
⏳ Contract addresses need to be updated
