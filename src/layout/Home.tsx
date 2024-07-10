import React from "react";
import { Outlet } from "react-router-dom";
import Container from "@mui/material/Container";
import Header from "./Header";
import Footer from "./Footer";

const Layout: React.FC = () => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      <Container component='main' sx={{ flex: 1 }}>
        <Outlet />
      </Container>
      <Footer />
    </div>
  );
};

export default Layout;
