const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

const projectId = process.env.REACT_APP_INFURA_PROJECT_ID;
const mnemonic = process.env.REACT_APP_MNEMONIC;
console.log(projectId, mnemonic);
module.exports = {
  networks: {
    // Ethereum Mainnet
    // mainnet: {
    //   provider: () =>
    //     new HDWalletProvider(
    //       mnemonic,
    //       `https://mainnet.infura.io/v3/${projectId}`
    //     ),
    //   network_id: 1, // Mainnet's id
    //   gas: 5500000, // Gas limit - adjust as needed
    //   confirmations: 2, // # of confirmations to wait between deployments
    //   timeoutBlocks: 200, // # of blocks before a deployment times out
    //   skipDryRun: true, // Skip dry run before migrations
    // },

    // // Sepolia Testnet
    // sepolia: {
    //   provider: () =>
    //     new HDWalletProvider(
    //       mnemonic,
    //       `https://sepolia.infura.io/v3/${projectId}`
    //     ),
    //   network_id: 11155111, // Sepolia's id
    //   gas: 5500000, // Gas limit - adjust as needed
    //   confirmations: 2, // # of confirmations to wait between deployments
    //   timeoutBlocks: 200, // # of blocks before a deployment times out
    //   skipDryRun: true, // Skip dry run before migrations
    // },

    // Holesky Testnet
    holesky: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://holesky.infura.io/v3/${projectId}`
        ),
      network_id: 17000, // Holesky's id
      gas: 5500000, // Gas limit - adjust as needed
      confirmations: 2, // # of confirmations to wait between deployments
      timeoutBlocks: 200, // # of blocks before a deployment times out
      skipDryRun: true, // Skip dry run before migrations
    },
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
