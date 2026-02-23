// ERC20 ABI subset — totalSupply only
// Used for reading WBTC circulating supply (liabilities)

export const ERC20 = [
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const
