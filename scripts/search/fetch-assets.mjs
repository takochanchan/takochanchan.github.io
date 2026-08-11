import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "../..");
const argument = (name, fallback = null) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const outputRoot = path.resolve(
  projectRoot,
  argument("--output", ".cache/fulltext-assets"),
);
const manifest = JSON.parse(
  await readFile(path.join(projectRoot, "assets-manifest.json"), "utf8"),
);
const assets = manifest.assets.filter(
  (asset) => asset.path.endsWith(".pdf") || asset.path.endsWith(".epub"),
);
const concurrency = Math.max(1, Number(argument("--concurrency", "3")) || 3);

const digestFile = async (filename) => {
  const digest = createHash("sha256");
  const bytes = await readFile(filename);
  digest.update(bytes);
  return digest.digest("hex");
};

const validExisting = async (asset, target) => {
  try {
    if ((await stat(target)).size !== asset.size) return false;
    return (await digestFile(target)) === asset.sha256;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
};

const fetchAsset = async (asset) => {
  const target = path.join(outputRoot, asset.path);
  if (await validExisting(asset, target)) {
    process.stdout.write(`Cached ${asset.path}\n`);
    return;
  }
  await mkdir(path.dirname(target), { recursive: true });
  const partial = target + ".part";
  await rm(partial, { force: true });
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(asset.url, {
        redirect: "follow",
        headers: { "user-agent": "takochan-fulltext-index/1.0" },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length !== asset.size) {
        throw new Error(`size ${bytes.length}, expected ${asset.size}`);
      }
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      if (sha256 !== asset.sha256) {
        throw new Error(`SHA-256 ${sha256}, expected ${asset.sha256}`);
      }
      await writeFile(partial, bytes);
      await rename(partial, target);
      process.stdout.write(`Fetched ${asset.path}\n`);
      return;
    } catch (error) {
      lastError = error;
      await rm(partial, { force: true });
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
      }
    }
  }
  throw new Error(`Failed ${asset.path}: ${lastError?.message || lastError}`);
};

let cursor = 0;
await Promise.all(
  Array.from({ length: Math.min(concurrency, assets.length) }, async () => {
    while (cursor < assets.length) {
      const asset = assets[cursor];
      cursor += 1;
      await fetchAsset(asset);
    }
  }),
);
process.stdout.write(`Verified ${assets.length} PDF/EPUB search assets.\n`);
