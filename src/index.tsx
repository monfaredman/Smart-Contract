import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  root.render(<App />);
} else {
  console.error("Failed to find the root element.");
}
