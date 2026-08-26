import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
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
const config = await readSearchShardConfig(projectRoot);
validateSearchShardAssignments(publications, config);
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
const assetManifestSha256 = createHash("sha256")
  .update(assetManifestBytes)
  .digest("hex");
const bibliographicManifestSha256 = createHash("sha256")
  .update(bibliographicManifestBytes)
  .digest("hex");

const fetchRequired = async (url, type) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${type} unavailable (${response.status}): ${url}`);
  }
  return response;
};

let totalWorks = 0;
let totalDocuments = 0;
let totalBytes = 0;
const seenSlugs = new Set();
for (const shard of config.shards) {
  const expected = publicationsForSearchShard(publications, shard.id);
  const expectedSlugs = expected.map((publication) => publication.slug).sort();
  const metadataUrl = new URL("search-meta.json", shard.baseUrl).href;
  const documentMapUrl = new URL("document-map.json", shard.baseUrl).href;
  const moduleUrl = new URL("pagefind/pagefind.js", shard.baseUrl).href;
  const strictWorks = expected.filter((publication) =>
    strictBibliography.has(publication.slug),
  );
  const [metadata, documentMap, moduleSource, strictMaps] = await Promise.all([
    fetchRequired(metadataUrl, "Search metadata").then((response) =>
      response.json(),
    ),
    fetchRequired(documentMapUrl, "Search document map").then((response) =>
      response.json(),
    ),
    fetchRequired(moduleUrl, "Pagefind module").then((response) =>
      response.text(),
    ),
    Promise.all(
      strictWorks.map((publication) =>
        fetchRequired(
          new URL(`maps/${publication.slug}.json`, shard.baseUrl).href,
          "Strict bibliography search map",
        ).then((response) => response.json()),
      ),
    ),
  ]);
  const actualSlugs = [...(metadata.workSlugs || [])].sort();
  const sealedShard = Number.isInteger(shard.sealedWorks);
  const currentGlobalMetadata =
    metadata.archiveCommit === archive.archive_commit &&
    metadata.assetManifestSha256 === assetManifestSha256 &&
    metadata.bibliographicManifestSha256 === bibliographicManifestSha256;
  const mappedSlugs = new Set();
  for (const mapping of Object.values(documentMap.fragments || {})) {
    if (!Array.isArray(mapping) || !expectedSlugs.includes(mapping[0])) {
      throw new Error(`Search shard ${shard.id} has an unexpected fragment`);
    }
    mappedSlugs.add(mapping[0]);
  }
  if (
    metadata.schemaVersion !== 1 ||
    metadata.searchShard !== shard.id ||
    (!sealedShard && !currentGlobalMetadata) ||
    metadata.works !== expected.length ||
    JSON.stringify(actualSlugs) !== JSON.stringify(expectedSlugs) ||
    metadata.books !== expected.filter(
      (publication) => publication.recordClass === "major-work",
    ).length ||
    metadata.papers !== expected.filter(
      (publication) => publication.recordClass === "short-work",
    ).length ||
    !Number.isInteger(metadata.chunks) ||
    metadata.chunks < expected.length ||
    !Number.isInteger(metadata.pagefindBytes) ||
    metadata.pagefindBytes < 1 ||
    metadata.pagefindBytes > config.maxBytesPerShard ||
    documentMap.schemaVersion !== 1 ||
    documentMap.documents !== metadata.documents ||
    Object.keys(documentMap.fragments || {}).length !== metadata.documents ||
    mappedSlugs.size !== expected.length ||
    moduleSource.length < 1000
  ) {
    throw new Error(`Search shard ${shard.id} is stale or incomplete`);
  }
  for (const [index, publication] of strictWorks.entries()) {
    const strict = strictBibliography.get(publication.slug);
    const pageMap = strictMaps[index];
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
        throw new Error(`${publication.slug}: remote search ${field} is stale`);
      }
    }
    if (pageMap.pdfSha256 !== strict.assets.pdf.sha256) {
      throw new Error(`${publication.slug}: remote search PDF is stale`);
    }
    const sourcePages = new Set();
    for (const mapping of Object.values(pageMap.blocks || {})) {
      for (const match of String(mapping?.[0]).matchAll(/原刊 p\.\s*(\d+)/gu)) {
        sourcePages.add(Number(match[1]));
      }
    }
    if (
      strict.sourcePages.markers.some((page) => !sourcePages.has(page)) ||
      sourcePages.has(strict.sourcePages.nextWorkStartsAt)
    ) {
      throw new Error(`${publication.slug}: remote search source scope is stale`);
    }
  }
  for (const slug of actualSlugs) {
    if (seenSlugs.has(slug)) {
      throw new Error(`Publication occurs in multiple search shards: ${slug}`);
    }
    seenSlugs.add(slug);
  }
  totalWorks += metadata.works;
  totalDocuments += metadata.documents;
  totalBytes += metadata.pagefindBytes;
}

if (totalWorks !== publications.length || seenSlugs.size !== publications.length) {
  throw new Error(
    `Remote search coverage: ${seenSlugs.size}/${publications.length} works`,
  );
}
process.stdout.write(
  `Remote search shards OK: ${config.shards.length} shard(s), ` +
    `${totalWorks} works, ${totalDocuments} documents, ${totalBytes} bytes.\n`,
);
