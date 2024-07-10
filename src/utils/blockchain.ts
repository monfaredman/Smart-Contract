import { ethers } from "ethers";
import UserContract from "../../build/contracts/UserContract.json";

// Function to connect to Web3 provider
export async function connectToWeb3() {
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
  const networks: { [key: string]: { address: string } } =
    UserContract.networks;
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

export async function registerUser(
  did: string,
  ipfsHash: string,
  ethValue: string
) {
  console.log("Starting user registration...");
  const { provider, signer } = (await connectToWeb3()) as {
    provider: ethers.providers.Web3Provider;
    signer: ethers.providers.JsonRpcSigner;
  };
  if (!provider || !signer) {
    throw new Error("Failed to connect to Web3 provider or signer.");
  }
  console.log("provider", provider);
  console.log("signer", signer);

  const contractAddress = await getContractAddress(); // Get contract address dynamically
  console.log("contractAddress", contractAddress);

  const contract = new ethers.Contract(
    contractAddress,
    UserContract.abi,
    signer
  );

  try {
    const valueInWei = ethers.utils.parseEther(ethValue); // Convert ETH to Wei
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const balanceInEther = ethers.utils.formatEther(balance);

    if (parseFloat(balanceInEther) < parseFloat(ethValue)) {
      throw new Error("Insufficient funds to complete the transaction.");
    }

    console.log("Calling registerResident function...");
    // Call the registerResident function of the contract with ETH value
    const tx = await contract.registerResident(did, ipfsHash, {
      value: valueInWei,
    });
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

  const contract = new ethers.Contract(
    contractAddress,
    UserContract.abi,
    provider
  );

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

// Function to get the user's address
export async function getUserAddress() {
  console.log("Fetching user address...");
  const { signer } = (await connectToWeb3()) as {
    provider: ethers.providers.Web3Provider;
    signer: ethers.providers.JsonRpcSigner;
  };
  if (!signer) {
    throw new Error("Failed to connect to Web3 signer.");
  }

  try {
    const address = await signer.getAddress();
    console.log("User address:", address);
    return address;
  } catch (error) {
    console.error("Error getting user address:", error);
    throw error;
  }
}

// Function to get the user's balance
export async function getUserBalance() {
  console.log("Fetching user balance...");
  const { provider, signer } = (await connectToWeb3()) as {
    provider: ethers.providers.Web3Provider;
    signer: ethers.providers.JsonRpcSigner;
  };
  if (!provider || !signer) {
    throw new Error("Failed to connect to Web3 provider or signer.");
  }

  try {
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const balanceInEther = ethers.utils.formatEther(balance);
    console.log("User balance (ETH):", balanceInEther);
    return balanceInEther;
  } catch (error) {
    console.error("Error getting user balance:", error);
    throw error;
  }
}

// Function to disconnect the Web3 provider
export function disconnect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      window.ethereum.selectedAddress = null;
      console.log("Disconnected from Web3 provider");
    } catch (error) {
      console.error("Error disconnecting from web3:", error);
    }
  } else {
    console.error("No Ethereum provider found.");
  }
}

export async function deployContractWithValue(
  destinationAddress: string,
  ethValue: string
) {
  console.log("Starting to send Ether...");
  const { provider, signer } = (await connectToWeb3()) as {
    provider: ethers.providers.Web3Provider;
    signer: ethers.providers.JsonRpcSigner;
  };
  if (!provider || !signer) {
    throw new Error("Failed to connect to Web3 provider or signer.");
  }
  console.log("provider", provider);
  console.log("signer", signer);

  try {
    const valueInWei = ethers.utils.parseEther(ethValue); // Convert ETH to Wei
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const balanceInEther = ethers.utils.formatEther(balance);

    if (parseFloat(balanceInEther) < parseFloat(ethValue)) {
      throw new Error("Insufficient funds to complete the transaction.");
    }

    console.log("Sending Ether...");
    // Send the specified amount of Ether to the destination address
    const tx = await signer.sendTransaction({
      to: destinationAddress,
      value: valueInWei,
    });
    await tx.wait();
    console.log("Ether sent successfully:", tx);
    return tx;
  } catch (error) {
    console.error("Error sending Ether:", error);
    throw error;
  }
}
