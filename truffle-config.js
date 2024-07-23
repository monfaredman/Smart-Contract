module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Localhost
      port: 7545, // Port used by Ganache GUI
      network_id: "5777", // Match any network id
      // network_id: "*", // Match any network id
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
