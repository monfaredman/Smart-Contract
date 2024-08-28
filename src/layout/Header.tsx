import React, { useState, MouseEvent } from "react";
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
import { toast } from "react-toastify";
import { useEthereumAccount } from "@/hooks/userAccount";

declare global {
  interface Window {
    ethereum: any;
  }
}

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const {
    isLoading,
    isMetaMaskInstalled,
    isConnected,
    accounts,
    selectedAccount,
    balance,
    connectToMetaMask,
    logout,
  } = useEthereumAccount();

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography
          variant='h4'
          component='div'
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
          <CircularProgress color='inherit' />
        ) : isMetaMaskInstalled ? (
          isConnected ? (
            <>
              <IconButton
                size='large'
                edge='end'
                color='inherit'
                aria-label='profile'
                aria-controls='menu-appbar'
                aria-haspopup='true'
                onClick={handleMenuOpen}
                sx={{ ml: 2 }}
              >
                <Avatar sx={{ width: "4rem", height: "4rem" }}>
                  {selectedAccount && selectedAccount.slice(0, 4)}...
                </Avatar>
              </IconButton>
              <Menu
                id='menu-appbar'
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
                          <span
                            style={{ fontWeight: "bold", fontSize: "14px" }}
                          >
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
            <LoadingButton
              color='inherit'
              onClick={connectToMetaMask}
              loading={isLoading}
            >
              Connect to MetaMask
            </LoadingButton>
          )
        ) : (
          <Button
            color='inherit'
            onClick={() =>
              window.open("https://metamask.io/download.html", "_blank")
            }
          >
            Install MetaMask
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
