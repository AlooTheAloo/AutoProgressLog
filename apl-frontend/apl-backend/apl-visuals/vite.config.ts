import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "./",
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'apexcharts': ['apexcharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    outDir: './visuals',
  }

})

