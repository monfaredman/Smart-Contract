import React, { useState } from "react";
import { fakeAuthProvider } from "@/middleware/auth";
import { TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const loginAdmin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Replace with your actual admin username and password validation logic
    if (username === "admin" && password === "password") {
      await fakeAuthProvider.loginAdmin();
      navigate("/admin");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <Typography variant='h4'>Admin Login</Typography>
      <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label='Username'
          value={username}
          fullWidth
          onChange={(e) => setUsername(e.target.value)}
          margin='normal'
          required
          error={!username}
        />
        <TextField
          label='Password'
          type='password'
          fullWidth
          autoComplete='new-password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin='normal'
          required
          error={!password}
        />
        {error && (
          <Typography color='error' style={{ marginTop: "10px" }}>
            {error}
          </Typography>
        )}

        <Button
          type='submit'
          fullWidth
          variant='contained'
          color='primary'
          style={{ marginTop: "20px" }}
        >
          Login
        </Button>
      </Box>
    </div>
  );
};

export default loginAdmin;
