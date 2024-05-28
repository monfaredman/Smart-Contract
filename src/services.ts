import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { createHelia } from "helia";
import { strings } from "@helia/strings";

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dob: string;
}

export const generateDIDAndStoreData = async (userInfo: UserInfo) => {
  console.log("Starting the DID and IPFS storage process");

  // Step 1: Generate seed and create provider
  console.log("Generating seed and creating Ed25519 provider");
  const seed = new Uint8Array(32); // Replace with secure entropy
  const provider = new Ed25519Provider(seed);

  // Step 2: Create and authenticate DID
  console.log("Creating and authenticating DID");
  const did = new DID({ provider, resolver: KeyResolver.getResolver() });

  await did.authenticate();
  const didId = did.id;
  console.log(`DID authenticated successfully: ${didId}`);

  // Step 3: Initialize Helia and create strings instance
  console.log("Initializing Helia");
  const helia = await createHelia();
  const s = strings(helia);
  console.log("Helia initialized successfully");

  // Step 4: Convert userInfo to JSON string and store in IPFS
  console.log("Converting userInfo to JSON string and storing in IPFS");
  const userInfoString = JSON.stringify(userInfo);
  const ipfsHash = await s.add(userInfoString);
  console.log(`Data stored in IPFS with hash: ${ipfsHash}`);

  // Step 5: Set isRegistered to false for newly generated DID
  console.log("Setting isRegistered to false for newly generated DID");
  const isRegistered = false;

  console.log("DID and IPFS storage process completed");
  return { didId, ipfsHash, isRegistered };
};
