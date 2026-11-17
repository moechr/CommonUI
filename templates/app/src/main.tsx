import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@ki/common-ui/style.css";
import { ThemeProvider, ToastProvider } from "@ki/common-ui";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light">
      <ToastProvider>
        <App />
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
