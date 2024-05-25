import React, { useState, FormEvent } from "react";
import "./App.css";
import { Container, TextField, Button, Typography, Box } from "@mui/material";

// import { generateDid, storeOnIpfs, registerOnBlockchain } from "./services";
import { generateDid } from "./services";

const App: React.FC = () => {
  const [userData, setUserData] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Generating DID...");
    const did = generateDid();

    setStatus("Storing data on IPFS...");
    // const ipfsHash = await storeOnIpfs(userData);

    setStatus("Registering on blockchain...");
    // const result = await registerOnBlockchain(did, ipfsHash);

    // if (result) {
    //   setStatus("Registration successful!");
    // } else {
    //   setStatus("Registration failed.");
    // }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Register with DID and IPFS
      </Typography>
      <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
        <TextField
          label="Enter your data here"
          multiline
          fullWidth
          rows={4}
          variant="outlined"
          value={userData}
          onChange={(e: any) => setUserData(e.target.value)}
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Register
        </Button>
      </Box>
      <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
        {status}
      </Typography>
    </Container>
  );
};

export default App;
