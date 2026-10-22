
import { build } from "vite";
import fs from "node:fs/promises";
import path from "node:path";

await build();

const publicAssets = path.resolve("public/assets");
const distAssets = path.resolve("dist/assets");

for (const folder of ["uploads", "data"]) {
  await fs.rm(path.join(distAssets, folder), {
    recursive: true,
    force: true,
  });
}

console.log("Build complete. Excluded assets/uploads and assets/data.");