use cosmwasm_std::{
    entry_point, to_json_binary, BankMsg, Binary, Coin, Deps, DepsMut, Env,
    MessageInfo, Reply, Response, StdResult, SubMsg, Uint128, WasmMsg,
};
use cw2::set_contract_version;
use cw20::{Cw20Coin, MinterResponse};
use cw20_base::msg::InstantiateMsg as Cw20InstantiateMsg;
use cw_storage_plus::Bound;

use crate::error::ContractError;
use crate::msg::{ConfigResponse, ExecuteMsg, InstantiateMsg, QueryMsg, StatsResponse, TokenInfoResponse, TokenListResponse};
use crate::state::{Config, TokenInfo, CONFIG, TOKENS, TOKEN_COUNT};

const CONTRACT_NAME: &str = "crates.io:token-factory";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");
const INSTANTIATE_TOKEN_REPLY_ID: u64 = 1;

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;

    let config = Config {
        owner: info.sender.clone(),
        cw20_code_id: msg.cw20_code_id,
        creation_fee: msg.creation_fee.u128(),
    };

    CONFIG.save(deps.storage, &config)?;
    TOKEN_COUNT.save(deps.storage, &0)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender)
        .add_attribute("creation_fee", msg.creation_fee))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::CreateToken {
            name,
            symbol,
            total_supply,
            image_url,
            description,
        } => execute_create_token(deps, env, info, name, symbol, total_supply, image_url, description),
        ExecuteMsg::UpdateConfig {
            owner,
            cw20_code_id,
            creation_fee,
        } => execute_update_config(deps, info, owner, cw20_code_id, creation_fee),
    }
}

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
    let config = CONFIG.load(deps.storage)?;

    // Validate payment
    if info.funds.len() != 1 {
        return Err(ContractError::InvalidPayment {
            expected: config.creation_fee.to_string(),
            received: "0".to_string(),
        });
    }

    let payment = &info.funds[0];
    if payment.denom != "usei" {
        return Err(ContractError::WrongDenom {});
    }

    if payment.amount.u128() != config.creation_fee {
        return Err(ContractError::InvalidPayment {
            expected: config.creation_fee.to_string(),
            received: payment.amount.to_string(),
        });
    }

    // Check if symbol already exists
    if TOKENS.may_load(deps.storage, &symbol)?.is_some() {
        return Err(ContractError::SymbolExists {});
    }

    // Validate parameters
    if name.is_empty() || symbol.is_empty() || total_supply.is_zero() {
        return Err(ContractError::InvalidTokenParams {});
    }

    // Transfer fee to owner
    let transfer_msg = BankMsg::Send {
        to_address: config.owner.to_string(),
        amount: vec![Coin {
            denom: "usei".to_string(),
            amount: payment.amount,
        }],
    };

    // Instantiate CW20 token
    let instantiate_msg = Cw20InstantiateMsg {
        name: name.clone(),
        symbol: symbol.clone(),
        decimals: 6,
        initial_balances: vec![Cw20Coin {
            address: info.sender.to_string(),
            amount: total_supply,
        }],
        mint: Some(MinterResponse {
            minter: info.sender.to_string(),
            cap: None,
        }),
        marketing: None, // Avoid address validation issues from marketing field

    };

    let instantiate_token_msg = WasmMsg::Instantiate {
        admin: Some(info.sender.to_string()),
        code_id: config.cw20_code_id,
        msg: to_json_binary(&instantiate_msg)?,
        funds: vec![],
        label: format!("meme-token-{}", symbol),
    };

    let submsg = SubMsg::reply_on_success(instantiate_token_msg, INSTANTIATE_TOKEN_REPLY_ID);

    // Store temporary data for reply
    let temp_data = TokenInfo {
        contract_address: "".to_string(), // Will be set in reply
        symbol: symbol.clone(),
        name: name.clone(),
        creator: info.sender.clone(),
        created_at: env.block.time.seconds(),
    };

    TOKENS.save(deps.storage, &symbol, &temp_data)?;

    Ok(Response::new()
        .add_message(transfer_msg)
        .add_submessage(submsg)
        .add_attribute("method", "create_token")
        .add_attribute("creator", info.sender)
        .add_attribute("symbol", symbol)
        .add_attribute("name", name))
}

