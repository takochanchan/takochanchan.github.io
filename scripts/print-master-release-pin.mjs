import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const slug = process.argv[2];
if (!slug || process.argv.length !== 3) {
  throw new Error("usage: node scripts/print-master-release-pin.mjs SLUG");
}
const ledger = JSON.parse(await readFile(new URL("../master-archive.json", import.meta.url), "utf8"));
if (!Object.hasOwn(ledger.release_fallbacks ?? {}, slug)) {
  throw new Error(`no release fallback for ${slug}`);
}
const fallback = ledger.release_fallbacks[slug];
const entries = Object.entries(fallback).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
const fallback_sha256 = createHash("sha256").update(JSON.stringify([slug, entries])).digest("hex");
console.error("Verify the private ledger, ancestry, release and bytes before recording this pin.");
console.log(JSON.stringify({ [slug]: { ledger_commit: fallback.ledger_commit, fallback_sha256 } }, null, 2));
