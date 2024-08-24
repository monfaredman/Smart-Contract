import React, { useState, useEffect } from "react";
import Web3 from "web3";
import UserContract from "~/build/contracts/UserRegistration.json"; // Update the contract import
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
import { fakeAuthProvider } from "@/middleware/auth";
import { retrieveUserInfo, retrieveDocFile } from "@/services/services";
import { useNavigate } from "react-router-dom";

const GANACHE_RPC_URL = "http://127.0.0.1:7545"; // Ganache RPC URL

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
  const [contract, setContract] = useState<any>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);
  const [networkBalance, setNetworkBalance] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [retrievedFile, setRetrievedFile] = useState<Uint8Array | null>(null);
  const [userDetails, setUserDetails] = useState<UserInfo | null>(null);

  const navigate = useNavigate();
  const alchemyApiKey = process.env.REACT_APP_ALCHEMY_API_KEY;
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  useEffect(() => {
    const init = async () => {
      try {
        const web3Instance = new Web3(
          // new Web3.providers.HttpProvider(GANACHE_RPC_URL)
          new Web3.providers.HttpProvider(alchemyApiKey)
        );
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        setAccounts(accounts);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = UserContract.networks[networkId];
        if (deployedNetwork) {
          // const instance = new web3Instance.eth.Contract(
          //   UserContract.abi,
          //   deployedNetwork.address
          // );
          const instance = new web3Instance.eth.Contract(
            UserContract.abi,
            contractAddress
          );

          setContract(instance);
        } else {
          toast.error("Contract not deployed on the detected network.");
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    };
    init();
  }, []);

  const adminLogout = async () => {
    try {
      await contract.methods.adminLogout().send({ from: accounts[0] });
      await fakeAuthProvider.logoutAdmin();
      navigate("/register");
    } catch (error: any) {
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
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const fetchNetworkBalance = async () => {
    try {
      const balance = await contract.methods
        .getNetworkBalance()
        .call({ from: accounts[0] });
      setNetworkBalance(parseFloat(web3!.utils.fromWei(balance, "ether")));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleWithdraw = async () => {
    try {
      fetchNetworkBalance();
      if (parseFloat(withdrawAmount) > networkBalance) {
        toast.error("Insufficient balance");
        return;
      }
      const amountWei = web3!.utils.toWei(withdrawAmount, "ether");
      await contract.methods.withdraw(amountWei).send({ from: accounts[0] });
      setWithdrawAmount("");
      fetchNetworkBalance(); // Refresh balance after withdrawal
    } catch (error: any) {
      toast.error(error.message);
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
      const userInfo = await contract.methods
        .getUserInfo(user)
        .call({ from: accounts[0] });

      if (!userInfo.ipfsUserInfoHash) {
        throw new Error("userInfo.ipfsUserInfoHash is undefined.");
      }
      if (!userInfo.docFileIPFSHash) {
        throw new Error("userInfo.docFileIPFSHash is undefined.");
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
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registeredUsers.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user}</TableCell>
                      <TableCell>
                        <Button
                          variant='outlined'
                          onClick={() => handleUserClick(user)}
                        >
                          View Details
                        </Button>
                      </TableCell>
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
