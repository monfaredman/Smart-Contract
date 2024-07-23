// // services/index.js
// import { createHelia } from "helia";
// import { unixfs } from "@helia/unixfs";
// import { Ed25519Provider } from "key-did-provider-ed25519";
// import { DID } from "dids";
// import KeyResolver from "key-did-resolver";
// import { randomBytes } from "@stablelib/random";

// export const generateDIDAndStoreData = async (userInfo) => {
//   try {
//     // Generate a new key pair for the DID
//     const seed = randomBytes(32);
//     const provider = new Ed25519Provider(seed);
//     const did = new DID({ provider, resolver: KeyResolver.getResolver() });
//     await did.authenticate();

//     // Create the DID ID
//     const didId = did.id;

//     // Initialize Helia IPFS client
//     const helia = await createHelia();
//     const fs = unixfs(helia);

//     // Prepare user info for IPFS
//     const { firstName, lastName, passportNo, birthday, docFile } = userInfo;

//     // Convert the file to a buffer
//     const arrayBuffer = await docFile.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);

//     // Upload the document to IPFS
//     const docResult = await fs.addBytes(buffer);
//     const docHash = docResult.cid.toString();

//     // Store user info with document hash
//     const userInfoWithDoc = {
//       firstName,
//       lastName,
//       passportNo,
//       birthday,
//       docHash,
//     };

//     // Upload user info to IPFS
//     const userInfoBuffer = Buffer.from(JSON.stringify(userInfoWithDoc));
//     const userInfoResult = await fs.addBytes(userInfoBuffer);
//     const ipfsUserInfoHash = userInfoResult.cid.toString();

//     return { didId, ipfsUserInfoHash };
//   } catch (error) {
//     console.error("Error generating DID and storing data on IPFS:", error);
//     throw new Error("Failed to generate DID and store data.");
//   }
// };

import { createHelia } from "helia";
import { json } from "@helia/json";
import { unixfs } from "@helia/unixfs";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { DID } from "dids";
import KeyResolver from "key-did-resolver";
import { randomBytes } from "@stablelib/random";
// Import FileSaver.js for browser file downloads
// import { saveAs } from "file-saver";

// Function to read a file as an ArrayBuffer
const readFileAsArrayBuffer = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Function to generate DID
const didGenerator = async () => {
  try {
    // Generate a new key pair for the DID
    const seed = randomBytes(32);
    const provider = new Ed25519Provider(seed);
    const did = new DID({ provider, resolver: KeyResolver.getResolver() });
    await did.authenticate();

    // Create the DID ID
    const didId = did.id;
    return didId;
  } catch (error) {
    console.error("Error generating DID and storing data on IPFS:", error);
    throw new Error("Failed to generate DID and store data.");
  }
};

// Function to store userInfo JSON on IPFS and return the CID
const storeUserInfo = async (userInfo, jsonClient) => {
  try {
    const userInfoCid = await jsonClient.add(userInfo);
    console.log("Stored userInfo CID:", userInfoCid.toString());
    return userInfoCid;
  } catch (error) {
    console.error("Error storing userInfo on IPFS:", error);
    throw new Error("Failed to store userInfo on IPFS.");
  }
};

// Function to store docFile on IPFS and return the CID
const storeDocFile = async (docFile, fsClient) => {
  if (!docFile) return null;

  try {
    const arrayBuffer = await readFileAsArrayBuffer(docFile);
    const uint8Array = new Uint8Array(arrayBuffer);

    const entries = fsClient.addAll([
      {
        path: docFile.name,
        content: uint8Array,
      },
    ]);

    let fileHash = null;
    for await (const entry of entries) {
      fileHash = entry.cid.toString();
      console.log("Stored document file CID:", fileHash);
    }

    return fileHash;
  } catch (error) {
    console.error("Error storing document file on IPFS:", error);
    throw new Error("Failed to store document file on IPFS.");
  }
};

