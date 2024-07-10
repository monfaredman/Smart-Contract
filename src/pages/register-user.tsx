import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Box, Alert } from "@mui/material";
import Web3 from "web3";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";

import UserContract from "../../build/contracts/UserContract.json";

const GANACHE_RPC_URL = "http://127.0.0.1:7545"; // Ganache RPC URL

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
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileConfirmation, setFileConfirmation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize Web3
        const web3 = new Web3(new Web3.providers.HttpProvider(GANACHE_RPC_URL));

        // Fetch accounts
        const accounts = await web3.eth.getAccounts();
        console.log(1, accounts);
        setAccount(accounts[0]); // Assuming you want to use the first account by default
        // Fetch network ID
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = UserContract.networks[networkId];

        // Initialize contract instance
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

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!contract) {
      console.error("Contract instance not initialized.");
      return;
    }

    const { firstName, lastName, birthday, passportNo } = userInfo;
    const birthdayString = birthday ? birthday.format("YYYY-MM-DD") : "";

    if (!firstName || !lastName || !birthdayString || !passportNo) {
      setConfirmation("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      await contract.methods
        .registerUser(firstName, lastName, birthdayString, passportNo)
        .send({ from: account, gas: 3000000 })
        .on("receipt", (receipt) => {
          console.log("Transaction receipt:", receipt); // Log the transaction receipt
        })
        .catch((error) => {
          console.error("Error registering user:", error);
          setConfirmation(`Error registering user: ${error.message}`);
        })
        .finally(() => {
          setLoading(false);
        });

      setConfirmation("User registered successfully.");
    } catch (error) {
      console.error("Error registering user: ", error);
      setConfirmation(`Error registering user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
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
          disabled={loading}
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
          disabled={loading}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={"en"}>
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
            disabled={loading}
          />
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
          disabled={loading}
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
            disabled={loading}
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
        <Button
          type='submit'
          variant='contained'
          color='primary'
          fullWidth
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </Button>
      </Box>
      {confirmation && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {confirmation}
        </Alert>
      )}
    </>
  );
};

export default Register;
