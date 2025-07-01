import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import pkg from "./package.json";

export default defineConfig({
  main: {
    optimizeDeps: {
      exclude: ["electron-app-universal-protocol-client"],
    },
    build: {
      watch: {},
      outDir: "dist/main",
      rollupOptions: {
        external: [
          ...(pkg.dependencies ? Object.keys(pkg.dependencies) : []),
          "@bokuweb/zstd-wasm",
          "electron-app-universal-protocol-client",
          /\.node$/,
        ],
      },
      lib: {
        entry: "electron/main/index.ts",
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    optimizeDeps: {
      exclude: ["electron-app-universal-protocol-client"],
    },
    build: {
      watch: {},
      outDir: "dist/preload",
      rollupOptions: {
        external: [
          ...(pkg.dependencies ? Object.keys(pkg.dependencies) : []),
          "@bokuweb/zstd-wasm",
          "electron-app-universal-protocol-client",
        ],
      },
      lib: {
        entry: "electron/preload/index.ts",
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    optimizeDeps: {
      exclude: ["electron-app-universal-protocol-client"],
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, "src/index.html"),
      },
    },
    root: "./src",
    resolve: {
      alias: {
        "@renderer": resolve("src"),
      },
    },
    plugins: [vue()],
  },
});
