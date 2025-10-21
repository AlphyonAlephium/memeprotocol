// Sei Network Configuration
export const SEI_CONFIG = {
  chainId: "atlantic-2", // Testnet - change to "pacific-1" for mainnet
  rpcEndpoint: "https://rpc.atlantic-2.seinetwork.io",
  restEndpoint: "https://rest.atlantic-2.seinetwork.io",
};

// Contract Addresses (update these after deploying your contracts)
export const CONTRACTS = {
  tokenFactory: "sei1ynsc3ew96ppcufg264hz4srrpu5vc0rwkka47xshgkv7uhwdunfskue9cu", // Your deployed Token Factory contract address
  marketRegistrar: "sei1...", // Your Market Registrar contract address
};

// Token Creation Fee (in microSEI, 1 SEI = 1,000,000 microSEI)
export const TOKEN_CREATION_FEE = "20000000"; // 20 SEI

// Default token supply
export const DEFAULT_TOKEN_SUPPLY = "1000000000"; // 1 billion tokens
