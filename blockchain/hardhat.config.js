// File: blockchain/hardhat.config.js

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    monadTestnet: {
      url: process.env.MONAD_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 10143 // Check Monad docs for actual chainId
    }
  }
};