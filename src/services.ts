import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import * as KeyResolver from "key-did-resolver";
import { create } from "ipfs-core";

export const generateDid = async () => {
  const seed = new Uint8Array(32); // Replace with secure entropy
  const provider = new Ed25519Provider(seed);
  const did = new DID({ provider, resolver: KeyResolver.getResolver() });

  await did.authenticate();
  const didId = did.id;

  const ipfs = await create();
  const { cid } = await ipfs.add(JSON.stringify("Hello world"));
  const ipfsHash = cid.toString();

  return { didId, ipfsHash };
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
