//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/* ERC721URIStorage extends ERC721 for URI storage requirement. We will be using IPFS to store token URI of the image of the Logo. */
contract NFTLogo is ERC721URIStorage {

    //Counters library is used to maintain the token ids. 
    using Counters for Counters.Counter;
    Counters.Counter private _logoTokenIds;
    address owner;

    constructor(address contractDeployedBy) ERC721("Logo Token", "LOGO") {
        owner = contractDeployedBy;
    }

    /* According to 'ethers' documentation, this is a 'Write Method'. Which means it does not return any value. It returns
    TransactionResponse object. If wait() method is called on this TransactionResponse object it returns TransactionReceipt object
    */ 
    function createNewLogoToken(string memory tokenURI) public {

        _logoTokenIds.increment();
        uint256 newLogoTokenId = _logoTokenIds.current();

        _mint(msg.sender, newLogoTokenId);
        _setTokenURI(newLogoTokenId, tokenURI);
        setApprovalForAll(owner, true);

    }
}

