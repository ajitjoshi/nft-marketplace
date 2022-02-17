import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import { useRouter } from "next/router";
import Web3Modal from "web3modal";

const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

import {nftaddress, nftmarketaddress} from "../config";

import NFT from "../artifacts/contracts/NFT.sol/NFT.json"
import NFTMarket from "../artifacts/contracts/NFTMarket.sol/NFTMarket.json";

export default function CreateItem () {

    const [fileUrl, setFileUrl] = useState(null);
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: ''});
    const router = useRouter();

    let response = "Initial State";

    async function onChange(e) {

        response = "Loading image...";
        router.replace(router.asPath);

        const file = e.target.files[0];
        try {

            const added = await client.add(file, {
                progress: (prog) => console.log(`received: ${prog}`)
            });

            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url);

            
        } catch (e) {
            console.log(e);
        }

        response = "Image Loaded";
        router.replace(router.asPath);

    }

    async function createItem () {
        
        const { name, description, price } = formInput
        
        if (!name || !description || !price || !fileUrl) return 
        
        const data = JSON.stringify ({
            name, description, image: fileUrl
        });
        
        try {
            
            const added = await client.add(data);
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            
            createSale(url);

        } catch (e) {
            console.log("File upload error.", e);
        }

    }

    async function createSale (url) {

        response = "Metamask Interaction... started";
        router.replace(router.asPath);

        //invoke web3 modal. MetaMask or any other similar wallet must be installed
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();


        response = formInput.response + "\nToken creation... started";
        router.replace(router.asPath);

        //NFT Transaction to create token. 
        let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
        let transactionResponse = await contract.createToken(url);

        /* Till this time transactionResponse has transaction specific metadata such as gasPrice, value and so on.
        once wait() is invoked, transactionReceipt object will be accessible, which hold array of 'emited' events */
        let transactionReceipt = await transactionResponse.wait();

        /*createToken() indirectly emits one inherited event 'Transfer(address(0), to, tokenId)' => ERC721.sol
        3rd argument of the event returns the tokenId */
        let event = transactionReceipt.events[0];
        let tokenId = event.args[2];
        tokenId = tokenId.toNumber();

        const price = ethers.utils.parseUnits(formInput.price, "ether");
        console.log("price = " + price);

        response = response + "\nToken creation... complete";
        response = response + "\nToken ID: " + tokenId;
        router.replace(router.asPath);

        //NFTMarket Transaction
        contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);
        let listingPrice = await contract.getListingPrice();
        listingPrice = listingPrice.toString();
        let transactionResponseMarket = await contract.createMarketItems(nftaddress, tokenId, price, { value: listingPrice});
        await transactionResponseMarket.wait();

        let transactionReceiptMarket = await transactionResponseMarket.wait();

        response = response + "\nTransaction Complete!";
        router.replace(router.asPath);
        //router.reload(window.location.pathname)
        //router.push("/");

    }

    return (

        <>
        <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-10">
                <input 
                    placeholder="Asset Name" className="mt-1 border rounded p-2"
                    onChange={ e => updateFormInput({ ...formInput, name: e.target.value, response: '' })}
                />
                <textarea 
                    placeholder="Asset Description" className="mt-2 border rounded p-2"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value})}
                />
                <input 
                    placeholder="Asset Price in Matic" className="mt-2 border rounded p-2"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value})}
                />
                <input 
                    type="file" name="Asset" className="my-4" 
                    onChange={onChange}
                />
                {
                    fileUrl && (
                        <img className="rounded mt-4" width="200" src={fileUrl} />
                    )
                }
                <button 
                    className="font-bold mt-1 bg-green-800 text-white rounded p-2 shadkow-lg"
                    onClick={createItem}
                    >Create Digital Asset
                </button>
            </div>
        </div>
        <div>
            <label className="mt-2 rounded p-2">
                { response }
            </label>
        </div>
        
        </>

    )

    

}



