import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "public/assets/*",
          dest: "assets",
        },
      ],
    }),
  ],

  publicDir: false,

  build: {
    emptyOutDir: true,
  },
});