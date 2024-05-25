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
import { formatEther, parseEther } from "ethers";
import { useNavigate } from "react-router-dom";
import { fakeAuthProvider } from "@/middleware/auth";
import { toast } from "react-toastify";
import { useEthereumAccount } from "@/hooks/userAccount";
import { useContractInstance } from "@/hooks/contractAccount"; // Import the custom hook

interface Transaction {
  type: string;
  amount: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [userInfo, setUserInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [fetchingTransactions, setFetchingTransactions] =
    useState<boolean>(false);
  const [userDID, setUserDID] = useState<string | null>(null);

  const navigate = useNavigate();

  const { selectedAccount, signer } = useEthereumAccount();
  const contract = useContractInstance(signer);

  useEffect(() => {
    const init = async () => {
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
    };

    init();
  }, [signer, navigate]);

  useEffect(() => {
    const init = async () => {
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
    if (contract && userDID && selectedAccount) {
      setFetchingTransactions(true);
      try {
        const events = await contract.queryFilter(
          contract.filters.Deposit(userDID),
          0,
          "latest"
        );

        const parsedTransactions = await Promise.all(
          events.map(async (event: any) => {
            const block = await event.getBlock();
            const timestamp = block.timestamp;
            return {
              type: event.event,
              amount: formatEther(event.args?.amount || "0"),
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

  const handleDeposit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!contract || !userDID || !selectedAccount || !depositAmount) {
      toast.error("Missing contract, userDID, account, or depositAmount.");
      return;
    }
    setLoading(true);

    try {
      // Parse deposit amount
      const amount = parseEther(depositAmount);

      // Perform the deposit transaction
      const tx = await contract.deposit(userDID, {
        from: selectedAccount,
        value: amount,
      });

      // Wait for the transaction to be mined
      await tx.wait();

      toast.success("Deposit successful!");
      setDepositAmount("");
      fetchTransactions();
    } catch (error) {
      // Check if the error has a reason for reverting
      if (error.reason) {
        toast.error(`Deposit failed: ${error.reason}`);
      } else if (error.code === "CALL_EXCEPTION") {
        toast.error("Call exception: The transaction reverted on execution.");
      } else {
        toast.error("Deposit failed. Please try again.");
      }
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
        <Typography variant='h4' component='h1' gutterBottom>
          {userInfo && <span style={{ color: "blue" }}>{userInfo}'s</span>}{" "}
          Dashboard
        </Typography>
        <Button
          variant='outlined'
          size='small'
          color='error'
          sx={{ height: "3rem" }}
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
              {fetchingTransactions
                ? Array.from(new Array(3)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={3}>
                        <Skeleton />
                      </TableCell>
                    </TableRow>
                  ))
                : transactions.map((transaction, index) => (
                    <TableRow key={index}>
                      <TableCell>{transaction.type}</TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell>{transaction.timestamp}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default Dashboard;
