import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";

const Footer: React.FC = () => {
  return (
    <Box
      component='footer'
      sx={{
        py: 3,
        px: 2,
        mt: 4,
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        color: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[900]
            : theme.palette.grey[100],
      }}
    >
      <Container maxWidth='md'>
        <Typography variant='h6' align='center' gutterBottom>
          Empowering Your Financial Future
        </Typography>
        <Typography variant='body1' align='center' paragraph>
          At DApp, we believe in providing secure and innovative banking
          solutions to help you manage your finances with ease.
        </Typography>
        <Typography variant='body2' color='text.secondary' align='center'>
          {"© "}
          {new Date().getFullYear()} DApp. All rights reserved.
        </Typography>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Link href='#' sx={{ mx: 1 }}>
            Privacy Policy
          </Link>
          <Link href='#' sx={{ mx: 1 }}>
            Terms of Service
          </Link>
          <Link href='#' sx={{ mx: 1 }}>
            Contact Us
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
