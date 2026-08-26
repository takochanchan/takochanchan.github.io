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

if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.works)) {
  throw new Error("Unsupported bibliographic manifest");
}
if (new Set(manifest.works.map((work) => work.slug)).size !== manifest.works.length) {
  throw new Error("Duplicate bibliographic manifest slug");
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
      throw new Error(`${work.slug}: catalogue ${field} differs from manifest`);
    }
  }
  if (
    item.attributedTo !== work.attribution.attributedTo ||
    item.attributionStatus !== work.attribution.status ||
    item.attributionNote !== work.attribution.note
  ) {
    throw new Error(`${work.slug}: attribution fields differ from manifest`);
  }
  if (!item.sourceEdition.startsWith(work.sourceCitation)) {
    throw new Error(`${work.slug}: citation differs from manifest`);
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
      throw new Error(`${work.slug}: ${format.toUpperCase()} path differs from manifest`);
    }
    const recorded = assets.get(expected.path);
    if (
      !recorded ||
      recorded.size !== expected.size ||
      recorded.sha256 !== expected.sha256
    ) {
      throw new Error(`${work.slug}: ${format.toUpperCase()} asset record differs from manifest`);
    }
    if (assetsRoot) {
      const filename = path.resolve(assetsRoot, expected.path);
      await access(filename);
      if ((await stat(filename)).size !== expected.size) {
        throw new Error(`${work.slug}: local ${format.toUpperCase()} size differs from manifest`);
      }
      if ((await sha256(filename)) !== expected.sha256) {
        throw new Error(`${work.slug}: local ${format.toUpperCase()} hash differs from manifest`);
      }
    }
  }

  const detail = path.join(root, "dist", "publications", work.slug, "index.html");
  try {
    const html = await readFile(detail, "utf8");
    for (const value of [
      work.title,
      work.originalTitle,
      work.author,
      work.originalAuthor,
      work.originalPublication,
      work.attribution.attributedTo,
      work.attribution.note,
    ]) {
      if (!html.includes(value.replaceAll("&", "&amp;"))) {
        throw new Error(`${work.slug}: rendered bibliography omits ${value}`);
      }
    }
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    if (!match) throw new Error(`${work.slug}: JSON-LD is missing`);
    const records = JSON.parse(match[1]);
    const structured = records.find((record) => record["@id"]?.endsWith("#work"));
    if (
      !structured ||
      structured.author?.name !== work.originalAuthor ||
      structured.translationOfWork?.author?.name !== work.originalAuthor ||
      structured.translationOfWork?.additionalProperty?.value !==
        work.attribution.status ||
      structured.translationOfWork?.creditText !== work.attribution.note
    ) {
      throw new Error(`${work.slug}: JSON-LD bibliography differs from manifest`);
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

process.stdout.write(
  `Bibliographic manifest OK: ${manifest.works.length} strict record(s).\n`,
);
