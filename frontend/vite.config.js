import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API_TARGET = process.env.VITE_PROXY_TARGET || "https://marquisa-backend.onrender.com";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false,
    open: false,
    proxy: {
      "/api": { target: API_TARGET, changeOrigin: true, secure: true },
      "/auth": { target: API_TARGET, changeOrigin: true, secure: true },
      "/me": { target: API_TARGET, changeOrigin: true, secure: true },
    },
  },
});
