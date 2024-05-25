import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";

export const useEthereumAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      if (window.ethereum) {
        setIsMetaMaskInstalled(true);
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []); // Prompts user to connect their wallet

          // Get the signer
          const signer = await provider.getSigner();

          // Fetch the address
          const account = await signer.getAddress();

          if (account) {
            handleAccountChange(account, provider, signer);
            window.ethereum.on(
              "accountsChanged",
              async (accounts: string[]) => {
                if (accounts.length > 0) {
                  handleAccountChange(accounts[0], provider, signer);
                } else {
                  handleAccountDisconnect();
                }
              }
            );
          }
        } catch (error) {
          toast.error((error as Error).message);
        }
      } else {
        setIsMetaMaskInstalled(false);
        toast.error("MetaMask is not installed");
      }
      setIsLoading(false);
    };

    init();
  }, []);

  const handleAccountChange = async (
    account: string,
    provider: ethers.BrowserProvider,
    signer: ethers.Signer
  ) => {
    setAccounts([account]);
    setSelectedAccount(account);
    setSigner(signer);
    setIsConnected(true);

    const balanceWei = await provider.getBalance(account);
    const balanceEth = ethers.formatEther(balanceWei);
    setBalance(balanceEth);
  };

  const handleAccountDisconnect = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setIsConnected(false);
    setBalance(null);
    setSigner(null);
  };

  return {
    isLoading,
    isMetaMaskInstalled,
    isConnected,
    accounts,
    selectedAccount,
    balance,
    signer, // Exporting the signer
  };
};
