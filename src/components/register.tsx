import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  AppBar,
  Toolbar,
  Alert,
} from "@mui/material";
import Web3 from "web3";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import {
  registerUser,
  getUserBalance,
  connectToWeb3,
  disconnect,
  deployContractWithValue,
} from "../utils/blockchain";
import { generateDIDAndStoreData } from "../services";
import UserContract from "../../build/contracts/UserContract.json";

interface UserInfo {
  firstName: string;
  lastName: string;
  passportNo: string;
  birthday: Dayjs | null;
}

const Register: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: "",
    lastName: "",
    passportNo: "",
    birthday: null,
  });
  const [newMessage, setNewMessage] = useState("");
  const [valueToSend, setValueToSend] = useState<string>("0.1"); // Default value
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [confirmationByValue, setConfirmationByValue] = useState<string | null>(
    null
  );
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileConfirmation, setFileConfirmation] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Modern dapp browsers
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum);
          await window.ethereum.enable(); // Request account access if needed
        }
        // Legacy dapp browsers (e.g., Mist)
        else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider);
        }
        // Non-dapp browsers
        else {
          console.log(
            "Non-Ethereum browser detected. You should consider trying MetaMask!"
          );
        }

        const web3 = window.web3;
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = UserContract.networks[networkId];
        const instance = new web3.eth.Contract(
          UserContract.abi,
          deployedNetwork && deployedNetwork.address
        );
        setContract(instance);
      } catch (error) {
        console.error("Error initializing web3: ", error);
      }
    };

    init();
  }, []);

  const handleChange =
    (prop: keyof UserInfo) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setUserInfo({ ...userInfo, [prop]: event.target.value });
    };

  const handleConnect = async () => {
    try {
      const { signer } = await connectToWeb3();
      if (signer) {
        const address = await signer.getAddress();
        setAccount(address);
        const balance = await getUserBalance();
        setBalance(balance);
      }
    } catch (error) {
      console.error("Failed to connect to Web3", error);
      setConfirmation("Failed to connect to Web3. Please try again.");
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setAccount(null);
    setBalance(null);
  };

  const updateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { didId, ipfsHash } = await generateDIDAndStoreData({
        ...userInfo,
        docFile: file,
      });
      const tx = await registerUser(didId, ipfsHash, "0");
      console.log("tx", tx);
      setConfirmation(
        `Registration successful with transaction hash: ${tx.hash}`
      );
    } catch (error) {
      console.error("Registration failed", error);
      setConfirmation(`Registration failed: ${error.message}`);
    }
  };

  const handleSendValue = async () => {
    try {
      const { didId, ipfsHash } = await generateDIDAndStoreData(userInfo);
      const tx = await deployContractWithValue(newMessage, valueToSend);
      console.log("tx", tx);
      setConfirmationByValue(
        `Registration successful with transaction hash: ${tx.hash}`
      );
    } catch (error) {
      console.error("Error deploying contract:", error);
      setConfirmationByValue(`Error deploying contract: ${error.message}`);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setFileConfirmation("Please select a file to upload.");
      return;
    }

    try {
      // Implement your file upload logic here
      // Example: Upload 'file' using an API call
      // Replace this with your actual upload logic
      console.log("Uploading file:", file.name);
      setFileConfirmation(`File '${file.name}' uploaded successfully.`);
    } catch (error) {
      console.error("Error uploading file:", error);
      setFileConfirmation(`Error uploading file: ${error.message}`);
    }
  };

  const handleRegister = async () => {
    await contract.methods
      .registerUser(
        userInfo.firstName,
        userInfo.lastName,
        userInfo.birthday,
        userInfo.passportNo
      )
      .send({ from: account });
  };

  return (
    <Container maxWidth='sm'>
      <AppBar position='sticky'>
        <Toolbar>
          <Typography variant='h6' sx={{ flexGrow: 1 }}>
            DApp
          </Typography>
          {account ? (
            <Button color='inherit' onClick={handleDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button color='inherit' onClick={handleConnect}>
              Connect
            </Button>
          )}
        </Toolbar>
      </AppBar>
      {account ? (
        <>
          <Box sx={{ mt: 2 }}>
            <Typography variant='h5' color='green' sx={{ fontWeight: "bold" }}>
              You are connected to MetaMask.
            </Typography>
            <Typography variant='body1'>Account: {account}</Typography>
            <Typography variant='body1'>Balance: {balance} ETH</Typography>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant='h5'>Add Transaction</Typography>
            <TextField
              label='Recipient Address'
              variant='outlined'
              fullWidth
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              margin='normal'
              required
            />
            <TextField
              label='Value to Send (ETH)'
              variant='outlined'
              fullWidth
              value={valueToSend}
              onChange={(e) => setValueToSend(e.target.value)}
              margin='normal'
              required
              type='number'
            />
            <Button
              variant='contained'
              color='primary'
              fullWidth
              onClick={handleSendValue}
            >
              Send Transaction
            </Button>
            {confirmationByValue && (
              <Alert severity='error' sx={{ mt: 2 }}>
                {confirmationByValue}
              </Alert>
            )}
          </Box>
        </>
      ) : (
        <>
          <Typography
            variant='h4'
            component='h1'
            gutterBottom
            sx={{ marginTop: "2rem" }}
          >
            Register with DID and IPFS
          </Typography>
          <Box component='form' onSubmit={handleRegister} sx={{ mt: 2 }}>
            <TextField
              label='First Name'
              variant='outlined'
              fullWidth
              value={userInfo.firstName}
              onChange={handleChange("firstName")}
              margin='normal'
              required
              error={!userInfo.firstName}
            />
            <TextField
              label='Last Name'
              variant='outlined'
              fullWidth
              value={userInfo.lastName}
              onChange={handleChange("lastName")}
              margin='normal'
              required
              error={!userInfo.lastName}
            />
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale={"en"}
            >
              <DemoContainer components={["DatePicker"]}>
                <DatePicker
                  disableFuture
                  value={userInfo.birthday}
                  sx={{ width: "100%" }}
                  label='Birthdate'
                  slotProps={{
                    field: { clearable: true },
                    textField: { required: true, error: !userInfo.birthday },
                  }}
                  onChange={(newValue) =>
                    setUserInfo({ ...userInfo, birthday: newValue })
                  }
                />
              </DemoContainer>
            </LocalizationProvider>

            <TextField
              label='Passport No'
              variant='outlined'
              fullWidth
              value={userInfo.passportNo}
              onChange={handleChange("passportNo")}
              margin='normal'
              required
              error={!userInfo.passportNo}
            />

            <Box sx={{ mt: 4 }}>
              <Typography color={`${file ? "black" : "red"}`} variant='h5'>
                Upload Documents
              </Typography>
              <input
                type='file'
                accept='.pdf,.doc,.docx'
                onChange={handleFileChange}
                style={{ marginBottom: "1rem" }}
                required
              />
              {/* <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleFileUpload}
              >
                Upload File
              </Button> */}
              {fileConfirmation && (
                <Alert severity='error' sx={{ mt: 2 }}>
                  {fileConfirmation}
                </Alert>
              )}
            </Box>
            <Button type='submit' variant='contained' color='primary' fullWidth>
              Register
            </Button>
          </Box>
          {confirmation && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {confirmation}
            </Alert>
          )}
        </>
      )}
    </Container>
  );
};

export default Register;
