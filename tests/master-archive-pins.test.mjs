import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { publications } from "../src/publications.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseLedger = JSON.parse(await readFile(path.join(root, "master-archive.json"), "utf8"));
const basePins = JSON.parse(await readFile(path.join(root, "master-release-pins.json"), "utf8"));
const slug = Object.keys(baseLedger.release_fallbacks)[0];
const fingerprint = (key, value) => createHash("sha256")
  .update(JSON.stringify([key, Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)]))
  .digest("hex");

async function runFixture(change = () => {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "archive-gate-"));
  try {
    await mkdir(path.join(dir, "scripts"));
    await cp(path.join(root, "scripts", "verify-master-archive.mjs"),
      path.join(dir, "scripts", "verify-master-archive.mjs"));
    await mkdir(path.join(dir, "src"));
    await writeFile(path.join(dir, "src", "publications.mjs"),
      `export const publications = ${JSON.stringify(publications.map(({ slug }) => ({ slug })))};\n`);
    const ledger = structuredClone(baseLedger);
    const pins = structuredClone(basePins);
    change(ledger, pins);
    await writeFile(path.join(dir, "master-archive.json"), JSON.stringify(ledger));
    await writeFile(path.join(dir, "master-release-pins.json"), JSON.stringify(pins));
    return spawnSync(process.execPath, ["scripts/verify-master-archive.mjs"], { cwd: dir, encoding: "utf8" });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("all existing fallback pins match without changing any archive entry", async () => {
  assert.ok(Object.keys(baseLedger.release_fallbacks).length > 0);
  const result = await runFixture();
  assert.equal(result.status, 0, result.stderr);
});

test("advancing the overall archive leaves every existing fallback pin valid", async () => {
  const result = await runFixture((ledger) => { ledger.archive_commit = "a".repeat(40); });
  assert.equal(result.status, 0, result.stderr);
});

test("archive commit must be a string rather than an array that stringifies to one", async () => {
  const result = await runFixture((ledger) => { ledger.archive_commit = [ledger.archive_commit]; });
  assert.notEqual(result.status, 0, result.stdout);
  assert.match(result.stderr, /archive_commit must be/);
});

test("fallback property order does not affect the pin", async () => {
  const result = await runFixture((ledger) => {
    ledger.release_fallbacks[slug] = Object.fromEntries(Object.entries(ledger.release_fallbacks[slug]).reverse());
  });
  assert.equal(result.status, 0, result.stderr);
});

test("migration removes only the migrated fallback and its pin", async () => {
  const result = await runFixture((ledger, pins) => {
    ledger.publications[slug] = ledger.release_fallbacks[slug].canonical_path;
    delete ledger.release_fallbacks[slug];
    delete pins.fallbacks[slug];
  });
  assert.equal(result.status, 0, result.stderr);
});

for (const [field, value] of Object.entries({
  ledger_commit: "0".repeat(40),
  canonical_path: "publications/wrong/master.docx",
  release_tag: "wrong-release",
  release_url: "https://example.com/wrong",
  master_filename: "other.docx",
  master_sha256: "0".repeat(64),
  master_size: 1,
  status: "migrated",
  unexpected: "unverified",
})) {
  test(`reject altered fallback ${field}`, async () => {
    const result = await runFixture((ledger) => { ledger.release_fallbacks[slug][field] = value; });
    assert.notEqual(result.status, 0, result.stdout);
  });
}

test("reject missing, stale, or modified independent pins", async () => {
  for (const change of [
    (ledger, pins) => { delete pins.fallbacks[slug]; },
    (ledger, pins) => { pins.fallbacks["unknown"] = pins.fallbacks[slug]; },
    (ledger, pins) => { pins.fallbacks[slug].ledger_commit = "0".repeat(40); },
    (ledger, pins) => { pins.fallbacks[slug].fallback_sha256 = "0".repeat(64); },
    (ledger, pins) => { pins.repository = "wrong/repository"; },
  ]) {
    const result = await runFixture(change);
    assert.notEqual(result.status, 0, result.stdout);
  }
});

test("an added fallback is rejected until its independent pin is added", async () => {
  const newSlug = Object.keys(baseLedger.publications)[0];
  const pathToMaster = baseLedger.publications[newSlug];
  const change = (ledger, pins, addPin) => {
    delete ledger.publications[newSlug];
    const f = {
      canonical_path: pathToMaster,
      status: "pending_lfs",
      release_tag: "example-v1",
      release_url: `https://github.com/${ledger.repository}/releases/tag/example-v1`,
      ledger_commit: "b".repeat(40),
      master_filename: pathToMaster.split("/").at(-1),
      master_size: 42,
      master_sha256: "c".repeat(64),
    };
    ledger.release_fallbacks[newSlug] = f;
    if (addPin) pins.fallbacks[newSlug] = { ledger_commit: f.ledger_commit, fallback_sha256: fingerprint(newSlug, f) };
  };
  const missing = await runFixture((ledger, pins) => change(ledger, pins, false));
  assert.notEqual(missing.status, 0);
  const pinned = await runFixture((ledger, pins) => change(ledger, pins, true));
  assert.equal(pinned.status, 0, pinned.stderr);
});

test("independent pin does not bypass existing path and SHA format validation", async () => {
  for (const [field, value, expected] of [
    ["master_sha256", "not-a-sha", /invalid release fallback master SHA-256/],
    ["master_size", 0, /invalid release fallback master size/],
    ["master_size", Number.MAX_SAFE_INTEGER + 1, /invalid release fallback master size/],
    ["master_sha256", ["c".repeat(64)], /invalid release fallback master SHA-256/],
    ["master_filename", ["master.docx"], /invalid release fallback master filename/],
    ["release_tag", ["tag"], /invalid release fallback tag/],
    ["release_tag", "..", /invalid release fallback tag/],
    ["canonical_path", "publications/wrong/master.docx", /invalid canonical master path/],
    ["status", "wrong", /invalid release fallback status/],
    ["release_url", "https://example.com/wrong", /invalid release fallback URL/],
    ["master_filename", "../unsafe.docx", /invalid release fallback master filename/],
  ]) {
    const result = await runFixture((ledger, pins) => {
      ledger.release_fallbacks[slug][field] = value;
      pins.fallbacks[slug].fallback_sha256 = fingerprint(slug, ledger.release_fallbacks[slug]);
    });
    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, expected);
  }
});
