import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  majorPublications,
  publications,
  shortPublicationAuthors,
  shortPublications,
  taxonomy,
} from "../src/publications.mjs";

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
  assert.equal(publications.length, 90);
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

test("short works use explicit author groups instead of page-count rules", () => {
  assert.equal(majorPublications.length, 72);
  assert.equal(shortPublications.length, 19);
  assert.equal(shortPublicationAuthors.length, 9);
  assert.deepEqual(
    new Set(shortPublications.map((item) => item.slug)),
    new Set([
      "esquinca-usumacinta",
      "sapper-eastern-lacandons-1891",
      "berendt-central-america-explorations-1867",
      "galindo-ruins-palenque-literary-gazette-1831",
      "galindo-noticias-peten-1831",
      "galindo-usumacinta-1833",
      "galindo-caribs-central-america-1833",
      "galindo-copan-full-report-1834",
      "galindo-antiquities-peten-1834",
      "galindo-eruption-cosiguina-1835",
      "galindo-copan-literary-gazette-1835",
      "galindo-on-central-america-1836",
      "galindo-ruins-copan-aas-1836",
      "friedrichsthal-yucatan-1841",
      "galindo-palenque-1832",
      "arthes-peten-1893",
      "chonay-totonicapan-title-1886",
      "societe-geographie-central-america-report-1836",
      "ximenez-escolios-ayer-ms-1515",
    ]),
  );
  const galindo = shortPublicationAuthors.find(
    (author) => author.key === "juan-galindo",
  );
  assert.ok(galindo);
  assert.equal(galindo.name, "フアン・ガリンド");
  assert.deepEqual(
    galindo.publications.map((item) => item.slug),
    [
      "galindo-ruins-palenque-literary-gazette-1831",
      "galindo-noticias-peten-1831",
      "galindo-palenque-1832",
      "galindo-usumacinta-1833",
      "galindo-caribs-central-america-1833",
      "galindo-copan-full-report-1834",
      "galindo-antiquities-peten-1834",
      "galindo-eruption-cosiguina-1835",
      "galindo-copan-literary-gazette-1835",
      "galindo-on-central-america-1836",
      "galindo-ruins-copan-aas-1836",
    ],
  );
  const committee = shortPublicationAuthors.find(
    (author) => author.key === "societe-de-geographie-committee",
  );
  assert.ok(committee);
  assert.equal(committee.name, "フランス地理学会委員会");
  assert.deepEqual(
    committee.publications.map((item) => item.slug),
    ["societe-geographie-central-america-report-1836"],
  );
  const ximenez = shortPublicationAuthors.find(
    (author) => author.key === "francisco-ximenez",
  );
  assert.ok(ximenez);
  assert.equal(ximenez.name, "フランシスコ・ヒメネス");
  assert.deepEqual(
    ximenez.publications.map((item) => item.slug),
    ["ximenez-escolios-ayer-ms-1515"],
  );
  assert.equal(
    publications.find((item) => item.slug === "cook-balise-merida-1769")
      .recordClass,
    "major-work",
  );
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

test("revised Galindo Palenque record includes the Baezo appendix", () => {
  const item = publications.find(
    (publication) => publication.slug === "galindo-palenque-1832",
  );
  assert.ok(item);
  assert.equal(item.pageCount, 25);
  assert.match(item.subtitle, /198–217頁/);
  assert.match(item.description, /ペルフェクト・バエソ/);
  assert.deepEqual(item.languages, ["フランス語", "スペイン語", "マヤ語"]);
  assert.equal(item.updatedDate, "2026-08-01");
});

test("Ximenez Escolios is catalogued as the complete six-leaf short work", () => {
  const item = publications.find(
    (publication) => publication.slug === "ximenez-escolios-ayer-ms-1515",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "short-work");
  assert.equal(item.pageCount, 28);
  assert.equal(item.plateCount, 12);
  assert.match(item.subtitle, /第2巻末尾・全6葉/);
  assert.match(item.description, /1734年のエチャーベ署名文/);
  assert.deepEqual(item.languages, ["スペイン語", "キチェ語", "ラテン語"]);
});

test("approved Galindo short-paper batch remains individually catalogued", () => {
  const expectedPages = new Map([
    ["galindo-caribs-central-america-1833", 3],
    ["galindo-antiquities-peten-1834", 5],
    ["galindo-copan-literary-gazette-1835", 7],
    ["galindo-ruins-copan-aas-1836", 9],
  ]);
  for (const [slug, pageCount] of expectedPages) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, "short-work", slug);
    assert.equal(item.authorKey, "juan-galindo", slug);
    assert.equal(item.pageCount, pageCount, slug);
    assert.equal(item.publishedDate, "2026-08-01", slug);
  }
  const peten = publications.find(
    (publication) => publication.slug === "galindo-antiquities-peten-1834",
  );
  assert.match(peten.description, /ヤショー湖（原刊 Yashaw）/);
  assert.doesNotMatch(peten.description, /ヤシャ湖|Yaxh/u);
});

