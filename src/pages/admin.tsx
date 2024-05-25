import React, { useState, useEffect } from "react";
import Web3 from "web3";
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Tabs,
  Tab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { toast } from "react-toastify";
import { useEthereumAccount } from "@/hooks/userAccount";
import { fakeAuthProvider } from "@/middleware/auth";
import { useContractInstance } from "@/hooks/contractAccount"; // Import the custom hook
import { retrieveUserInfo, retrieveDocFile } from "@/services/services";
import { useNavigate } from "react-router-dom";
import { formatEther, parseEther } from "ethers";

interface UserInfo {
  depositAmount: number;
  firstName: string;
  lastName: string;
  passportNo: string;
  birthday: string;
  ipfsUserInfoHash?: string;
  docFileIPFSHash?: string;
}

const Admin: React.FC = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);
  const [networkBalance, setNetworkBalance] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [retrievedFile, setRetrievedFile] = useState<Uint8Array | null>(null);
  const [userDetails, setUserDetails] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { signer } = useEthereumAccount();
  const contract = useContractInstance(signer);

  const adminLogout = async () => {
    try {
      await fakeAuthProvider.logoutAdmin();
      navigate("/register");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const fetchRegisteredUsers = async () => {
    if (contract) {
      try {
        const users = await contract.getAllRegisteredUsersDIDs();
        setRegisteredUsers(users);
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const fetchNetworkBalance = async () => {
    try {
      // Call the getNetworkBalance function from your contract
      const balance = await contract!.getNetworkBalance();

      // Convert the balance from Wei to Ether using formatEther
      const balanceInEther = formatEther(balance);

      // Update the state with the formatted balance
      setNetworkBalance(parseFloat(balanceInEther));
    } catch (error: any) {
      // Display an error message to the user
      toast.error(error.message || "Failed to fetch network balance.");
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);

    try {
      // Fetch the latest network balance before withdrawal
      await fetchNetworkBalance();

      // Check if the withdrawal amount is greater than the available balance
      if (parseFloat(withdrawAmount) > networkBalance) {
        toast.error("Insufficient balance");
        return;
      }

      // Convert the withdrawal amount from Ether to Wei (required for transaction)
      const amountWei = parseEther(withdrawAmount);

      // Call the withdraw function from the contract
      await contract!.withdraw(amountWei);

      // Clear the withdrawal amount input after a successful transaction
      setWithdrawAmount("");

      // Refresh the network balance after withdrawal
      await fetchNetworkBalance();
    } catch (error: any) {
      // Display an error message if the withdrawal fails
      toast.error(error.message || "Failed to withdraw.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTab = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    if (tabIndex === 0) {
      fetchRegisteredUsers();
    } else if (tabIndex === 1) {
      fetchNetworkBalance();
    }
  }, [tabIndex, contract]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setUserDetails(null);
    setRetrievedFile(null);
  };

  const handleUserClick = async (user: string) => {
    try {
      const userInfo = await contract!.getUserInfo(user);
      if (!userInfo.ipfsUserInfoHash) {
        throw new Error("ipfsUserInfoHash is undefined.");
      }
      if (!userInfo.docFileIPFSHash) {
        throw new Error("docFileIPFSHash is undefined.");
      }

      const retrievedFile = await retrieveDocFile(userInfo.docFileIPFSHash);
      const retrievedUserInfo = await retrieveUserInfo(
        userInfo.ipfsUserInfoHash,
        2
      );
      setUserDetails({ ...userInfo, ...retrievedUserInfo });
      setRetrievedFile(retrievedFile);
      setSelectedUser(user);
      setIsModalOpen(true);
    } catch (error: any) {
      toast.error(`Failed to retrieve user data. Details: ${error.message}`);
    }
  };

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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User DID</TableCell>
                    {/* <TableCell>Actions</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registeredUsers.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user}</TableCell>
                      {/* <TableCell>
                        <Button
                          variant='outlined'
                          onClick={() => handleUserClick(user)}
                        >
                          View Details
                        </Button>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
              disabled={loading}
            />
            <Button
              variant='contained'
              color='primary'
              onClick={handleWithdraw}
              disabled={loading}
            >
              {loading ? "Processing..." : "Withdraw"}
            </Button>
          </Box>
        )}
      </Box>
      {selectedUser && userDetails && (
        <Dialog open={isModalOpen} onClose={handleCloseModal}>
          <DialogTitle>User Details</DialogTitle>
          <DialogContent>
            <Typography variant='body1'>
              Deposit Amount:{" "}
              {web3!.utils.fromWei(
                userDetails.depositAmount.toString(),
                "ether"
              )}{" "}
              ETH
            </Typography>
            <Typography variant='body1'>
              First Name: {userDetails.firstName}
            </Typography>
            <Typography variant='body1'>
              Last Name: {userDetails.lastName}
            </Typography>
            <Typography variant='body1'>
              Passport No: {userDetails.passportNo}
            </Typography>
            <Typography variant='body1'>
              Birthday: {userDetails.birthday}
            </Typography>
            {retrievedFile && (
              <a
                href={URL.createObjectURL(
                  new Blob([retrievedFile], {
                    type: "application/octet-stream",
                  })
                )}
                download='retrievedDocument'
              >
                Download Document
              </a>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color='primary'>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default Admin;
