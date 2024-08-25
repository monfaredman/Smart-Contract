import { useState, useEffect } from "react";
import Web3 from "web3";
import { toast } from "react-toastify";

export const useEthereumAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      if (window.ethereum) {
        setIsMetaMaskInstalled(true);
        try {
          const web3 = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          if (accounts.length > 0) {
            handleAccountChange(accounts[0], web3);
            window.ethereum.on(
              "accountsChanged",
              async (accounts: string[]) => {
                if (accounts.length > 0) {
                  handleAccountChange(accounts[0], web3);
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

  const handleAccountChange = async (account: string, web3: Web3) => {
    setAccounts([account]);
    setSelectedAccount(account);
    setIsConnected(true);

    // Get balance of the account
    const balanceWei = await web3.eth.getBalance(account);
    const balanceEth = web3.utils.fromWei(balanceWei, "ether");
    setBalance(balanceEth);
  };

  const handleAccountDisconnect = () => {
    setAccounts([]);
    setSelectedAccount(null);
    setIsConnected(false);
    setBalance(null);
  };

  return {
    isLoading,
    isMetaMaskInstalled,
    isConnected,
    accounts,
    selectedAccount,
    balance,
  };
};
