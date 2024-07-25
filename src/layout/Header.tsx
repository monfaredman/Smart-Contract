import React, { useState, useEffect, MouseEvent } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { LoadingButton } from "@mui/lab";
import Web3 from "web3";
import { toast } from "react-toastify";

declare global {
  interface Window {
    ethereum: any;
  }
}

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [balance, setBalance] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
            setAccounts(accounts);
            const account = accounts[0];
            setSelectedAccount(account);
            setIsConnected(true);

            // Get balance of the first account
            const balanceWei = await web3.eth.getBalance(account);
            const balanceEth = web3.utils.fromWei(balanceWei, "ether");
            setBalance(balanceEth);

            window.ethereum.on("accountsChanged", async (accounts: string[]) => {
              if (accounts.length > 0) {
                setAccounts(accounts);
                const account = accounts[0];
                setSelectedAccount(account);
                // Update balance on account change
                const balanceWei = await web3.eth.getBalance(account);
                const balanceEth = web3.utils.fromWei(balanceWei, "ether");
                setBalance(balanceEth);
              } else {
                // Handle account disconnection
                setAccounts([]);
                setSelectedAccount(null);
                setIsConnected(false);
                setBalance(null);
              }
            });
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

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const connectToMetaMask = async () => {
    setIsLoading(true);
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          const account = accounts[0];
          setAccounts(accounts);
          setSelectedAccount(account);
          setIsConnected(true);

          // Get balance
          const balanceWei = await web3.eth.getBalance(account);
          const balanceEth = web3.utils.fromWei(balanceWei, "ether");
          setBalance(balanceEth);

          window.ethereum.on("accountsChanged", async (accounts: string[]) => {
            if (accounts.length > 0) {
              setAccounts(accounts);
              const account = accounts[0];
              setSelectedAccount(account);

              // Update balance on account change
              const balanceWei = await web3.eth.getBalance(account);
              const balanceEth = web3.utils.fromWei(balanceWei, "ether");
              setBalance(balanceEth);
            } else {
              // Handle account disconnection
              setAccounts([]);
              setSelectedAccount(null);
              setIsConnected(false);
              setBalance(null);
            }
          });
        }
      } catch (error) {
        toast.error((error as Error).message);
      }
    }
    setIsLoading(false);
  };

  const installMetaMask = () => {
    window.open("https://metamask.io/download.html", "_blank");
  };

  const logout = () => {
    // Simulate disconnection by resetting the states
    setAccounts([]);
    setSelectedAccount(null);
    setIsConnected(false);
    setBalance(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h4"
          component="div"
          sx={{
            flexGrow: 1,
            color: "#fff",
            fontWeight: "bold",
            letterSpacing: 2,
          }}
        >
          DApp
        </Typography>
        {isLoading ? (
          <CircularProgress color="inherit" />
        ) : isMetaMaskInstalled ? (
          isConnected ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="profile"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                sx={{ ml: 2 }}
              >
                <Avatar sx={{ width: "4rem", height: "4rem" }}>
                  {selectedAccount && selectedAccount.slice(1, 5)}...
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem>
                  <h2>Connected Accounts:</h2>
                  <ul>
                    {Array.isArray(accounts) &&
                      accounts.map((account, index) => (
                        <li style={{ listStyle: "none" }} key={index}>
                          <span style={{ fontWeight: "bold", fontSize: "14px" }}>
                            {index + 1}
                          </span>{" "}
                          <span
                            style={{
                              color: "blue",
                              fontWeight: "bold",
                              fontSize: "20px",
                            }}
                          >
                            -
                          </span>{" "}
                          {account}
                        </li>
                      ))}
                  </ul>
                </MenuItem>
                <MenuItem>
                  <div>
                    <h3>Selected Account:</h3>
                    <p>{selectedAccount}</p>
                  </div>
                </MenuItem>
                <MenuItem>
                  <p style={{ color: "blue" }}>Balance: {balance} ETH</p>
                </MenuItem>
                <MenuItem
                  style={{ color: "red" }}
                  onClick={() => {
                    logout();
                    handleMenuClose();
                  }}
                >
                  Disconnect Wallet
                </MenuItem>
              </Menu>
            </>
          ) : (
            <LoadingButton color="inherit" onClick={connectToMetaMask} loading={isLoading}>
              Connect to MetaMask
            </LoadingButton>
          )
        ) : (
          <Button color="inherit" onClick={installMetaMask}>
            Install MetaMask
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
