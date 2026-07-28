import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publications, taxonomy } from "../src/publications.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "..");
const dist = path.join(projectRoot, "dist");
const assetFlag = process.argv.indexOf("--assets");
const localAssets =
  assetFlag >= 0 && process.argv[assetFlag + 1]
    ? path.resolve(process.argv[assetFlag + 1])
    : null;

const site = {
  url: "https://takochanchan.github.io",
  name: "中部アメリカ歴史資料 日本語翻訳アーカイブ",
  shortName: "日本語翻訳アーカイブ",
  englishName: "MIDDLE AMERICA HISTORICAL SOURCES",
  description:
    "中部アメリカの探検記・旅行記・考古学調査報告・一次史料を、原図版とともに日本語で公開するデジタルアーカイブ。",
};
const assetVersion = "20260728-release";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const jsonForScript = (value) =>
  JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");

const formatFileSize = (bytes) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const assetManifest = JSON.parse(
  await readFile(path.join(projectRoot, "assets-manifest.json"), "utf8"),
);
const assetSizes = new Map(
  assetManifest.assets.map((asset) => [asset.path, asset.size]),
);
for (const item of publications) {
  const pdfBytes = assetSizes.get(item.pdf);
  const epubBytes = assetSizes.get(item.epub);
  if (!Number.isFinite(pdfBytes) || !Number.isFinite(epubBytes)) {
    throw new Error(`Missing asset size: ${item.slug}`);
  }
  item.pdfBytes = pdfBytes;
  item.epubBytes = epubBytes;
  item.pdfSize = formatFileSize(pdfBytes);
  item.epubSize = formatFileSize(epubBytes);
}

const options = (values, label) =>
  [`<option value="">すべての${label}</option>`]
    .concat(
      values.map(
        (value) =>
          `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`,
      ),
    )
    .join("");

const formatDate = (value) => {
  const [year, month, day] = value.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
};

const publicationCard = (item) => `
  <article class="record-card">
    <a class="record-card__cover" href="/publications/${escapeHtml(item.slug)}/">
      <img src="/${escapeHtml(item.cover)}" width="794" height="1123" loading="lazy"
        alt="${escapeHtml(item.title)}の表紙">
      <span>${escapeHtml(String(item.year))}</span>
    </a>
    <div class="record-card__body">
      <p class="record-card__series">${escapeHtml(item.series)}</p>
      <h3><a href="/publications/${escapeHtml(item.slug)}/">${escapeHtml(item.title)}</a></h3>
      <p class="record-card__original-title"><span>原題</span><cite>${escapeHtml(item.originalTitle)}</cite></p>
      <p class="record-card__author">${escapeHtml(item.author)}</p>
      <p class="record-card__subtitle">${escapeHtml(item.subtitle)}</p>
      <div class="tag-list">
        ${[item.types[0], item.regions[0], item.languages[0]]
          .map((tag) => `<span>${escapeHtml(tag)}</span>`)
          .join("")}
      </div>
      <dl class="record-card__facts">
        <div><dt>原刊</dt><dd>${escapeHtml(item.originalPublication)}</dd></div>
        <div><dt>構成</dt><dd>${escapeHtml(item.extent)}</dd></div>
      </dl>
      <div class="record-card__actions">
        <a class="button button--primary" href="/publications/${escapeHtml(item.slug)}/">書誌・本文</a>
        <a class="button button--quiet" href="${escapeHtml(item.pdfUrl)}" download>PDF保存（${escapeHtml(item.pdfSize)}）</a>
        <a class="button button--quiet" href="${escapeHtml(item.epubUrl)}"
          type="application/epub+zip" download>EPUB保存（${escapeHtml(item.epubSize)}）</a>
      </div>
    </div>
  </article>`;

const staticCatalogue = [...publications]
  .sort((a, b) => a.year - b.year)
  .map(publicationCard)
  .join("");

const header = ({ detail = false } = {}) => `
  <a class="skip-link" href="#main">本文へ移動</a>
  <header class="site-header">
    <a class="archive-mark" href="/">
      <span class="archive-mark__en">${site.englishName}</span>
      <span class="archive-mark__ja">${site.name}</span>
    </a>
    ${
      detail
        ? `<a class="back-link" href="/#publications">← 資料一覧へ戻る</a>`
        : `<nav class="site-nav" aria-label="主要メニュー">
            <a href="#publications">資料を探す</a>
            <a href="#about">このアーカイブについて</a>
          </nav>`
    }
  </header>`;

const footer = () => `
  <footer class="site-footer">
    <span>${site.englishName}</span>
    <span>日本語翻訳資料を順次追加しています</span>
  </footer>`;

const documentShell = ({
  title,
  description = site.description,
  canonical = site.url,
  body,
  scripts = "",
}) => `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#101c1d">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="stylesheet" href="/archive.css?v=${assetVersion}">
  <title>${escapeHtml(title)}</title>
</head>
<body>
${body}
${scripts}
</body>
</html>
`;

