import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { logger } from "./utils/logger";

if (import.meta.env.DEV) {
  window.addEventListener("unhandledrejection", (event) => {
    logger.error("Unhandled promise rejection", event?.reason);
  });
  window.addEventListener("error", (event) => {
    logger.error("Unhandled window error", {
      message: event?.message,
      filename: event?.filename,
      lineno: event?.lineno,
      colno: event?.colno,
    });
  });
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
