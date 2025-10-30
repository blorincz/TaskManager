import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  plugins: [tanstackRouter(), react()],
  server: {
    port: 5173,
    proxy: {
      // Route ALL API calls through the Gateway
      "/api": {
        target: "https://localhost:7002", // Gateway
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