const totalPages = publications.reduce((sum, item) => sum + item.pageCount, 0);
const totalVisuals = publications.reduce(
  (sum, item) => sum + item.figureCount + item.plateCount,
  0,
);

const home = documentShell({
  title: site.name,
  body: `
${header()}
<main id="main">
  <section class="hero">
    <div class="hero__inner">
      <div>
        <p class="eyebrow">DIGITAL TRANSLATION ARCHIVE</p>
        <h1>元資料を読もう</h1>
        <p class="hero__lead">
          17世紀末から20世紀初頭の中部アメリカに関する探検記、旅行記、遺跡調査報告、
          河川記述を、日本語訳と原刊図版を一体にして公開しています。
        </p>
      </div>
      <div class="hero__index" aria-label="収録統計">
        <div><strong>${publications.length}</strong><span>PUBLICATIONS</span></div>
        <div><strong>${totalPages.toLocaleString("ja-JP")}</strong><span>公開版総ページ数</span></div>
        <div><strong>${totalVisuals}</strong><span>FIGURES &amp; PLATES</span></div>
      </div>
    </div>
  </section>

  <section class="catalog" id="publications">
    <div class="catalog__inner">
      <div class="section-heading">
        <p class="eyebrow">CATALOGUE</p>
        <h2>資料を探す</h2>
        <p>
          書名・著者・地名・タグは一覧内で絞り込めます。サイト本文とGitHub Releases上のPDFは
          Googleで検索できます。資料種別、地域、原刊言語、年代による絞り込みにも対応しています。
        </p>
      </div>

      <form class="google-search" id="google-site-search"
        action="https://www.google.com/search" method="get" target="_blank"
        rel="noopener" role="search">
        <label for="google-search-query">Googleサイト内検索</label>
        <input id="google-search-query" type="search"
          placeholder="PDF本文を含む語句" autocomplete="off" required>
        <input id="google-search-value" name="q" type="hidden">
        <button type="submit">Googleで検索</button>
      </form>
      <p class="google-search__note">
        PDF・EPUB本体はGitHub Releasesで配布しています。Googleの索引状況により、
        公開直後の資料やPDF本文が検索結果に表示されない場合があります。
      </p>

      <form class="archive-tools" role="search" onsubmit="return false">
        <div class="archive-search">
          <label for="archive-search">資料検索</label>
          <input id="archive-search" type="search"
            placeholder="書名・著者・地名・キーワード" autocomplete="off">
        </div>
        <div class="archive-filters">
          <div class="field">
            <label for="filter-type">資料種別</label>
            <select id="filter-type">${options(taxonomy.types, "種別")}</select>
          </div>
          <div class="field">
            <label for="filter-region">地域</label>
            <select id="filter-region">${options(taxonomy.regions, "地域")}</select>
          </div>
          <div class="field">
            <label for="filter-language">原刊言語</label>
            <select id="filter-language">${options(taxonomy.languages, "言語")}</select>
          </div>
          <div class="field">
            <label for="filter-era">年代</label>
            <select id="filter-era">
              <option value="">すべての年代</option>
              <option value="17世紀">17世紀</option>
              <option value="18世紀">18世紀</option>
              <option value="19世紀前半">19世紀前半</option>
              <option value="19世紀後半">19世紀後半</option>
              <option value="20世紀初頭">20世紀初頭</option>
            </select>
          </div>
          <div class="field">
            <label for="archive-sort">並べ替え</label>
            <select id="archive-sort">
              <option value="year-asc">原刊年・古い順</option>
              <option value="year-desc">原刊年・新しい順</option>
              <option value="title">書名順</option>
              <option value="author">著者順</option>
            </select>
          </div>
          <button class="reset-button" id="archive-reset" type="button">条件を解除</button>
        </div>
      </form>

      <div class="archive-status" aria-live="polite">
        <div class="active-filters" id="active-filters"></div>
        <p class="archive-status__result" id="archive-results"></p>
      </div>
      <div class="archive-grid" data-archive>${staticCatalogue}</div>
      <nav class="pagination" id="archive-pagination" aria-label="資料一覧のページ"></nav>
    </div>
  </section>

  <section class="about" id="about">
    <div class="about__inner">
      <div>
        <p class="eyebrow">ABOUT THIS ARCHIVE</p>
        <h2>海外の記録を、<br>日本語で。</h2>
      </div>
      <div class="about__copy">
        <p>
          本アーカイブは、中部アメリカの歴史・地理・考古学を伝える刊行物を日本語で読める形に整え、
          PDFとリフロー型EPUBで公開する個人プロジェクトです。原刊の見出し、段落、注、表、図版を照合し、
          史料としての構成を保ちながら、画面幅や文字サイズに合わせて読める版も用意しています。
        </p>
        <p class="note">
          翻訳資料は生成AIの余剰リソースを用いて趣味的に作成しています。各資料の底本、収録範囲、
          図版点数は個別ページの書誌情報をご確認ください。
        </p>
      </div>
    </div>
  </section>
</main>
${footer()}`,
  scripts: `
<script>window.ARCHIVE_PUBLICATIONS=${jsonForScript(publications)};</script>
<script src="/archive.js?v=${assetVersion}" defer></script>`,
});

