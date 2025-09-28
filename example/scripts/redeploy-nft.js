const { ethers } = require("hardhat");
const { validateEnvironment } = require("./validate-env");

async function main() {
  // Validate environment before deployment
  if (!validateEnvironment()) {
    console.error("❌ Environment validation failed. Please fix the issues above.");
    process.exit(1);
  }
  
  console.log("🎨 Redeploying PrivacyAuctionNFT contract (updated permissions)...");
  
  // Get the contract factory
  const PrivacyAuctionNFT = await ethers.getContractFactory("PrivacyAuctionNFT");
  
  // Deploy the contract
  const nftContract = await PrivacyAuctionNFT.deploy();
  
  // Wait for deployment to complete
  await nftContract.waitForDeployment();
  
  const nftAddress = await nftContract.getAddress();
  
  console.log("✅ PrivacyAuctionNFT deployed successfully!");
  console.log(`📍 Contract Address: ${nftAddress}`);
  console.log(`🔗 Network: ${network.name}`);
  
  // Get deployment info
  const deploymentTx = nftContract.deploymentTransaction();
  if (deploymentTx) {
    const receipt = await deploymentTx.wait();
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);
  }
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const owner = await nftContract.owner();
  const nextTokenId = await nftContract.getNextTokenId();
  
  console.log(`👤 Contract Owner: ${owner}`);
  console.log(`🆔 Next Token ID: ${nextTokenId.toString()}`);
  
  // Update addresses.json
  const fs = require('fs');
  const path = require('path');
  const addressesPath = path.join(__dirname, '..', 'addresses.json');
  
  let addresses = {};
  if (fs.existsSync(addressesPath)) {
    addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  }
  
  addresses.PrivacyAuctionNFT = nftAddress;
  addresses.PrivacyAuctionNFT_Network = network.name;
  addresses.PrivacyAuctionNFT_DeployedAt = new Date().toISOString();
  
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("📝 Updated addresses.json");
  
  console.log("\n🎉 NFT Contract redeployment completed successfully!");
  console.log("📝 Next steps:");
  console.log("1. Update your frontend configuration with the new address");
  console.log("2. Test the NFT minting functionality");
  console.log("3. Anyone can now mint NFTs!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
