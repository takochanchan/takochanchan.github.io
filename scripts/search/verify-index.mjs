import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publications } from "../../src/publications.mjs";
import {
  publicationsForSearchShard,
  readSearchShardConfig,
  validateSearchShardAssignments,
} from "./shard-config.mjs";

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
const searchShard = argument("--shard", process.env.SEARCH_SHARD || null);
const searchShardConfig = await readSearchShardConfig(projectRoot);
validateSearchShardAssignments(publications, searchShardConfig);
if (
  searchShard &&
  !searchShardConfig.shards.some((shard) => shard.id === searchShard)
) {
  throw new Error(`Unknown search shard: ${searchShard}`);
}
const expectedPublications = searchShard
  ? publicationsForSearchShard(publications, searchShard)
  : publications;
const metadata = JSON.parse(
  await readFile(path.join(directory, "search-meta.json"), "utf8"),
);
const documentMap = JSON.parse(
  await readFile(path.join(directory, "document-map.json"), "utf8"),
);
const archive = JSON.parse(
  await readFile(path.join(projectRoot, "master-archive.json"), "utf8"),
);
const assetManifestBytes = await readFile(
  path.join(projectRoot, "assets-manifest.json"),
);
const bibliographicManifestBytes = await readFile(
  path.join(projectRoot, "bibliographic-manifest.json"),
);
const bibliographicManifest = JSON.parse(
  bibliographicManifestBytes.toString("utf8"),
);
const strictBibliography = new Map(
  bibliographicManifest.works.map((work) => [work.slug, work]),
);
const assetManifest = JSON.parse(assetManifestBytes.toString("utf8"));
const assets = new Map(assetManifest.assets.map((asset) => [asset.path, asset]));
const masterPathFor = (slug) =>
  archive.publications[slug] ??
  archive.release_fallbacks?.[slug]?.canonical_path ??
  null;
const expectedAssetSha = createHash("sha256")
  .update(assetManifestBytes)
  .digest("hex");
const expectedBibliographicSha = createHash("sha256")
  .update(bibliographicManifestBytes)
  .digest("hex");
const expectedSlugs = expectedPublications
  .map((publication) => publication.slug)
  .sort();
const actualSlugs = [...(metadata.workSlugs || [])].sort();
const sourceLocationLabelPattern = new RegExp(
  "^(?:底本位置なし（前付）|" +
    "前付・底本PDF|付録・底本PDF|裏表紙・底本PDF|" +
    "原冊|原刊|原資料|原書|原写本|写本|自筆稿|原稿|底本|原誌|原報告|" +
    "クラウス\\s*117\\s*写本|PMM\\s*\\d+\\s*,|出所|" +
    "(?:未丁付)?第\\s*\\d+\\s*葉[表裏]|主底本|補完底本|合成底本)",
);

if (metadata.schemaVersion !== 1) throw new Error("Unsupported search metadata");
if ((metadata.searchShard ?? null) !== searchShard) {
  throw new Error("Search index shard identifier is stale");
}
if (metadata.archiveCommit !== archive.archive_commit) {
  throw new Error("Search index uses a stale archive commit");
}
if (metadata.assetManifestSha256 !== expectedAssetSha) {
  throw new Error("Search index uses a stale asset manifest");
}
if (metadata.bibliographicManifestSha256 !== expectedBibliographicSha) {
  throw new Error("Search index uses a stale bibliographic manifest");
}
if (metadata.works !== expectedPublications.length) {
  throw new Error(
    `Search index has ${metadata.works}/${expectedPublications.length} works`,
  );
}
if (JSON.stringify(actualSlugs) !== JSON.stringify(expectedSlugs)) {
  throw new Error("Search index slug set does not match the public catalogue");
}
if (metadata.books + metadata.papers !== expectedPublications.length) {
  throw new Error("Search index book/paper counts are inconsistent");
}
if (
  !Number.isInteger(metadata.chunks) ||
  metadata.chunks < expectedPublications.length
) {
  throw new Error("Search index contains too few text chunks");
}
if (
  documentMap.schemaVersion !== 1 ||
  !Number.isInteger(documentMap.documents) ||
  documentMap.documents < expectedPublications.length ||
  metadata.documents !== documentMap.documents
) {
  throw new Error("Search document map is missing or inconsistent");
}
if ((await stat(path.join(directory, "pagefind", "pagefind.js"))).size < 1000) {
  throw new Error("Pagefind browser module is missing or empty");
}
if (
  !Number.isInteger(metadata.pagefindBytes) ||
  metadata.pagefindBytes < 1 ||
  metadata.pagefindBytes > searchShardConfig.maxBytesPerShard
) {
  throw new Error(
    `Search shard size exceeds its Pages budget: ${metadata.pagefindBytes}`,
  );
}

