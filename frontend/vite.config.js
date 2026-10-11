import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const proxy = {
  "/api": {
    target: process.env.API_PROXY_TARGET || "http://localhost:8085",
    changeOrigin: true,
  },
};
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true, proxy },
  preview: { port: 5173, strictPort: true, proxy },
  build: { rollupOptions: { output: { manualChunks(id) {
    if (id.includes("/src/locales/") || id.endsWith("/src/i18n.js") || id.includes("/node_modules/i18next/") || id.includes("/node_modules/react-i18next/")) return "localization";
    if (id.includes("/node_modules/")) return "vendor";
  } } } },
});
