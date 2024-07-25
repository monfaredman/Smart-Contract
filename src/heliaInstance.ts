import { createHelia } from "helia";
import { json } from "@helia/json";
import { unixfs } from "@helia/unixfs";

class HeliaSingleton {
    static helia = null;
    static jsonClient = null;
    static fsClient = null;
  
    static async getInstance() {
      // Check if instance exists in localStorage
      const instanceExists = localStorage.getItem('HeliaInstance');
  
      if (!HeliaSingleton.helia && instanceExists) {
        // Reinitialize the instance
        HeliaSingleton.helia = await createHelia();
        HeliaSingleton.jsonClient = json(HeliaSingleton.helia);
        HeliaSingleton.fsClient = unixfs(HeliaSingleton.helia);
      } else if (!HeliaSingleton.helia) {
        // Create new instance and store flag in localStorage
        HeliaSingleton.helia = await createHelia();
        HeliaSingleton.jsonClient = json(HeliaSingleton.helia);
        HeliaSingleton.fsClient = unixfs(HeliaSingleton.helia);
  
        localStorage.setItem('HeliaInstance', 'created');
      }
  
      return {
        helia: HeliaSingleton.helia,
        jsonClient: HeliaSingleton.jsonClient,
        fsClient: HeliaSingleton.fsClient,
      };
    }

  }
  
  export default HeliaSingleton;
  