import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
} from "@mui/material";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import { fakeAuthProvider } from "@/middleware/auth";
import UserContract from "~/build/contracts/UserRegistration.json"; // Update the contract import

const GANACHE_RPC_URL = "http://127.0.0.1:7545"; // Ganache RPC URL

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userDID, setUserDID] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = new Web3(new Web3.providers.HttpProvider(GANACHE_RPC_URL));
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        console.log("Network ID:", networkId); // Debugging line

        const deployedNetwork = UserContract.networks[networkId];
        if (deployedNetwork) {
          console.log("Deployed Network:", deployedNetwork); // Debugging line
          const instance = new web3.eth.Contract(
            UserContract.abi,
            deployedNetwork.address
          );
          setContract(instance);
        } else {
          console.error("Contract not deployed on the detected network.");
        }

        const userData = localStorage.getItem("userData");
        if (userData) {
          const userObj = JSON.parse(userData);
          setUserDID(userObj.didId);
        } else {
          console.error("User data not found in local storage.");
          navigate("/register"); // Redirect to login if user data is not found
          return; // Exit early if no user data
        }
      } catch (error) {
        console.error(
          "Error initializing web3 or fetching transactions: ",
          error
        );
      }
    };

    init();
  }, [navigate]);

  useEffect(() => {
    fetchTransactions();
  }, [contract, userDID]);

  const fetchTransactions = async () => {
    if (contract && userDID && account) {
      console.log(55, userDID, account);
      try {
        console.log("Fetching transactions..."); // Debugging line
        const events = await contract.getPastEvents("Deposit", {
          filter: { userDID: userDID },
          fromBlock: 0, // You can specify the starting block number
          toBlock: "latest", // Or the ending block number
        });
        console.log("events", events);

        const parsedTransactions = await Promise.all(
          events.map(async (event) => {
            // Fetch the block details
            const web3 = new Web3(
              new Web3.providers.HttpProvider(GANACHE_RPC_URL)
            );
            // Ensure event.blockNumber is a number
            const blockNumber = Number(event.blockNumber);

            // Fetch the block details
            const block = await web3.eth.getBlock(blockNumber);

            // Convert block.timestamp to a number
            const timestamp = Number(block.timestamp);
            console.log("block", timestamp);
            return {
              type: event.event,
              amount: Web3.utils.fromWei(
                event.returnValues.amount || "0",
                "ether"
              ),
              timestamp: new Date(timestamp * 1000).toString(),
            };
          })
        );
        console.log("parsedTransactions", parsedTransactions);
        setTransactions(parsedTransactions);
      } catch (error) {
        console.error("Error fetching transactions: ", error);
      }
    } else {
      console.log("Waiting for contract, userDID, and account to be set."); // Debugging line
    }
  };

  const handleDeposit = async () => {
    console.log(userDID, account, depositAmount);
    if (!contract || !userDID || !account || !depositAmount) {
      console.error("Missing contract, userDID, account, or depositAmount.");
      return;
    }
    setLoading(true);

    try {
      await contract.methods
        .deposit(userDID, Web3.utils.toWei(depositAmount, "ether"))
        .send({
          from: account,
          value: Web3.utils.toWei(depositAmount, "ether"),
          gas: 3000000,
        });

      setDepositAmount("");
      fetchTransactions();
      // Optionally update transactions here
    } catch (error) {
      console.error("Error making deposit: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fakeAuthProvider.signout();
    navigate("/register"); // Navigate to login or registration page
  };

  return (
    <Container>
      <Typography variant='h4' component='h1' gutterBottom>
        Dashboard
      </Typography>
      <Button
        variant='contained'
        color='primary'
        sx={{ mb: 2 }}
        onClick={handleLogout}
      >
        Logout
      </Button>
      <Typography variant='h5' component='h2' gutterBottom>
        Make a Deposit
      </Typography>
      <TextField
        label='Deposit Amount (ETH)'
        variant='outlined'
        fullWidth
        value={depositAmount}
        onChange={(e) => setDepositAmount(e.target.value)}
        margin='normal'
        disabled={loading}
      />
      <Button
        variant='contained'
        color='primary'
        onClick={handleDeposit}
        sx={{ mb: 2 }}
        disabled={loading}
      >
        {loading ? "Processing..." : "Deposit"}
      </Button>
      <Typography variant='h5' component='h2' gutterBottom>
        Transaction History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Amount (ETH)</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions &&
              transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.amount}</TableCell>
                  <TableCell>{transaction.timestamp}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Dashboard;
