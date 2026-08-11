import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publications } from "../../src/publications.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "../..");
const argument = (name, fallback = null) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const directory = path.resolve(
  projectRoot,
  argument("--directory", "dist/search"),
);
const metadata = JSON.parse(
  await readFile(path.join(directory, "search-meta.json"), "utf8"),
);
const archive = JSON.parse(
  await readFile(path.join(projectRoot, "master-archive.json"), "utf8"),
);
const assetManifestBytes = await readFile(
  path.join(projectRoot, "assets-manifest.json"),
);
const assetManifest = JSON.parse(assetManifestBytes.toString("utf8"));
const assets = new Map(assetManifest.assets.map((asset) => [asset.path, asset]));
const expectedAssetSha = createHash("sha256")
  .update(assetManifestBytes)
  .digest("hex");
const expectedSlugs = publications.map((publication) => publication.slug).sort();
const actualSlugs = [...(metadata.workSlugs || [])].sort();

if (metadata.schemaVersion !== 1) throw new Error("Unsupported search metadata");
if (metadata.archiveCommit !== archive.archive_commit) {
  throw new Error("Search index uses a stale archive commit");
}
if (metadata.assetManifestSha256 !== expectedAssetSha) {
  throw new Error("Search index uses a stale asset manifest");
}
if (metadata.works !== publications.length) {
  throw new Error(`Search index has ${metadata.works}/${publications.length} works`);
}
if (JSON.stringify(actualSlugs) !== JSON.stringify(expectedSlugs)) {
  throw new Error("Search index slug set does not match the public catalogue");
}
if (metadata.books + metadata.papers !== publications.length) {
  throw new Error("Search index book/paper counts are inconsistent");
}
if (!Number.isInteger(metadata.chunks) || metadata.chunks < publications.length) {
  throw new Error("Search index contains too few text chunks");
}
if ((await stat(path.join(directory, "pagefind", "pagefind.js"))).size < 1000) {
  throw new Error("Pagefind browser module is missing or empty");
}

const mapNames = (await readdir(path.join(directory, "maps")))
  .filter((name) => name.endsWith(".json"))
  .sort();
if (mapNames.length !== publications.length) {
  throw new Error(`Search page maps: ${mapNames.length}/${publications.length}`);
}
for (const publication of publications) {
  const filename = path.join(directory, "maps", publication.slug + ".json");
  const pageMap = JSON.parse(await readFile(filename, "utf8"));
  const canonicalUrl = `/publications/${publication.slug}/`;
  if (pageMap.slug !== publication.slug) throw new Error(`Wrong map slug: ${filename}`);
  if (pageMap.canonicalUrl !== canonicalUrl) {
    throw new Error(`${publication.slug}: search result must open its bibliography page`);
  }
  if (pageMap.pdfUrl !== publication.pdfUrl) {
    throw new Error(`${publication.slug}: stale PDF URL in search map`);
  }
  const pdfAsset = assets.get(publication.pdf);
  const epubAsset = assets.get(publication.epub);
  if (!pdfAsset || !epubAsset) {
    throw new Error(`${publication.slug}: PDF/EPUB asset manifest entry is missing`);
  }
  if (pageMap.pdfSha256 !== pdfAsset.sha256) {
    throw new Error(`${publication.slug}: stale PDF checksum in search map`);
  }
  if (!archive.publications[publication.slug] || pageMap.masterPath !== archive.publications[publication.slug]) {
    throw new Error(`${publication.slug}: missing canonical master reference`);
  }
  if (!['canonical-master', 'approved-epub-mirror'].includes(pageMap.sourceMode)) {
    throw new Error(`${publication.slug}: invalid search source mode`);
  }
  if (
    pageMap.sourceMode === "approved-epub-mirror" &&
    pageMap.sourceSha256 !== epubAsset.sha256
  ) {
    throw new Error(`${publication.slug}: stale EPUB source checksum in search map`);
  }
  if (!/^[a-f0-9]{64}$/.test(pageMap.sourceSha256 || "")) {
    throw new Error(`${publication.slug}: invalid search source checksum`);
  }
  if (!['embedded', 'japanese-ocr'].includes(pageMap.pdfTextMode)) {
    throw new Error(`${publication.slug}: invalid PDF text mapping mode`);
  }
  const blocks = Object.entries(pageMap.blocks || {});
  if (!blocks.length) throw new Error(`${publication.slug}: empty search page map`);
  const orders = new Set();
  for (const [blockId, mapping] of blocks) {
    if (!/^b\d{5}$/.test(blockId)) throw new Error(`${publication.slug}: unsafe block ID`);
    if (
      !Array.isArray(mapping) ||
      !/^(?:原刊|原資料|原書|原写本|原稿|底本|原誌|原報告)/.test(String(mapping[0]))
    ) {
      throw new Error(`${publication.slug}: missing original-page label`);
    }
    if (
      !Number.isInteger(mapping[1]) ||
      mapping[1] < 1 ||
      mapping[1] > publication.pageCount
    ) {
      throw new Error(`${publication.slug}: invalid physical PDF page`);
    }
    if (!Number.isInteger(mapping[2]) || mapping[2] < 0) {
      throw new Error(`${publication.slug}: invalid source order`);
    }
    orders.add(mapping[2]);
  }
  if (orders.size !== blocks.length || Math.max(...orders) !== blocks.length - 1) {
    throw new Error(`${publication.slug}: duplicate or incomplete source order`);
  }
  const mappingSummary = metadata.mappings?.[publication.slug];
  const verifiedRate = mappingSummary?.verifiedRate;
  if (!Number.isFinite(verifiedRate) || verifiedRate < 0.9) {
    throw new Error(`${publication.slug}: PDF mapping is below 90%`);
  }
  const mappedChunkTotal = [
    "exact",
    "fingerprint",
    "fuzzy",
    "sourcePage",
    "inherited",
    "unmapped",
  ].reduce((sum, method) => sum + (mappingSummary?.[method] || 0), 0);
  if (mappedChunkTotal !== blocks.length || mappingSummary.unmapped !== 0) {
    throw new Error(`${publication.slug}: mapping summary is incomplete`);
  }
}

process.stdout.write(
  `Search index OK: ${metadata.books} books, ${metadata.papers} papers, ` +
    `${metadata.chunks.toLocaleString("en-US")} chunks.\n`,
);
