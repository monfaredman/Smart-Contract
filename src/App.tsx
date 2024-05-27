import React, { useState, useEffect } from "react";
import "./App.css";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { getWeb3, getContract } from "./services/contractService";
import { registerUser } from "./utils/blockchain";

// import { generateDid, storeOnIpfs, registerOnBlockchain } from "./services";
import { generateDIDAndStoreData } from "./services";

interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dob: string;
}

const App: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dob: "",
  });
  const [userData, setUserData] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [message, setMessage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    // const init = async () => {
    //   const web3 = await getWeb3();
    //   const contract = await getContract(web3);
    //   const message = await contract.methods.message().call();
    //   setMessage(message);
    // };
    // init();
  }, []);

  // const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setStatus("Generating DID...");
  //   const did = generateDid();

  //   setStatus("Storing data on IPFS...");
  //   // const ipfsHash = await storeOnIpfs(userData);

  //   setStatus("Registering on blockchain...");
  //   // const result = await registerOnBlockchain(did, ipfsHash);

  //   // if (result) {
  //   //   setStatus("Registration successful!");
  //   // } else {
  //   //   setStatus("Registration failed.");
  //   // }
  // };

  const handleChange =
    (prop: keyof UserInfo) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setUserInfo({ ...userInfo, [prop]: event.target.value });
    };

  const updateMessage = async (e) => {
    e.preventDefault();
    // const web3 = await getWeb3();
    // const contract = await getContract(web3);
    // const accounts = await web3.eth.getAccounts();
    // await contract.methods.setMessage(newMessage).send({ from: accounts[0] });
    // const updatedMessage = await contract.methods.message().call();
    // setMessage(updatedMessage);
    try {
      const { didId, ipfsHash } = await generateDIDAndStoreData({ userInfo });
      const tx = await registerUser(didId, ipfsHash);
      setConfirmation(
        `Registration successful with transaction hash: ${tx.hash}`
      );
    } catch (error) {
      console.error(error);
      setConfirmation("Registration failed");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Register with DID and IPFS
      </Typography>
      <Box component="form" onSubmit={updateMessage} sx={{ mt: 2 }}>
        <TextField
          label="First Name"
          variant="outlined"
          fullWidth
          value={userInfo.firstName}
          onChange={handleChange("firstName")}
          margin="normal"
        />
        <TextField
          label="Last Name"
          variant="outlined"
          fullWidth
          value={userInfo.lastName}
          onChange={handleChange("lastName")}
          margin="normal"
        />
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={userInfo.email}
          onChange={handleChange("email")}
          margin="normal"
        />
        <TextField
          label="Phone Number"
          variant="outlined"
          fullWidth
          value={userInfo.phoneNumber}
          onChange={handleChange("phoneNumber")}
          margin="normal"
        />
        <TextField
          label="Address"
          variant="outlined"
          fullWidth
          value={userInfo.address}
          onChange={handleChange("address")}
          margin="normal"
        />
        <TextField
          label="Date of Birth"
          type="date"
          variant="outlined"
          fullWidth
          value={userInfo.dob}
          onChange={handleChange("dob")}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Register
        </Button>
      </Box>
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
        {status}
      </Typography>
      <p>{confirmation}</p>
    </Container>
  );
};

export default App;
