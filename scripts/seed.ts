import "dotenv/config";
import { ethers } from "hardhat";

const REGISTRY_ADDRESS = "0x89E4B22E1aB94d7Da4e4563DA3D237c81fF8DeF2";
const VAULT_ADDRESS = "0x405A9131cD9c71Dd4a98d0501789a1CeddEbD23D";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Seeding with:", deployer.address);

  const registry = await ethers.getContractAt("BonsaiRegistry", REGISTRY_ADDRESS);
  const vault = await ethers.getContractAt("BonsaiVault", VAULT_ADDRESS);

  // Check if already seeded
  const count = await registry.bonsaiCount();
  if (count > 0n) {
    console.log("Already seeded:", count.toString(), "bonsai found");
  } else {
    const bonsaiData = [
      {
        name: "雅趣: Graceful Arc",
        species: "Akamatsu",
        artist: "Masashi Hirao",
        imageURI: "https://arweave.net/XRMU77I2Q4tY-M4iu4GJWoU0JmVEp_upcSHWiojSR20",
        method: 0,
        price: ethers.parseEther("14"),
      },
      {
        name: "天平: Ten-Pyo",
        species: "Goyomatsu",
        artist: "Masashi Hirao",
        imageURI: "https://arweave.net/_U_NNPCZZMRLQBgxqvKTrB-H5WbD6zaXT5nFG0vaQEU",
        method: 1,
        price: ethers.parseEther("1.12"),
      },
      {
        name: "螺旋: Rasen",
        species: "Goyomatsu",
        artist: "Masashi Hirao",
        imageURI: "https://arweave.net/Ytex_FoQPT9SlvKGsJsQJ947H3FBMrswSESSFjvf2wU",
        method: 2,
        price: ethers.parseEther("5.678"),
      },
      {
        name: "曲: Kyoku",
        species: "Bonsai",
        artist: "Masashi Hirao",
        imageURI: "https://static.snft.jp/itemtype/BONSAINFTGALLERY/thumbnails/4101.gif",
        method: 0,
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
  }

  // Create Vault if needed
  const vaultCount = await vault.vaultCount();
  if (vaultCount > 0n) {
    console.log("Vault already exists");
  } else {
    const tx = await vault.createVault(
      "BONSAI VAULT #001",
      "Art Bonsai Collection — 4 masterpieces by Masashi Hirao bundled into a single vault. Total valuation: 40.798 ETH.",
      ethers.parseEther("0.05"),
      1000,
      [0, 1, 2, 3]
    );
    await tx.wait();
    console.log("Vault #001 created");
  }

  console.log("\nDone! Contract addresses:");
  console.log("NEXT_PUBLIC_REGISTRY_ADDRESS=" + REGISTRY_ADDRESS);
  console.log("NEXT_PUBLIC_VAULT_ADDRESS=" + VAULT_ADDRESS);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
