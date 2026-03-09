// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BonsaiRegistry
 * @notice On-chain registry for bonsai assets with price history logging.
 */
contract BonsaiRegistry is Ownable {
    enum ValuationMethod { ClassicGallery, ExchangeGallery, SecondaryMarket }

    struct Bonsai {
        string name;
        string species;
        string artist;
        string imageURI;
        ValuationMethod valuationMethod;
        uint256 initialPriceWei;  // Initial valuation in wei
        uint256 registeredAt;
        bool active;
    }

    struct PriceLog {
        uint256 priceWei;
        ValuationMethod source;
        string evidenceURI;
        uint256 timestamp;
    }

    mapping(uint256 => Bonsai) public bonsais;
    mapping(uint256 => PriceLog[]) public priceLogs;
    uint256 public bonsaiCount;

    event BonsaiRegistered(uint256 indexed bonsaiId, string name, uint256 initialPriceWei);
    event PriceLogged(uint256 indexed bonsaiId, uint256 priceWei, ValuationMethod source);

    constructor() Ownable(msg.sender) {}

    function registerBonsai(
        string calldata _name,
        string calldata _species,
        string calldata _artist,
        string calldata _imageURI,
        ValuationMethod _valuationMethod,
        uint256 _initialPriceWei
    ) external onlyOwner returns (uint256) {
        uint256 id = bonsaiCount;
        bonsais[id] = Bonsai({
            name: _name,
            species: _species,
            artist: _artist,
            imageURI: _imageURI,
            valuationMethod: _valuationMethod,
            initialPriceWei: _initialPriceWei,
            registeredAt: block.timestamp,
            active: true
        });
        bonsaiCount++;

        // Log initial price
        priceLogs[id].push(PriceLog({
            priceWei: _initialPriceWei,
            source: _valuationMethod,
            evidenceURI: "",
            timestamp: block.timestamp
        }));

        emit BonsaiRegistered(id, _name, _initialPriceWei);
        return id;
    }

    function logPrice(
        uint256 _bonsaiId,
        uint256 _priceWei,
        ValuationMethod _source,
        string calldata _evidenceURI
    ) external onlyOwner {
        require(_bonsaiId < bonsaiCount, "Bonsai does not exist");
        require(bonsais[_bonsaiId].active, "Bonsai not active");

        priceLogs[_bonsaiId].push(PriceLog({
            priceWei: _priceWei,
            source: _source,
            evidenceURI: _evidenceURI,
            timestamp: block.timestamp
        }));

        emit PriceLogged(_bonsaiId, _priceWei, _source);
    }

    function getBonsai(uint256 _bonsaiId)
        external
        view
        returns (
            string memory name,
            string memory species,
            string memory artist,
            string memory imageURI,
            ValuationMethod valuationMethod,
            uint256 initialPriceWei,
            uint256 registeredAt,
            bool active
        )
    {
        Bonsai storage b = bonsais[_bonsaiId];
        return (b.name, b.species, b.artist, b.imageURI, b.valuationMethod, b.initialPriceWei, b.registeredAt, b.active);
    }

    function getLatestPrice(uint256 _bonsaiId) external view returns (uint256) {
        PriceLog[] storage logs = priceLogs[_bonsaiId];
        if (logs.length == 0) return 0;
        return logs[logs.length - 1].priceWei;
    }

    function getPriceLogCount(uint256 _bonsaiId) external view returns (uint256) {
        return priceLogs[_bonsaiId].length;
    }

    function getPriceLog(uint256 _bonsaiId, uint256 _index)
        external
        view
        returns (uint256 priceWei, ValuationMethod source, string memory evidenceURI, uint256 timestamp)
    {
        PriceLog storage log = priceLogs[_bonsaiId][_index];
        return (log.priceWei, log.source, log.evidenceURI, log.timestamp);
    }

    function getTotalValuation(uint256[] calldata _bonsaiIds) external view returns (uint256 total) {
        for (uint256 i = 0; i < _bonsaiIds.length; i++) {
            PriceLog[] storage logs = priceLogs[_bonsaiIds[i]];
            if (logs.length > 0) {
                total += logs[logs.length - 1].priceWei;
            }
        }
    }
}
