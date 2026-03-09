import { type Address } from "viem";

// Contract addresses — updated after deployment
export const VAULT_ADDRESS = (process.env.NEXT_PUBLIC_VAULT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as Address;

export const REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as Address;

// Base Sepolia chain ID
export const CHAIN_ID = 84532;

// Bonsai data (static for Phase 1 demo — mirrors on-chain registry)
export interface BonsaiAsset {
  id: number;
  name: string;
  nameJa: string;
  species: string;
  artist: string;
  imageURI: string;
  valuationMethod: string;
  valuationDetail: string;
  priceETH: number;
}

export const VAULT_BONSAI: BonsaiAsset[] = [
  {
    id: 0,
    name: "Graceful Arc",
    nameJa: "雅趣",
    species: "Akamatsu (Red Pine)",
    artist: "Masashi Hirao",
    imageURI:
      "https://arweave.net/XRMU77I2Q4tY-M4iu4GJWoU0JmVEp_upcSHWiojSR20",
    valuationMethod: "Classic Gallery",
    valuationDetail: "¥3,500,000 × 120%",
    priceETH: 14,
  },
  {
    id: 1,
    name: "Ten-Pyo",
    nameJa: "天平",
    species: "Goyomatsu (Five-needle Pine)",
    artist: "Masashi Hirao",
    imageURI:
      "https://nft-cdn.alchemy.com/eth-mainnet/c09cb22ba0779d6a61ac03dca73ef32b",
    valuationMethod: "Exchange Gallery",
    valuationDetail: "FARM 120 × ¥3,000",
    priceETH: 1.12,
  },
  {
    id: 2,
    name: "Rasen",
    nameJa: "螺旋",
    species: "Goyomatsu (Five-needle Pine)",
    artist: "Masashi Hirao",
    imageURI:
      "https://arweave.net/Ytex_FoQPT9SlvKGsJsQJ947H3FBMrswSESSFjvf2wU",
    valuationMethod: "Secondary Market",
    valuationDetail: "Market price",
    priceETH: 5.678,
  },
  {
    id: 3,
    name: "Kyoku",
    nameJa: "曲",
    species: "Bonsai Art",
    artist: "Masashi Hirao",
    imageURI:
      "https://static.snft.jp/itemtype/BONSAINFTGALLERY/thumbnails/4101.gif",
    valuationMethod: "Classic Gallery",
    valuationDetail: "¥5,000,000 × 120%",
    priceETH: 20,
  },
];

export const VAULT_TOTAL_ETH = VAULT_BONSAI.reduce(
  (sum, b) => sum + b.priceETH,
  0
);
export const MINT_PRICE_ETH = 0.05;
export const MAX_SUPPLY = 1000;
