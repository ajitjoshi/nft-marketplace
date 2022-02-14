import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress } from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function CreatorDashboard() {

  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);

  const [loadingState, setLoadingState] = useState([]);
  useEffect(() => {
    loadNFTs()
  }, []);


  async function loadNFTs() {

    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);

    const data = await marketContract.fetchMyCreatedItems();

    const items = await Promise.all(data.map(async i => {

      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatUnits(i.price.toString(), "ether");
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        sold: i.sold,
        image: meta.data.image,
      }
      return item;
    }));

    setNfts(items)
    const soldItems = items.filter(i => i.sold)
    setSold(soldItems);
    setLoadingState("loaded");

  }

  return (

    <div>
      <div className="p-2 text-center">
        <h2 className="text-2xl py-2">Logo Created</h2>
        <div className="px-4" style={{ maxWidth: "900px"}}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} className="rounded"/>
                <div className="p-4 bg-black">
                  <p className="text-xl font-light text-white">Price - {nft.price} ETH</p>
                </div>
              </div>
            ))
          }
          </div>
        </div>
      </div>
      <div className="px-2 text-center">
        {
          Boolean(sold.length) && (
            <div>
            <h2 className="text-2xl py-2">Logo Sold</h2>
            <div className="px-4" style={{ maxWidth: "900px"}}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {
                sold.map((nft, i) => (
                  <div key={i} className="border shadow rounded-xl overflow-hidden">
                    <img src={nft.image} className="rounded"/>
                    <div className="p-4 bg-black">
                      <p className="text-xl font-light text-white">Price - {nft.price} ETH</p>
                    </div>
                  </div>
                ))
              }
            </div>
            </div>
            </div>
          )
        }
      </div>
    </div>

  )

} 


