import Web3 from "web3";

declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
  }
}

const GANACHE_RPC_URL = "http://127.0.0.1:7545";

const getWeb3 = (): Promise<Web3> =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", async () => {
      if (GANACHE_RPC_URL) {
        const web3 = new Web3(GANACHE_RPC_URL);
        try {
          const accounts = await web3.eth.getAccounts();
          if (accounts.length > 0) {
            resolve(web3);
            return;
          } else {
            reject(new Error("No accounts found on Ganache"));
          }
        } catch (error) {
          console.error("Failed to connect to Ganache:", error);
        }
      }

      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else if (window.web3) {
        resolve(new Web3(window.web3.currentProvider));
      } else {
        reject(new Error("Must install MetaMask"));
      }
    });
  });

export default getWeb3;
