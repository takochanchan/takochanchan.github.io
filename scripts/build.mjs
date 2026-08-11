import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  majorPublications,
  publications,
  shortPublicationAuthors,
  shortPublications,
} from "../src/publications.mjs";

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
const assetVersion = "20260811-fulltext-search-v2";

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

const catalogueTaxonomy = {
  types: [...new Set(publications.flatMap((item) => item.types))].sort(
    (a, b) => a.localeCompare(b, "ja"),
  ),
  regions: [...new Set(publications.flatMap((item) => item.regions))].sort(
    (a, b) => a.localeCompare(b, "ja"),
  ),
  languages: [...new Set(publications.flatMap((item) => item.languages))].sort(
    (a, b) => a.localeCompare(b, "ja"),
  ),
};

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

const staticCatalogue = [...majorPublications]
  .sort((a, b) => a.year - b.year)
  .map(publicationCard)
  .join("");

const shortWorkCard = (item) => `
  <article class="short-work-card">
    <div class="short-work-card__meta">
      <time datetime="${escapeHtml(String(item.year))}">${escapeHtml(String(item.year))}</time>
      <span>${escapeHtml(String(item.pageCount))}頁</span>
    </div>
    <div class="short-work-card__body">
      <h4><a href="/publications/${escapeHtml(item.slug)}/">${escapeHtml(item.title)}</a></h4>
      <p class="short-work-card__original-title"><cite>${escapeHtml(item.originalTitle)}</cite></p>
      <p class="short-work-card__publication">${escapeHtml(item.originalPublication)}</p>
      <div class="short-work-card__actions">
        <a class="button button--primary" href="/publications/${escapeHtml(item.slug)}/">書誌・本文</a>
      </div>
    </div>
  </article>`;

const shortWorkCatalogue = shortPublicationAuthors
  .map(
    (author) => `
      <details class="short-author" id="author-${escapeHtml(author.key)}">
        <summary class="short-author__heading">
          <span class="short-author__name" role="heading" aria-level="3">${escapeHtml(author.name)}</span>
          <span class="short-author__count">${author.publications.length}篇</span>
          <span class="short-author__toggle" aria-hidden="true"></span>
        </summary>
        <div class="short-author__works">
          ${author.publications.map(shortWorkCard).join("")}
        </div>
      </details>`,
  )
  .join("");

const header = ({
  detail = false,
  backHref = `/?v=${assetVersion}#publications`,
  backLabel = "資料一覧へ戻る",
} = {}) => `
  <a class="skip-link" href="#main">本文へ移動</a>
  <header class="site-header">
    <a class="archive-mark" href="/">
      <span class="archive-mark__en">${site.englishName}</span>
      <span class="archive-mark__ja">${site.name}</span>
    </a>
    ${
      detail
        ? `<a class="back-link" href="${escapeHtml(backHref)}">← ${escapeHtml(backLabel)}</a>`
        : `<nav class="site-nav" aria-label="主要メニュー">
            <a href="#publications">書籍</a>
            <a href="#short-works">論文</a>
            <a href="/about/">このアーカイブについて</a>
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
  <link rel="stylesheet" href="/fulltext-search.css?v=${assetVersion}">
  <noscript><style>.collection-panel[hidden]{display:block}</style></noscript>
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

