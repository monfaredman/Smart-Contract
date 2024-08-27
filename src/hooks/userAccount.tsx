import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useDialog } from "@/contexts/dialogContext";

export const useEthereumAccount = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const { showDialog, hideDialog } = useDialog();

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      if (window.ethereum) {
        setIsMetaMaskInstalled(true);
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);

          // Listen for account changes and disconnections
          window.ethereum.on("accountsChanged", async (accounts: string[]) => {
            if (accounts.length > 0) {
              handleAccountChange(accounts[0], provider, signer!);
            } else {
              handleAccountDisconnect();
              showDialog(); // Show the dialog when MetaMask is disconnected
            }
          });

          window.ethereum.on("disconnect", () => {
            handleAccountDisconnect();
            showDialog();
          });

          // Request accounts and handle connection
          await provider.send("eth_requestAccounts", []); // Prompts user to connect their wallet

          const signer = await provider.getSigner();
          const account = await signer.getAddress();

          if (account) {
            handleAccountChange(account, provider, signer);
          }
        } catch (error) {
          toast.error((error as Error).message);
          showDialog(); // Show the dialog on error
        }
      } else {
        setIsMetaMaskInstalled(false);
        toast.error("MetaMask is not installed");
      }
      setIsLoading(false);
    };

    init();

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountDisconnect
        );
        window.ethereum.removeListener("disconnect", handleAccountDisconnect);
      }
    };
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
    signer,
  };
};
