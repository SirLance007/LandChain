// Deploy enhanced LandNFT contract with admin controls and duplicate prevention
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Enhanced LandNFT Contract...\n");

  // Get the contract factory
  const LandNFT = await ethers.getContractFactory("LandNFT");
  
  // Deploy the contract
  console.log("📝 Deploying contract...");
  const landNFT = await LandNFT.deploy();
  
  // Wait for deployment
  await landNFT.waitForDeployment();
  
  const contractAddress = await landNFT.getAddress();
  console.log("✅ LandNFT deployed to:", contractAddress);
  
  // Get deployer address
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployed by:", deployer.address);
  
  // Check initial setup
  console.log("\n🔍 Verifying initial setup...");
  
  // Check if deployer is owner
  const owner = await landNFT.owner();
  console.log("🔑 Contract owner:", owner);
  
  // Check if deployer is registrar
  const isRegistrar = await landNFT.isRegistrar(deployer.address);
  console.log("📋 Deployer is registrar:", isRegistrar);
  
  // Get total lands (should be 0)
  const totalLands = await landNFT.getTotalLands();
  console.log("🏠 Total lands:", totalLands.toString());
  
  console.log("\n🎉 Enhanced Contract Features:");
  console.log("✅ Admin-only minting (registrar role required)");
  console.log("✅ Duplicate land prevention (coordinates + IPFS hash)");
  console.log("✅ Standard ERC721 transfers (safeTransferFrom)");
  console.log("✅ Unique transfer hash generation");
  console.log("✅ Complete transfer history tracking");
  console.log("✅ On-chain ownership proof");
  
  console.log("\n📋 Contract Details:");
  console.log("Contract Address:", contractAddress);
  console.log("Network: Monad Testnet");
  console.log("Chain ID: 10143");
  console.log("Explorer:", `https://testnet-explorer.monad.xyz/address/${contractAddress}`);
  
  console.log("\n💡 Next Steps:");
  console.log("1. Update CONTRACT_ADDRESS in backend/.env");
  console.log("2. Restart backend server");
  console.log("3. Test land registration with duplicate prevention");
  console.log("4. Test transfers with unique transaction hashes");
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log(`\n🎯 Deployment completed successfully!`);
    console.log(`📋 Contract Address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });