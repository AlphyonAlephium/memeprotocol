use cosmwasm_schema::{cw_serde, QueryResponses};
use cosmwasm_std::Uint128;

#[cw_serde]
pub struct InstantiateMsg {
    pub cw20_code_id: u64,
    pub creation_fee: Uint128,
}

#[cw_serde]
pub enum ExecuteMsg {
    CreateToken {
        name: String,
        symbol: String,
        total_supply: Uint128,
        image_url: String,
        description: String,
    },
    UpdateConfig {
        owner: Option<String>,
        cw20_code_id: Option<u64>,
        creation_fee: Option<Uint128>,
    },
}

#[cw_serde]
#[derive(QueryResponses)]
pub enum QueryMsg {
    #[returns(ConfigResponse)]
    Config {},
    #[returns(TokenInfoResponse)]
    TokenInfo { symbol: String },
    #[returns(TokenListResponse)]
    TokenList {
        start_after: Option<String>,
        limit: Option<u32>,
    },
    #[returns(StatsResponse)]
    Stats {},
}

#[cw_serde]
pub struct ConfigResponse {
    pub owner: String,
    pub cw20_code_id: u64,
    pub creation_fee: Uint128,
}

#[cw_serde]
pub struct TokenInfoResponse {
    pub contract_address: String,
    pub symbol: String,
    pub name: String,
    pub creator: String,
    pub created_at: u64,
}

#[cw_serde]
pub struct TokenListResponse {
    pub tokens: Vec<TokenInfoResponse>,
}

#[cw_serde]
pub struct StatsResponse {
    pub total_tokens: u64,
}
