import Web3 from "web3";

declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
  }
}

interface ContractAbi {
  name: string;
  type: string;
  inputs: { internalType: string; name: string; type: string }[];
  outputs?: { internalType: string; name: string; type: string }[];
  stateMutability?: string;
  constant?: boolean;
}

interface MyContract {
  abi: ContractAbi[];
  networks: { [networkId: string]: { address: string } };
}

// Adjust the ABI structure to match the ContractAbi interface
const abi: ContractAbi[] = [
  {
    name: "methodName",
    type: "function",
    inputs: [{ internalType: "uint256", name: "paramName", type: "uint256" }],
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  // Add other method definitions as needed
];

// Define MyContract object with the correct ABI structure
const MyContract: MyContract = {
  abi: abi,
  networks: {}, // Define networks here, assuming it's an object with network IDs as keys
};

const getWeb3 = (): Promise<Web3> =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.request({ method: "eth_requestAccounts" });
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else if (window.web3) {
        const web3 = new Web3(window.web3.currentProvider);
        resolve(web3);
      } else {
        // Display a user-friendly message to install MetaMask or similar
        reject(
          new Error(
            "Please install MetaMask or a similar Ethereum wallet extension."
          )
        );
      }
    });
  });

const getContract = async (web3: Web3): Promise<any> => {
  const networkId = await web3.eth.net.getId();
  // Use MyContract as expected
  const deployedNetwork = MyContract.networks[networkId.toString()];
  if (!deployedNetwork) {
    throw new Error("Contract not deployed on the current network");
  }
  const contract = new web3.eth.Contract(
    MyContract.abi as any, // Use 'as any' to bypass TypeScript check due to ABI typings
    deployedNetwork.address
  );
  return contract;
};

export { getWeb3, getContract };