const fulltextDialog = () => `
  <dialog id="fulltext-dialog" class="fulltext-dialog" aria-labelledby="fulltext-dialog-query">
    <div class="fulltext-dialog__frame">
      <header class="fulltext-dialog__header">
        <div>
          <p class="fulltext-dialog__eyebrow">SEARCH RESULTS</p>
          <h2 id="fulltext-dialog-query">検索結果</h2>
        </div>
        <button id="fulltext-dialog-close" class="fulltext-dialog__close" type="button"
          aria-label="検索結果を閉じる">×</button>
      </header>
      <div class="fulltext-dialog__summary">
        <p id="fulltext-summary" aria-live="polite">検索語を入力してください。</p>
        <p id="fulltext-status" class="fulltext-status" aria-live="polite"></p>
      </div>
      <div class="fulltext-dialog__body">
        <div id="fulltext-result-list" class="fulltext-result-list"></div>
      </div>
    </div>
  </dialog>`;

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
          中部アメリカとその周辺に関する年代記、行政文書、旅行記、地誌、考古学、民族誌、言語、自然環境などの資料を
          生成AIで全訳し、原刊の図版とともに公開しています。
        </p>
      </div>
      <div class="hero__index" aria-label="収録統計">
        <div><strong>${majorPublications.length}冊</strong><span>書籍</span></div>
        <div><strong>${shortPublications.length}篇</strong><span>論文</span></div>
        <div><strong>${totalPages.toLocaleString("ja-JP")}</strong><span>公開版総ページ数</span></div>
        <div><strong>${totalVisuals}</strong><span>FIGURES &amp; PLATES</span></div>
      </div>
    </div>
  </section>

  <section class="site-search" aria-label="資料検索">
    <div class="site-search__inner">
      <form class="archive-tools" role="search" onsubmit="return false">
        <div class="archive-search">
          <label for="archive-search">一覧内検索</label>
          <input id="archive-search" type="search"
            placeholder="書名・著者・地名・キーワード" autocomplete="off">
        </div>
        <div class="archive-filters">
          <div class="field">
            <label for="filter-type">資料種別</label>
            <select id="filter-type">${options(catalogueTaxonomy.types, "種別")}</select>
          </div>
          <div class="field">
            <label for="filter-region">地域</label>
            <select id="filter-region">${options(catalogueTaxonomy.regions, "地域")}</select>
          </div>
          <div class="field">
            <label for="filter-language">原刊言語</label>
            <select id="filter-language">${options(catalogueTaxonomy.languages, "言語")}</select>
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
          <button class="reset-button" id="archive-reset" type="button">条件を解除</button>
        </div>
      </form>

      <div class="active-filters" id="active-filters"></div>

      <div class="fulltext-search-block">
        <form id="fulltext-form" class="fulltext-form fulltext-form--archive"
          role="search" onsubmit="return false">
          <label for="fulltext-query">本文全文検索</label>
          <div class="fulltext-form__row">
            <input id="fulltext-query" name="fulltext" type="search" required
              placeholder="本文・注・図版説明を検索" autocomplete="off">
            <button type="submit">検索</button>
          </div>
        </form>
        <p class="fulltext-help" id="fulltext-scope">
          検索結果は資料単位でモーダル表示します。同じPDF頁の一致は1件にまとめ、
          原刊標識と日本語版PDFの物理頁を併記します。
        </p>
      </div>

      <p class="collection-match-summary" id="collection-match-summary" aria-live="polite">
        <span>書籍 <strong id="book-match-count">${majorPublications.length}</strong>件</span>
        <span>論文 <strong id="paper-match-count">${shortPublications.length}</strong>件</span>
        <span>が該当</span>
      </p>
    </div>
  </section>

  <nav class="collection-switcher" aria-label="資料区分">
    <div class="collection-switcher__inner">
      <div class="collection-tabs" role="tablist" aria-label="収録資料">
        <a class="collection-tab" id="tab-publications" href="#publications"
          role="tab" aria-selected="true" aria-controls="publications"
          data-collection-tab="publications">
          <span class="collection-tab__label">書籍</span>
        </a>
        <a class="collection-tab" id="tab-short-works" href="#short-works"
          role="tab" aria-selected="false" aria-controls="short-works" tabindex="-1"
          data-collection-tab="short-works">
          <span class="collection-tab__label">論文</span>
        </a>
      </div>
    </div>
  </nav>

  <section class="catalog collection-panel" id="publications" role="tabpanel"
    aria-labelledby="tab-publications" data-collection-panel="publications">
    <div class="catalog__inner">
      <div class="section-heading">
        <p class="eyebrow">BOOKS</p>
        <h2>書籍</h2>
        <p>
          単行本、報告書、長編資料を収録しています。下の一覧は書名・著者・地名・タグのほか、
          資料種別、地域、原刊言語、年代で絞り込めます。論文は別タブに著者別でまとめています。
        </p>
      </div>

      <div class="archive-status">
        <p class="archive-status__result" id="archive-results" aria-live="polite"></p>
        <div class="archive-status__summary">
          <label class="page-size sort-control" for="archive-sort">
            <span>並べ替え</span>
            <select id="archive-sort">
              <option value="year-asc">原刊年・古い順</option>
              <option value="year-desc">原刊年・新しい順</option>
              <option value="title">書名順</option>
              <option value="author">著者順</option>
            </select>
          </label>
          <label class="page-size" for="archive-per-page">
            <span>表示件数</span>
            <select id="archive-per-page">
              <option value="6">6件</option>
              <option value="12" selected>12件</option>
              <option value="24">24件</option>
              <option value="all">すべて</option>
            </select>
          </label>
        </div>
      </div>
      <div class="archive-grid" data-archive>${staticCatalogue}</div>
      <nav class="pagination" id="archive-pagination" aria-label="資料一覧のページ"></nav>
    </div>
  </section>

  <section class="short-works collection-panel" id="short-works" role="tabpanel"
    aria-labelledby="tab-short-works" data-collection-panel="short-works" hidden>
    <div class="short-works__inner">
      <div class="section-heading">
        <p class="eyebrow">PAPERS &amp; REPORTS</p>
        <h2>論文</h2>
        <p>
          雑誌、年報、新聞などに掲載された論文・報告と、短い原史料を著者ごとにまとめています。
          著者名を開くと、各篇が刊行年順に表示されます。書誌情報、原刊頁、PDF・EPUBは個別ページに保持しています。
        </p>
      </div>
      <p class="short-results" id="short-results" aria-live="polite">論文 ${shortPublications.length}件</p>
      <div class="short-author-list" data-short-archive>${shortWorkCatalogue}</div>
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
          翻訳には生成AIを用い、別工程のAIレビューと、公開前の人による版面確認を行っています。
          このレビューは専門研究者による外部査読ではありません。
        </p>
        <a class="about__link" href="/about/">翻訳・編集・レビュー・再利用方針を読む →</a>
      </div>
    </div>
  </section>
