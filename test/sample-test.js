const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {

    const MarketContract = await ethers.getContractFactory("NFTMarket");
    const marketContract = await MarketContract.deploy();
    await marketContract.deployed();
    const marketContractAddress = marketContract.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketContractAddress);
    await nft.deployed();
    const nftContractAddress = nft.address;

    let listingPrice = await marketContract.getListingPrice();

    const auctionPrice = ethers.utils.parseUnits('100', 'ether');

    await nft.createToken("https://www.mytokenlocation.com");
    await nft.createToken("https://www.mytokenlocation2.com");

    await marketContract.createMarketItems(nftContractAddress, 1, auctionPrice, {value: listingPrice});
    await marketContract.createMarketItems(nftContractAddress, 2, auctionPrice, {value: listingPrice});

    const [_, buyerAddress] = await ethers.getSigners(); //ignoring first address 

    await marketContract.connect(buyerAddress).createMarketSale(nftContractAddress, 1, {value: auctionPrice});

    let items = await marketContract.fetchMarketItems();

    items = await Promise.all(items.map(async i => {
      const tokenUri = await nft.tokenURI(i.tokenId);
      let item = {
        price: i.price.toString(),
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        tokenUri
      }
      return item;
    }));


    console.log('items : ', items);


  });
});
