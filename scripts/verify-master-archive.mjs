import { readFile } from "node:fs/promises";

import { publications } from "../src/publications.mjs";

const ledgerUrl = new URL("../master-archive.json", import.meta.url);
const ledger = JSON.parse(await readFile(ledgerUrl, "utf8"));
const shaPattern = /^[0-9a-f]{40}$/;
const masterPattern = /^publications\/([a-z0-9]+(?:-[a-z0-9]+)*)\/master\.(?:docx|md)$/;

const fail = (message) => {
  throw new Error(`Working-master archive gate: ${message}`);
};

if (ledger.schema_version !== 1) {
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

const siteSlugs = publications.map((item) => item.slug);
const siteSlugSet = new Set(siteSlugs);
const ledgerSlugs = Object.keys(ledger.publications);
const missing = siteSlugs.filter((slug) => !(slug in ledger.publications));
const stale = ledgerSlugs.filter((slug) => !siteSlugSet.has(slug));
if (missing.length || stale.length) {
  fail(`slug mismatch; missing=${missing.join(",")}; stale=${stale.join(",")}`);
}

const paths = new Set();
for (const slug of siteSlugs) {
  const path = ledger.publications[slug];
  const match = typeof path === "string" ? path.match(masterPattern) : null;
  if (!match || match[1] !== slug) {
    fail(`${slug}: invalid canonical master path`);
  }
  if (paths.has(path)) {
    fail(`${slug}: duplicate canonical master path`);
  }
  paths.add(path);
}

console.log(
  `Working-master archive gate OK: ${siteSlugs.length} publications at ${ledger.archive_commit}`,
);

