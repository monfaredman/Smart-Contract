import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
// import AccountCircle from "@mui/icons-material/AccountCircle";

const Header = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position='static'>
      <Toolbar>
        {/* Site Logo */}
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          dApp{" "}
        </Typography>

        {/* Login or Profile Avatar */}
        <IconButton
          size='large'
          edge='end'
          color='inherit'
          aria-label='profile'
          aria-controls='menu-appbar'
          aria-haspopup='true'
          onClick={handleMenuOpen}
          sx={{ ml: 2 }}
        >
          <Avatar>{/* <AccountCircle /> */}</Avatar>
        </IconButton>

        {/* User Menu */}
        <Menu
          id='menu-appbar'
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {/* Example menu items (replace with actual user-related options) */}
          <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
          <MenuItem onClick={handleMenuClose}>My account</MenuItem>
          <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
