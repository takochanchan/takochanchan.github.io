import { readFile } from "node:fs/promises";
import path from "node:path";

const SHARD_ID = /^\d{3}$/;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export const readSearchShardConfig = async (projectRoot) => {
  const filename = path.join(projectRoot, "search-shards.json");
  const config = JSON.parse(await readFile(filename, "utf8"));
  if (config.schemaVersion !== 1) {
    throw new Error("Unsupported search shard configuration");
  }
  if (!SHARD_ID.test(config.defaultShard || "")) {
    throw new Error("Invalid default search shard");
  }
  if (
    !Number.isInteger(config.maxWorksPerShard) ||
    config.maxWorksPerShard < 250 ||
    config.maxWorksPerShard > 400
  ) {
    throw new Error("Search shard work limit must be between 250 and 400");
  }
  if (
    !Number.isInteger(config.maxBytesPerShard) ||
    config.maxBytesPerShard < 100 * 1024 * 1024 ||
    config.maxBytesPerShard > 900 * 1024 * 1024
  ) {
    throw new Error("Search shard byte limit is outside the safe Pages range");
  }
  if (!Array.isArray(config.shards) || !config.shards.length) {
    throw new Error("At least one search shard is required");
  }

  const ids = new Set();
  const repositories = new Set();
  const baseUrls = new Set();
  for (const shard of config.shards) {
    if (!SHARD_ID.test(shard.id || "") || ids.has(shard.id)) {
      throw new Error(`Invalid or duplicate search shard: ${shard.id}`);
    }
    if (!REPOSITORY.test(shard.repository || "") || repositories.has(shard.repository)) {
      throw new Error(`Invalid or duplicate search repository: ${shard.repository}`);
    }
    let baseUrl;
    try {
      baseUrl = new URL(shard.baseUrl);
    } catch {
      throw new Error(`Invalid search shard URL: ${shard.baseUrl}`);
    }
    if (
      baseUrl.protocol !== "https:" ||
      baseUrl.hostname !== "takochanchan.github.io" ||
      !baseUrl.pathname.endsWith("/") ||
      baseUrls.has(baseUrl.href)
    ) {
      throw new Error(`Unsafe or duplicate search shard URL: ${shard.baseUrl}`);
    }
    ids.add(shard.id);
    repositories.add(shard.repository);
    baseUrls.add(baseUrl.href);
  }
  if (!ids.has(config.defaultShard)) {
    throw new Error("Default search shard is not configured");
  }
  return config;
};

export const publicationsForSearchShard = (publications, shardId) =>
  publications.filter((publication) => publication.searchShard === shardId);

export const validateSearchShardAssignments = (publications, config) => {
  const configured = new Set(config.shards.map((shard) => shard.id));
  const slugs = new Set();
  const counts = new Map(config.shards.map((shard) => [shard.id, 0]));
  for (const publication of publications) {
    if (slugs.has(publication.slug)) {
      throw new Error(`Duplicate publication slug: ${publication.slug}`);
    }
    slugs.add(publication.slug);
    if (!configured.has(publication.searchShard)) {
      throw new Error(
        `${publication.slug}: unknown search shard ${publication.searchShard}`,
      );
    }
    counts.set(publication.searchShard, counts.get(publication.searchShard) + 1);
  }
  for (const [shardId, count] of counts) {
    if (count > config.maxWorksPerShard) {
      throw new Error(
        `Search shard ${shardId} has ${count}/${config.maxWorksPerShard} works`,
      );
    }
  }
  return counts;
};

export const browserSearchShards = (config) =>
  config.shards.map((shard) => ({
    id: shard.id,
    pagefindModule: new URL("pagefind/pagefind.js", shard.baseUrl).href,
    pagefindBase: new URL("pagefind/", shard.baseUrl).href,
    documentMapPath: new URL("document-map.json", shard.baseUrl).href,
    mapsPath: new URL("maps/", shard.baseUrl).href,
    metadataPath: new URL("search-meta.json", shard.baseUrl).href,
  }));
