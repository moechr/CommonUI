// Dev-Server für die Demo (index.html → demo/main.tsx)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // GitHub Pages liegt unter /CommonUI/, lokal unter /
  base: process.env.DEMO_BASE ?? "/",
  server: { port: 5180 },
  build: { outDir: "dist-demo" },
});
