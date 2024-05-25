import React, { useState, ChangeEvent, FormEvent } from "react";
import { TextField, Button, Typography, Box, Alert } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import { generateDIDAndStoreData } from "@/services/services";
import { fakeAuthProvider } from "@/middleware/auth";
import { toast } from "react-toastify";
import { useEthereumAccount } from "@/hooks/userAccount";
import { useContractInstance } from "@/hooks/contractAccount"; // Import the custom hook
import { parseEther } from "ethers";

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

  const [fileConfirmation, setFileConfirmation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { selectedAccount, signer } = useEthereumAccount();
  const contract = useContractInstance(signer);

  const handleChange =
    (prop: keyof UserInfo) => (event: ChangeEvent<HTMLInputElement>) => {
      setUserInfo({ ...userInfo, [prop]: event.target.value });
    };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (files[0]?.type !== "application/pdf") {
        toast.error("Invalid file type. Only PDF files are allowed.");
        setFileConfirmation(null);
      } else {
        setUserInfo({ ...userInfo, docFile: files[0] });
        setFileConfirmation(`Selected file: ${files[0].name}`);
        toast.success("File selected successfully.");
      }
    }
  };

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault();
    if (!contract) {
      toast.error("Contract instance not initialized.");
      return;
    }

    const { firstName, lastName, birthday, passportNo, docFile } = userInfo;

    if (!firstName || !lastName || !birthday || !passportNo || !docFile) {
      toast.error(
        "Please fill in all required fields and upload the document."
      );
      return;
    }

    setLoading(true);

    try {
      const { userInfoCid, fileHash, didId } = await generateDIDAndStoreData({
        firstName,
        lastName,
        phoneNumber: passportNo,
        birthday: birthday.format("YYYY-MM-DD"),
        docFile,
      });
      const amount = parseEther("0.01");

      const tx = await contract.registerUser(didId, userInfoCid, fileHash, {
        from: selectedAccount,
        gasLimit: 3000000,
        value: amount,
      });
      await tx.wait();

      toast.success("User registered successfully!");
      const userData = {
        firstName,
        lastName,
        passportNo,
        birthday: birthday.format("YYYY-MM-DD"),
        docFileName: docFile.name,
        didId,
        userInfoCid,
        fileHash,
      };

      localStorage.setItem("userData", JSON.stringify(userData));
      await fakeAuthProvider.signin(firstName);
      navigate("/");
    } catch (error: any) {
      toast.error(`Registration failed: ${error.message}`);
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
          <Typography color={userInfo.docFile ? "black" : "red"} variant='h5'>
            Upload Documents
          </Typography>
          <input
            type='file'
            accept='.pdf'
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
          {loading ? "Registering..." : "Register User"}
        </Button>
        <Button
          variant='outlined'
          color='primary'
          fullWidth
          style={{ marginTop: "1rem" }}
          onClick={() => navigate("/loginAdmin")}
        >
          Login Admin
        </Button>
      </Box>
    </>
  );
};

export default Register;
