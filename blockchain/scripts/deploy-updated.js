// Deploy Updated LandNFT Contract with Transfer Function
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying updated LandNFT contract with transfer function...");

  // Get the ContractFactory and Signers here.
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with the account:", deployer.address);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "MON");

  // Deploy the contract
  const LandNFT = await ethers.getContractFactory("LandNFT");
  const landNFT = await LandNFT.deploy();
  
  await landNFT.waitForDeployment();
  const contractAddress = await landNFT.getAddress();

  console.log("✅ LandNFT deployed to:", contractAddress);
  console.log("🌐 Explorer:", `https://testnet-explorer.monad.xyz/address/${contractAddress}`);
  
  // Test the new transfer function
  console.log("\n🧪 Testing contract functions...");
  
  // Test minting
  const mintTx = await landNFT.mintLand(
    deployer.address,
    "QmTestHash123",
    26936000, // 26.936 * 1000000
    75925000, // 75.925 * 1000000
    1000
  );
  
  await mintTx.wait();
  console.log("✅ Test NFT minted");
  
  // Check total supply
  const totalLands = await landNFT.getTotalLands();
  console.log("📊 Total lands:", totalLands.toString());
  
  // Check owner
  const owner = await landNFT.ownerOf(0);
  console.log("👤 Owner of token 0:", owner);
  
  console.log("\n🎯 Deployment Summary:");
  console.log("📍 Contract Address:", contractAddress);
  console.log("⛓️ Network: Monad Testnet");
  console.log("🔗 Explorer:", `https://testnet-explorer.monad.xyz/address/${contractAddress}`);
  console.log("\n⚠️ Update your .env files with the new contract address!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });