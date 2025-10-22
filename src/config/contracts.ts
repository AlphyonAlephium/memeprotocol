// Sei Network Configuration
export const SEI_CONFIG = {
  chainId: "atlantic-2", // Testnet - change to "pacific-1" for mainnet
  rpcEndpoint: "https://rpc.atlantic-2.seinetwork.io",
  restEndpoint: "https://rest.atlantic-2.seinetwork.io",
  gasPrice: "0.1usei", // Gas price for transactions
};

// Contract Addresses (update these after deploying your contracts)
export const CONTRACTS = {
  tokenFactory: "sei13xf5vcexf2p67fvxpm3g38gq6j2ga05f7wkg7y7lp6atzmp6mjhqsytjwp", // Your deployed Token Factory contract address
  marketRegistrar: "sei1...", // Your Market Registrar contract address
};

// Platform owner address (contract deployer) - UPDATE THIS to your deployer address
export const PLATFORM_OWNER = "sei1phy94y7c2gy49fvu68zw77a7hhaaxjc0mf5xat"; // Set this to the address that deployed the contract

// Token Creation Fee (in microSEI, 1 SEI = 1,000,000 microSEI)
export const TOKEN_CREATION_FEE = "20000000"; // 20 SEI

// Default token supply
export const DEFAULT_TOKEN_SUPPLY = "1000000000"; // 1 billion tokens
