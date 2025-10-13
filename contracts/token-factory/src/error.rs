use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("Unauthorized")]
    Unauthorized {},

    #[error("Invalid payment amount. Expected {expected} usei, received {received} usei")]
    InvalidPayment { expected: String, received: String },

    #[error("No funds sent")]
    NoFundsSent {},

    #[error("Wrong denom. Expected usei")]
    WrongDenom {},

    #[error("Token symbol already exists")]
    SymbolExists {},

    #[error("Invalid token parameters")]
    InvalidTokenParams {},
}
