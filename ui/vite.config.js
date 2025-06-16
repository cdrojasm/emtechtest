import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/chataiWebServerDev/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // Make sure this is your entry
      output: {
        manualChunks: () => 'everything', // prevent chunking
        entryFileNames: 'assets/chatai.js',
        chunkFileNames: 'assets/chatai.js',
        assetFileNames: ({ name }) => {
          if (name && name.endsWith('.css')) return 'assets/chatai.css'
          return 'assets/[name].[ext]'
        },
      },
    },
    cssCodeSplit: false, // ensure only one CSS file
  },
})
