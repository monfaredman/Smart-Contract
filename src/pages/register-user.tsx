import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Box, Alert } from "@mui/material";
import Web3 from "web3";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import UserContract from "~/build/contracts/UserRegistration.json"; // Update the contract import
import { generateDIDAndStoreData } from "@/services";
import { fakeAuthProvider } from "@/middleware/auth";

const GANACHE_RPC_URL = "http://127.0.0.1:7545"; // Ganache RPC URL

interface UserInfo {
  firstName: string;
  lastName: string;
  passportNo: string;
  birthday: Dayjs | null;
  docFile?: File | null;
}

const Register: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: "",
    lastName: "",
    passportNo: "",
    birthday: null,
    docFile: null,
  });
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [fileConfirmation, setFileConfirmation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        const web3 = new Web3(new Web3.providers.HttpProvider(GANACHE_RPC_URL));
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
          console.error("Contract not deployed on the detected network.");
        }
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
      setUserInfo({ ...userInfo, docFile: files[0] });
      setFileConfirmation(`Selected file: ${files[0].name}`);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!contract) {
      console.error("Contract instance not initialized.");
      return;
    }

    const { firstName, lastName, birthday, passportNo, docFile } = userInfo;

    if (!firstName || !lastName || !birthday || !passportNo || !docFile) {
      setConfirmation(
        "Please fill in all required fields and upload the document."
      );
      return;
    }

    setLoading(true);

    try {
      // Generate DID and store user info in IPFS
      const { userInfoCid, fileHash, userInfoMatch, retrievedFile, didId } =
        await generateDIDAndStoreData({
          firstName,
          lastName,
          phoneNumber: passportNo,
          birthday: birthday.format("YYYY-MM-DD"),
          docFile,
        });
      console.log("DID and IPFS data:", {
        userInfoCid,
        fileHash,
        userInfoMatch,
        retrievedFile,
        didId,
      });

      // Register user on the blockchain
      const didIdStr = String(didId);
      const userInfoCidStr = String(userInfoCid);
      const fileHashStr = String(fileHash);
      await contract.methods
        .registerUser(didIdStr, userInfoCidStr, fileHashStr)
        .send({ from: account, gas: 3000000 })
        .then(async () => {
          // Store user data to local storage
          const userData = {
            firstName,
            lastName,
            passportNo,
            birthday: birthday.format("YYYY-MM-DD"),
            docFileName: docFile.name,
            didId: didIdStr,
            userInfoCid: userInfoCidStr,
            fileHash: fileHashStr,
          };
          localStorage.setItem("userData", JSON.stringify(userData));

          // Sign in the user
          await fakeAuthProvider.signin(firstName);

          setConfirmation(
            "User registered successfully and data stored locally."
          );
          navigate("/");
        })
        .catch((error: any) => {
          console.error("Error registering user:", error);
          setConfirmation(`Error registering user: ${error.message}`);
        });
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
        Register user to network
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
          <Typography
            color={`${userInfo.docFile ? "black" : "red"}`}
            variant='h5'
          >
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
          {fileConfirmation && (
            <Alert severity='info' sx={{ mt: 2 }}>
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
        <Alert severity='info' sx={{ mt: 2 }}>
          {confirmation}
        </Alert>
      )}
    </>
  );
};

export default Register;
