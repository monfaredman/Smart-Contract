import React, { useState, useEffect, FormEvent } from "react";
import { fakeAuthProvider } from "@/middleware/auth";
import { TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import Eth from "web3-eth";

import UserContract from "~/build/contracts/UserRegistration.json";
import { toast } from "react-toastify";
import { useEthereumAccount } from "@/hooks/userAccount";

const GANACHE_RPC_URL = "http://127.0.0.1:7545"; // Ganache RPC URL
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
const alchemyApiKeyUrl: string = `https://eth-holesky.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`;

const LoginAdmin: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [contract, setContract] = useState<Web3.eth.Contract | null>(null);
  // const [accounts, setAccounts] = useState<string[]>([]);

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
      try {
        // const web3Instance = new Web3(new Web3.providers.HttpProvider(GANACHE_RPC_URL));
        const web3Instance = new Web3(
          new Web3.providers.HttpProvider(alchemyApiKeyUrl)
        );
        // const accounts = await web3Instance.eth.getAccounts();
        // setAccounts(accounts);

        const networkId = await web3Instance.eth.net.getId();
        console.log("networkId", networkId);
        console.log("UserContract.abi", UserContract.abi);
        handleEncodeAbi();
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
  const handleEncodeAbi = () => {
    const web3 = new Web3(new Web3.providers.HttpProvider(alchemyApiKeyUrl));

    // const abiString = JSON.stringify(UserContract.abi);

    // console.log("ABI as JSON String:", abiString);
    // const eth = new Eth(new Web3.providers.HttpProvider(alchemyApiKeyUrl));

    // // Iterate over each function in the ABI and encode its signature
    // UserContract.abi.forEach((item) => {
    //   if (item.type === "function") {
    //     const functionSignature = web3.eth.abi.encodeFunctionSignature(item);
    //     console.log(
    //       `Function: ${item.name}, Encoded Signature: ${functionSignature}`
    //     );
    //   }
    // });
    const constructorParams = [
      "UserRegistration", // Replace with your actual constructor arguments
      100, // Replace with your actual constructor arguments
    ];

    const encoded = web3.eth.abi.encodeParameters(
      ["string", "uint256"], // Data types of your constructor parameters
      constructorParams
    );

    console.log("ABI-encoded Constructor Arguments:", encoded);
  };
  const checkContract = async () => {
    try {
      const code = await web3.eth.getCode(contractAddress);
      if (code === "0x") {
        console.log("No contract found at this address.");
      } else {
        console.log("Contract is deployed at this address.");
      }
    } catch (error) {
      console.error("Error checking contract address:", error);
    }
  };
  const adminLogin = async () => {
    console.log("contract?.methods", contract?.methods);
    console.log("selectedAccount", selectedAccount);
    try {
      await contract?.methods
        .adminLogin("admin", "password")
        .send({ from: selectedAccount });
      await fakeAuthProvider.loginAdmin();
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message);
      console.log(1, error.message);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(username, password);
    if (username === "admin" && password === "password") {
      await checkContract();
      await adminLogin();
    } else {
      toast.error("Invalid username or password");
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ textAlign: "left", marginTop: "20px" }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ marginTop: "2rem" }}
      >
        Admin Login
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label="Username"
          value={username}
          fullWidth
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          required
          error={!username}
          helperText="hint: admin"
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
          error={!password}
          helperText="hint: password"
        />
        {error && (
          <Typography color="error" style={{ marginTop: "10px" }}>
            {error}
          </Typography>
        )}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          style={{ marginTop: "20px" }}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          style={{ marginTop: "1rem" }}
          onClick={() => navigate("/register")}
        >
          Register User
        </Button>
      </Box>
    </div>
  );
};

export default LoginAdmin;
