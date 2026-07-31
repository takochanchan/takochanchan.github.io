import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { publications, taxonomy } from "../src/publications.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const dist = path.join(root, "dist");

const exists = async (file) => {
  await access(file);
  return true;
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

test("catalogue metadata is complete and unique", () => {
  assert.equal(publications.length, 65);
  assert.equal(new Set(publications.map((item) => item.slug)).size, publications.length);
  for (const item of publications) {
    for (const key of [
      "title",
      "originalTitle",
      "author",
      "description",
      "cover",
      "pdf",
      "epub",
      "pdfUrl",
      "epubUrl",
      "year",
      "types",
      "regions",
      "languages",
      "tags",
      "sourceEdition",
      "sourceProvider",
      "rights",
      "publishedDate",
      "updatedDate",
    ]) {
      assert.ok(item[key] && item[key].length !== 0, `${item.slug}: ${key}`);
    }
  }
  assert.ok(taxonomy.types.length >= 8);
  assert.ok(taxonomy.regions.includes("ウスマシンタ川流域"));
  assert.ok(taxonomy.languages.includes("フランス語"));
});

test("corrected Sapper author form stays fixed for Alta Verapaz", () => {
  const item = publications.find(
    (publication) => publication.slug === "sapper-alta-verapaz-1901",
  );
  assert.ok(item);
  assert.equal(item.author, "カール・ザッパー");
  assert.match(item.description, /カール・ザッパー/);
  assert.doesNotMatch(`${item.author}\n${item.description}`, /カール・サッパー/);
});

test("Lundell bibliography uses the Japanese translation cover", () => {
  const item = publications.find(
    (publication) => publication.slug === "lundell-vegetation-peten-1937",
  );
  assert.ok(item);
  assert.equal(
    item.cover,
    "publications/lundell-vegetation-peten-1937/japanese-cover.jpg",
  );
});

test("home page contains scalable archive controls", async () => {
  const html = await readFile(path.join(dist, "index.html"), "utf8");
  for (const id of [
    "archive-search",
    "filter-type",
    "filter-region",
    "filter-language",
    "filter-era",
    "archive-sort",
    "archive-reset",
    "archive-pagination",
    "google-site-search",
    "google-search-query",
    "google-search-value",
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /window\.ARCHIVE_PUBLICATIONS=/);
  assert.match(html, /\/archive\.css\?v=20260729-reuse-policy-v1/);
  assert.match(html, /\/archive\.js\?v=20260729-reuse-policy-v1/);
  assert.match(
    html,
    /サイト本文とGitHub Releases上のPDFは\s+Googleで検索できます/,
  );
  assert.match(html, /書名・著者・地名・キーワード/);
  assert.match(html, /Googleサイト内検索/);
  assert.match(html, /action="https:\/\/www\.google\.com\/search"/);
  assert.match(html, />資料検索</);
  assert.match(html, /元資料を読もう/);
  assert.match(html, /17世紀末から20世紀初頭/);
  assert.match(html, /公開版総ページ数/);
  assert.match(html, /海外の記録を、/);
  assert.match(html, /PDFとリフロー型EPUB/);
  assert.match(html, /href="\/about\/">翻訳・編集・レビュー・再利用方針を読む/);
  assert.doesNotMatch(html, /生成AIの余剰リソース/);
  assert.match(
    html,
    /PDF・EPUB本体はGitHub Releasesで配布しています/,
  );
  assert.equal(
    (html.match(/class="record-card"/g) || []).length,
    publications.length,
  );
});

test("about page explains the editorial workflow and its limits", async () => {
  const html = await readFile(path.join(dist, "about", "index.html"), "utf8");
  assert.match(html, /翻訳・編集・/);
  assert.match(html, /底本と翻訳/);
  assert.match(html, /独立レビュー/);
  assert.match(html, /組版と公開前確認/);
  assert.match(html, /再利用とライセンス/);
  assert.match(html, /パブリックドメインの原著に基づく通常の翻訳/);
  assert.match(html, /BY、SA、NCなどの条件は省略せず/);
  assert.match(html, /利用上の注意/);
  assert.match(html, /原文から日本語へ翻訳します/);
  assert.match(html, /専門研究者による外部査読を意味しません/);
  assert.match(html, /全文を逐語的に人手校閲したことを意味しません/);
  assert.match(html, /最終PDFの確認と承認を受けるまでは/);
  assert.doesNotMatch(html, /現在翻訳中|WORK IN PROGRESS/);
  assert.match(html, /<link rel="canonical" href="https:\/\/takochanchan\.github\.io\/about\/">/);
  assert.match(html, /\/archive\.css\?v=20260729-reuse-policy-v1/);
});

test("catalogue search stays within publication metadata", async () => {
  const script = await readFile(path.join(dist, "archive.js"), "utf8");
  assert.doesNotMatch(script, /search-index\.json|__fullText|PDF本文/u);
  assert.match(script, /item\.__search\.includes\(query\)/);
  assert.match(script, /site:\$\{location\.hostname\} OR/);
  assert.match(
    script,
    /site:github\.com\/takochanchan\/takochanchan\.github\.io\/releases/,
  );
  assert.match(script, /frame\.src = button\.dataset\.pdfSrc/);
});

test("sitemap exposes every same-origin detail page", async () => {
  const sitemap = await readFile(path.join(dist, "sitemap.xml"), "utf8");
  assert.match(sitemap, /https:\/\/takochanchan\.github\.io\/about\//);
  for (const item of publications) {
    assert.match(
      sitemap,
      new RegExp(
        `https://takochanchan\\.github\\.io/publications/${item.slug}/`,
      ),
    );
    assert.doesNotMatch(sitemap, new RegExp(escapeHtml(item.pdfUrl)));
  }
  assert.doesNotMatch(sitemap, /github\.com/);
});

test("every publication has a detail page, local cover, and release links", async () => {
  for (const item of publications) {
    const detail = path.join(dist, "publications", item.slug, "index.html");
    assert.ok(await exists(detail));
    const html = await readFile(detail, "utf8");
    assert.match(html, new RegExp(item.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(
      html,
      new RegExp(
        escapeHtml(item.originalTitle).replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        ),
      ),
    );
    assert.ok(html.includes(escapeHtml(item.pdfUrl)), `${item.slug}: PDF URL`);
    assert.ok(html.includes(escapeHtml(item.epubUrl)), `${item.slug}: EPUB URL`);
    assert.match(html, /底本・公開情報/);
    assert.match(html, /\/archive\.css\?v=20260729-reuse-policy-v1/);
    assert.match(html, /\/archive\.js\?v=20260729-reuse-policy-v1/);
    for (const label of [
      "底本",
      "公開元",
      "権利・利用条件",
      "公開日",
      "更新日",
      "訂正窓口",
    ]) {
      assert.match(html, new RegExp(`>${label}<`), `${item.slug}: ${label}`);
    }
    assert.ok(html.includes(escapeHtml(item.sourceEdition)), item.slug);
    assert.ok(html.includes(escapeHtml(item.sourceProvider)), item.slug);
    assert.match(html, /PDFを読み込む（\d+(?:\.\d+)? (?:KB|MB)）/);
    assert.match(html, /PDFを保存（\d+(?:\.\d+)? (?:KB|MB)）/);
    assert.match(html, /EPUBを保存（\d+(?:\.\d+)? (?:KB|MB)）/);
    assert.doesNotMatch(html, /PDFを開く|別画面で開く/);
    const iframeTags = html.match(/<iframe\b[^>]*>/g) || [];
    assert.equal(iframeTags.length, 1, `${item.slug}: iframe count`);
    assert.doesNotMatch(iframeTags[0], /\ssrc=/, `${item.slug}: eager PDF`);
    assert.match(iframeTags[0], /\sdata-pdf-frame(?:\s|>)/);
    assert.ok(await exists(path.join(dist, item.cover)));
    await assert.rejects(access(path.join(dist, item.pdf)));
    await assert.rejects(access(path.join(dist, item.epub)));
    assert.match(
      html,
      /https:\/\/docs\.google\.com\/viewerng\/viewer\?embedded=true&amp;url=/,
    );
  }
});

test("auxiliary text no longer uses 7–10px font sizes", async () => {
  const css = await readFile(path.join(dist, "archive.css"), "utf8");
  assert.doesNotMatch(css, /font-size:\s*(?:7|8|9|10)px/);
});

test("detail PDF and EPUB controls stay in a two-column row", async () => {
  const css = await readFile(path.join(dist, "archive.css"), "utf8");
  assert.match(
    css,
    /\.publication-actions\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*1fr 1fr;[^}]*gap:\s*8px;[^}]*\}/s,
  );
  assert.doesNotMatch(
    css,
    /\.publication-actions \.button\s*\{[^}]*min-width:\s*170px;/s,
  );
});

test("local covers and release assets match the recorded manifest", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(root, "assets-manifest.json"), "utf8"),
  );
  assert.equal(manifest.assets.length, publications.length * 3);
  assert.deepEqual(
    new Set(manifest.assets.map((asset) => asset.path)),
    new Set(
      publications.flatMap((item) => [item.cover, item.pdf, item.epub]),
    ),
  );
  const publicationByPath = new Map(
    publications.flatMap((item) => [
      [item.pdf, item.pdfUrl],
      [item.epub, item.epubUrl],
    ]),
  );
  for (const asset of manifest.assets.filter((item) => item.path.endsWith("cover.jpg"))) {
    const file = path.join(dist, asset.path);
    const info = await stat(file);
    const bytes = await readFile(file);
    assert.equal(info.size, asset.size, asset.path);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      asset.sha256,
      asset.path,
    );
  }
  for (const asset of manifest.assets.filter((item) => !item.path.endsWith("cover.jpg"))) {
    assert.equal(asset.url, publicationByPath.get(asset.path), asset.path);
    assert.match(
      asset.url,
      /^https:\/\/github\.com\/takochanchan\/takochanchan\.github\.io\/releases\/download\/publications-current\//,
    );
    await assert.rejects(access(path.join(dist, asset.path)));
  }
});

