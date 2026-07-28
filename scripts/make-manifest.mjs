import { createHash } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  publicationReleaseUrl,
  publications,
} from "../src/publications.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const sourceRoot = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(projectRoot, "static");
const sourceBase = "https://takochanchan.github.io";
const publicUrl = (relative) => {
  const extension = path.extname(relative).toLowerCase();
  if (extension === ".pdf" || extension === ".epub") {
    return `${publicationReleaseUrl}/${encodeURIComponent(path.basename(relative))}`;
  }
  return `${sourceBase}/${relative}`;
};
const manifestPath = path.join(projectRoot, "assets-manifest.json");
const previousManifest = JSON.parse(await readFile(manifestPath, "utf8"));
const previousByPath = new Map(
  previousManifest.assets.map((asset) => [asset.path, asset]),
);
const requiredPaths = [
  ...new Set(
    publications.flatMap((publication) => [
      publication.cover,
      publication.pdf,
      publication.epub,
    ]),
  ),
].sort();
const assets = [];
for (const relative of requiredPaths) {
  const file = path.join(sourceRoot, relative);
  try {
    const bytes = await readFile(file);
    const info = await stat(file);
    assets.push({
      path: relative,
      url: publicUrl(relative),
      size: info.size,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const previous = previousByPath.get(relative);
    if (!previous) {
      throw new Error(`Missing required archive asset: ${relative}`);
    }
    assets.push({ ...previous, url: publicUrl(relative) });
  }
}

await writeFile(
  manifestPath,
  `${JSON.stringify({ version: 1, assets }, null, 2)}\n`,
);
console.log(`Recorded ${assets.length} archive assets.`);
