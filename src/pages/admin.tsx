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
  Tabs,
  Tab,
} from "@mui/material";
import { toast } from "react-toastify";
import { fakeAuthProvider } from "@/middleware/auth";

const GANACHE_RPC_URL = "http://127.0.0.1:7545"; // Ganache RPC URL

const Admin = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [networkBalance, setNetworkBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [tabIndex, setTabIndex] = useState(0);

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

  const adminLogout = async () => {
    try {
      await contract.methods.adminLogout().send({ from: accounts[0] });
      await fakeAuthProvider.logoutAdmin();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchRegisteredUsers = async () => {
    if (contract) {
      try {
        const users = await contract.methods
          .getAllRegisteredUsersDIDs()
          .call({ from: accounts[0] });
        setRegisteredUsers(users);
      } catch (error) {
        toast.error(error.message);
        console.log(2);
      }
    }
  };

  const fetchNetworkBalance = async () => {
    try {
      const balance = await contract.methods
        .getNetworkBalance()
        .call({ from: accounts[0] });
      setNetworkBalance(web3.utils.fromWei(balance, "ether"));
    } catch (error) {
      toast.error(error.message);
      console.log(1);
    }
  };

  const handleWithdraw = async () => {
    try {
      fetchNetworkBalance();
      if (withdrawAmount > networkBalance) {
        toast.error("Insufficient inventory");
        return;
      }
      const amountWei = web3.utils.toWei(withdrawAmount, "ether");
      await contract.methods.withdraw(amountWei).send({ from: accounts[0] });
      setWithdrawAmount("");
      fetchNetworkBalance(); // Refresh balance after withdrawal
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleChangeTab = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    if (tabIndex === 0) {
      fetchRegisteredUsers();
    } else if (tabIndex === 1) {
      fetchNetworkBalance();
    }
  }, [tabIndex, contract]);

  return (
    <Container>
      <Box my={4}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant='h3' component='h1' gutterBottom>
            Admin Dashboard
          </Typography>
          <Button
            variant='outlined'
            size='small'
            color='error'
            style={{ height: "3rem" }}
            onClick={adminLogout}
          >
            Logout
          </Button>
        </Box>
        <Tabs value={tabIndex} onChange={handleChangeTab}>
          <Tab label='Registered Users' />
          <Tab label='Network Balance' />
          <Tab label='Withdraw Funds' />
        </Tabs>
        {tabIndex === 0 && (
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
        )}
        {tabIndex === 1 && (
          <Box my={4}>
            <Typography variant='h5' component='h2'>
              Network Balance: {networkBalance} ETH
            </Typography>
          </Box>
        )}
        {tabIndex === 2 && (
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
            >
              Withdraw
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Admin;
