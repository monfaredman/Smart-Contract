import React, { createContext, useContext, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

interface DialogContextType {
  openDialog: boolean;
  showDialog: () => void;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [openDialog, setOpenDialog] = useState(false);

  const showDialog = () => setOpenDialog(true);
  const hideDialog = () => setOpenDialog(false);

  const handleRetry = () => {
    hideDialog();
    window.location.reload(); // Reload the page when Retry is clicked
  };

  return (
    <DialogContext.Provider value={{ openDialog, showDialog, hideDialog }}>
      {children}
      <Dialog
        open={openDialog}
        onClose={() => {}} // Prevent closing on outside click or ESC key
        disableEscapeKeyDown
      >
        <DialogTitle>MetaMask Connection Error</DialogTitle>
        <DialogContent>
          <DialogContentText>
            There was an issue connecting to MetaMask. Please make sure MetaMask
            is installed and connected and try again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRetry} color='primary'>
            Retry
          </Button>
        </DialogActions>
      </Dialog>
    </DialogContext.Provider>
  );
};