</main>
${fulltextDialog()}
${footer()}`,
  scripts: `
<script>window.ARCHIVE_PUBLICATIONS=${jsonForScript(publications)};</script>
<script>
window.FULLTEXT_SEARCH_CONFIG={
  pagefindModule:"/search/pagefind/pagefind.js",
  pagefindBase:"/search/pagefind/",
  mapsPath:"/search/maps/",
  metadataPath:"/search/search-meta.json",
  preferEmbedded:false
};
</script>
<script src="/archive.js?v=${assetVersion}" defer></script>
<script src="/fulltext-search.js?v=${assetVersion}" defer></script>`,
});

const aboutPage = documentShell({
  title: `翻訳・編集・レビュー・再利用方針｜${site.shortName}`,
  description:
    "中部アメリカ歴史資料 日本語翻訳アーカイブの底本選定、生成AIによる翻訳、独立レビュー、組版、公開前確認、再利用とライセンスの方針。",
  canonical: `${site.url}/about/`,
  body: `
${header({ detail: true })}
<main id="main">
  <section class="about-page-hero">
    <div class="about-page-hero__inner">
      <div>
        <p class="eyebrow">ABOUT &amp; EDITORIAL POLICY</p>
        <h1>翻訳・編集・<br>利用方針</h1>
        <p class="about-page-hero__lead">
          生成AIを用いた翻訳資料について、底本、点検工程、公開承認に加え、
          訳文と資料の再利用条件を明示します。
          本サイトは、GPT‑5.6とChatGPT Workによって長編史料の全訳・照合・組版・公開を
          継続的に扱える可能性に着目し、その実践として2026年7月24日に開設しました。
        </p>
      </div>
      <dl class="responsibility-grid" aria-label="制作工程の役割分担">
        <div>
          <dt>翻訳</dt>
          <dd><strong>生成AI</strong><span>原文から直接翻訳</span></dd>
        </div>
        <div>
          <dt>レビュー</dt>
          <dd><strong>別工程の生成AI</strong><span>重大な誤訳と構造欠落を照合</span></dd>
        </div>
        <div>
          <dt>公開承認</dt>
          <dd><strong>人</strong><span>最終PDFの収録内容と版面を確認</span></dd>
        </div>
      </dl>
    </div>
  </section>

  <section class="workflow" aria-labelledby="workflow-heading">
    <div class="workflow__inner">
      <p class="eyebrow">WORKFLOW</p>
      <h2 id="workflow-heading">公開までの流れ</h2>
      <ol class="workflow__steps">
        <li><span>01</span>底本・権利確認</li>
        <li><span>02</span>原文から翻訳</li>
        <li><span>03</span>独立レビュー</li>
        <li><span>04</span>組版・ファイル検証</li>
        <li><span>05</span>人による最終承認</li>
      </ol>
    </div>
  </section>

  <nav class="policy-nav" aria-label="このページの目次">
    <div class="policy-nav__inner">
      <a href="#translation"><span>01</span>底本と翻訳</a>
      <a href="#review"><span>02</span>独立レビュー</a>
      <a href="#production"><span>03</span>組版と公開前確認</a>
      <a href="#reuse"><span>04</span>再利用とライセンス</a>
      <a href="#notice"><span>05</span>利用上の注意</a>
    </div>
  </nav>

  <section class="policy-section" id="translation" aria-labelledby="translation-heading">
    <div class="policy-section__inner">
      <div class="policy-section__heading">
        <p class="eyebrow">SOURCE &amp; TRANSLATION</p>
        <h2 id="translation-heading">底本と翻訳</h2>
      </div>
      <div class="policy-copy">
        <p>
          翻訳に着手する前に、原著者、刊行年、収録範囲、著作権、公開条件を確認し、
          利用可能な原刊・原資料の中から最も適切な底本を選定します。現代の編者による解説や注釈など、
          権利が残る可能性のある部分は翻訳対象に含めません。
        </p>
        <p>
          翻訳には生成AIを使用しますが、外部翻訳サービス、ブラウザの自動翻訳、
          ローカル翻訳モデルは使用しません。原刊画像または信頼できる原文転写を直接読み、
          原文から日本語へ翻訳します。OCRや同版の別個体は判読困難箇所の確認と照合に限って使用し、
          既存の翻訳文を訳文として流用しません。
        </p>
        <p>
          原刊の見出し、段落、原刊頁、脚注、表、図版、キャプション、付録、索引などは、
          可能な限り原構成に対応させます。判読や解釈に確信を持てない箇所は推測で埋めず、
          必要に応じて注記または確認対象として扱います。
        </p>
        <p>
          翻訳・編集の正本はMarkdown形式で保存し、PDFとリフロー型EPUBは同じ正本から生成します。
        </p>
      </div>
    </div>
  </section>

  <section class="policy-section" id="review" aria-labelledby="review-heading">
    <div class="policy-section__inner">
      <div class="policy-section__heading">
        <p class="eyebrow">INDEPENDENT REVIEW</p>
        <h2 id="review-heading">独立レビュー</h2>
      </div>
      <div class="policy-copy">
        <p>
          翻訳後の訳文は、翻訳を生成した工程とは分離した生成AIによる独立レビューにかけます。
          ここでいう「独立」は工程を分離したAIレビューを指し、専門研究者による外部査読を意味しません。
        </p>
        <p>レビューでは、次の項目を優先して原文と照合します。</p>
        <ul class="review-list">
          <li>訳文の脱落、重複、順序の誤り</li>
          <li>文意を大きく変える誤訳</li>
          <li>人名、地名、民族名、組織名などの固有名詞</li>
          <li>年代、数量、距離、頁番号などの数値</li>
          <li>脚注、表、図版、キャプションと本文との対応</li>
          <li>章立て、付録、索引など収録構成の欠落</li>
        </ul>
        <p>
          独立レビューは、訳文全体を別の文章へ作り直す再翻訳ではありません。
          同じ範囲を複数回にわたって逐語的に読み直すことも原則として行いません。
          意味や収録範囲に関わる重大な問題の発見を主目的とし、
          軽微な表現差や文体上の選択は必要以上に修正しない方針です。
        </p>
      </div>
    </div>
  </section>

  <section class="policy-section" id="production" aria-labelledby="production-heading">
    <div class="policy-section__inner">
      <div class="policy-section__heading">
        <p class="eyebrow">PRODUCTION &amp; APPROVAL</p>
        <h2 id="production-heading">組版と公開前確認</h2>
      </div>
      <div class="policy-copy">
        <p>
          レビュー後、訳文を所定の書式で組版し、PDFとリフロー型EPUBを生成します。
          原刊頁表示、注、表、図版、改頁、目次、内部リンク、文字化け、ファイル構造などを確認し、
          必要な修正を反映します。
        </p>
        <p>
          公開前には、人が最終PDFを閲覧し、表紙、標題紙、本文、原刊頁表示、図版、文字化け、
          欠落、版面の崩れなどを確認します。この確認は主として収録内容と組版を対象とするものであり、
          全文を逐語的に人手校閲したことを意味しません。最終PDFの確認と承認を受けるまでは、
          公開処理を行いません。
        </p>
      </div>
    </div>
  </section>

  <section class="policy-section" id="reuse" aria-labelledby="reuse-heading">
    <div class="policy-section__inner">
      <div class="policy-section__heading">
        <p class="eyebrow">REUSE &amp; LICENSING</p>
        <h2 id="reuse-heading">再利用とライセンス</h2>
      </div>
      <div class="policy-copy">
        <p>
          本アーカイブは、パブリックドメイン資料および適切なオープンライセンスで公開された資料を、
          日本語で利用しやすい形にすることを目的としています。翻訳物を排他的に囲い込むことではなく、
          原資料への到達可能性を高め、研究、教育、読書に役立てることを重視します。
        </p>
        <p>
          パブリックドメインの原著に基づく通常の翻訳について、本アーカイブは訳文の排他的な利用を求めず、
          転載、引用、改変、再配布その他の利用を妨げる意図はありません。
        </p>
        <p>
          利用に際しては、法的な独占を目的とする条件ではなく、訳文の来歴、改訂状況および
          誤訳等の責任の所在を明確にするため、次の事項の表示をお願いします。
        </p>
        <ul class="review-list">
          <li>原著者および原著書名</li>
          <li>本アーカイブの日本語訳を利用したこと</li>
          <li>参照した版または公開日</li>
          <li>当該作品の公開ページ</li>
          <li>訳文を修正または改変した場合は、その旨と変更者</li>
        </ul>
        <p>
          出典表示は、再利用者に原訳の誤訳や解釈上の問題を負わせないためでもあります。
          本アーカイブの訳文に由来する誤りが、再利用者自身による翻訳と誤認されないよう、
          訳文の出所を明示してください。
        </p>
        <p>
          底本、校訂本文、図版、写真その他の資料にCreative Commonsライセンスが適用されている場合は、
          当該ライセンスの条件を作品または素材ごとに継承します。BY、SA、NCなどの条件は省略せず、
          原著者、原資料、提供機関または権利者、ライセンス、日本語への翻訳や組版等の変更を明記します。
          翻案物にSAまたはNCが適用される場合は、その条件を明確に継承します。
        </p>
        <p>
          ライセンスは作品単位または対象素材単位で表示します。ある一冊にCCライセンスが適用されても、
          その条件が本アーカイブの他の独立した翻訳やサイト全体に自動的に適用されるものではありません。
          一つの刊行物にパブリックドメインの本文、CCライセンスの図版、独自の解説等が含まれる場合は、
          それぞれの権利状態を可能な限り区別して表示します。
        </p>
        <p>
          原著本文がパブリックドメインであっても、底本のページ画像、現代の校訂、解説、写真、地図、
          図版等には別の権利が存在する場合があります。各作品の書誌ページおよび刊行物内の権利表示を確認し、
          第三者資料を再利用する場合は、当該資料に付された条件を優先してください。
        </p>
      </div>
    </div>
  </section>

  <section class="policy-section policy-section--notice" id="notice" aria-labelledby="notice-heading">
    <div class="policy-section__inner">
      <div class="policy-section__heading">
        <p class="eyebrow">NOTICE</p>
        <h2 id="notice-heading">利用上の注意</h2>
      </div>
      <div class="policy-copy">
        <p>
          本アーカイブの翻訳は、生成AIを用いて作成し、独立したAIレビューと
          公開前の人による版面確認を経た日本語読書版です。専門家による批判校訂版ではなく、
          誤読や訳語上の問題が残る可能性があります。
        </p>
        <p>
          研究や論文で利用する場合は、各資料に示した底本と原刊頁を併せて確認してください。
          公開後に判明した誤りは、原刊との照合に基づいて随時修正します。
        </p>
      </div>
    </div>
  </section>
