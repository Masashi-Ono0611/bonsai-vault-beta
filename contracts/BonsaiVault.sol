// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BonsaiVault
 * @notice ERC-1155 Vault NFT — each token ID represents a vault of bundled bonsai assets.
 *         Users mint vault NFTs by paying ETH. Redeems are time-locked.
 *         Owner can execute buyback-and-burn to reduce supply.
 *         Reserved tokens can be minted by owner for locked distribution.
 */
contract BonsaiVault is ERC1155, Ownable, ReentrancyGuard {
    struct VaultInfo {
        string name;
        string description;
        uint256 mintPrice;       // wei per NFT
        uint256 maxSupply;       // total supply (public + reserved)
        uint256 reservedSupply;  // reserved for 1-year lock distribution
        uint256 minted;
        uint256 burned;
        uint256 createdAt;
        bool active;
        uint256[] bonsaiIds;     // IDs referencing BonsaiRegistry
    }

    // vaultId => VaultInfo
    mapping(uint256 => VaultInfo) public vaults;
    uint256 public vaultCount;

    // vaultId => holder => first mint timestamp (for lock tracking)
    mapping(uint256 => mapping(address => uint256)) public firstMintAt;

    // Lock period: 365 days
    uint256 public constant LOCK_PERIOD = 365 days;

    // Events
    event VaultCreated(uint256 indexed vaultId, string name, uint256 mintPrice, uint256 maxSupply, uint256 reservedSupply);
    event Minted(uint256 indexed vaultId, address indexed to, uint256 amount);
    event OwnerMinted(uint256 indexed vaultId, address indexed to, uint256 amount);
    event Redeemed(uint256 indexed vaultId, address indexed from, uint256 amount, uint256 ethAmount);
    event BuybackBurned(uint256 indexed vaultId, uint256 amount);
    event FundsWithdrawn(address indexed to, uint256 amount);

    constructor() ERC1155("") Ownable(msg.sender) {}

    // ─── Vault Management ───────────────────────────────────────

    function createVault(
        string calldata _name,
        string calldata _description,
        uint256 _mintPrice,
        uint256 _maxSupply,
        uint256 _reservedSupply,
        uint256[] calldata _bonsaiIds
    ) external onlyOwner returns (uint256) {
        require(_mintPrice > 0, "Price must be > 0");
        require(_maxSupply > 0, "Supply must be > 0");
        require(_reservedSupply <= _maxSupply, "Reserved exceeds max");
        require(_bonsaiIds.length >= 4, "Min 4 bonsai required");

        uint256 vaultId = vaultCount;
        vaults[vaultId] = VaultInfo({
            name: _name,
            description: _description,
            mintPrice: _mintPrice,
            maxSupply: _maxSupply,
            reservedSupply: _reservedSupply,
            minted: 0,
            burned: 0,
            createdAt: block.timestamp,
            active: true,
            bonsaiIds: _bonsaiIds
        });
        vaultCount++;

        emit VaultCreated(vaultId, _name, _mintPrice, _maxSupply, _reservedSupply);
        return vaultId;
    }

    function setVaultActive(uint256 _vaultId, bool _active) external onlyOwner {
        require(_vaultId < vaultCount, "Vault does not exist");
        vaults[_vaultId].active = _active;
    }

    // ─── Public Mint ──────────────────────────────────────────────

    function mint(uint256 _vaultId, uint256 _amount) external payable nonReentrant {
        VaultInfo storage v = vaults[_vaultId];
        require(v.active, "Vault not active");
        require(_amount > 0, "Amount must be > 0");
        require(v.minted + _amount <= v.maxSupply - v.reservedSupply, "Exceeds public supply");
        require(msg.value == v.mintPrice * _amount, "Wrong ETH amount");

        if (firstMintAt[_vaultId][msg.sender] == 0) {
            firstMintAt[_vaultId][msg.sender] = block.timestamp;
        }

        v.minted += _amount;
        _mint(msg.sender, _vaultId, _amount, "");

        emit Minted(_vaultId, msg.sender, _amount);
    }

    // ─── Owner Mint (Reserved) ────────────────────────────────────

    function ownerMint(uint256 _vaultId, uint256 _amount, address _to) external onlyOwner {
        VaultInfo storage v = vaults[_vaultId];
        require(v.minted + _amount <= v.maxSupply, "Exceeds max supply");
        require(_amount > 0, "Amount must be > 0");

        if (firstMintAt[_vaultId][_to] == 0) {
            firstMintAt[_vaultId][_to] = block.timestamp;
        }

        v.minted += _amount;
        _mint(_to, _vaultId, _amount, "");

        emit OwnerMinted(_vaultId, _to, _amount);
    }

    // ─── Redeem ─────────────────────────────────────────────────

    function redeem(uint256 _vaultId, uint256 _amount) external nonReentrant {
        require(_vaultId < vaultCount, "Vault does not exist");
        require(_amount > 0, "Amount must be > 0");
        require(balanceOf(msg.sender, _vaultId) >= _amount, "Insufficient balance");
        require(
            block.timestamp >= firstMintAt[_vaultId][msg.sender] + LOCK_PERIOD,
            "Lock period not expired"
        );

        VaultInfo storage v = vaults[_vaultId];
        uint256 supply = v.minted - v.burned;
        require(supply > 0, "No supply");

        // Redeem value = contract ETH balance * (amount / supply)
        uint256 redeemValue = (address(this).balance * _amount) / supply;

        v.burned += _amount;
        _burn(msg.sender, _vaultId, _amount);

        (bool sent, ) = payable(msg.sender).call{value: redeemValue}("");
        require(sent, "ETH transfer failed");

        emit Redeemed(_vaultId, msg.sender, _amount, redeemValue);
    }

    // ─── Buyback & Burn ─────────────────────────────────────────

    function buybackAndBurn(uint256 _vaultId, uint256 _amount) external onlyOwner {
        require(balanceOf(msg.sender, _vaultId) >= _amount, "Insufficient balance");
        vaults[_vaultId].burned += _amount;
        _burn(msg.sender, _vaultId, _amount);
        emit BuybackBurned(_vaultId, _amount);
    }

    // ─── Withdraw (owner) ───────────────────────────────────────

    function withdrawFunds(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance, "Insufficient balance");
        (bool sent, ) = payable(owner()).call{value: _amount}("");
        require(sent, "ETH transfer failed");
        emit FundsWithdrawn(owner(), _amount);
    }

    // ─── View Functions ─────────────────────────────────────────

    function getVaultInfo(uint256 _vaultId)
        external
        view
        returns (
            string memory name,
            string memory description,
            uint256 mintPrice,
            uint256 maxSupply,
            uint256 minted,
            uint256 burned,
            uint256 createdAt,
            bool active,
            uint256 reservedSupply
        )
    {
        VaultInfo storage v = vaults[_vaultId];
        return (v.name, v.description, v.mintPrice, v.maxSupply, v.minted, v.burned, v.createdAt, v.active, v.reservedSupply);
    }

    function getVaultBonsaiIds(uint256 _vaultId) external view returns (uint256[] memory) {
        return vaults[_vaultId].bonsaiIds;
    }

    function currentSupply(uint256 _vaultId) external view returns (uint256) {
        VaultInfo storage v = vaults[_vaultId];
        return v.minted - v.burned;
    }

    function publicSupply(uint256 _vaultId) external view returns (uint256) {
        VaultInfo storage v = vaults[_vaultId];
        return v.maxSupply - v.reservedSupply;
    }

    function isRedeemable(uint256 _vaultId, address _holder) external view returns (bool) {
        uint256 fm = firstMintAt[_vaultId][_holder];
        if (fm == 0) return false;
        return block.timestamp >= fm + LOCK_PERIOD;
    }

    function redeemableAt(uint256 _vaultId, address _holder) external view returns (uint256) {
        uint256 fm = firstMintAt[_vaultId][_holder];
        if (fm == 0) return 0;
        return fm + LOCK_PERIOD;
    }

    // Allow contract to receive ETH (for buyback funding)
    receive() external payable {}
}
