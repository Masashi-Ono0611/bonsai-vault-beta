import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Deploy BonsaiRegistry
  const Registry = await ethers.getContractFactory("BonsaiRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("BonsaiRegistry:", registryAddr);

  // Deploy BonsaiVault
  const Vault = await ethers.getContractFactory("BonsaiVault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("BonsaiVault:", vaultAddr);

  // Register 4 bonsai
  const bonsaiData = [
    {
      name: "雅趣: Graceful Arc",
      species: "Akamatsu",
      artist: "Masashi Hirao",
      imageURI: "https://arweave.net/XRMU77I2Q4tY-M4iu4GJWoU0JmVEp_upcSHWiojSR20",
      method: 0, // ClassicGallery
      price: ethers.parseEther("14"),
    },
    {
      name: "天平: Ten-Pyo",
      species: "Goyomatsu",
      artist: "Masashi Hirao",
      imageURI: "https://arweave.net/_U_NNPCZZMRLQBgxqvKTrB-H5WbD6zaXT5nFG0vaQEU",
      method: 1, // ExchangeGallery
      price: ethers.parseEther("1.12"),
    },
    {
      name: "螺旋: Rasen",
      species: "Goyomatsu",
      artist: "Masashi Hirao",
      imageURI: "https://arweave.net/Ytex_FoQPT9SlvKGsJsQJ947H3FBMrswSESSFjvf2wU",
      method: 2, // SecondaryMarket
      price: ethers.parseEther("5.678"),
    },
    {
      name: "曲: Kyoku",
      species: "Bonsai",
      artist: "Masashi Hirao",
      imageURI: "https://static.snft.jp/itemtype/BONSAINFTGALLERY/thumbnails/4101.gif",
      method: 0, // ClassicGallery
      price: ethers.parseEther("20"),
    },
  ];

  for (const b of bonsaiData) {
    const tx = await registry.registerBonsai(
      b.name, b.species, b.artist, b.imageURI, b.method, b.price
    );
    await tx.wait();
    console.log(`Registered: ${b.name}`);
  }

  // Create Vault #001
  const mintPrice = ethers.parseEther("0.05");
  const tx = await vault.createVault(
    "BONSAI VAULT #001",
    "Art Bonsai Collection — 4 masterpieces by Masashi Hirao bundled into a single vault. Total valuation: 40.798 ETH.",
    mintPrice,
    1000,
    [0, 1, 2, 3]
  );
  await tx.wait();
  console.log("Vault #001 created. Mint price:", ethers.formatEther(mintPrice), "ETH");

  console.log("\n--- Deployment Summary ---");
  console.log("NEXT_PUBLIC_REGISTRY_ADDRESS=" + registryAddr);
  console.log("NEXT_PUBLIC_VAULT_ADDRESS=" + vaultAddr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
