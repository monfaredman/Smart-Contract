import { createHelia, Helia } from "helia";
import { json, JsonClient } from "@helia/json";
import { unixfs, UnixfsClient } from "@helia/unixfs";

class HeliaSingleton {
  private static helia: Helia | null = null;
  private static jsonClient: JsonClient | null = null;
  private static fsClient: UnixfsClient | null = null;

  public static async getInstance(): Promise<{
    helia: Helia;
    jsonClient: JsonClient;
    fsClient: UnixfsClient;
  }> {
    if (!HeliaSingleton.helia) {
      HeliaSingleton.helia = await createHelia();
      HeliaSingleton.jsonClient = json(HeliaSingleton.helia);
      HeliaSingleton.fsClient = unixfs(HeliaSingleton.helia);
    }
    return {
      helia: HeliaSingleton.helia,
      jsonClient: HeliaSingleton.jsonClient,
      fsClient: HeliaSingleton.fsClient,
    };
  }
}

export default HeliaSingleton;