const scoreRelated = (current, candidate) => {
  const shared = (left, right) => left.filter((value) => right.includes(value)).length;
  return (
    shared(current.regions, candidate.regions) * 4 +
    shared(current.types, candidate.types) * 3 +
    shared(current.tags, candidate.tags) * 2 +
    shared(current.languages, candidate.languages)
  );
};

const relatedFor = (current) =>
  publications
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => ({
      ...candidate,
      __score: scoreRelated(current, candidate),
    }))
    .sort((a, b) => b.__score - a.__score || a.year - b.year)
    .slice(0, 3);

const tagList = (item) =>
  [...new Set([...item.types, ...item.regions, ...item.languages, ...item.tags])]
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("");

const detailPage = (item) => {
  const related = relatedFor(item);
  const visualTotal = item.figureCount + item.plateCount;
  const pdfViewerUrl =
    `https://docs.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(item.pdfUrl)}`;
  const sourceProvider = item.sourceUrl
    ? `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(item.sourceProvider)} ↗</a>`
    : escapeHtml(item.sourceProvider);
  const correctionUrl =
    "https://github.com/takochanchan/takochanchan.github.io/issues/new" +
    `?title=${encodeURIComponent(`訂正：${item.title}`)}`;
  return documentShell({
    title: `${item.title}｜${site.shortName}`,
    description: item.description,
    canonical: `${site.url}/publications/${item.slug}/`,
    body: `
${header({ detail: true })}
<main id="main">
  <article>
    <section class="publication-hero">
      <div class="publication-hero__inner">
        <div class="publication-hero__cover">
          <img src="/${escapeHtml(item.cover)}" width="794" height="1123"
            alt="${escapeHtml(item.title)}の表紙">
        </div>
        <div>
          <p class="eyebrow">${escapeHtml(item.series)}</p>
          <h1>${escapeHtml(item.title)}</h1>
          <p class="publication-hero__original-title">
            <span>原題</span>
            <cite>${escapeHtml(item.originalTitle)}</cite>
          </p>
          <p class="publication-hero__subtitle">${escapeHtml(item.subtitle)}</p>
          <p class="publication-hero__author">${escapeHtml(item.author)}</p>
          <p class="publication-hero__description">${escapeHtml(item.description)}</p>
          <div class="tag-list" aria-label="分類タグ">${tagList(item)}</div>
          <div class="publication-actions">
            <a class="button button--primary" href="${escapeHtml(item.pdfUrl)}">PDFを開く（${escapeHtml(item.pdfSize)}）</a>
            <a class="button button--quiet" href="${escapeHtml(item.pdfUrl)}" download>PDFを保存（${escapeHtml(item.pdfSize)}）</a>
            <a class="button button--quiet" href="${escapeHtml(item.epubUrl)}"
              type="application/epub+zip" download>リフロー型EPUBを保存（${escapeHtml(item.epubSize)}）</a>
          </div>
          <p class="epub-note">
            EPUBは本文リフロー型です。読書アプリの画面幅・文字サイズ・縦横表示に合わせて組み替わります。
          </p>
          <dl class="fact-grid">
            <div><dt>原刊</dt><dd>${escapeHtml(item.originalPublication)}</dd></div>
            <div><dt>翻訳版</dt><dd>${item.pageCount}頁</dd></div>
            <div><dt>図版・挿図</dt><dd>${visualTotal}点</dd></div>
            <div><dt>原刊言語</dt><dd>${escapeHtml(item.languages.join("・"))}</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section class="publication-info" aria-labelledby="publication-info-heading">
      <div class="publication-info__inner">
        <div class="publication-info__heading">
          <p class="eyebrow">SOURCE &amp; PUBLICATION DATA</p>
          <h2 id="publication-info-heading">底本・公開情報</h2>
        </div>
        <dl class="publication-info__grid">
          <div class="publication-info__wide">
            <dt>底本</dt>
            <dd>${escapeHtml(item.sourceEdition)}</dd>
          </div>
          <div class="publication-info__wide">
            <dt>公開元</dt>
            <dd>${sourceProvider}</dd>
          </div>
          <div class="publication-info__wide">
            <dt>権利・利用条件</dt>
            <dd>${escapeHtml(item.rights)}</dd>
          </div>
          <div>
            <dt>公開日</dt>
            <dd><time datetime="${escapeHtml(item.publishedDate)}">${formatDate(item.publishedDate)}</time></dd>
          </div>
          <div>
            <dt>更新日</dt>
            <dd><time datetime="${escapeHtml(item.updatedDate)}">${formatDate(item.updatedDate)}</time></dd>
          </div>
          <div>
            <dt>訂正窓口</dt>
            <dd><a href="${escapeHtml(correctionUrl)}" target="_blank" rel="noopener">誤訳・誤植を連絡する ↗</a></dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="reader-section" id="reader">
      <div class="reader-section__inner">
        <div class="reader-heading">
          <div>
            <p class="eyebrow">DOCUMENT READER</p>
            <h2>日本語翻訳版 PDF</h2>
          </div>
          <a class="reader-open" href="${escapeHtml(item.pdfUrl)}" target="_blank" rel="noopener">
            別画面で開く（${escapeHtml(item.pdfSize)}）↗
          </a>
        </div>
        <div class="pdf-frame" data-pdf-reader>
          <div class="pdf-placeholder" data-pdf-placeholder>
            <p>PDFは自動では読み込みません。閲覧するときだけ下のボタンを押してください。</p>
            <button class="pdf-load-button" type="button" data-pdf-load
              data-pdf-src="${escapeHtml(pdfViewerUrl)}"
              aria-controls="pdf-reader-frame">
              PDFを読み込む（${escapeHtml(item.pdfSize)}）
            </button>
            <a href="${escapeHtml(item.pdfUrl)}" target="_blank" rel="noopener">別画面で開く ↗</a>
          </div>
          <iframe id="pdf-reader-frame" data-pdf-frame hidden
            title="${escapeHtml(item.title)} 日本語翻訳版PDF"></iframe>
          <noscript>
            <p class="pdf-noscript">
              JavaScriptが無効です。<a href="${escapeHtml(item.pdfUrl)}">PDFを別画面で開いてください</a>。
            </p>
          </noscript>
        </div>
      </div>
    </section>

    <section class="related-section">
      <div class="related-section__inner">
        <p class="eyebrow">RELATED RECORDS</p>
        <h2>関連する資料</h2>
        <div class="related-grid">
          ${related
            .map(
              (candidate) => `
            <a class="related-card" href="/publications/${escapeHtml(candidate.slug)}/">
              <img src="/${escapeHtml(candidate.cover)}" width="92" height="120"
                loading="lazy" alt="">
              <div>
                <p>${escapeHtml(candidate.originalPublication)}</p>
                <h3>${escapeHtml(candidate.title)}</h3>
                <cite>${escapeHtml(candidate.originalTitle)}</cite>
                <span>${escapeHtml(candidate.author)}</span>
              </div>
            </a>`,
            )
            .join("")}
        </div>
      </div>
    </section>
  </article>
</main>
${footer()}`,
    scripts: `<script src="/archive.js?v=${assetVersion}" defer></script>`,
  });
};

