import path from "node:path";
import vue from "@vitejs/plugin-vue";
import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";
import tailwind from "tailwindcss";

export default defineConfig({
  css: {
    postcss: {
      plugins: [autoprefixer(), tailwind()],
    },
  },
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ["eleven-sheep-trade.loca.lt"],
  },
});
