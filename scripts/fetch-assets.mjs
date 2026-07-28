import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const manifest = JSON.parse(
  await readFile(path.join(projectRoot, "assets-manifest.json"), "utf8"),
);
const outputRoot = path.join(projectRoot, "dist");
const bundledRoot = path.join(projectRoot, "static");
const concurrency = 3;

const verifyAndWrite = async (asset, bytes, sourceLabel) => {
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (sha256 !== asset.sha256) {
    throw new Error(
      `checksum mismatch: expected ${asset.sha256}, received ${sha256}`,
    );
  }
  if (bytes.length !== asset.size) {
    throw new Error(
      `size mismatch: expected ${asset.size}, received ${bytes.length}`,
    );
  }
  const target = path.join(outputRoot, asset.path);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes);
  console.log(`${sourceLabel} ${asset.path}`);
};

const download = async (asset) => {
  try {
    const bytes = await readFile(path.join(bundledRoot, asset.path));
    await verifyAndWrite(asset, bytes, "Bundled");
    return;
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(asset.url, {
        headers: { "user-agent": "archive-pages-build/1.0" },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      await verifyAndWrite(asset, bytes, "Fetched");
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  throw new Error(`Failed ${asset.path}: ${lastError.message}`);
};

let next = 0;
const workers = Array.from(
  { length: Math.min(concurrency, manifest.assets.length) },
  async () => {
    while (next < manifest.assets.length) {
      const asset = manifest.assets[next];
      next += 1;
      await download(asset);
    }
  },
);

await Promise.all(workers);
console.log(`Fetched and verified ${manifest.assets.length} archive assets.`);
