import { DID } from "dids";
// import IPFS from "ipfs-core";
// import Web3 from "web3";
// import RegisterContract from "./contracts/Register.json";
// import { ImportCandidate } from "ipfs-core-types/src/utils";

export const generateDid = () => {
  const did = new DID();
  return did.toString();
};

// export const storeOnIpfs = async (data: ImportCandidate) => {
//   const node = await IPFS.create();
//   const { path } = await node.add(data);
//   return path;
// };

// const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
// const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Replace with your deployed contract address
// const registerContract = new web3.eth.Contract(
//   RegisterContract.abi,
//   contractAddress
// );

// export const registerOnBlockchain = async (did, ipfsHash) => {
//   const accounts = await web3.eth.getAccounts();
//   try {
//     await registerContract.methods
//       .register(did, ipfsHash)
//       .send({ from: accounts[0] });
//     return true;
//   } catch (error) {
//     console.error(error);
//     return false;
//   }
// };