test("second approved Galindo batch remains individually catalogued", () => {
  const expected = new Map([
    ["galindo-ruins-palenque-literary-gazette-1831", [13, 2, 2]],
    ["galindo-noticias-peten-1831", [9, 1, 0]],
    ["galindo-copan-full-report-1834", [44, 0, 13]],
    ["galindo-eruption-cosiguina-1835", [8, 1, 0]],
    ["galindo-on-central-america-1836", [25, 1, 2]],
  ]);
  for (const [slug, [pageCount, figureCount, plateCount]] of expected) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, "short-work", slug);
    assert.equal(item.authorKey, "juan-galindo", slug);
    assert.equal(item.pageCount, pageCount, slug);
    assert.equal(item.figureCount, figureCount, slug);
    assert.equal(item.plateCount, plateCount, slug);
    assert.equal(item.publishedDate, "2026-08-01", slug);
  }
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
    "archive-per-page",
    "archive-reset",
    "archive-pagination",
    "google-site-search",
    "google-search-query",
    "google-search-value",
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /window\.ARCHIVE_PUBLICATIONS=/);
  const embeddedStart = html.indexOf("window.ARCHIVE_PUBLICATIONS=") +
    "window.ARCHIVE_PUBLICATIONS=".length;
  const embeddedEnd = html.indexOf(";</script>", embeddedStart);
  const embeddedPublications = JSON.parse(
    html.slice(embeddedStart, embeddedEnd),
  );
  assert.equal(embeddedPublications.length, publications.length);
  assert.equal(
    embeddedPublications.filter((item) => item.recordClass === "major-work").length,
    majorPublications.length,
  );
  assert.equal(
    embeddedPublications.filter((item) => item.recordClass === "short-work").length,
    shortPublications.length,
  );
  assert.match(html, /\/archive\.css\?v=20260801-unified-search-v1/);
  assert.match(html, /\/archive\.js\?v=20260801-unified-search-v1/);
  assert.match(
    html,
    /サイト本文とGitHub Releases上のPDFは\s+Googleで検索できます/,
  );
  assert.match(html, /書名・著者・地名・キーワード/);
  assert.match(html, /Googleサイト内検索/);
  assert.match(html, /action="https:\/\/www\.google\.com\/search"/);
  assert.match(html, />一覧内検索</);
  assert.match(html, /class="collection-tabs" role="tablist"/);
  assert.match(html, /id="collection-match-summary" aria-live="polite"/);
  assert.match(html, /id="book-match-count">72<\/strong>件/);
  assert.match(html, /id="paper-match-count">19<\/strong>件/);
  assert.match(html, /data-short-archive/);
  const catalogueSearchPosition = html.indexOf('id="archive-search"');
  const googleSearchPosition = html.indexOf('id="google-site-search"');
  const matchSummaryPosition = html.indexOf('id="collection-match-summary"');
  const collectionTabsPosition = html.indexOf('class="collection-tabs"');
  const booksPanelPosition = html.indexOf('id="publications" role="tabpanel"');
  assert.ok(
    catalogueSearchPosition < matchSummaryPosition &&
      googleSearchPosition < matchSummaryPosition &&
      matchSummaryPosition < collectionTabsPosition &&
      collectionTabsPosition < booksPanelPosition,
    "all search controls and category match counts must precede the tabs",
  );
  assert.match(
    html,
    /id="tab-publications"[\s\S]*?aria-selected="true"[\s\S]*?collection-tab__label">書籍<\/span>/,
  );
  assert.match(
    html,
    /id="tab-short-works"[\s\S]*?aria-selected="false"[\s\S]*?collection-tab__label">論文<\/span>/,
  );
  assert.match(html, /id="publications" role="tabpanel"/);
  assert.match(html, /id="short-works" role="tabpanel"[\s\S]*? hidden>/);
  assert.doesNotMatch(html, /刊本・大部論文|短篇論文・報告/);
  assert.match(html, /<option value="12" selected>12件<\/option>/);
  assert.match(html, /<option value="all">すべて<\/option>/);
  assert.match(html, /元資料を読もう/);
  assert.match(html, /中部アメリカとその周辺に関する年代記/);
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
    majorPublications.length,
  );
  assert.equal(
    (html.match(/class="short-work-card"/g) || []).length,
    shortPublications.length,
  );
  assert.equal(
    (html.match(/class="short-author"/g) || []).length,
    shortPublicationAuthors.length,
  );
  assert.match(html, /id="author-juan-galindo"/);
  assert.match(html, /フアン・ガリンド/);
  assert.match(html, />11篇</);
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
  assert.match(html, /\/archive\.css\?v=20260801-unified-search-v1/);
});