pub fn execute_update_config(
    deps: DepsMut,
    info: MessageInfo,
    owner: Option<String>,
    cw20_code_id: Option<u64>,
    creation_fee: Option<Uint128>,
) -> Result<Response, ContractError> {
    let mut config = CONFIG.load(deps.storage)?;

    if info.sender != config.owner {
        return Err(ContractError::Unauthorized {});
    }

    if let Some(owner) = owner {
        config.owner = deps.api.addr_validate(&owner)?;
    }
    if let Some(code_id) = cw20_code_id {
        config.cw20_code_id = code_id;
    }
    if let Some(fee) = creation_fee {
        config.creation_fee = fee.u128();
    }

    CONFIG.save(deps.storage, &config)?;

    Ok(Response::new().add_attribute("method", "update_config"))
}

#[entry_point]
pub fn reply(deps: DepsMut, _env: Env, msg: Reply) -> Result<Response, ContractError> {
    if msg.id == INSTANTIATE_TOKEN_REPLY_ID {
        let res = msg.result.into_result().map_err(|e| {
            ContractError::Std(cosmwasm_std::StdError::generic_err(format!(
                "Token instantiation failed: {}",
                e
            )))
        })?;

        // Extract contract address from events
        let contract_address = res
            .events
            .iter()
            .find(|e| e.ty == "instantiate")
            .and_then(|e| e.attributes.iter().find(|a| a.key == "_contract_address"))
            .map(|a| a.value.clone())
            .ok_or_else(|| {
                ContractError::Std(cosmwasm_std::StdError::generic_err(
                    "Could not find contract address in reply",
                ))
            })?;

        // Update all tokens to set the contract address
        let tokens: Vec<_> = TOKENS
            .range(deps.storage, None, None, cosmwasm_std::Order::Ascending)
            .collect::<StdResult<Vec<_>>>()?;

        for (symbol, mut token_info) in tokens {
            if token_info.contract_address.as_str().is_empty() {
                token_info.contract_address = contract_address.clone();
                TOKENS.save(deps.storage, &symbol, &token_info)?;
                
                // Increment counter
                let count = TOKEN_COUNT.load(deps.storage)?;
                TOKEN_COUNT.save(deps.storage, &(count + 1))?;
                
                break;
            }
        }

        Ok(Response::new().add_attribute("token_address", contract_address))
    } else {
        Err(ContractError::Std(cosmwasm_std::StdError::generic_err(
            "Unknown reply id",
        )))
    }
}

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Config {} => to_json_binary(&query_config(deps)?),
        QueryMsg::TokenInfo { symbol } => to_json_binary(&query_token_info(deps, symbol)?),
        QueryMsg::TokenList { start_after, limit } => {
            to_json_binary(&query_token_list(deps, start_after, limit)?)
        }
        QueryMsg::Stats {} => to_json_binary(&query_stats(deps)?),
    }
}

fn query_config(deps: Deps) -> StdResult<ConfigResponse> {
    let config = CONFIG.load(deps.storage)?;
    Ok(ConfigResponse {
        owner: config.owner.to_string(),
        cw20_code_id: config.cw20_code_id,
        creation_fee: Uint128::from(config.creation_fee),
    })
}

fn query_token_info(deps: Deps, symbol: String) -> StdResult<TokenInfoResponse> {
    let token = TOKENS.load(deps.storage, &symbol)?;
    Ok(TokenInfoResponse {
        contract_address: token.contract_address.to_string(),
        symbol: token.symbol,
        name: token.name,
        creator: token.creator.to_string(),
        created_at: token.created_at,
    })
}

fn query_token_list(
    deps: Deps,
    start_after: Option<String>,
    limit: Option<u32>,
) -> StdResult<TokenListResponse> {
    let limit = limit.unwrap_or(30).min(100) as usize;
    let start = start_after.as_deref();

    let tokens: Vec<TokenInfoResponse> = TOKENS
        .range(deps.storage, start.map(Bound::exclusive), None, cosmwasm_std::Order::Ascending)
        .take(limit)
        .map(|item| {
            let (_, token) = item?;
            Ok(TokenInfoResponse {
                contract_address: token.contract_address.to_string(),
                symbol: token.symbol,
                name: token.name,
                creator: token.creator.to_string(),
                created_at: token.created_at,
            })
        })
        .collect::<StdResult<Vec<_>>>()?;

    Ok(TokenListResponse { tokens })
}

fn query_stats(deps: Deps) -> StdResult<StatsResponse> {
    let total_tokens = TOKEN_COUNT.load(deps.storage)?;
    Ok(StatsResponse { total_tokens })
}
