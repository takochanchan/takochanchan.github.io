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
const assetManifestSha256 = createHash("sha256")
  .update(assetManifestBytes)
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
  const [metadata, documentMap, moduleSource] = await Promise.all([
    fetchRequired(metadataUrl, "Search metadata").then((response) =>
      response.json(),
    ),
    fetchRequired(documentMapUrl, "Search document map").then((response) =>
      response.json(),
    ),
    fetchRequired(moduleUrl, "Pagefind module").then((response) =>
      response.text(),
    ),
  ]);
  const actualSlugs = [...(metadata.workSlugs || [])].sort();
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
    metadata.archiveCommit !== archive.archive_commit ||
    metadata.assetManifestSha256 !== assetManifestSha256 ||
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
