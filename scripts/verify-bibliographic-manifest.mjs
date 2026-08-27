import { createHash } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publications } from "../src/publications.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const argument = (name) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};
const assetsRoot = argument("--assets-root");
const manifest = JSON.parse(
  await readFile(path.join(root, "bibliographic-manifest.json"), "utf8"),
);
const assetManifest = JSON.parse(
  await readFile(path.join(root, "assets-manifest.json"), "utf8"),
);
const assets = new Map(assetManifest.assets.map((asset) => [asset.path, asset]));
const catalogue = new Map(publications.map((item) => [item.slug, item]));

if (
  manifest.schemaVersion !== 2 ||
  !Array.isArray(manifest.records) ||
  !Array.isArray(manifest.works)
) {
  throw new Error("Unsupported bibliographic manifest");
}
const records = new Map(manifest.records.map((record) => [record.slug, record]));
if (records.size !== manifest.records.length) {
  throw new Error("Duplicate canonical bibliographic record slug");
}
if (new Set(manifest.works.map((work) => work.slug)).size !== manifest.works.length) {
  throw new Error("Duplicate strict bibliographic work slug");
}
if (records.size !== catalogue.size) {
  throw new Error(`Canonical bibliography coverage: ${records.size}/${catalogue.size}`);
}
for (const slug of catalogue.keys()) {
  if (!records.has(slug)) throw new Error(`${slug}: canonical bibliography is missing`);
}
for (const slug of records.keys()) {
  if (!catalogue.has(slug)) throw new Error(`${slug}: orphan canonical bibliography`);
}

const requiredFields = [
  "recordClass",
  "title",
  "originalTitle",
  "author",
  "originalAuthor",
  "year",
  "originalPublication",
  "sourceEdition",
  "sourceProvider",
  "rights",
  "publishedDate",
  "updatedDate",
];
const negativeJapaneseEditionNotice =
  /(?:日本語|本版|本訳).*(?:再利用|転載).*(?:設定してい(?:ません|ない)|付与し(?:ていません|ない)|許諾するものではありません)/u;
const oldGenericRights =
  "原刊本文はパブリックドメインです。デジタル画像には公開元の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。";
const datePattern = /^\d{4}-\d{2}-\d{2}$/u;
const shortWorkLocator =
  /(?:\b(?:pp?|S|vol|no|tome|núm|Bd|Band|Nr|Heft|Item|Folder|Box|Series|MSS|Ms)\.?\s*[\dIVXLCDM]|頁|葉|巻|号|全\d+|sans pagination|dactylographiées)/iu;

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

