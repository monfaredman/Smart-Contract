// Import Web3
const { Web3 } = require("web3");

// Replace with your Alchemy HTTP endpoint
const alchemyUrl =
  "https://eth-sepolia.g.alchemy.com/v2/MqJsy0T6Xg4gQll-N8AuT_fQLl34nME4";

// Instantiate Web3 with the HTTP provider
const web3 = new Web3(alchemyUrl);

// async function testConnection() {
//   try {
//     // Get the latest block number
//     const latestBlockNumber = await web3.eth.getBlockNumber();
//     console.log("Latest Block Number:", latestBlockNumber);

//     // Fetch the details of the latest block
//     const latestBlock = await web3.eth.getBlock(latestBlockNumber);
//     console.log("Latest Block:", latestBlock);
//   } catch (error) {
//     console.error("Error connecting to the Ethereum network:", error);
//   }
// }

// async function testConnection() {
//   try {
//     // Fetch the response from the endpoint
//     const response = await fetch(alchemyUrl);
//     const data = await response.text(); // Get the raw response body as text
//     console.log("Raw Response:", data);

//     // Try to parse the response as JSON (if it's valid JSON)
//     const jsonData = JSON.parse(data);
//     console.log("Parsed JSON Response:", jsonData);

//     // Get the latest block number
//     const latestBlockNumber = await web3.eth.getBlockNumber();
//     console.log("Latest Block Number:", latestBlockNumber);

//     // Fetch the details of the latest block
//     const latestBlock = await web3.eth.getBlock(latestBlockNumber);
//     console.log("Latest Block:", latestBlock);
//   } catch (error) {
//     console.error("Error connecting to the Ethereum network:", error);
//   }
// }

// testConnection();

const fetch = require("node-fetch");

async function testConnection() {
  try {
    const response = await fetch(alchemyUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
      },
    });
    const data = await response.text();
    console.log("Raw Response:", data);

    // Try to parse the response as JSON
    const jsonData = JSON.parse(data);
    console.log("Parsed JSON Response:", jsonData);

    // Additional Web3 code to interact with the blockchain
    const latestBlockNumber = await web3.eth.getBlockNumber();
    console.log("Latest Block Number:", latestBlockNumber);

    const latestBlock = await web3.eth.getBlock(latestBlockNumber);
    console.log("Latest Block:", latestBlock);
  } catch (error) {
    console.error("Error connecting to the Ethereum network:", error);
  }
}

testConnection();