test("repository source contains covers but no PDF, EPUB, or split parts", async () => {
  const staticRoot = path.join(root, "static", "publications");
  const files = await readdir(staticRoot, { recursive: true });
  assert.equal(files.filter((file) => file.endsWith("cover.jpg")).length, publications.length);
  assert.equal(
    files.filter((file) => /\.(?:pdf|epub)(?:\.part-\d+)?$/i.test(file)).length,
    0,
  );
});

test("rendered public site does not expose the previous identifying host", async () => {
  const textFiles = [
    "index.html",
    "about/index.html",
    "404.html",
    "archive.css",
    "archive.js",
    "robots.txt",
    "sitemap.xml",
    ...publications.map((item) => `publications/${item.slug}/index.html`),
  ];
  for (const relative of textFiles) {
    const content = await readFile(path.join(dist, relative), "utf8");
    assert.doesNotMatch(content, /masaki1979|chatgpt\.site/i, relative);
  }
});

test("current repository source does not reference the previous identifying host", async () => {
  for (const relative of [
    "assets-manifest.json",
    "README.md",
    "scripts/build.mjs",
    "scripts/fetch-assets.mjs",
    "scripts/make-manifest.mjs",
    "src/archive.js",
    "src/publications.mjs",
    "src/styles.css",
  ]) {
    const content = await readFile(path.join(root, relative), "utf8");
    assert.doesNotMatch(content, /masaki1979|chatgpt\.site/i, relative);
  }
});