</main>
${footer()}`,
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
  const isShortWork = item.recordClass === "short-work";
  const recordClassLabel = isShortWork ? "論文" : "書籍";
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
${header({
  detail: true,
  backHref: isShortWork
    ? `/?v=${assetVersion}#short-works`
    : `/?v=${assetVersion}#publications`,
  backLabel: `${recordClassLabel}へ戻る`,
})}
<main id="main">
  <article>
    <section class="publication-hero">
      <div class="publication-hero__inner">
        <div class="publication-hero__cover">
          <img src="/${escapeHtml(item.cover)}" width="794" height="1123"
            alt="${escapeHtml(item.title)}の表紙">
        </div>
        <div>
          <p class="publication-hero__record-class">${escapeHtml(recordClassLabel)}</p>
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
        </div>
        <div class="pdf-frame" data-pdf-reader>
          <div class="pdf-placeholder" data-pdf-placeholder>
            <p>PDFは自動では読み込みません。閲覧するときだけ下のボタンを押してください。</p>
            <button class="pdf-load-button" type="button" data-pdf-load
              data-pdf-src="${escapeHtml(pdfViewerUrl)}"
              aria-controls="pdf-reader-frame">
              PDFを読み込む（${escapeHtml(item.pdfSize)}）
            </button>
          </div>
          <iframe id="pdf-reader-frame" data-pdf-frame hidden
            title="${escapeHtml(item.title)} 日本語翻訳版PDF"></iframe>
          <noscript>
            <p class="pdf-noscript">
              JavaScriptが無効です。<a href="${escapeHtml(item.pdfUrl)}" download>PDFを保存してください</a>。
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
await mkdir(path.join(dist, "about"), { recursive: true });
await Promise.all([
  writeFile(path.join(dist, "index.html"), home),
  writeFile(path.join(dist, "about", "index.html"), aboutPage),
  cp(path.join(projectRoot, "src", "styles.css"), path.join(dist, "archive.css")),
  cp(path.join(projectRoot, "src", "archive.js"), path.join(dist, "archive.js")),
  cp(
    path.join(projectRoot, "src", "fulltext-search.css"),
    path.join(dist, "fulltext-search.css"),
  ),
  cp(
    path.join(projectRoot, "src", "fulltext-search.js"),
    path.join(dist, "fulltext-search.js"),
  ),
  cp(
    path.join(projectRoot, "google6a6ff1ca39cd5a62.html"),
    path.join(dist, "google6a6ff1ca39cd5a62.html"),
  ),
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
  `${site.url}/about/`,
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
  `Built ${publications.length + 2} pages in ${path.relative(projectRoot, dist)}`,
);
