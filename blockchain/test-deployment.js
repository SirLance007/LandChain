// Test script to verify Monad testnet connection
const hre = require("hardhat");

async function main() {
  console.log("🧪 Testing Monad Testnet Connection...");
  console.log("=====================================");

  try {
    // Get network info
    const network = await hre.ethers.provider.getNetwork();
    console.log("✅ Connected to network:", {
      name: network.name,
      chainId: network.chainId.toString()
    });

    // Get signer (your wallet)
    const [signer] = await hre.ethers.getSigners();
    const address = await signer.getAddress();
    console.log("✅ Wallet address:", address);

    // Check balance
    const balance = await hre.ethers.provider.getBalance(address);
    const balanceInMON = hre.ethers.formatEther(balance);
    console.log("💰 Wallet balance:", balanceInMON, "MON");

    if (parseFloat(balanceInMON) < 0.01) {
      console.log("⚠️ Low balance! Get testnet tokens from: https://faucet.monad.xyz");
    } else {
      console.log("✅ Sufficient balance for deployment");
    }

    // Test contract compilation
    console.log("\n🔨 Testing contract compilation...");
    const LandNFT = await hre.ethers.getContractFactory("LandNFT");
    console.log("✅ Contract compiled successfully");

    console.log("\n🎉 All tests passed! Ready for deployment.");
    console.log("\nTo deploy, run:");
    console.log("npx hardhat run scripts/deploy.js --network monadTestnet");

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    
    if (error.message.includes("private key too short")) {
      console.log("\n💡 Fix: Update blockchain/.env with your real private key");
    } else if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Fix: Get testnet tokens from https://faucet.monad.xyz");
    } else if (error.message.includes("network")) {
      console.log("\n💡 Fix: Check internet connection and RPC URL");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });