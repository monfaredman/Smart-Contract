import React, { useState, FormEvent } from "react";
import { fakeAuthProvider } from "@/middleware/auth";
import { TextField, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginAdmin: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  const adminLogin = async () => {
    try {
      await fakeAuthProvider.loginAdmin();
      navigate("/admin");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username === "admin" && password === "password") {
      await adminLogin();
    } else {
      toast.error("Invalid username or password");
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ textAlign: "left", marginTop: "20px" }}>
      <Typography
        variant='h4'
        component='h1'
        gutterBottom
        sx={{ marginTop: "2rem" }}
      >
        Admin Login
      </Typography>
      <Box component='form' onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          label='Username'
          value={username}
          fullWidth
          onChange={(e) => setUsername(e.target.value)}
          margin='normal'
          required
          error={!username}
          helperText='hint: admin'
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
          helperText='hint: password'
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
        <Button
          variant='outlined'
          color='primary'
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
