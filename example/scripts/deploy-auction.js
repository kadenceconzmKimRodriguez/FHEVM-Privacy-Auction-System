const { ethers } = require("hardhat");
const { validateEnvironment } = require("./validate-env");

async function main() {
  // Validate environment before deployment
  if (!validateEnvironment()) {
    console.error("❌ Environment validation failed. Please fix the issues above.");
    process.exit(1);
  }
  
  console.log("🔐 Deploying PrivacyAuction contract...");
  
  // Get the contract factory
  const PrivacyAuction = await ethers.getContractFactory("PrivacyAuction");
  
  // Deploy the contract
  const auctionContract = await PrivacyAuction.deploy();
  
  // Wait for deployment to complete
  await auctionContract.waitForDeployment();
  
  const contractAddress = await auctionContract.getAddress();
  
  console.log("✅ PrivacyAuction deployed successfully!");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Network:", network.name);
  console.log("⛽ Gas Used:", (await auctionContract.deploymentTransaction())?.gasLimit?.toString());
  
  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const owner = await auctionContract.owner();
  const auctionCounter = await auctionContract.getAuctionCounter();
  
  console.log("👤 Contract Owner:", owner);
  console.log("📊 Auction Counter:", auctionCounter.toString());
  
  // Update addresses file
  try {
    const fs = require('fs');
    const path = require('path');
    
    const addressesPath = path.join(__dirname, '..', 'addresses.json');
    let addresses = {};
    
    if (fs.existsSync(addressesPath)) {
      addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    }
    
    addresses.PrivacyAuction = contractAddress;
    addresses.PrivacyAuction_Network = network.name;
    addresses.PrivacyAuction_DeployedAt = new Date().toISOString();
    
    fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
    console.log("📝 Updated addresses.json");
  } catch (error) {
    console.log("⚠️ Could not update addresses.json:", error.message);
  }
  
  console.log("\n🎉 Auction Contract deployment completed successfully!");
  console.log("📝 Next steps:");
  console.log("1. Copy the contract address above");
  console.log("2. Update your frontend configuration");
  console.log("3. Test the auction functionality");
  console.log("4. Run 'npm run verify:all' to verify on Etherscan");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
