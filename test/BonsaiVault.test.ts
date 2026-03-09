import { expect } from "chai";
import { ethers } from "hardhat";
import { BonsaiVault, BonsaiRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("BonsaiVault", function () {
  let vault: BonsaiVault;
  let registry: BonsaiRegistry;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const MINT_PRICE = ethers.parseEther("0.040798");
  const MAX_SUPPLY = 1000n;
  const RESERVED_SUPPLY = 300n;
  const PUBLIC_SUPPLY = MAX_SUPPLY - RESERVED_SUPPLY; // 700

  async function deployAndSeed() {
    [owner, user1, user2] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("BonsaiRegistry");
    registry = await Registry.deploy();

    const Vault = await ethers.getContractFactory("BonsaiVault");
    vault = await Vault.deploy();

    // Register 4 bonsai
    await registry.registerBonsai("雅趣", "Akamatsu", "Masashi Hirao", "https://arweave.net/img1", 0, ethers.parseEther("14"));
    await registry.registerBonsai("天平", "Goyomatsu", "Masashi Hirao", "https://arweave.net/img2", 1, ethers.parseEther("1.12"));
    await registry.registerBonsai("螺旋", "Goyomatsu", "Masashi Hirao", "https://arweave.net/img3", 2, ethers.parseEther("5.678"));
    await registry.registerBonsai("曲", "Unknown", "Masashi Hirao", "https://snft.jp/img4", 0, ethers.parseEther("20"));

    // Create vault with 4 bonsai (1000 total, 300 reserved)
    await vault.createVault(
      "BONSAI VAULT #001",
      "Art Bonsai Collection featuring 4 masterpieces",
      MINT_PRICE,
      MAX_SUPPLY,
      RESERVED_SUPPLY,
      [0, 1, 2, 3]
    );

    return { vault, registry, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("should set the owner correctly", async function () {
      await deployAndSeed();
      expect(await vault.owner()).to.equal(owner.address);
    });

    it("should start with 0 vaults", async function () {
      const Vault = await ethers.getContractFactory("BonsaiVault");
      const freshVault = await Vault.deploy();
      expect(await freshVault.vaultCount()).to.equal(0);
    });
  });

  describe("Vault Creation", function () {
    beforeEach(deployAndSeed);

    it("should create a vault with correct info", async function () {
      const info = await vault.getVaultInfo(0);
      expect(info.name).to.equal("BONSAI VAULT #001");
      expect(info.mintPrice).to.equal(MINT_PRICE);
      expect(info.maxSupply).to.equal(MAX_SUPPLY);
      expect(info.reservedSupply).to.equal(RESERVED_SUPPLY);
      expect(info.minted).to.equal(0);
      expect(info.active).to.equal(true);
    });

    it("should store bonsai IDs correctly", async function () {
      const ids = await vault.getVaultBonsaiIds(0);
      expect(ids).to.deep.equal([0n, 1n, 2n, 3n]);
    });

    it("should increment vault count", async function () {
      expect(await vault.vaultCount()).to.equal(1);
    });

    it("should return correct public supply", async function () {
      expect(await vault.publicSupply(0)).to.equal(PUBLIC_SUPPLY);
    });

    it("should reject vault with fewer than 4 bonsai", async function () {
      await expect(
        vault.createVault("Bad Vault", "desc", MINT_PRICE, MAX_SUPPLY, 0n, [0, 1, 2])
      ).to.be.revertedWith("Min 4 bonsai required");
    });

    it("should reject vault with 0 price", async function () {
      await expect(
        vault.createVault("Bad", "desc", 0, MAX_SUPPLY, 0n, [0, 1, 2, 3])
      ).to.be.revertedWith("Price must be > 0");
    });

    it("should reject reserved exceeding max supply", async function () {
      await expect(
        vault.createVault("Bad", "desc", MINT_PRICE, 100n, 200n, [0, 1, 2, 3])
      ).to.be.revertedWith("Reserved exceeds max");
    });

    it("should reject non-owner creating vault", async function () {
      await expect(
        vault.connect(user1).createVault("Hack", "desc", MINT_PRICE, MAX_SUPPLY, 0n, [0, 1, 2, 3])
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });

  describe("Public Minting", function () {
    beforeEach(deployAndSeed);

    it("should mint NFTs with correct ETH payment", async function () {
      await vault.connect(user1).mint(0, 5, { value: MINT_PRICE * 5n });
      expect(await vault.balanceOf(user1.address, 0)).to.equal(5);
    });

    it("should update minted count", async function () {
      await vault.connect(user1).mint(0, 10, { value: MINT_PRICE * 10n });
      const info = await vault.getVaultInfo(0);
      expect(info.minted).to.equal(10);
    });

    it("should set firstMintAt timestamp", async function () {
      await vault.connect(user1).mint(0, 1, { value: MINT_PRICE });
      const ts = await vault.firstMintAt(0, user1.address);
      expect(ts).to.be.greaterThan(0);
    });

    it("should not overwrite firstMintAt on subsequent mints", async function () {
      await vault.connect(user1).mint(0, 1, { value: MINT_PRICE });
      const ts1 = await vault.firstMintAt(0, user1.address);

      await time.increase(100);

      await vault.connect(user1).mint(0, 1, { value: MINT_PRICE });
      const ts2 = await vault.firstMintAt(0, user1.address);
      expect(ts2).to.equal(ts1);
    });

    it("should reject mint with wrong ETH amount", async function () {
      await expect(
        vault.connect(user1).mint(0, 1, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("Wrong ETH amount");
    });

    it("should reject mint exceeding public supply (700)", async function () {
      await expect(
        vault.connect(user1).mint(0, 701, { value: MINT_PRICE * 701n })
      ).to.be.revertedWith("Exceeds public supply");
    });

    it("should reject mint on inactive vault", async function () {
      await vault.setVaultActive(0, false);
      await expect(
        vault.connect(user1).mint(0, 1, { value: MINT_PRICE })
      ).to.be.revertedWith("Vault not active");
    });

    it("should emit Minted event", async function () {
      await expect(vault.connect(user1).mint(0, 3, { value: MINT_PRICE * 3n }))
        .to.emit(vault, "Minted")
        .withArgs(0, user1.address, 3);
    });
  });

  describe("Owner Mint (Reserved)", function () {
    beforeEach(deployAndSeed);

    it("should allow owner to mint reserved tokens", async function () {
      await vault.ownerMint(0, 50, user2.address);
      expect(await vault.balanceOf(user2.address, 0)).to.equal(50);
    });

    it("should update minted count", async function () {
      await vault.ownerMint(0, 100, user2.address);
      const info = await vault.getVaultInfo(0);
      expect(info.minted).to.equal(100);
    });

    it("should set firstMintAt for recipient", async function () {
      await vault.ownerMint(0, 1, user2.address);
      const ts = await vault.firstMintAt(0, user2.address);
      expect(ts).to.be.greaterThan(0);
    });

    it("should allow owner to mint up to maxSupply after public mint", async function () {
      // Public mint 700
      await vault.connect(user1).mint(0, 100, { value: MINT_PRICE * 100n });
      await vault.connect(user1).mint(0, 100, { value: MINT_PRICE * 100n });
      await vault.connect(user1).mint(0, 100, { value: MINT_PRICE * 100n });
      await vault.connect(user1).mint(0, 100, { value: MINT_PRICE * 100n });
      await vault.connect(user1).mint(0, 100, { value: MINT_PRICE * 100n });
      await vault.connect(user1).mint(0, 100, { value: MINT_PRICE * 100n });
      await vault.connect(user1).mint(0, 100, { value: MINT_PRICE * 100n });
      // Now 700 minted, owner can mint remaining 300
      await vault.ownerMint(0, 300, user2.address);
      const info = await vault.getVaultInfo(0);
      expect(info.minted).to.equal(1000);
    });

    it("should reject owner mint exceeding max supply", async function () {
      await vault.ownerMint(0, 700, user2.address);
      // Now 700 via ownerMint. Public can't mint since ownerMint ate into public supply.
      // But ownerMint can still go up to 1000 total
      await expect(
        vault.ownerMint(0, 301, user2.address)
      ).to.be.revertedWith("Exceeds max supply");
    });

    it("should reject non-owner calling ownerMint", async function () {
      await expect(
        vault.connect(user1).ownerMint(0, 1, user1.address)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("should emit OwnerMinted event", async function () {
      await expect(vault.ownerMint(0, 10, user2.address))
        .to.emit(vault, "OwnerMinted")
        .withArgs(0, user2.address, 10);
    });
  });

  describe("Redeem", function () {
    beforeEach(async function () {
      await deployAndSeed();
      await vault.connect(user1).mint(0, 10, { value: MINT_PRICE * 10n });
    });

    it("should reject redeem before lock period", async function () {
      await expect(
        vault.connect(user1).redeem(0, 1)
      ).to.be.revertedWith("Lock period not expired");
    });

    it("should allow redeem after lock period", async function () {
      await time.increase(365 * 24 * 60 * 60 + 1);

      const balBefore = await ethers.provider.getBalance(user1.address);
      const tx = await vault.connect(user1).redeem(0, 1);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balAfter = await ethers.provider.getBalance(user1.address);

      expect(balAfter + gasUsed).to.be.greaterThan(balBefore);
    });

    it("should burn tokens on redeem", async function () {
      await time.increase(365 * 24 * 60 * 60 + 1);
      await vault.connect(user1).redeem(0, 3);
      expect(await vault.balanceOf(user1.address, 0)).to.equal(7);
    });

    it("should update burned count", async function () {
      await time.increase(365 * 24 * 60 * 60 + 1);
      await vault.connect(user1).redeem(0, 2);
      const info = await vault.getVaultInfo(0);
      expect(info.burned).to.equal(2);
    });

    it("should reject redeem with insufficient balance", async function () {
      await time.increase(365 * 24 * 60 * 60 + 1);
      await expect(
        vault.connect(user1).redeem(0, 11)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Buyback & Burn", function () {
    beforeEach(async function () {
      await deployAndSeed();
      // Owner mints some tokens
      await vault.connect(owner).mint(0, 50, { value: MINT_PRICE * 50n });
    });

    it("should burn tokens from owner", async function () {
      await vault.buybackAndBurn(0, 10);
      expect(await vault.balanceOf(owner.address, 0)).to.equal(40);
    });

    it("should update burned count", async function () {
      await vault.buybackAndBurn(0, 5);
      const info = await vault.getVaultInfo(0);
      expect(info.burned).to.equal(5);
    });

    it("should reduce current supply", async function () {
      await vault.buybackAndBurn(0, 20);
      expect(await vault.currentSupply(0)).to.equal(30);
    });

    it("should reject non-owner burn", async function () {
      await expect(
        vault.connect(user1).buybackAndBurn(0, 1)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await deployAndSeed();
      await vault.connect(user1).mint(0, 10, { value: MINT_PRICE * 10n });
    });

    it("should return correct current supply", async function () {
      expect(await vault.currentSupply(0)).to.equal(10);
    });

    it("should return correct public supply", async function () {
      expect(await vault.publicSupply(0)).to.equal(700);
    });

    it("should return isRedeemable = false before lock", async function () {
      expect(await vault.isRedeemable(0, user1.address)).to.equal(false);
    });

    it("should return isRedeemable = true after lock", async function () {
      await time.increase(365 * 24 * 60 * 60 + 1);
      expect(await vault.isRedeemable(0, user1.address)).to.equal(true);
    });

    it("should return redeemableAt timestamp", async function () {
      const fm = await vault.firstMintAt(0, user1.address);
      const ra = await vault.redeemableAt(0, user1.address);
      expect(ra).to.equal(fm + BigInt(365 * 24 * 60 * 60));
    });

    it("should return 0 for non-minter redeemableAt", async function () {
      expect(await vault.redeemableAt(0, user2.address)).to.equal(0);
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      await deployAndSeed();
      await vault.connect(user1).mint(0, 100, { value: MINT_PRICE * 100n });
    });

    it("should allow owner to withdraw ETH", async function () {
      const contractBal = await ethers.provider.getBalance(await vault.getAddress());
      const balBefore = await ethers.provider.getBalance(owner.address);

      const tx = await vault.withdrawFunds(contractBal);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balAfter = await ethers.provider.getBalance(owner.address);

      expect(balAfter + gasUsed - balBefore).to.equal(contractBal);
    });

    it("should reject non-owner withdraw", async function () {
      await expect(
        vault.connect(user1).withdrawFunds(1)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("should reject withdraw exceeding balance", async function () {
      await expect(
        vault.withdrawFunds(ethers.parseEther("1000"))
      ).to.be.revertedWith("Insufficient balance");
    });
  });
});

describe("BonsaiRegistry", function () {
  let registry: BonsaiRegistry;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("BonsaiRegistry");
    registry = await Registry.deploy();
  });

  describe("Registration", function () {
    it("should register a bonsai", async function () {
      await registry.registerBonsai("雅趣", "Akamatsu", "Hirao", "https://img", 0, ethers.parseEther("14"));
      const info = await registry.getBonsai(0);
      expect(info.name).to.equal("雅趣");
      expect(info.species).to.equal("Akamatsu");
      expect(info.artist).to.equal("Hirao");
    });

    it("should increment bonsai count", async function () {
      await registry.registerBonsai("A", "S", "A", "U", 0, 1000);
      await registry.registerBonsai("B", "S", "A", "U", 1, 2000);
      expect(await registry.bonsaiCount()).to.equal(2);
    });

    it("should log initial price on registration", async function () {
      await registry.registerBonsai("雅趣", "Akamatsu", "Hirao", "https://img", 0, ethers.parseEther("14"));
      expect(await registry.getLatestPrice(0)).to.equal(ethers.parseEther("14"));
      expect(await registry.getPriceLogCount(0)).to.equal(1);
    });

    it("should reject non-owner registration", async function () {
      await expect(
        registry.connect(user1).registerBonsai("Hack", "S", "A", "U", 0, 1000)
      ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    });
  });

  describe("Price Logging", function () {
    beforeEach(async function () {
      await registry.registerBonsai("雅趣", "Akamatsu", "Hirao", "https://img", 0, ethers.parseEther("14"));
    });

    it("should log a new price", async function () {
      await registry.logPrice(0, ethers.parseEther("15"), 0, "https://evidence");
      expect(await registry.getLatestPrice(0)).to.equal(ethers.parseEther("15"));
      expect(await registry.getPriceLogCount(0)).to.equal(2);
    });

    it("should store price log details", async function () {
      await registry.logPrice(0, ethers.parseEther("15"), 1, "https://evidence");
      const log = await registry.getPriceLog(0, 1);
      expect(log.priceWei).to.equal(ethers.parseEther("15"));
      expect(log.source).to.equal(1); // ExchangeGallery
      expect(log.evidenceURI).to.equal("https://evidence");
    });

    it("should reject price log for non-existent bonsai", async function () {
      await expect(
        registry.logPrice(99, 1000, 0, "")
      ).to.be.revertedWith("Bonsai does not exist");
    });
  });

  describe("Total Valuation", function () {
    it("should calculate total valuation of multiple bonsai", async function () {
      await registry.registerBonsai("A", "S", "A", "U", 0, ethers.parseEther("14"));
      await registry.registerBonsai("B", "S", "A", "U", 1, ethers.parseEther("1.12"));
      await registry.registerBonsai("C", "S", "A", "U", 2, ethers.parseEther("5.678"));
      await registry.registerBonsai("D", "S", "A", "U", 0, ethers.parseEther("20"));

      const total = await registry.getTotalValuation([0, 1, 2, 3]);
      expect(total).to.equal(ethers.parseEther("40.798"));
    });
  });
});
