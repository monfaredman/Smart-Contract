import { ethers } from "ethers";
import Register from "../../build/contracts/Register.json";

// Function to connect to Web3 provider
async function connectToWeb3() {
  if (typeof window.ethereum !== "undefined") {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      console.log("Connected to Web3 provider");
      return { provider, signer };
    } catch (error) {
      console.error("Error connecting to web3:", error);
    }
  } else {
    console.error(
      "No Ethereum provider found. Install a Web3 wallet like MetaMask."
    );
    alert(
      "No Ethereum provider found. Please install MetaMask or another Web3 wallet."
    );
  }
}

// Function to get the deployed contract address
async function getContractAddress(): Promise<string> {
  const networks: { [key: string]: { address: string } } = Register.networks;
  let networkId: string | undefined;

  // Iterate over keys of networks object in Register.json
  for (const key of Object.keys(networks)) {
    networkId = key;
    break; // Get the first network ID
  }

  if (networkId === undefined) {
    throw new Error("No network ID found in the contract.");
  }

  return networks[networkId].address;
}

// Function to register a user
export async function registerUser(did: string, ipfsHash: string) {
  console.log("Starting user registration...");
  const { provider, signer } = (await connectToWeb3()) as {
    provider: ethers.providers.Web3Provider;
    signer: ethers.providers.JsonRpcSigner;
  };
  if (!provider || !signer) {
    throw new Error("Failed to connect to Web3 provider or signer.");
  }

  const contractAddress = await getContractAddress(); // Get contract address dynamically

  const contract = new ethers.Contract(contractAddress, Register.abi, signer);

  try {
    console.log("Calling registerResident function...");
    // Call the registerResident function of the contract
    const tx = await contract.registerResident(did, ipfsHash);
    await tx.wait();
    console.log("User registration successful:", tx);
    return tx;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

// Function to verify a user
export async function verifyUser(userAddress: string) {
  console.log("Starting user verification...");
  const { provider } = (await connectToWeb3()) as {
    provider: ethers.providers.Web3Provider;
    signer: ethers.providers.JsonRpcSigner;
  };
  if (!provider) {
    throw new Error("Failed to connect to Web3 provider.");
  }

  const contractAddress = await getContractAddress(); // Get contract address dynamically

  const contract = new ethers.Contract(contractAddress, Register.abi, provider);

  try {
    console.log("Calling verifyResident function...");
    // Call the verifyResident function of the contract
    const result = await contract.verifyResident(userAddress);
    console.log("User verification successful:", result);
    return result;
  } catch (error) {
    console.error("Error verifying user:", error);
    throw error;
  }
}
