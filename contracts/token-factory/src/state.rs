use cosmwasm_std::Addr;
use cw_storage_plus::{Item, Map};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct Config {
    pub owner: Addr,
    pub cw20_code_id: u64,
    pub creation_fee: u128,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct TokenInfo {
    pub contract_address: String,
    pub symbol: String,
    pub name: String,
    pub creator: Addr,
    pub created_at: u64,
}

pub const CONFIG: Item<Config> = Item::new("config");
pub const TOKENS: Map<&str, TokenInfo> = Map::new("tokens");
pub const TOKEN_COUNT: Item<u64> = Item::new("token_count");
