import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { createHelia } from "helia";
import { strings } from "@helia/strings";

export const generateDIDAndStoreData = async () => {
  const seed = new Uint8Array(32); // Replace with secure entropy
  const provider = new Ed25519Provider(seed);
  const did = new DID({ provider, resolver: KeyResolver.getResolver() });

  await did.authenticate();
  const didId = did.id;

  const helia = await createHelia();
  const s = strings(helia);

  const ipfsHash = await s.add("hello world");

  const isRegistered = false; // Set isRegistered to false for newly generated DID

  return { didId, ipfsHash, isRegistered };
};
