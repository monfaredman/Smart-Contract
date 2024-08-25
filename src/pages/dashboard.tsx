import React, { useEffect, useState, FormEvent } from "react";
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
import { useEthereumAccount } from "@/hooks/userAccount";

const GANACHE_RPC_URL =
  process.env.REACT_APP_GANACHE_RPC_URL || "http://127.0.0.1:7545";

const alchemyApiKeyUrl: string = `https://eth-holesky.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`;

interface Transaction {
  type: string;
  amount: string;
  timestamp: string;
}

interface UserContract extends web3.eth.Contract {
  methods: {
    deposit(
      userDID: string,
      amount: string
    ): {
      send(options: {
        from: string;
        value: string;
        gas: number;
      }): Promise<void>;
    };
    adminLogin(
      userDID: string,
      amount: string
    ): {
      send(options: {
        from: string;
        value: string;
        gas: number;
      }): Promise<void>;
    };
  };
  getPastEvents(event: string, options: any): Promise<any[]>;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [userInfo, setUserInfo] = useState<string | null>(null);
  const [contract, setContract] = useState<UserContract | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [fetchingTransactions, setFetchingTransactions] =
    useState<boolean>(false);
  const [userDID, setUserDID] = useState<string | null>(null);

  const navigate = useNavigate();

  const {
    isLoading,
    isMetaMaskInstalled,
    isConnected,
    accounts,
    selectedAccount,
    balance,
  } = useEthereumAccount();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        if (window.ethereum) {
          // const web3 = new Web3(window.ethereum);
          const web3 = new Web3(
            // new Web3.providers.HttpProvider(GANACHE_RPC_URL)
            new Web3.providers.HttpProvider(alchemyApiKeyUrl)
          );
          try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
          } catch (error) {
            toast.error("User denied account access");
            return;
          }

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = UserContract.networks[networkId];
          if (deployedNetwork) {
            const instance = new web3.eth.Contract(
              UserContract.abi,
              deployedNetwork.address
            ) as unknown as UserContract;
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
        toast.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  // useEffect(() => {
  //   // Fetch transactions only if all required variables are set
  //   if (contract && userDID && selectedAccount) {
  //     fetchTransactions();
  //   }
  // }, [contract, userDID, selectedAccount]); //

  useEffect(() => {
    const init = async () => {
      // Existing initialization logic...

      // Simulate contract and userDID setup
      if (contract && userDID && selectedAccount) {
        setIsInitialized(true);
      }
    };

    init();
  }, [contract, userDID, selectedAccount]);

  useEffect(() => {
    if (isInitialized) {
      fetchTransactions();
    }
  }, [isInitialized]);

  useEffect(() => {
    const getUserInfo = () => {
      const storedIsAuthenticated = localStorage.getItem("username");
      setUserInfo(storedIsAuthenticated);
    };
    getUserInfo();
  }, []);

  const fetchTransactions = async () => {
    console.log(contract, userDID, selectedAccount);
    if (contract && userDID && selectedAccount) {
      setFetchingTransactions(true);
      try {
        const events = await contract.getPastEvents("Deposit", {
          filter: { userDID: userDID },
          fromBlock: 0,
          toBlock: "latest",
        });

        const parsedTransactions = await Promise.all(
          events.map(async (event: any) => {
            const web3 = new Web3(
              // new Web3.providers.HttpProvider(GANACHE_RPC_URL)
              new Web3.providers.HttpProvider(alchemyApiKeyUrl)
            );
            const blockNumber = Number(event.blockNumber);
            const block = await web3.eth.getBlock(blockNumber);
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
        toast.error((error as Error).message);
      } finally {
        setFetchingTransactions(false);
      }
    } else {
      toast.error("Waiting for contract, userDID, and account to be set.");
    }
  };
  const checkUserRegistration = async (userDID: string) => {
    try {
      const userInfo = await contract.methods.getUserInfo(userDID).call();
      return userInfo.isRegistered;
    } catch (error) {
      console.error("Error fetching user info:", error);
      return false;
    }
  };
  const getAllRegisteredUsers = async () => {
    try {
      const registeredUsers = await contract.methods
        .getAllRegisteredUsersDIDs()
        .call({ from: selectedAccount });
      console.log("Registered Users:", registeredUsers);
    } catch (error) {
      console.error("Error fetching registered users:", error);
    }
  };

  const adminLogin = async () => {
    console.log("Contract Address:", contract!.options.address);
    console.log("Contract ABI:", contract!.options.jsonInterface);

    console.log("contract?.methods", contract?.methods);
    try {
      await contract!.methods["adminLogin(string,string)"](
        "admin",
        "password"
      ).send({
        from: selectedAccount,
      });
      return true;
    } catch (error: any) {
      toast.error(error.message);
      console.log(error);
      return false;
    }
  };

  const handleDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(contract, userDID, selectedAccount, depositAmount);

    if (!contract || !userDID || !selectedAccount || !depositAmount) {
      toast.error("Missing contract, userDID, account, or depositAmount.");
      return;
    }
    let isRegistered;
    const isAdminLogin = await adminLogin();
    if (isAdminLogin) {
      await getAllRegisteredUsers();
      isRegistered = await checkUserRegistration(userDID);
    }

    if (!isRegistered) {
      toast.error(
        "User is not registered. Please register before making a deposit."
      );
      return;
    }

    setLoading(true);

    try {
      await contract.methods
        .deposit(userDID, Web3.utils.toWei(depositAmount, "ether"))
        .send({
          from: selectedAccount,
          value: Web3.utils.toWei(depositAmount, "ether"),
          gas: 3000000,
        });

      setDepositAmount("");
      fetchTransactions();
      toast.success("Deposit successful!");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fakeAuthProvider.signout();
    navigate("/register");
  };

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          {userInfo && <span style={{ color: "blue" }}>{userInfo}'s</span>}{" "}
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          size="small"
          color="error"
          sx={{ height: "3rem" }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
      <Box component="form" onSubmit={handleDeposit} sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Make a Deposit
        </Typography>
        <TextField
          label="Deposit Amount (ETH)"
          variant="outlined"
          fullWidth
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          margin="normal"
          required
          disabled={loading}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          disabled={loading}
        >
          {loading ? "Processing..." : "Deposit"}
        </Button>
      </Box>

      <Typography variant="h5" component="h2" gutterBottom>
        Transaction History
      </Typography>
      <Box
        sx={{
          height: "40vh",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "blue white",
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
