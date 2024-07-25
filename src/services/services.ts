import HeliaSingleton from "./heliaInstance"; // Adjust the import path accordingly
import { Ed25519Provider } from "key-did-provider-ed25519";
import { DID } from "dids";
import KeyResolver from "key-did-resolver";
import { randomBytes } from "@stablelib/random";
import { CID } from 'multiformats/cid';

// Define the UserInfo interface
interface UserInfo {
  firstName: string;
  lastName: string;
  passportNo: string;
  birthday: string;
  docFile?: File;
  did?: string;
}

// Function to read a file as an ArrayBuffer
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Function to generate DID
const didGenerator = async (): Promise<string> => {
  try {
    const seed = randomBytes(32);
    const provider = new Ed25519Provider(seed);
    const did = new DID({ provider, resolver: KeyResolver.getResolver() });
    await did.authenticate();
    return did.id;
  } catch (error) {
    console.error("Error generating DID:", error);
    throw new Error("Failed to generate DID.");
  }
};

// Function to convert CID hash string to CID object
const convertCidStringToObject = (cidString: string): CID | null => {
  try {
    return CID.parse(cidString);
  } catch (error) {
    console.error("Error converting CID string to object:", error);
    return null;
  }
};

// Function to store userInfo JSON on IPFS and return the CID
const storeUserInfo = async (userInfo: UserInfo): Promise<CID> => {
  try {
    const { jsonClient } = await HeliaSingleton.getInstance();
    return await jsonClient.add(userInfo);
  } catch (error) {
    console.error("Error storing userInfo on IPFS:", error);
    throw new Error("Failed to store userInfo on IPFS.");
  }
};

// Function to store docFile on IPFS and return the CID
const storeDocFile = async (docFile?: File): Promise<string | null> => {
  if (!docFile) return null;

  try {
    const { fsClient } = await HeliaSingleton.getInstance();
    const arrayBuffer = await readFileAsArrayBuffer(docFile);
    const uint8Array = new Uint8Array(arrayBuffer);

    const entries = fsClient.addAll([
      { path: docFile.name, content: uint8Array },
    ]);

    let fileHash: string | null = null;
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
export const retrieveUserInfo = async (userInfoCid: string, type: number): Promise<any> => {
  let userinfo: CID | null = null;
  if (type === 2) {
    userinfo = convertCidStringToObject(userInfoCid);
  } else {
    userinfo = CID.parse(userInfoCid);
  }

  try {
    const { jsonClient } = await HeliaSingleton.getInstance();
    if (!jsonClient) {
      throw new Error("jsonClient is undefined. Ensure HeliaSingleton.getInstance() is working correctly.");
    }
    if (!userinfo) {
      throw new Error("userInfoCid is undefined. Ensure a valid CID is provided.");
    }

    const retrievedUserInfo = await jsonClient.get(userinfo);
    if (!retrievedUserInfo) {
      throw new Error(`Failed to retrieve userInfo with CID: ${userinfo}`);
    }

    return retrievedUserInfo;
  } catch (error) {
    console.error("Error retrieving userInfo from IPFS:", error);
    throw new Error(`Failed to retrieve userInfo from IPFS. Details: ${error.message}`);
  }
};

// Function to retrieve docFile from IPFS using its CID
export const retrieveDocFile = async (fileHash: string): Promise<Uint8Array | null> => {
  if (!fileHash) return null;

  try {
    const { fsClient } = await HeliaSingleton.getInstance();
    const fileData: Uint8Array[] = [];
    for await (const chunk of fsClient.cat(fileHash)) {
      fileData.push(chunk);
    }
    return new Uint8Array(fileData.flat());
  } catch (error) {
    console.error("Error retrieving document file from IPFS:", error);
    throw new Error("Failed to retrieve document file from IPFS.");
  }
};

// Main function to generate DID, store data, and retrieve/verify it
export const generateDIDAndStoreData = async (userInfo: UserInfo) => {
  const { firstName, lastName, passportNo, birthday, docFile } = userInfo;

  try {
    console.info(userInfo);

    const didId = await didGenerator();

    // Store userInfo JSON on IPFS
    const userInfoCid = await storeUserInfo({ ...userInfo, did: didId });

    // Store document file on IPFS (if provided)
    const fileHash = await storeDocFile(docFile);

    // Retrieve the userInfo from IPFS using its CID
    const retrievedUserInfos = await retrieveUserInfo(userInfoCid.toString(), 1);

    // Retrieve the docFile from IPFS using its CID
    const retrievedFile = await retrieveDocFile(fileHash!);

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
