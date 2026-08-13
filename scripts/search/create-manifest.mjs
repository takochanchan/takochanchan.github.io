import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publications } from "../../src/publications.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "../..");
const argument = (name, fallback = null) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const assetsRoot = path.resolve(
  projectRoot,
  argument("--assets-root", ".cache/fulltext-assets"),
);
const mastersRootArg = argument("--masters-root");
const mastersRoot = mastersRootArg ? path.resolve(mastersRootArg) : null;
const output = path.resolve(
  projectRoot,
  argument("--output", ".cache/fulltext-search-manifest.json"),
);
const assetManifestBytes = await readFile(
  path.join(projectRoot, "assets-manifest.json"),
);
const assetManifest = JSON.parse(assetManifestBytes.toString("utf8"));
const archiveLedger = JSON.parse(
  await readFile(path.join(projectRoot, "master-archive.json"), "utf8"),
);
const assets = new Map(assetManifest.assets.map((asset) => [asset.path, asset]));
const masterPathFor = (slug) =>
  archiveLedger.publications[slug] ??
  archiveLedger.release_fallbacks?.[slug]?.canonical_path ??
  null;

const usableMaster = async (filename) => {
  if (!mastersRoot) return false;
  try {
    const info = await stat(filename);
    if (!info.isFile()) return false;
    if (info.size > 512) return true;
    const text = await readFile(filename, "utf8");
    return !text.startsWith("version https://git-lfs.github.com/spec/v1");
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
};

const works = [];
for (const publication of publications) {
  const masterPath = masterPathFor(publication.slug);
  if (!masterPath) throw new Error(`Missing master ledger entry: ${publication.slug}`);
  const pdfAsset = assets.get(publication.pdf);
  const epubAsset = assets.get(publication.epub);
  if (!pdfAsset || !epubAsset) {
    throw new Error(`Missing PDF/EPUB asset: ${publication.slug}`);
  }
  const canonicalMaster = mastersRoot
    ? path.join(mastersRoot, masterPath)
    : null;
  const useMaster = canonicalMaster && (await usableMaster(canonicalMaster));
  const sourceAsset = useMaster ? null : epubAsset;
  works.push({
    slug: publication.slug,
    title: publication.title,
    author: publication.author,
    recordClass: publication.recordClass,
    url: `/publications/${publication.slug}/`,
    pdfUrl: publication.pdfUrl,
    masterPath,
    source: useMaster
      ? canonicalMaster
      : path.join(assetsRoot, epubAsset.path),
    format: useMaster ? path.extname(masterPath).slice(1) : "epub",
    sourceMode: useMaster ? "canonical-master" : "approved-epub-mirror",
    sourceSha256: sourceAsset?.sha256,
    pdf: path.join(assetsRoot, pdfAsset.path),
    pdfSha256: pdfAsset.sha256,
    ocrPageLimit: publication.searchOcrPageLimit,
  });
}

const manifest = {
  schemaVersion: 1,
  archiveCommit: archiveLedger.archive_commit,
  assetManifestSha256: createHash("sha256")
    .update(assetManifestBytes)
    .digest("hex"),
  works,
};
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(manifest, null, 2) + "\n", "utf8");
const direct = works.filter((work) => work.sourceMode === "canonical-master").length;
process.stdout.write(
  `Search manifest: ${works.length} works (${direct} canonical masters, ` +
    `${works.length - direct} approved EPUB mirrors).\n`,
);
