import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { createHelia } from "helia";
import { strings } from "@helia/strings";
// import { filesFromBlob } from "@helia/files";
import { unixfs } from "@helia/unixfs";

interface UserInfo {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  birthday: string;
  docFile: File | null;
}

export const generateDIDAndStoreData = async (userInfo: UserInfo) => {
  console.log(userInfo);
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

  // Step 3: Initialize Helia and create strings and files instances
  console.log("Initializing Helia");
  const helia = await createHelia();
  const s = strings(helia);
  // const f = filesFromBlob(helia);
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
    const fileBlob = new Blob([userInfo.docFile], {
      type: userInfo.docFile.type,
    });
    // const fileResult = await f.add({ content: fileBlob });
    // create an empty dir and a file, then add the file to the dir
    const emptyDirCid = await f.addDirectory();
    const fileCid = await f.addBytes(fileBlob);
    const updateDirCid = await f.cp(fileCid, emptyDirCid, "foo.txt");

    for await (const entry of f.addAll([
      {
        path: "foo.txt",
        content: fileBlob,
      },
    ])) {
      console.info(entry);
    }

    // const fileResult = await f.add({ content: fileBlob });
    // ipfsDocFileHash = fileResult.cid.toString();
    // console.log(`Document file stored in IPFS with hash: ${ipfsDocFileHash}`);
    console.log({ didId, ipfsUserInfoHash, fileCid });
  }

  // Step 6: Set isRegistered to false for newly generated DID
  console.log("Setting isRegistered to false for newly generated DID");
  const isRegistered = false;

  console.log("DID and IPFS storage process completed");
  // console.log({ didId, ipfsUserInfoHash, ipfsDocFileHash, isRegistered });
  // return { didId, ipfsUserInfoHash, ipfsDocFileHash, isRegistered };
  return { didId, ipfsUserInfoHash, isRegistered };
};
