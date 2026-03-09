export const BonsaiVaultABI = [
  // ─── Read ─────────────────────────────────────────────────
  {
    inputs: [{ internalType: "uint256", name: "_vaultId", type: "uint256" }],
    name: "getVaultInfo",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "uint256", name: "mintPrice", type: "uint256" },
      { internalType: "uint256", name: "maxSupply", type: "uint256" },
      { internalType: "uint256", name: "minted", type: "uint256" },
      { internalType: "uint256", name: "burned", type: "uint256" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_vaultId", type: "uint256" }],
    name: "getVaultBonsaiIds",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_vaultId", type: "uint256" }],
    name: "currentSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "vaultCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_vaultId", type: "uint256" },
      { internalType: "address", name: "_holder", type: "address" },
    ],
    name: "isRedeemable",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_vaultId", type: "uint256" },
      { internalType: "address", name: "_holder", type: "address" },
    ],
    name: "redeemableAt",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "id", type: "uint256" },
    ],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "LOCK_PERIOD",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  // ─── Write ────────────────────────────────────────────────
  {
    inputs: [
      { internalType: "uint256", name: "_vaultId", type: "uint256" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "uint256", name: "_mintPrice", type: "uint256" },
      { internalType: "uint256", name: "_maxSupply", type: "uint256" },
      { internalType: "uint256[]", name: "_bonsaiIds", type: "uint256[]" },
    ],
    name: "createVault",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_vaultId", type: "uint256" },
      { internalType: "bool", name: "_active", type: "bool" },
    ],
    name: "setVaultActive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_vaultId", type: "uint256" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
    ],
    name: "redeem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_vaultId", type: "uint256" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
    ],
    name: "buybackAndBurn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_amount", type: "uint256" }],
    name: "withdrawFunds",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // ─── Events ───────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "vaultId", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "uint256", name: "mintPrice", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "maxSupply", type: "uint256" },
    ],
    name: "VaultCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "vaultId", type: "uint256" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "Minted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "vaultId", type: "uint256" },
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "ethAmount", type: "uint256" },
    ],
    name: "Redeemed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "vaultId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "BuybackBurned",
    type: "event",
  },
] as const;

export const BonsaiRegistryABI = [
  // ─── Read ─────────────────────────────────────────────────
  {
    inputs: [{ internalType: "uint256", name: "_bonsaiId", type: "uint256" }],
    name: "getBonsai",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "species", type: "string" },
      { internalType: "string", name: "artist", type: "string" },
      { internalType: "string", name: "imageURI", type: "string" },
      { internalType: "uint8", name: "valuationMethod", type: "uint8" },
      { internalType: "uint256", name: "initialPriceWei", type: "uint256" },
      { internalType: "uint256", name: "registeredAt", type: "uint256" },
      { internalType: "bool", name: "active", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_bonsaiId", type: "uint256" }],
    name: "getLatestPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_bonsaiId", type: "uint256" }],
    name: "getPriceLogCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_bonsaiId", type: "uint256" },
      { internalType: "uint256", name: "_index", type: "uint256" },
    ],
    name: "getPriceLog",
    outputs: [
      { internalType: "uint256", name: "priceWei", type: "uint256" },
      { internalType: "uint8", name: "source", type: "uint8" },
      { internalType: "string", name: "evidenceURI", type: "string" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256[]", name: "_bonsaiIds", type: "uint256[]" }],
    name: "getTotalValuation",
    outputs: [{ internalType: "uint256", name: "total", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "bonsaiCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  // ─── Write ────────────────────────────────────────────────
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_species", type: "string" },
      { internalType: "string", name: "_artist", type: "string" },
      { internalType: "string", name: "_imageURI", type: "string" },
      { internalType: "uint8", name: "_valuationMethod", type: "uint8" },
      { internalType: "uint256", name: "_initialPriceWei", type: "uint256" },
    ],
    name: "registerBonsai",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_bonsaiId", type: "uint256" },
      { internalType: "uint256", name: "_priceWei", type: "uint256" },
      { internalType: "uint8", name: "_source", type: "uint8" },
      { internalType: "string", name: "_evidenceURI", type: "string" },
    ],
    name: "logPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // ─── Events ───────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bonsaiId", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "uint256", name: "initialPriceWei", type: "uint256" },
    ],
    name: "BonsaiRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "bonsaiId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "priceWei", type: "uint256" },
      { indexed: false, internalType: "uint8", name: "source", type: "uint8" },
    ],
    name: "PriceLogged",
    type: "event",
  },
] as const;
