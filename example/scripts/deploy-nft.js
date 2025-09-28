const { ethers } = require("hardhat");
const { validateEnvironment } = require("./validate-env");

async function main() {
  // Validate environment before deployment
  if (!validateEnvironment()) {
    console.error("❌ Environment validation failed. Please fix the issues above.");
    process.exit(1);
  }
  
  console.log("🎨 Deploying PrivacyAuctionNFT contract...");
  
  // Get the contract factory
  const PrivacyAuctionNFT = await ethers.getContractFactory("PrivacyAuctionNFT");
  
  // Deploy the contract
  const nftContract = await PrivacyAuctionNFT.deploy();
  
  // Wait for deployment to complete
  await nftContract.waitForDeployment();
  
  const contractAddress = await nftContract.getAddress();
  
  console.log("✅ PrivacyAuctionNFT deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Network:", network.name);
  console.log("⛽ Gas Used:", (await nftContract.deploymentTransaction())?.gasLimit?.toString());
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const owner = await nftContract.owner();
  const nextTokenId = await nftContract.getNextTokenId();
  
  console.log("👤 Contract Owner:", owner);
  console.log("🆔 Next Token ID:", nextTokenId.toString());
  
  // Update addresses file
  try {
    const fs = require('fs');
    const path = require('path');
    
    const addressesPath = path.join(__dirname, '..', 'addresses.json');
    let addresses = {};
    
    if (fs.existsSync(addressesPath)) {
      addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    }
    
    addresses.PrivacyAuctionNFT = contractAddress;
    addresses.PrivacyAuctionNFT_Network = network.name;
    addresses.PrivacyAuctionNFT_DeployedAt = new Date().toISOString();
    
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("📝 Updated addresses.json");
  } catch (error) {
    console.log("⚠️ Could not update addresses.json:", error.message);
  }
  
  console.log("\n🎉 NFT Contract deployment completed successfully!");
  console.log("📝 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Deploy the auction contract");
  console.log("3. Update your frontend configuration");
  console.log("4. Test the NFT minting functionality");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
