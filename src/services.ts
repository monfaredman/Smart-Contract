import HeliaSingleton from "./heliaInstance"; // Adjust the import path accordingly
import { Ed25519Provider } from "key-did-provider-ed25519";
import { DID } from "dids";
import KeyResolver from "key-did-resolver";
import { randomBytes } from "@stablelib/random";
import { CID } from 'multiformats/cid'

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
    console.error("Error generating DID:", error);
    throw new Error("Failed to generate DID.");
  }
};

// Function to convert CID hash string to CID object
const convertCidStringToObject = (cidString) => {
  try {
    // Convert the string to a CID object
    const cid = CID.parse(cidString);
    return cid;
  } catch (error) {
    console.error("Error converting CID string to object:", error);
    return null;
  }
};

// Function to store userInfo JSON on IPFS and return the CID
const storeUserInfo = async (userInfo) => {
  try {
    const { jsonClient } = await HeliaSingleton.getInstance();
    const userInfoCid = await jsonClient.add(userInfo);
    return userInfoCid;
  } catch (error) {
    console.error("Error storing userInfo on IPFS:", error);
    throw new Error("Failed to store userInfo on IPFS.");
  }
};

// Function to store docFile on IPFS and return the CID
const storeDocFile = async (docFile) => {
  if (!docFile) return null;

  try {
    const { fsClient } = await HeliaSingleton.getInstance();
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
    }

    return fileHash;
  } catch (error) {
    console.error("Error storing document file on IPFS:", error);
    throw new Error("Failed to store document file on IPFS.");
  }
};

// Function to retrieve userInfo from IPFS using its CID
export const retrieveUserInfo = async (userInfoCid, type) => {
  let userinfo = null;
  if (type === 2) {
    userinfo = convertCidStringToObject(userInfoCid);
  } else {
    userinfo = userInfoCid;
  }
  try {
    const { jsonClient } = await HeliaSingleton.getInstance();
    if (!jsonClient) {
      throw new Error(
        "jsonClient is undefined. Ensure HeliaSingleton.getInstance() is working correctly."
      );
    }
    if (!userinfo) {
      throw new Error(
        "userInfoCid is undefined. Ensure a valid CID is provided."
      );
    }

    const retrievedUserInfo = await jsonClient.get(userinfo);
    if (!retrievedUserInfo) {
      throw new Error(`Failed to retrieve userInfo with CID: ${userinfo}`);
    }

    return retrievedUserInfo;
  } catch (error) {
    console.error("Error retrieving userInfo from IPFS:", error);
    throw new Error(
      `Failed to retrieve userInfo from IPFS. Details: ${error.message}`
    );
  }
};

// Function to retrieve docFile from IPFS using its CID
export const retrieveDocFile = async (fileHash) => {
  if (!fileHash) return null;

  try {
    const { fsClient } = await HeliaSingleton.getInstance();
    const fileData = [];
    for await (const chunk of fsClient.cat(fileHash)) {
      fileData.push(...chunk);
    }
    const retrievedFile = new Uint8Array(fileData);
    return retrievedFile;
  } catch (error) {
    console.error("Error retrieving document file from IPFS:", error);
    throw new Error("Failed to retrieve document file from IPFS.");
  }
};

// Main function to generate DID, store data, and retrieve/verify it
export const generateDIDAndStoreData = async (userInfo) => {
  const { firstName, lastName, passportNo, birthday, docFile } = userInfo;

  try {
    console.info(userInfo);

    const didId = await didGenerator();

    // Store userInfo JSON on IPFS
    const userInfoCid = await storeUserInfo({ ...userInfo, did: didId });

    // Store document file on IPFS (if provided)
    const fileHash = await storeDocFile(docFile);

    // Retrieve the userInfo from IPFS using its CID
    const retrievedUserInfos = await retrieveUserInfo(userInfoCid, 1);

    // Retrieve the docFile from IPFS using its CID
    const retrievedFile = await retrieveDocFile(fileHash);
    // Verify retrieved data (example: log and compare)
    // const userInfoMatch = JSON.stringify(retrievedUserInfo) === JSON.stringify(userInfo);

    return {
      userInfoCid: userInfoCid.toString(),
      fileHash,
      retrievedUserInfos,
      retrievedFile,
      didId,
    };
  } catch (error) {
    console.error("Error generating DID and storing data on IPFS:", error);
    throw new Error("Failed to generate DID and store data.");
  }
};
