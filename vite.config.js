import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { cp, mkdir } from 'node:fs/promises'
import path from 'node:path'

// Copy ordinary public assets to dist, but never copy admin-managed runtime
// data/uploads into the build output. Runtime storage is served by Express.
function copyPublicAssetsExceptRuntimeStorage() {
  return {
    name: 'copy-public-assets-except-runtime-storage',
    apply: 'build',
    async closeBundle() {
      const publicDir = path.resolve(process.cwd(), 'public')
      const outDir = path.resolve(process.cwd(), 'dist')
      const runtimeStorageDir = path.resolve(publicDir, 'assets', 'delta-storage')

      await mkdir(outDir, { recursive: true })
      await cp(publicDir, outDir, {
        recursive: true,
        force: true,
        filter(source) {
          const resolved = path.resolve(source)
          return resolved !== runtimeStorageDir &&
            !resolved.startsWith(runtimeStorageDir + path.sep)
        },
      })
    },
  }
}

export default defineConfig({
  // Disable Vite's automatic public copy; the plugin above copies it safely.
  publicDir: false,
  plugins: [react(), copyPublicAssetsExceptRuntimeStorage()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
