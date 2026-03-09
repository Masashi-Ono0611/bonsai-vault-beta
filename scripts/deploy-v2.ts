import { ethers } from "hardhat";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Deploy BonsaiRegistry
  const Registry = await ethers.getContractFactory("BonsaiRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("BonsaiRegistry:", registryAddr);
  await sleep(3000);

  // Deploy BonsaiVault
  const Vault = await ethers.getContractFactory("BonsaiVault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("BonsaiVault:", vaultAddr);
  await sleep(3000);

  // Register 4 bonsai (with delays)
  const bonsaiData = [
    { name: "雅趣: Graceful Arc", species: "Akamatsu", artist: "Masashi Hirao", imageURI: "https://arweave.net/XRMU77I2Q4tY-M4iu4GJWoU0JmVEp_upcSHWiojSR20", method: 0, price: ethers.parseEther("14") },
    { name: "天平: Ten-Pyo", species: "Goyomatsu", artist: "Masashi Hirao", imageURI: "https://nft-cdn.alchemy.com/eth-mainnet/c09cb22ba0779d6a61ac03dca73ef32b", method: 1, price: ethers.parseEther("1.12") },
    { name: "螺旋: Rasen", species: "Goyomatsu", artist: "Masashi Hirao", imageURI: "https://arweave.net/Ytex_FoQPT9SlvKGsJsQJ947H3FBMrswSESSFjvf2wU", method: 2, price: ethers.parseEther("5.678") },
    { name: "曲: Kyoku", species: "Bonsai", artist: "Masashi Hirao", imageURI: "https://static.snft.jp/itemtype/BONSAINFTGALLERY/thumbnails/4101.gif", method: 0, price: ethers.parseEther("20") },
  ];

  for (const b of bonsaiData) {
    const tx = await registry.registerBonsai(b.name, b.species, b.artist, b.imageURI, b.method, b.price);
    await tx.wait();
    console.log(`Registered: ${b.name}`);
    await sleep(2000);
  }

  // Create Vault #001
  const mintPrice = ethers.parseEther("0.040798");
  const tx = await vault.createVault(
    "BONSAI VAULT #001",
    "Art Bonsai Collection — 4 masterpieces by Masashi Hirao. Total valuation: 40.798 ETH.",
    mintPrice,
    1000,
    300,
    [0, 1, 2, 3]
  );
  await tx.wait();
  console.log("Vault #001 created. Mint price:", ethers.formatEther(mintPrice), "ETH");
  await sleep(2000);

  // Transfer ownership
  const NEW_OWNER = "0x678a2fc326dEE5d986C48Ee75992F784Ab3a561c";
  const tx1 = await vault.transferOwnership(NEW_OWNER);
  await tx1.wait();
  console.log("Vault ownership transferred");
  await sleep(2000);

  const tx2 = await registry.transferOwnership(NEW_OWNER);
  await tx2.wait();
  console.log("Registry ownership transferred");

  console.log("\n--- Deployment Summary ---");
  console.log("NEXT_PUBLIC_VAULT_ADDRESS=" + vaultAddr);
  console.log("NEXT_PUBLIC_REGISTRY_ADDRESS=" + registryAddr);
  console.log("Owner:", NEW_OWNER);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
