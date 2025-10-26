// Sei Network Configuration
export const SEI_CONFIG = {
  chainId: "atlantic-2", // Testnet - change to "pacific-1" for mainnet
  rpcEndpoint: "https://sei-testnet-rpc.polkachu.com:443",
  restEndpoint: "https://rest.atlantic-2.seinetwork.io",
  gasPrice: "0.1usei", // Gas price for transactions
};

// Contract Addresses (update these after deploying your contracts)
export const CONTRACTS = {
  tokenFactory: "sei10m5088wk8tvp66ll3aeqxng4gza37e3j95utzpkw4kst2fygy0esdgte6n", // Deployed Token Factory contract address
  marketRegistrar: "sei1...", // Your Market Registrar contract address
};

// Platform owner address (contract deployer)
export const PLATFORM_OWNER = "sei1phy94y7c2gy49fvu68zw77a7hhaaxjc0mf5xat";

// Token Creation Fee (in microSEI, 1 SEI = 1,000,000 microSEI)
export const TOKEN_CREATION_FEE = "10000000"; // 10 SEI

// CW20 Code ID used by the factory
export const CW20_CODE_ID = 18509;

// Default token supply
export const DEFAULT_TOKEN_SUPPLY = "1000000000"; // 1 billion tokens
