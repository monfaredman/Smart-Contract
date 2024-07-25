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
  Box,
  Skeleton,
} from "@mui/material";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import { fakeAuthProvider } from "@/middleware/auth";
import { toast } from "react-toastify";
import UserContract from "~/build/contracts/UserRegistration.json"; // Update the contract import

const GANACHE_RPC_URL = "http://127.0.0.1:7545"; // Ganache RPC URL

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [account, setAccount] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingTransactions, setFetchingTransactions] =
    useState<boolean>(false);
  const [userDID, setUserDID] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (window.ethereum) {
          const web3 = new Web3(window.ethereum);
          try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
          } catch (error) {
            toast.error("User denied account access");
            return;
          }
  
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
  
          const networkId = await web3.eth.net.getId();
  
          const deployedNetwork = UserContract.networks[networkId];
          if (deployedNetwork) {
            const instance = new web3.eth.Contract(
              UserContract.abi,
              deployedNetwork.address
            );
            setContract(instance);
          } else {
            toast.error("Contract not deployed on the detected network.");
          }
  
          const userData = localStorage.getItem("userData");
          if (userData) {
            const userObj = JSON.parse(userData);
            setUserDID(userObj.didId);
          } else {
            toast.error("User data not found in local storage.");
            navigate("/register");
            return;
          }
          toast.success("Initialization successful!");
        } else {
          toast.error("Please install MetaMask!");
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    init();
  }, [navigate]);
  
  

  useEffect(() => {
    fetchTransactions();
  }, [contract, userDID]);

  useEffect(() => {
    const getUserInfo = () => {
      const storedIsAuthenticated = localStorage.getItem("username");
      setUserInfo(storedIsAuthenticated);
    };
    getUserInfo();
  }, []);

  const fetchTransactions = async () => {
    if (contract && userDID && account) {
      setFetchingTransactions(true);
      try {
        const events = await contract.getPastEvents("Deposit", {
          filter: { userDID: userDID },
          fromBlock: 0, // You can specify the starting block number
          toBlock: "latest", // Or the ending block number
        });

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
        setTransactions(parsedTransactions);
        toast.success("Transactions fetched successfully!");
      } catch (error) {
        toast.error(error.message);
      } finally {
        setFetchingTransactions(false);
      }
    } else {
      toast.error("Waiting for contract, userDID, and account to be set."); // Debugging line
    }
  };

  const handleDeposit = async (event) => {
    event.preventDefault();
    if (!contract || !userDID || !account || !depositAmount) {
      toast.error("Missing contract, userDID, account, or depositAmount.");
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
      toast.success("Deposit successful!");
    } catch (error) {
      toast.error(error.message);
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
      <Box
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant='h4'
          component='h1'
          gutterBottom
          style={{ marginTop: "1rem" }}
        >
          {userInfo && <span style={{ color: "blue" }}>{userInfo}'s</span>}{' '}
          Dashboard
        </Typography>
        <Button
          variant='outlined'
          size='small'
          color='error'
          style={{ height: "3rem" }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
      <Box component='form' onSubmit={handleDeposit} sx={{ mt: 2, mb: 4 }}>
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
          required
          // error={!depositAmount}
          disabled={loading}
        />
        <Button
          type='submit'
          variant='contained'
          color='primary'
          sx={{ mb: 2 }}
          disabled={loading}
        >
          {loading ? "Processing..." : "Deposit"}
        </Button>
      </Box>

      <Typography variant='h5' component='h2' gutterBottom>
        Transaction History
      </Typography>
      <Box
        style={{
          height: "40vh",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "blue white",
        }}
        sx={{
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            boxShadow: "inset 0 0 5px rgba(0,0,0,0.3)",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "blue",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "orange",
          },
        }}
      >
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
              {fetchingTransactions ? (
                <>
                  <TableRow>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                    <TableCell>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                transactions &&
                transactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>{transaction.amount}</TableCell>
                    <TableCell>{transaction.timestamp}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Dashboard;
