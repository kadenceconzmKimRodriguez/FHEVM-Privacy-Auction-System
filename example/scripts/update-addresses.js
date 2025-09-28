const fs = require('fs');
const path = require('path');

/**
 * Update contract addresses in the frontend configuration
 * Based on hello-fhevm-tutorial address management
 */

const addressesPath = path.join(__dirname, '..', 'addresses.json');
const frontendConfigPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'config', 'contracts.js');

function loadAddresses() {
  if (!fs.existsSync(addressesPath)) {
    console.log('📝 No addresses.json found, creating new file...');
    return {};
  }
  
  try {
    const data = fs.readFileSync(addressesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Error reading addresses.json:', error.message);
    return {};
  }
}

function updateFrontendConfig(addresses) {
  const configContent = `// Auto-generated contract addresses
// Updated: ${new Date().toISOString()}

export const CONTRACT_ADDRESSES = {
  PrivacyAuctionNFT: "${addresses.PrivacyAuctionNFT || '0x...'}",
  PrivacyAuction: "${addresses.PrivacyAuction || '0x...'}",
  // Add more contracts as needed
};

export const NETWORK_CONFIG = {
  name: "${addresses.PrivacyAuction_Network || 'unknown'}",
  deployedAt: "${addresses.PrivacyAuction_DeployedAt || 'unknown'}"
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
`;

  try {
    // Ensure directory exists
    const configDir = path.dirname(frontendConfigPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(frontendConfigPath, configContent);
    console.log('✅ Updated frontend contract configuration');
  } catch (error) {
    console.error('❌ Error updating frontend config:', error.message);
  }
}

function displayAddresses(addresses) {
  console.log('\n📋 Current Contract Addresses:');
  console.log('================================');
  
  Object.entries(addresses).forEach(([key, value]) => {
    if (key.includes('_')) return; // Skip metadata
    
    const network = addresses[`${key}_Network`] || 'unknown';
    const deployedAt = addresses[`${key}_DeployedAt`] || 'unknown';
    
    console.log(`\n${key}:`);
    console.log(`  Address: ${value}`);
    console.log(`  Network: ${network}`);
    console.log(`  Deployed: ${deployedAt}`);
  });
}

function main() {
  console.log('🔧 Contract Address Manager');
  console.log('==========================');
  
  const addresses = loadAddresses();
  
  if (Object.keys(addresses).length === 0) {
    console.log('📝 No contracts deployed yet.');
    console.log('Run deployment scripts to add contract addresses.');
    return;
  }
  
  displayAddresses(addresses);
  updateFrontendConfig(addresses);
  
  console.log('\n✅ Address management completed!');
}

main();
