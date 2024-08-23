const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

const alchemyApiKey = process.env.REACT_APP_ALCHEMY_API_KEY;
const mnemonic = process.env.REACT_APP_MNEMONIC;
console.log(alchemyApiKey, mnemonic);
module.exports = {
  networks: {
    // // Ethereum Mainnet
    mainnet: {
      networkCheckTimeout: 1000000, // NB: this option does nothing
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          // `wss://mainnet.infura.io/v3/${projectId}`
          // `wss://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`
          `wss://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
          // `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}`
        ),
      network_id: 1, // Mainnet's id
      gas: 5500000, // Gas limit - adjust as needed
      confirmations: 2, // # of confirmations to wait between deployments
      timeoutBlocks: 50000, // # of blocks before a deployment times out
      skipDryRun: true, // Skip dry run before migrations
    },
    // Sepolia Testnet
    // sepolia: {
    //   networkCheckTimeout: 1000000, // NB: this option does nothing
    //   provider: () =>
    //     new HDWalletProvider(
    //       mnemonic,
    //       // `https://sepolia.infura.io/v3/${projectId}`
    //       `https://eth-sepolia.alchemyapi.io/v2/${alchemyApiKey}`
    //     ),
    //   network_id: 11155111, // Sepolia's id
    //   gas: 5500000, // Gas limit - adjust as needed
    //   confirmations: 2, // # of confirmations to wait between deployments
    //   timeoutBlocks: 200, // # of blocks before a deployment times out
    //   skipDryRun: true, // Skip dry run before migrations
    // },
    // Holesky Testnet
    // holesky: {
    //   provider: () =>
    //     new HDWalletProvider(
    //       mnemonic,
    //       `https://holesky.infura.io/v3/${projectId}`
    //     ),
    //   network_id: 17000, // Holesky's id
    //   gas: 5500000, // Gas limit - adjust as needed
    //   confirmations: 2, // # of confirmations to wait between deployments
    //   timeoutBlocks: 50000, // Increase timeout // # of blocks before a deployment times out
    //   skipDryRun: true, // Skip dry run before migrations
    // },
  },

  compilers: {
    solc: {
      version: "0.8.21", // Specify the Solidity compiler version
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: "istanbul",
      },
    },
  },
};
