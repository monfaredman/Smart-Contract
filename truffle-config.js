const HDWalletProvider = require("@truffle/hdwallet-provider");
// require("dotenv").config();

const alchemyApiKey = process.env.REACT_APP_ALCHEMY_API_KEY;
const mnemonic = process.env.REACT_APP_MNEMONIC;

if (!alchemyApiKey || !mnemonic) {
  throw new Error(
    "Missing Alchemy API key or mnemonic in environment variables"
  );
}

module.exports = {
  networks: {
    // Sepolia Testnet
    holesky: {
      networkCheckTimeout: 1000000, // NB: this option does nothing
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://eth-holesky.g.alchemy.com/v2/${alchemyApiKey}` // Use HTTP endpoint
        ),
      network_id: 17000, // Holesky's id
      gas: 5500000, // Gas limit - adjust as needed
      confirmations: 2, // # of confirmations to wait between deployments
      timeoutBlocks: 50000, // Increase timeout // # of blocks before a deployment times out
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
