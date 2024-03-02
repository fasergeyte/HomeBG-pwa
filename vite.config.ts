import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@libs": resolve(__dirname, "./src/libs"),
    },
  },
  plugins: [
    react(),
    VitePWA({
      devOptions: {
        enabled: true,
        type: "module",
      },
      registerType: "autoUpdate",
      manifest: {
        name: "Настолки",
        theme_color: "#1976d2",
      },
    }),
    checker({
      typescript: true,
      eslint: {
        lintCommand:
          "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
      },
    }),
  ],
});