// Function to retrieve userInfo from IPFS using its CID
const retrieveUserInfo = async (userInfoCid, jsonClient) => {
  try {
    const retrievedUserInfo = await jsonClient.get(userInfoCid);
    console.log("Retrieved userInfo:", retrievedUserInfo);
    return retrievedUserInfo;
  } catch (error) {
    console.error("Error retrieving userInfo from IPFS:", error);
    throw new Error("Failed to retrieve userInfo from IPFS.");
  }
};

// Function to retrieve docFile from IPFS using its CID
const retrieveDocFile = async (fileHash, fsClient) => {
  if (!fileHash) return null;

  try {
    const fileData = [];
    for await (const chunk of fsClient.cat(fileHash)) {
      fileData.push(...chunk);
      console.log("chunk", chunk);
    }
    const retrievedFile = new Uint8Array(fileData);
    console.log("Retrieved docFile:", retrievedFile);
    return retrievedFile;
  } catch (error) {
    console.error("Error retrieving document file from IPFS:", error);
    throw new Error("Failed to retrieve document file from IPFS.");
  }
};

// Function to download and save the docFile in the browser
// const downloadAndSaveDocFile = async (fileHash, fsClient) => {
//   const retrievedFile = await retrieveDocFile(fileHash, fsClient);
//   if (retrievedFile) {
//     // Create a Blob from the Uint8Array
//     const blob = new Blob([retrievedFile], {
//       type: "application/octet-stream",
//     });
//     // Use FileSaver.js to save the file
//     saveAs(blob, "retrievedFile");
//   }
// };

// Function to store the DID and IPFS CIDs in the smart contract
// const storeDIDInSmartContract = async (did, ipfsUserInfoHash, docHash) => {
//   try {
//     // Connect to the Ethereum network
//     const provider = new ethers.providers.Web3Provider(window.ethereum);
//     const signer = provider.getSigner();

//     // Get the contract instance
//     const contract = new ethers.Contract(
//       DID_REGISTRY_CONTRACT_ADDRESS,
//       DID_REGISTRY_ABI,
//       signer
//     );

//     // Call the smart contract function to store the data
//     const tx = await contract.storeUserInfo(did, ipfsUserInfoHash, docHash);
//     await tx.wait();

//     console.log("Stored DID and IPFS CIDs in the smart contract");
//   } catch (error) {
//     console.error("Error storing DID in smart contract:", error);
//     throw new Error("Failed to store DID in smart contract.");
//   }
// };

// Main function to generate DID, store data, and retrieve/verify it
export const generateDIDAndStoreData = async (userInfo) => {
  const { firstName, lastName, passportNo, birthday, docFile } = userInfo;

  try {
    console.info(userInfo);

    // Initialize Helia and its components
    const helia = await createHelia();
    const fsClient = unixfs(helia);
    const jsonClient = json(helia);

    const didId = await didGenerator();
    console.log("didId", didId);
    // Store userInfo JSON on IPFS
    const userInfoCid = await storeUserInfo(
      { ...userInfo, did: didId },
      jsonClient
    );

    // Store document file on IPFS (if provided)
    const fileHash = await storeDocFile(docFile, fsClient);

    // Retrieve the userInfo from IPFS using its CID
    const retrievedUserInfo = await retrieveUserInfo(userInfoCid, jsonClient);

    // Retrieve the docFile from IPFS using its CID
    const retrievedFile = await retrieveDocFile(fileHash, fsClient);

    // Verify retrieved data (example: log and compare)
    const userInfoMatch =
      JSON.stringify(retrievedUserInfo) === JSON.stringify(userInfo);
    console.log("Retrieved and Original userInfo match:", userInfoMatch);

    // Download and save the document file
    // if (fileHash) {
    //   await downloadAndSaveDocFile(fileHash, fsClient);
    // }

    // Store DID and IPFS CIDs in the smart contract
    // await storeDIDInSmartContract(didId, userInfoCid.toString(), fileHash);

    return {
      userInfoCid: userInfoCid.toString(),
      fileHash,
      userInfoMatch,
      retrievedFile,
      didId,
    };
  } catch (error) {
    console.error("Error generating DID and storing data on IPFS:", error);
    throw new Error("Failed to generate DID and store data.");
  }
};
