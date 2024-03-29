import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function Home() {

  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loading');

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {

    console.log("nftaddress : " + nftaddress);
    console.log("nftmarketaddress : " + nftmarketaddress);

    const provider = new ethers.providers.JsonRpcProvider();
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, provider);

    const data = await marketContract.fetchMarketItems();

    console.log(data);

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      
      const meta = await axios.get(tokenUri);
      
      let price = ethers.utils.formatUnits(i.price.toString(), "ether");

      let item = {
        price, 
        tokenId: i.tokenId.toString(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item;
    }));
    
    setNfts(items);
    setLoadingState("loaded");

  }

  async function buyNft(nft) {

    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");

    console.log("price : " + price);
    console.log("nft.price : " + nft.price);

    const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {value: price});
    await transaction.wait();
    loadNFTs();

  }

  if (loadingState === "loaded" && !nfts.length) {
    return (
      <h1 className="px-20 py10 text-3xl">No items in marketplace</h1>
    )
  } 

  console.log("nfts", nfts)

  return (
    <div className="flex justify-left">
    <div className="px-4" style={{ maxWidth: "800px"}}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        {
        nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden">
            <img src={nft.image} />
            <div className="p-4 bg-blue-800 text-white">
                <p style={{height: "32px"}} className="text-xl font-semibold">{nft.name}</p>
                <div style={{ height: "32px", overflow: "hidden"}}>
                <p className="text-gray-400">{nft.description}</p>
                </div>
            </div>
            <div className="p-4 bg-black">
                <p className="text-xl mb-4 font-semibold text-white">{nft.price} Matic</p>
                <button className="w-full bg-green-800 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
            </div>
            </div>
        ))
        }
    </div>
    </div>
    </div>
    
  ) 
  
}
