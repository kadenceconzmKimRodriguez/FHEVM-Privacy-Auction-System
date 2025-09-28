// Auto-generated contract addresses
// Updated: 2025-01-28T00:00:00.000Z

export const CONTRACT_ADDRESSES = {
  PrivacyAuctionNFT: "0x1FBc7f3551E4e20ceB4D6a1D4C7Adbb3ceDD7972",
  PrivacyAuction: "0x42A1047Cc85CF8bF9D485dFe73117630431DDf2E",
  // Add more contracts as needed
};

export const NETWORK_CONFIG = {
  name: "sepolia",
  deployedAt: "2025-01-28T00:00:00.000Z"
};

// Contract ABIs (simplified for demo)
export const PRIVACY_AUCTION_NFT_ABI = [
  "function mint(address to, string memory uri) public returns (uint256)",
  "function setAuctionStatus(uint256 tokenId, bool inAuction) external",
  "function getAuctionStatus(uint256 tokenId) external view returns (bool)",
  "function getNextTokenId() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId) external",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function owner() external view returns (address)",
  "event NFTMinted(uint256 indexed tokenId, address indexed owner, string tokenURI)",
  "event NFTAuctionStatusChanged(uint256 indexed tokenId, bool inAuction)"
];

export const PRIVACY_AUCTION_ABI = [
  "function createAuction(uint256 tokenId, address nftContract, uint256 reservePrice, uint256 duration) external returns (uint256)",
  "function placeBid(uint256 auctionId, tuple(bytes32 value) encryptedBid) external payable",
  "function endAuction(uint256 auctionId) external",
  "function settleAuction(uint256 auctionId) external",
  "function getAuctionInfo(uint256 auctionId) external view returns (uint256, address, uint256, uint256, uint256, bool, bool, uint256, address, uint256)",
  "function hasBid(uint256 auctionId, address bidder) external view returns (bool)",
  "function getEncryptedAuctionData(uint256 auctionId) external view returns (tuple(bytes32 value), tuple(bytes32 value))",
  "function getAuctionCounter() external view returns (uint256)",
  "function owner() external view returns (address)",
  "event AuctionCreated(uint256 indexed auctionId, uint256 indexed tokenId, address indexed creator, uint256 reservePrice, uint256 endTime)",
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 bidAmount)",
  "event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 winningBid)",
  "event AuctionSettled(uint256 indexed auctionId, address indexed winner, uint256 winningBid)"
];

export default CONTRACT_ADDRESSES;
