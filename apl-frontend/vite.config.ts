import fs from "node:fs";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import electron from "vite-plugin-electron/simple";
import pkg from "./package.json";

// @ts-ignore
export default defineConfig(({ command }) => {
  fs.rmSync("dist-electron", { recursive: true, force: true });

  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    optimizeDeps: {
      exclude: [
        "node-mac-permissions",
        "@miniben90/x-win",
        "electron-app-universal-protocol-client",
      ],
    },
    plugins: [
      vue(),
      electron({
        main: {
          entry: "electron/main/index.ts",
          onstart({ startup }) {
            if (process.env.VSCODE_DEBUG) {
              console.log("[startup] Electron App");
            } else {
              startup();
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: "dist-electron/main",
              rollupOptions: {
                external: [
                  ...Object.keys("dependencies" in pkg ? pkg.dependencies : {}),
                  "electron-app-universal-protocol-client",
                  // maybe also the native bindings directly:
                  "electron-app-universal-protocol-client/prebuilds/darwin-arm64/node.napi.uv1.armv8.node",
                  "electron-app-universal-protocol-client/prebuilds/darwin-x64/node.napi.uv1.node",
                ],
              },
            },
          },
        },
        preload: {
          input: "electron/preload/index.ts",
          vite: {
            build: {
              sourcemap: sourcemap ? "inline" : undefined,
              minify: isBuild,
              outDir: "dist-electron/preload",
              rollupOptions: {
                external: [
                  ...Object.keys("dependencies" in pkg ? pkg.dependencies : {}),
                  "electron-app-universal-protocol-client",
                  // maybe also the native bindings directly:
                  "electron-app-universal-protocol-client/prebuilds/darwin-arm64/node.napi.uv1.armv8.node",
                  "electron-app-universal-protocol-client/prebuilds/darwin-x64/node.napi.uv1.node",
                ],
              },
            },
          },
        },
        renderer: {},
      }),
    ],
    server:
      process.env.VSCODE_DEBUG &&
      (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
        return {
          host: url.hostname,
          port: +url.port,
        };
      })(),
    clearScreen: false,
  };
});
