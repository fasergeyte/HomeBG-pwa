import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import checker from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";
  const base = isProd ? "/HomeBG-pwa" : "";
  return {
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
          start_url: base,
          scope: base,
          icons: [192, 256, 384, 512].map((x) => ({
            src: `${base}/vite.svg`,
            sizes: `${x}x${x}`,
            type: "image/svg+xml",
          })),
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.origin === "https://apis.google.com",
              handler: "NetworkFirst",
              options: {
                cacheName: "api-cache",
              },
            },
          ],
        },
      }),
      checker({
        typescript: true,
        overlay: false,
        eslint: {
          useFlatConfig: true,
          lintCommand:
            "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
        },
      }),
    ],
  };
});
