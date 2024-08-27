import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App";
import { DialogProvider } from "@/contexts/dialogContext"; // Import the DialogProvider

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <DialogProvider>
      <App />
      <ToastContainer
        position='bottom-left'
        autoClose={5000}
        limit={10}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme='colored'
      />
    </DialogProvider>
  </React.StrictMode>
);