const notFound = documentShell({
  title: `ページが見つかりません｜${site.shortName}`,
  body: `
${header({ detail: true })}
<main id="main" class="not-found">
  <div>
    <p class="eyebrow">404 · NOT FOUND</p>
    <h1>ページが見つかりません。</h1>
    <a class="button button--primary" href="/">資料一覧へ戻る</a>
  </div>
</main>
${footer()}`,
});

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await Promise.all([
  writeFile(path.join(dist, "index.html"), home),
  cp(path.join(projectRoot, "src", "styles.css"), path.join(dist, "archive.css")),
  cp(path.join(projectRoot, "src", "archive.js"), path.join(dist, "archive.js")),
  writeFile(path.join(dist, "404.html"), notFound),
  writeFile(path.join(dist, ".nojekyll"), ""),
  writeFile(
    path.join(dist, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`,
  ),
]);

await Promise.all(
  publications.map(async (item) => {
    const directory = path.join(dist, "publications", item.slug);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, "index.html"), detailPage(item));

    const coverTarget = path.join(dist, item.cover);
    await mkdir(path.dirname(coverTarget), { recursive: true });
    await cp(path.join(projectRoot, "static", item.cover), coverTarget);
  }),
);

const sitemapEntries = [
  `${site.url}/`,
  ...publications.map(
    (item) => `${site.url}/publications/${encodeURIComponent(item.slug)}/`,
  ),
];
await writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapEntries.map((url) => `  <url><loc>${url}</loc></url>`).join("\n") +
    `\n</urlset>\n`,
);

if (localAssets) {
  await cp(
    path.join(localAssets, "publications"),
    path.join(dist, "publications"),
    { recursive: true },
  );
}

console.log(
  `Built ${publications.length + 1} pages in ${path.relative(projectRoot, dist)}`,
);