const publicationBySlug = new Map(
  expectedPublications.map((publication) => [publication.slug, publication]),
);
const fragmentDirectory = path.join(directory, "pagefind", "fragment");
const fragmentNames = (await readdir(fragmentDirectory))
  .filter((name) => name.endsWith(".pf_fragment"))
  .sort();
const fragmentNameSet = new Set(fragmentNames);
const mappedFragments = Object.entries(documentMap.fragments || {});
if (
  fragmentNames.length !== documentMap.documents ||
  mappedFragments.length !== documentMap.documents
) {
  throw new Error(
    `Search fragments: ${fragmentNames.length}/${documentMap.documents}`,
  );
}
const partsBySlug = new Map();
for (const [fragmentId, mapping] of mappedFragments) {
  if (!/^ja_[a-f0-9]+$/.test(fragmentId) || !Array.isArray(mapping)) {
    throw new Error(`Invalid search document mapping: ${fragmentId}`);
  }
  const [slug, recordClass, partIndex] = mapping;
  const publication = publicationBySlug.get(slug);
  if (
    !publication ||
    publication.recordClass !== recordClass ||
    !Number.isInteger(partIndex) ||
    partIndex < 0
  ) {
    throw new Error(`Invalid search document metadata: ${fragmentId}`);
  }
  const filename = `${fragmentId}.pf_fragment`;
  if (!fragmentNameSet.has(filename)) {
    throw new Error(`Mapped search fragment is missing: ${filename}`);
  }
  const bytes = (await stat(path.join(fragmentDirectory, filename))).size;
  if (bytes > 750_000) {
    throw new Error(`Search fragment exceeds the mobile budget: ${filename}`);
  }
  if (!partsBySlug.has(slug)) partsBySlug.set(slug, []);
  partsBySlug.get(slug).push(partIndex);
}
for (const publication of expectedPublications) {
  const parts = (partsBySlug.get(publication.slug) || []).sort((a, b) => a - b);
  if (
    !parts.length ||
    parts.some((partIndex, index) => partIndex !== index)
  ) {
    throw new Error(`${publication.slug}: incomplete search document sequence`);
  }
}

const mapNames = (await readdir(path.join(directory, "maps")))
  .filter((name) => name.endsWith(".json"))
  .sort();
if (mapNames.length !== expectedPublications.length) {
  throw new Error(
    `Search page maps: ${mapNames.length}/${expectedPublications.length}`,
  );
}
for (const publication of expectedPublications) {
  const filename = path.join(directory, "maps", publication.slug + ".json");
  const pageMap = JSON.parse(await readFile(filename, "utf8"));
  const canonicalUrl = `/publications/${publication.slug}/`;
  if (pageMap.slug !== publication.slug) throw new Error(`Wrong map slug: ${filename}`);
  for (const field of [
    "title",
    "author",
    "originalTitle",
    "originalAuthor",
    "originalPublication",
    "attributedTo",
    "attributionStatus",
    "attributionNote",
  ]) {
    if ((pageMap[field] ?? null) !== (publication[field] ?? null)) {
      throw new Error(`${publication.slug}: stale ${field} in search map`);
    }
  }
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
  const masterPath = masterPathFor(publication.slug);
  if (!masterPath || pageMap.masterPath !== masterPath) {
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
  const sourcePages = new Set();
  for (const [blockId, mapping] of blocks) {
    if (!/^b\d{5}$/.test(blockId)) throw new Error(`${publication.slug}: unsafe block ID`);
    if (
      !Array.isArray(mapping) ||
      !sourceLocationLabelPattern.test(String(mapping[0]))
    ) {
      throw new Error(`${publication.slug}: missing source-location label`);
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
    for (const match of String(mapping[0]).matchAll(/原刊 p\.\s*(\d+)/gu)) {
      sourcePages.add(Number(match[1]));
    }
  }
  const strict = strictBibliography.get(publication.slug);
  if (strict) {
    const expectedMarkers = strict.sourcePages.markers;
    if (
      expectedMarkers.some((page) => !sourcePages.has(page)) ||
      sourcePages.has(strict.sourcePages.nextWorkStartsAt)
    ) {
      throw new Error(`${publication.slug}: source-page scope differs from bibliography`);
    }
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
