
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

function copyPublicAssetsExceptLiveStorage() {
  return {
    name: 'copy-public-assets-except-live-storage',
    apply: 'build',

    async closeBundle() {
      const publicDir = path.resolve(process.cwd(), 'public');
      const outDir = path.resolve(process.cwd(), 'dist');
      const liveStorageDir = path.resolve(
        publicDir,
        'assets',
        'delta-storage'
      );

      await mkdir(outDir, { recursive: true });

      await cp(publicDir, outDir, {
        recursive: true,
        force: true,
        filter: (source) => {
          const resolved = path.resolve(source);

          return (
            resolved !== liveStorageDir &&
            !resolved.startsWith(liveStorageDir + path.sep)
          );
        },
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), copyPublicAssetsExceptLiveStorage()],
  publicDir: false,
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});