test("catalogue search stays within publication metadata", async () => {
  const script = await readFile(path.join(dist, "archive.js"), "utf8");
  assert.doesNotMatch(script, /search-index\.json|__fullText|PDF本文/u);
  assert.match(script, /item\.__search\.includes\(query\)/);
  assert.match(script, /const matching = publications\.filter/);
  assert.match(script, /item\.recordClass === "major-work"/);
  assert.match(script, /item\.recordClass === "short-work"/);
  assert.match(script, /shortCatalogue\(filteredShort\)/);
  assert.match(script, /controls\.bookMatch\.textContent = String\(filtered\.length\)/);
  assert.match(script, /controls\.paperMatch\.textContent = String\(filteredShort\.length\)/);
  assert.match(script, /site:\$\{location\.hostname\} OR/);
  assert.match(
    script,
    /site:github\.com\/takochanchan\/takochanchan\.github\.io\/releases/,
  );
  assert.match(script, /frame\.src = button\.dataset\.pdfSrc/);
  assert.match(script, /const defaultPageSize = "12"/);
  assert.match(script, /const paginationItems = \(pages\) =>/);
  assert.match(script, /localStorage\.setItem\(pageSizeStorageKey, state\.perPage\)/);
  assert.match(script, /`\$\{target\}\$\{location\.hash\}`/);
  assert.match(script, /\[data-collection-tab\]/);
  assert.match(script, /window\.addEventListener\("hashchange"/);
  assert.match(script, /history\.pushState\(null, "", nextUrl\)/);
  assert.match(script, /document\.getElementById\(initialAnchor\)\?\.scrollIntoView\(\)/);
  assert.doesNotMatch(script, /const perPage = 6/);
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
    assert.match(html, /\/archive\.css\?v=20260801-unified-search-v1/);
    assert.match(html, /\/archive\.js\?v=20260801-unified-search-v1/);
    if (item.recordClass === "short-work") {
      assert.match(
        html,
        /href="\/\?v=20260801-unified-search-v1#short-works">← 論文へ戻る<\/a>/,
      );
    } else {
      assert.match(
        html,
        /href="\/\?v=20260801-unified-search-v1#publications">← 書籍へ戻る<\/a>/,
      );
    }
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
  assert.equal(files.filter((file) => /cover\.(?:jpg|svg)$/.test(file)).length, publications.length);
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
