import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { createHelia } from "helia";
import { strings } from "@helia/strings";
import { unixfs } from "@helia/unixfs";
import { identifyService } from '@libp2p/identify';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
const randomBytes = require("randombytes");

interface UserInfo {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthday: string;
  docFile: File | null;
}

export const generateDIDAndStoreData = async (userInfo: UserInfo) => {
  try {
    console.log(userInfo);
    console.log("Starting the DID and IPFS storage process");

    // Step 1: Generate seed and create provider
    console.log("Generating seed and creating Ed25519 provider");
    const seed = randomBytes(32); // Secure entropy generation
    const provider = new Ed25519Provider(seed);

    // Step 2: Create and authenticate DID
    console.log("Creating and authenticating DID");
    const did = new DID({ provider, resolver: KeyResolver.getResolver() });

    await did.authenticate();
    const didId = did.id;
    console.log(`DID authenticated successfully: ${didId}`);

    // Step 3: Initialize Helia and create strings and files instances
    console.log("Initializing Helia");
    const helia = await createHelia({
      libp2p: {
        transports: [
          circuitRelayTransport()  // Add the circuit relay transport
        ],
        services: {
          identify: identifyService()  // Add the identify service
        },
        peerDiscovery: [
          // Add any necessary peer discovery services
        ],
        connectionManager: {
          // Configure connection manager settings if needed
        },
        relay: {
          enabled: true,
          hop: {
            enabled: true,
            active: true
          }
        },
        // Other necessary configurations
      }
    });
    console.log(55, helia);
    const s = strings(helia);
    const f = unixfs(helia);

    console.log("Helia initialized successfully");

    // Step 4: Convert userInfo to JSON string and store in IPFS
    console.log("Converting userInfo to JSON string and storing in IPFS");
    const userInfoString = JSON.stringify({
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      phoneNumber: userInfo.phoneNumber,
      birthday: userInfo.birthday,
    });
    const ipfsUserInfoHash = await s.add(userInfoString);
    console.log(`User info stored in IPFS with hash: ${ipfsUserInfoHash}`);

    // Step 5: Convert file to IPFS-compatible format and store in IPFS
    let ipfsDocFileHash = null;
    if (userInfo.docFile) {
      console.log(
        "Converting document file to IPFS-compatible format and storing in IPFS"
      );
      const fileArrayBuffer = await userInfo.docFile.arrayBuffer();
      const fileBytes = new Uint8Array(fileArrayBuffer);

      const fileCid = await f.addBytes(fileBytes);

      for await (const entry of f.addAll([
        {
          path: userInfo.docFile.name,
          content: fileBytes,
        },
      ])) {
        console.info(entry);
      }

      console.log(`Document file stored in IPFS with hash: ${fileCid}`);
      ipfsDocFileHash = fileCid.toString();
    }

    // Step 6: Set isRegistered to false for newly generated DID
    console.log("Setting isRegistered to false for newly generated DID");
    const isRegistered = false;

    console.log(
      "DID and IPFS storage process completed",
      didId,
      ipfsUserInfoHash,
      isRegistered
    );
    return { didId, ipfsUserInfoHash, isRegistered };
  } catch (error) {
    console.error("Error in DID and IPFS storage process: ", error);
    throw new Error(`DID and IPFS storage process failed: ${error.message}`);
  }
};
