// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @title PrivacyAuctionNFT
 * @dev NFT contract for privacy-preserving auction system
 * Based on OpenZeppelin ERC721 implementation
 */
contract PrivacyAuctionNFT is ERC721, ERC721URIStorage, Ownable {
    
    uint256 private _nextTokenId;
    
    // Mapping from token ID to auction status
    mapping(uint256 => bool) public isInAuction;
    
    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event NFTAuctionStatusChanged(uint256 indexed tokenId, bool inAuction);
    
    constructor() ERC721("PrivacyAuctionNFT", "PANFT") Ownable(msg.sender) {}
    
    /**
     * @dev Mint a new NFT
     * @param to The address to mint the NFT to
     * @param uri The metadata URI for the NFT
     * @return tokenId The ID of the minted token
     */
    function mint(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit NFTMinted(tokenId, to, uri);
        return tokenId;
    }
    
    /**
     * @dev Set auction status for a token
     * @param tokenId The token ID
     * @param inAuction Whether the token is in auction
     */
    function setAuctionStatus(uint256 tokenId, bool inAuction) external {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        // Allow NFT owner, contract owner, or PrivacyAuction contract to set status
        require(
            ownerOf(tokenId) == msg.sender || 
            owner() == msg.sender || 
            msg.sender == address(0x42A1047Cc85CF8bF9D485dFe73117630431DDf2E), 
            "Not authorized"
        );
        
        isInAuction[tokenId] = inAuction;
        emit NFTAuctionStatusChanged(tokenId, inAuction);
    }
    
    /**
     * @dev Check if a token is in auction
     * @param tokenId The token ID
     * @return Whether the token is in auction
     */
    function getAuctionStatus(uint256 tokenId) external view returns (bool) {
        return isInAuction[tokenId];
    }
    
    /**
     * @dev Get the next token ID
     * @return The next token ID that will be minted
     */
    function getNextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
    
    // Override required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
