import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// import { cp, mkdir } from 'node:fs/promises'
// import path from 'node:path'

// Vite's default public-folder copy is disabled below. This plugin copies
// normal public assets to dist after the build, while excluding live storage.
// function copyPublicAssetsExceptLiveStorage() {
//   return {
//     name: 'copy-public-assets-except-live-storage',
//     apply: 'build',
//     async closeBundle() {
//       const publicDir = path.resolve(process.cwd(), 'public')
//       const outDir = path.resolve(process.cwd(), 'dist')
//       const liveStorageDir = path.resolve(publicDir, 'assets', 'delta-storage')

//       await mkdir(outDir, { recursive: true })
//       await cp(publicDir, outDir, {
//         recursive: true,
//         force: true,
//         filter: (source) => {
//           const resolved = path.resolve(source)
//           return resolved !== liveStorageDir &&
//             !resolved.startsWith(liveStorageDir + path.sep)
//         },
//       })
//     },
//   }
// }

// https://vite.dev/config/
export default defineConfig({
  //plugins: [react(), copyPublicAssetsExceptLiveStorage()],
  //publicDir: false,
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
  },
})
