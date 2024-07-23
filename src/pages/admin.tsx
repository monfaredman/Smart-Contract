import React, { useState, useEffect } from "react";
import Web3 from "web3";
import UserContract from "~/build/contracts/UserRegistration.json"; // Update the contract import
import {
  Container,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  Box,
  Grid,
  Paper,
} from "@mui/material";

const GANACHE_RPC_URL = "http://127.0.0.1:7545"; // Ganache RPC URL

const Admin = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [networkBalance, setNetworkBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const web3Instance = new Web3(
          new Web3.providers.HttpProvider(GANACHE_RPC_URL)
        );
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        setAccounts(accounts);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = UserContract.networks[networkId];
        if (deployedNetwork) {
          const instance = new web3Instance.eth.Contract(
            UserContract.abi,
            deployedNetwork.address
          );
          setContract(instance);
        } else {
          console.error("Contract not deployed on the detected network.");
        }
      } catch (error) {
        console.error(
          "Error initializing web3 or fetching transactions: ",
          error
        );
      }
    };
    init();
  }, []);

  useEffect(() => {
    const adminLogin = async () => {
      try {
        await contract.methods
          .adminLogin("admin", "password")
          .send({ from: accounts[0] });
        setAdminLoggedIn(true);
      } catch (error) {
        console.error("Admin login failed", error);
      }
    };
    adminLogin();
  }, [contract, accounts]);

  const adminLogout = async () => {
    try {
      await contract.methods.adminLogout().send({ from: accounts[0] });
      setAdminLoggedIn(false);
    } catch (error) {
      console.error("Admin logout failed", error);
    }
  };

  const fetchRegisteredUsers = async () => {
    try {
      const users = await contract.methods
        .getAllRegisteredUsersDIDs()
        .call({ from: accounts[0] });
      setRegisteredUsers(users);
    } catch (error) {
      console.error("Error fetching registered users", error);
    }
  };

  const fetchNetworkBalance = async () => {
    try {
      const balance = await contract.methods
        .getNetworkBalance()
        .call({ from: accounts[0] });
      setNetworkBalance(web3.utils.fromWei(balance, "ether"));
    } catch (error) {
      console.error("Error fetching network balance", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      const amountWei = web3.utils.toWei(withdrawAmount, "ether");
      await contract.methods.withdraw(amountWei).send({ from: accounts[0] });
      setWithdrawAmount("");
      fetchNetworkBalance(); // Refresh balance after withdrawal
    } catch (error) {
      console.error("Withdrawal failed", error);
    }
  };

  return (
    <Container>
      <Box my={4}>
        <Typography variant='h3' component='h1' gutterBottom>
          Admin Dashboard
        </Typography>
        <Grid container spacing={2} justifyContent='center'>
          <Grid item>
            <Button variant='contained' color='secondary' onClick={adminLogout}>
              Logout
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant='contained'
              color='primary'
              onClick={fetchRegisteredUsers}
            >
              Show Registered Users
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant='contained'
              color='primary'
              onClick={fetchNetworkBalance}
            >
              Show Network Balance
            </Button>
          </Grid>
        </Grid>
        <Box my={4}>
          <Typography variant='h5' component='h2'>
            Registered Users
          </Typography>
          <List>
            {registeredUsers.map((user, index) => (
              <ListItem key={index}>{user}</ListItem>
            ))}
          </List>
        </Box>
        <Box my={4}>
          <Typography variant='h5' component='h2'>
            Network Balance: {networkBalance} ETH
          </Typography>
        </Box>
        <Box my={4}>
          <Typography variant='h5' component='h2'>
            Withdraw Funds
          </Typography>
          <TextField
            label='Amount in ETH'
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            variant='outlined'
            fullWidth
            margin='normal'
          />
          <Button
            variant='contained'
            color='primary'
            onClick={handleWithdraw}
            fullWidth
          >
            Withdraw
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Admin;
