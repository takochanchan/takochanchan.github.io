import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

import { publications } from "../src/publications.mjs";

const ledgerUrl = new URL("../master-archive.json", import.meta.url);
const ledger = JSON.parse(await readFile(ledgerUrl, "utf8"));
const pins = JSON.parse(await readFile(new URL("../master-release-pins.json", import.meta.url), "utf8"));
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
if (typeof ledger.archive_commit !== "string" || !shaPattern.test(ledger.archive_commit)) {
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
if (pins.schema_version !== 1 || pins.repository !== ledger.repository ||
    !pins.fallbacks || typeof pins.fallbacks !== "object" || Array.isArray(pins.fallbacks)) {
  fail("invalid independent fallback pin registry");
}
const fingerprint = (slug, fallback) => createHash("sha256")
  .update(JSON.stringify([slug, Object.entries(fallback).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)]))
  .digest("hex");

const siteSlugs = publications.map((item) => item.slug);
const siteSlugSet = new Set(siteSlugs);
const archivedSlugs = Object.keys(ledger.publications);
const fallbackSlugs = Object.keys(releaseFallbacks);
const pinSlugs = Object.keys(pins.fallbacks);
const missingPins = fallbackSlugs.filter((slug) => !Object.hasOwn(pins.fallbacks, slug));
const stalePins = pinSlugs.filter((slug) => !Object.hasOwn(releaseFallbacks, slug));
if (missingPins.length || stalePins.length) {
  fail(`fallback pin mismatch; missing=${missingPins.join(",")}; stale=${stalePins.join(",")}`);
}
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
    if (typeof fallback.ledger_commit !== "string" || !shaPattern.test(fallback.ledger_commit)) {
      fail(`${slug}: invalid release fallback ledger commit`);
    }
    const pin = pins.fallbacks[slug];
    if (!pin || typeof pin !== "object" || Array.isArray(pin) ||
        typeof pin.ledger_commit !== "string" || !shaPattern.test(pin.ledger_commit) ||
        typeof pin.fallback_sha256 !== "string" || !sha256Pattern.test(pin.fallback_sha256) ||
        pin.ledger_commit !== fallback.ledger_commit ||
        pin.fallback_sha256 !== fingerprint(slug, fallback)) {
      fail(`${slug}: release fallback does not match its independent pin`);
    }
    if (typeof fallback.master_sha256 !== "string" || !sha256Pattern.test(fallback.master_sha256)) {
      fail(`${slug}: invalid release fallback master SHA-256`);
    }
    if (!Number.isSafeInteger(fallback.master_size) || fallback.master_size < 1) {
      fail(`${slug}: invalid release fallback master size`);
    }
    if (typeof fallback.master_filename !== "string" || !/^[A-Za-z0-9_.-]+\.(?:docx|md)$/.test(fallback.master_filename)) {
      fail(`${slug}: invalid release fallback master filename`);
    }
    if (typeof fallback.release_tag !== "string" || !/^[A-Za-z0-9._-]+$/.test(fallback.release_tag) ||
        fallback.release_tag === "." || fallback.release_tag === "..") {
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