for (const record of manifest.records) {
  const item = catalogue.get(record.slug);
  for (const field of requiredFields) {
    if (record[field] === null || record[field] === undefined || record[field] === "") {
      throw new Error(`${record.slug}: canonical ${field} is missing`);
    }
    if (item[field] !== record[field]) {
      throw new Error(`${record.slug}: catalogue ${field} differs from manifest`);
    }
  }
  if (!datePattern.test(record.publishedDate) || !datePattern.test(record.updatedDate)) {
    throw new Error(`${record.slug}: invalid publication date`);
  }
  if (
    !record.sourceAccess ||
    !["online", "print-only", "unresolved-link"].includes(record.sourceAccess.status)
  ) {
    throw new Error(`${record.slug}: invalid source-access status`);
  }
  if (record.sourceAccess.status === "online") {
    let source;
    try {
      source = new URL(record.sourceAccess.url);
    } catch {
      throw new Error(`${record.slug}: invalid source URL`);
    }
    if (!/^https?:$/u.test(source.protocol) || item.sourceUrl !== source.href) {
      throw new Error(`${record.slug}: catalogue source URL differs from manifest`);
    }
    if (item.sourceAccessNote !== null) {
      throw new Error(`${record.slug}: online source has an access exception`);
    }
  } else {
    if (!record.sourceAccess.note || item.sourceAccessNote !== record.sourceAccess.note) {
      throw new Error(`${record.slug}: source-access exception note is missing`);
    }
    if (item.sourceUrl !== null) {
      throw new Error(`${record.slug}: non-online source unexpectedly has a URL`);
    }
  }
  if (item.sourceAccessStatus !== record.sourceAccess.status) {
    throw new Error(`${record.slug}: source-access status differs from manifest`);
  }
  const attribution = record.attribution ?? null;
  for (const [itemField, recordField] of [
    ["attributedTo", "attributedTo"],
    ["attributionStatus", "status"],
    ["attributionNote", "note"],
  ]) {
    if ((item[itemField] ?? null) !== (attribution?.[recordField] ?? null)) {
      throw new Error(`${record.slug}: ${itemField} differs from manifest`);
    }
  }
  if (record.rights === oldGenericRights || negativeJapaneseEditionNotice.test(record.rights)) {
    throw new Error(`${record.slug}: obsolete rights boilerplate remains`);
  }
  if (
    record.recordClass === "short-work" &&
    !shortWorkLocator.test(record.sourceEdition)
  ) {
    throw new Error(`${record.slug}: short-work source citation lacks a locator`);
  }
  if (
    record.author === "E・G・スクワイア" &&
    record.originalAuthor !== "E. G. Squier"
  ) {
    throw new Error(`${record.slug}: Squier must use the signed initials`);
  }

  const detail = path.join(root, "dist", "publications", record.slug, "index.html");
  try {
    const html = await readFile(detail, "utf8");
    for (const value of [
      record.title,
      record.originalTitle,
      record.author,
      record.originalAuthor,
      record.originalPublication,
      record.sourceEdition,
      record.sourceProvider,
      record.rights,
      record.sourceAccess.note,
    ].filter(Boolean)) {
      if (!html.includes(escapeHtml(value))) {
        throw new Error(`${record.slug}: rendered bibliography omits ${value}`);
      }
    }
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    if (!match) throw new Error(`${record.slug}: JSON-LD is missing`);
    const structured = JSON.parse(match[1]).find((entry) =>
      entry["@id"]?.endsWith("#work"),
    );
    if (
      !structured ||
      structured.translationOfWork?.author?.name !== record.originalAuthor
    ) {
      throw new Error(`${record.slug}: JSON-LD original author differs from manifest`);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

const sha256 = async (filename) =>
  createHash("sha256").update(await readFile(filename)).digest("hex");

for (const work of manifest.works) {
  const item = catalogue.get(work.slug);
  if (!item) throw new Error(`${work.slug}: catalogue record is missing`);
  for (const field of [
    "title",
    "originalTitle",
    "author",
    "originalAuthor",
    "originalPublication",
  ]) {
    if (item[field] !== work[field]) {
      throw new Error(`${work.slug}: catalogue ${field} differs from strict work`);
    }
  }
  if (
    item.attributedTo !== work.attribution.attributedTo ||
    item.attributionStatus !== work.attribution.status ||
    item.attributionNote !== work.attribution.note
  ) {
    throw new Error(`${work.slug}: attribution fields differ from strict work`);
  }
  if (!item.sourceEdition.startsWith(work.sourceCitation)) {
    throw new Error(`${work.slug}: citation differs from strict work`);
  }
  if (
    !item.sourceEdition.includes(`p. ${work.sourcePages.last}`) ||
    !item.sourceEdition.includes(`p. ${work.sourcePages.nextWorkStartsAt}`) ||
    !item.sourceEdition.includes(work.sourcePages.nextWorkTitle)
  ) {
    throw new Error(`${work.slug}: source-boundary note is missing`);
  }

  for (const format of ["pdf", "epub"]) {
    const expected = work.assets[format];
    if (item[format] !== expected.path) {
      throw new Error(`${work.slug}: ${format.toUpperCase()} path differs from strict work`);
    }
    const recorded = assets.get(expected.path);
    if (
      !recorded ||
      recorded.size !== expected.size ||
      recorded.sha256 !== expected.sha256
    ) {
      throw new Error(`${work.slug}: ${format.toUpperCase()} asset record differs from strict work`);
    }
    if (assetsRoot) {
      const filename = path.resolve(assetsRoot, expected.path);
      await access(filename);
      if ((await stat(filename)).size !== expected.size) {
        throw new Error(`${work.slug}: local ${format.toUpperCase()} size differs from strict work`);
      }
      if ((await sha256(filename)) !== expected.sha256) {
        throw new Error(`${work.slug}: local ${format.toUpperCase()} hash differs from strict work`);
      }
    }
  }
}

process.stdout.write(
  `Bibliographic manifest OK: ${manifest.records.length} canonical record(s), ` +
    `${manifest.works.length} strict source-boundary record(s).\n`,
);
