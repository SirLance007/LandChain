// File: blockchain/scripts/deploy.js

const hre = require("hardhat");

async function main() {
  console.log("Deploying LandNFT contract...");

  const LandNFT = await hre.ethers.getContractFactory("LandNFT");
  const landNFT = await LandNFT.deploy();

  await landNFT.waitForDeployment();

  const address = await landNFT.getAddress();
  console.log("LandNFT deployed to:", address);
  
  // Save this address!
  console.log("\\n⚠️  SAVE THIS ADDRESS IN backend/.env and frontend/src/config.js");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });