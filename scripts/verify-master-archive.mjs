import { readFile } from "node:fs/promises";

import { publications } from "../src/publications.mjs";

const ledgerUrl = new URL("../master-archive.json", import.meta.url);
const ledger = JSON.parse(await readFile(ledgerUrl, "utf8"));
const shaPattern = /^[0-9a-f]{40}$/;
const sha256Pattern = /^[0-9a-f]{64}$/;
const masterPattern = /^publications\/([a-z0-9]+(?:-[a-z0-9]+)*)\/master\.(?:docx|md)$/;

const fail = (message) => {
  throw new Error(`Working-master archive gate: ${message}`);
};

if (![1, 2].includes(ledger.schema_version)) {
  fail("unsupported schema_version");
}
if (ledger.repository !== "takochanchan/-archive-masters") {
  fail("incorrect private repository");
}
if (!shaPattern.test(ledger.archive_commit ?? "")) {
  fail("archive_commit must be a full 40-character commit SHA");
}
if (
  !ledger.publications ||
  typeof ledger.publications !== "object" ||
  Array.isArray(ledger.publications)
) {
  fail("publications must be an object");
}
const releaseFallbacks = ledger.release_fallbacks ?? {};
if (
  typeof releaseFallbacks !== "object" ||
  Array.isArray(releaseFallbacks)
) {
  fail("release_fallbacks must be an object");
}
if (ledger.schema_version === 1 && Object.keys(releaseFallbacks).length) {
  fail("release_fallbacks require schema_version 2");
}

const siteSlugs = publications.map((item) => item.slug);
const siteSlugSet = new Set(siteSlugs);
const archivedSlugs = Object.keys(ledger.publications);
const fallbackSlugs = Object.keys(releaseFallbacks);
const overlap = archivedSlugs.filter((slug) => slug in releaseFallbacks);
if (overlap.length) {
  fail(`slug stored twice; overlap=${overlap.join(",")}`);
}
const ledgerSlugs = [...archivedSlugs, ...fallbackSlugs];
const ledgerSlugSet = new Set(ledgerSlugs);
const missing = siteSlugs.filter((slug) => !ledgerSlugSet.has(slug));
const stale = ledgerSlugs.filter((slug) => !siteSlugSet.has(slug));
if (missing.length || stale.length) {
  fail(`slug mismatch; missing=${missing.join(",")}; stale=${stale.join(",")}`);
}

const paths = new Set();
for (const slug of siteSlugs) {
  const fallback = releaseFallbacks[slug];
  const path = ledger.publications[slug] ?? fallback?.canonical_path;
  const match = typeof path === "string" ? path.match(masterPattern) : null;
  if (!match || match[1] !== slug) {
    fail(`${slug}: invalid canonical master path`);
  }
  if (paths.has(path)) {
    fail(`${slug}: duplicate canonical master path`);
  }
  paths.add(path);
  if (fallback) {
    if (fallback.status !== "pending_lfs") {
      fail(`${slug}: invalid release fallback status`);
    }
    if (!shaPattern.test(fallback.ledger_commit ?? "")) {
      fail(`${slug}: invalid release fallback ledger commit`);
    }
    if (fallback.ledger_commit !== ledger.archive_commit) {
      fail(`${slug}: release fallback is not recorded at archive_commit`);
    }
    if (!sha256Pattern.test(fallback.master_sha256 ?? "")) {
      fail(`${slug}: invalid release fallback master SHA-256`);
    }
    if (!Number.isInteger(fallback.master_size) || fallback.master_size < 1) {
      fail(`${slug}: invalid release fallback master size`);
    }
    if (!/^[A-Za-z0-9_.-]+\.(?:docx|md)$/.test(fallback.master_filename ?? "")) {
      fail(`${slug}: invalid release fallback master filename`);
    }
    if (!/^[A-Za-z0-9._-]+$/.test(fallback.release_tag ?? "")) {
      fail(`${slug}: invalid release fallback tag`);
    }
    const expectedReleaseUrl =
      `https://github.com/${ledger.repository}/releases/tag/${fallback.release_tag}`;
    if (fallback.release_url !== expectedReleaseUrl) {
      fail(`${slug}: invalid release fallback URL`);
    }
  }
}

console.log(
  `Working-master archive gate OK: ${siteSlugs.length} publications ` +
    `(${archivedSlugs.length} archived, ${fallbackSlugs.length} release fallback) ` +
    `at ${ledger.archive_commit}`,
);
