import "dotenv/config";
import { ethers } from "hardhat";

const REGISTRY_ADDRESS = "0x89E4B22E1aB94d7Da4e4563DA3D237c81fF8DeF2";

async function main() {
  const [deployer] = await ethers.getSigners();
  const registry = await ethers.getContractAt("BonsaiRegistry", REGISTRY_ADDRESS);

  const count = await registry.bonsaiCount();
  console.log("Current bonsai count:", count.toString());

  const remaining = [
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

  // Register one at a time with confirmation
  for (const b of remaining) {
    try {
      console.log(`Registering: ${b.name}...`);
      const tx = await registry.registerBonsai(
        b.name, b.species, b.artist, b.imageURI, b.method, b.price
      );
      console.log(`TX: ${tx.hash}`);
      await tx.wait();
      console.log(`Done: ${b.name}`);
    } catch (e: any) {
      console.error(`Failed: ${b.name} - ${e.message}`);
      // Wait and retry once
      console.log("Waiting 10s and retrying...");
      await new Promise(r => setTimeout(r, 10000));
      const tx = await registry.registerBonsai(
        b.name, b.species, b.artist, b.imageURI, b.method, b.price
      );
      await tx.wait();
      console.log(`Retry done: ${b.name}`);
    }
  }

  const finalCount = await registry.bonsaiCount();
  console.log("Final bonsai count:", finalCount.toString());
}

main().catch(console.error);
