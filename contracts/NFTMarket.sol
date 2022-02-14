//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {

    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.025 ether;

    constructor () {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }
    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated (
        uint itemId,
        address nftContract,
        uint256 tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function createMarketItems(address nftContract, uint256 tokenId, uint256 price) public payable nonReentrant {
        require(price > 0, "Price must be at least 1 Wei");
        require(msg.value == listingPrice, "Price must be equal to listitng price");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        //address(0) = it is empty address i.e. address with zero value since no one owns it as of now
        idToMarketItem[itemId] = MarketItem(itemId, nftContract, tokenId, payable(msg.sender), payable(address(0)), price, false);

        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(itemId, nftContract, tokenId, payable(msg.sender), payable(address(0)), price, false);

    }

    function createMarketSale(address nftContract, uint256 itemId) public payable nonReentrant {

        uint price = idToMarketItem[itemId].price;
        uint tokenId = idToMarketItem[itemId].tokenId;

        console.log(msg.value);
        console.log(price);

        require(msg.value == price, "Please submit the asking price.");

        idToMarketItem[itemId].seller.transfer(msg.value);
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;

        _itemsSold.increment();

        payable(owner).transfer(listingPrice); //as a comission to owner of the contract

    }

    function fetchMarketItems() public view returns (MarketItem[] memory) {

        uint itemCount = _itemIds.current();
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();

        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        for(uint i = 0; i < itemCount; i++) {

            if (idToMarketItem[i + 1].owner == address(0)) {
                //Item is not sold yet

                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;

            }

        }

        return items;

    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        
        uint totalItemCounts = _itemIds.current();
        uint myItemsCount = 0;
        uint currentIndex = 0;
        
        console.log(msg.sender);

        for (uint i = 0; i < totalItemCounts; i++) {
            console.log(idToMarketItem[i + 1].owner);
            if (idToMarketItem[i + 1].owner == msg.sender) {
                myItemsCount += 1;
            }
        }

        console.log(myItemsCount);
        console.log(totalItemCounts);

        MarketItem[] memory myItems = new MarketItem[](myItemsCount);

        for (uint i = 0; i < totalItemCounts; i++) {

            if (idToMarketItem[i + 1].owner == msg.sender) {

                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                myItems[currentIndex] = currentItem;
                currentIndex += 1;

            }

        }

        return myItems;

    }

    function fetchMyCreatedItems() public view returns (MarketItem[] memory) {
        
        uint totalItemCounts = _itemIds.current();
        uint myItemsCount = 0;

        for (uint i = 0; i < totalItemCounts; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                myItemsCount += 1;
            }
        }

        console.log(myItemsCount);
        console.log(totalItemCounts);

        MarketItem[] memory myItems = new MarketItem[](myItemsCount);
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCounts; i++) {

            if (idToMarketItem[i + 1].seller == msg.sender) {

                uint currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                myItems[currentIndex] = currentItem;
                currentIndex += 1;

            }

        }

        return myItems;

    }

}
