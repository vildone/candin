import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Production container'da 0.0.0.0'dan erişim için
    host: "0.0.0.0",
    // VPS'te PORT env ile 8760, local'de 8765
    port: parseInt(process.env.PORT || "8765"),
    strictPort: true,
    allowedHosts: [
      ".trycloudflare.com",
      "localhost",
      "mirac.app",
      ".hstgr.cloud",
      "76.13.14.41",
    ],
    // PB proxy: VPS'te VITE_PB_PROXY=http://candin-pb:8090, local'de localhost:8090
    proxy: {
      "/api": {
        target: process.env.VITE_PB_PROXY || "http://localhost:8090",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
