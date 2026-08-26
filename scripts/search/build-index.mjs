import { spawn } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import * as pagefind from "pagefind";

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, "../..");

const argument = (name) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
};

const manifestArg = argument("--manifest");
const outputArg = argument("--output");
const buildPrototype = process.argv.includes("--prototype");
const SEARCH_PART_TEXT_LIMIT = 100_000;
const SEARCH_PART_CHUNK_LIMIT = 1_200;
if (!manifestArg || !outputArg) {
  throw new Error("Usage: build-index.mjs --manifest FILE --output DIST_DIR");
}

const manifestPath = path.resolve(projectRoot, manifestArg);
const outputPath = path.resolve(projectRoot, outputArg);
const distRoot = path.join(projectRoot, "dist");
const relativeOutput = path.relative(distRoot, outputPath);
if (
  !relativeOutput ||
  relativeOutput.startsWith("..") ||
  path.isAbsolute(relativeOutput)
) {
  throw new Error("Search output must be a child of dist/");
}

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

const runExtractor = (corpusPath) =>
  new Promise((resolve, reject) => {
    const child = spawn(
      "python3",
      [
        path.join(here, "extract-corpus.py"),
        "--manifest",
        manifestPath,
        "--output",
        corpusPath,
      ],
      { cwd: projectRoot, stdio: ["ignore", "inherit", "inherit"] },
    );
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error("Corpus extraction failed with exit code " + code));
    });
  });

const directorySize = async (directory) => {
  let bytes = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) bytes += await directorySize(entryPath);
    else bytes += (await stat(entryPath)).size;
  }
  return bytes;
};

const searchPartsFor = (work) => {
  const parts = [];
  let chunks = [];
  let textLength = 0;
  let lastPdfPage = null;

  const finishPart = () => {
    if (!chunks.length) return;
    parts.push({ index: parts.length, chunks });
    chunks = [];
    textLength = 0;
  };

  for (const chunk of work.chunks) {
    const startsNewPdfPage =
      chunks.length > 0 && chunk.pdfPage !== lastPdfPage;
    const exceedsLimit =
      textLength + chunk.text.length > SEARCH_PART_TEXT_LIMIT ||
      chunks.length >= SEARCH_PART_CHUNK_LIMIT;
    if (startsNewPdfPage && exceedsLimit) finishPart();
    chunks.push(chunk);
    textLength += chunk.text.length;
    lastPdfPage = chunk.pdfPage;
  }
  finishPart();
  return parts;
};

const searchDocumentUrl = (slug, partIndex) =>
  `/__fulltext/${slug}/part-${String(partIndex).padStart(4, "0")}/`;

const documentFor = (work, part) => {
  const documentUrl = searchDocumentUrl(work.slug, part.index);
  return [
    "<!doctype html>",
    '<html lang="ja">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="robots" content="noindex">',
    '  <link rel="canonical" href="' + escapeHtml(documentUrl) + '">',
    '  <meta data-pagefind-meta="title[content]" content="' +
      escapeHtml(work.title) +
      '">',
    '  <meta data-pagefind-meta="author[content]" content="' +
      escapeHtml(work.author) +
      '">',
    '  <meta data-pagefind-meta="slug[content]" content="' +
      escapeHtml(work.slug) +
      '">',
    '  <meta data-pagefind-meta="recordClass[content]" content="' +
      escapeHtml(work.recordClass) +
      '">',
    '  <meta data-pagefind-meta="pdfUrl[content]" content="' +
      escapeHtml(work.pdfUrl) +
      '">',
    '  <meta data-pagefind-meta="url[content]" content="' +
      escapeHtml(work.url) +
      '">',
    '  <meta data-pagefind-meta="searchPart[content]" content="' +
      String(part.index) +
      '">',
    '  <meta data-pagefind-filter="recordClass[content]" content="' +
      escapeHtml(work.recordClass) +
      '">',
    "  <title>" + escapeHtml(work.title) + "</title>",
    "</head>",
    "<body>",
    "  <h1 data-pagefind-ignore>" + escapeHtml(work.title) + "</h1>",
    part.chunks
      .map(
        (chunk) =>
          '  <h6 id="' +
          chunk.id +
          '" data-pagefind-weight="1">' +
          escapeHtml(chunk.text) +
          "</h6>",
      )
      .join("\n"),
    "</body>",
    "</html>",
  ].join("\n");
};

const pagefindDocumentMap = async (pagefindPath, expectedDocuments) => {
  const fragmentPath = path.join(pagefindPath, "fragment");
  const filenames = (await readdir(fragmentPath)).filter((filename) =>
    filename.endsWith(".pf_fragment"),
  );
  const fragments = {};
  const foundDocuments = new Set();
  for (const filename of filenames) {
    const compressed = await readFile(path.join(fragmentPath, filename));
    const decoded = gunzipSync(compressed).toString("utf8");
    if (!decoded.startsWith("pagefind_dcd")) {
      throw new Error(`Unexpected Pagefind fragment format: ${filename}`);
    }
    const fragment = JSON.parse(decoded.slice("pagefind_dcd".length));
    const slug = fragment.meta?.slug;
    const recordClass = fragment.meta?.recordClass;
    const partIndex = Number(fragment.meta?.searchPart);
    const key = `${slug}:${partIndex}`;
    const expected = expectedDocuments.get(key);
    if (
      !expected ||
      !["major-work", "short-work"].includes(recordClass) ||
      foundDocuments.has(key)
    ) {
      throw new Error(`Unexpected Pagefind search document: ${filename}`);
    }
    if (
      fragment.meta?.title !== expected.title ||
      fragment.meta?.author !== expected.author ||
      fragment.meta?.url !== expected.url ||
      fragment.meta?.pdfUrl !== expected.pdfUrl
    ) {
      throw new Error(`Stale Pagefind bibliography: ${filename}`);
    }
    foundDocuments.add(key);
    fragments[filename.replace(/\.pf_fragment$/, "")] = [
      slug,
      recordClass,
      partIndex,
    ];
  }
  if (
    foundDocuments.size !== expectedDocuments.size ||
    [...expectedDocuments.keys()].some((key) => !foundDocuments.has(key))
  ) {
    throw new Error(
      `Pagefind document map is incomplete: ${foundDocuments.size}/${expectedDocuments.size}`,
    );
  }
  return {
    schemaVersion: 1,
    documents: foundDocuments.size,
    fragments,
  };
};

const previewCorpusFor = (corpus) => ({
  schemaVersion: 1,
  works: corpus.works.map((work) => ({
    slug: work.slug,
    title: work.title,
    author: work.author,
    recordClass: work.recordClass,
    url: work.url,
    pdfUrl: work.pdfUrl,
    chunks: work.chunks.map((chunk) => ({
      id: chunk.id,
      originalPage: chunk.originalPage,
      pdfPage: chunk.pdfPage,
      text: chunk.text,
    })),
  })),
});

const prototypePage = ({
  corpus,
  metadata,
  browserScript,
  archiveCss,
  searchCss,
  preferEmbedded = false,
}) =>
  [
    "<!doctype html>",
    '<html lang="ja">',
    "<head>",
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    '  <meta name="robots" content="noindex">',
    "  <style>",
    archiveCss.replaceAll("</style", "<\\/style"),
    searchCss.replaceAll("</style", "<\\/style"),
    "  </style>",
    "  <title>全文検索 試作｜中部アメリカ歴史資料 日本語翻訳アーカイブ</title>",
    "</head>",
    "<body>",
    '  <a class="skip-link" href="#main">本文へ移動</a>',
    '  <header class="site-header">',
    '    <a class="archive-mark" href="../index.html">',
    '      <span class="archive-mark__en">MIDDLE AMERICA HISTORICAL SOURCES</span>',
    '      <span class="archive-mark__ja">中部アメリカ歴史資料 日本語翻訳アーカイブ</span>',
    "    </a>",
    '    <a class="back-link" href="../index.html">← 資料一覧へ戻る</a>',
    "  </header>",
    '  <main id="main" class="fulltext-page">',
    '    <section class="fulltext-hero">',
    "      <div>",
    '        <p class="eyebrow">FULL-TEXT SEARCH · PROTOTYPE</p>',
    "        <h1>正本から、<br>本文を探す。</h1>",
    "      </div>",
    '      <div class="fulltext-hero__copy">',
    "        <p>Markdown・DOCX正本から抽出した本文を対象に、資料ごとに一致箇所をまとめて表示します。</p>",
    '        <p id="prototype-scope">試作索引を読み込んでいます。</p>',
    "      </div>",
    "    </section>",
    "",
    '    <section class="fulltext-search" aria-labelledby="fulltext-heading">',
    '      <div class="fulltext-search__inner">',
    '        <h2 id="fulltext-heading">全文検索</h2>',
    '        <form id="fulltext-form" class="fulltext-form" role="search" onsubmit="return false">',
    '          <label for="fulltext-query">検索語</label>',
    '          <div class="fulltext-form__row">',
    '            <input id="fulltext-query" name="fulltext" type="search" required',
    '              placeholder="例：グアテマラ、ラカンドン、国境" autocomplete="off">',
    '            <button type="submit">検索</button>',
    "          </div>",
    "        </form>",
    '        <p class="fulltext-help">',
    "          検索結果はモーダルで開きます。大冊は最初の一致頁を先に表示し、全一致頁を資料ごとに展開できます。底本位置標識は正本どおりに表示し、PDF頁は表紙を1頁とする物理ページ番号です。",
    "        </p>",
    "      </div>",
    "    </section>",
    "  </main>",
    "",
    '  <dialog id="fulltext-dialog" class="fulltext-dialog" aria-labelledby="fulltext-dialog-query">',
    '    <div class="fulltext-dialog__frame">',
    '      <header class="fulltext-dialog__header">',
    "        <div>",
    '          <p class="fulltext-dialog__eyebrow">SEARCH RESULTS</p>',
    '          <h2 id="fulltext-dialog-query">検索結果</h2>',
    "        </div>",
    '        <button id="fulltext-dialog-close" class="fulltext-dialog__close" type="button" aria-label="検索結果を閉じる">×</button>',
    "      </header>",
    '      <div class="fulltext-dialog__summary">',
    '        <p id="fulltext-summary" aria-live="polite">検索中…</p>',
    '        <p id="fulltext-status" class="fulltext-status" aria-live="polite"></p>',
    "      </div>",
    '      <div class="fulltext-dialog__body">',
    '        <div id="fulltext-result-list" class="fulltext-result-list"></div>',
    "      </div>",
    "    </div>",
    "  </dialog>",
    "  <script>",
    '    window.FULLTEXT_SEARCH_CONFIG = { pagefindModule: "./pagefind/pagefind.js", pagefindBase: "./pagefind/", documentMapPath: "./document-map.json", mapsPath: "./maps/", metadataPath: "./search-meta.json", preferEmbedded: ' +
      String(preferEmbedded) +
      " };",
    "    window.SEARCH_PREVIEW_CORPUS = " +
      jsonForScript(previewCorpusFor(corpus)) +
      ";",
    "    window.SEARCH_PREVIEW_META = " + jsonForScript(metadata) + ";",
    "  </script>",
    "  <script>",
    browserScript.replaceAll("</script", "<\\/script"),
    "  </script>",
    "</body>",
    "</html>",
  ].join("\n");

const temporaryDirectory = await mkdtemp(
  path.join(os.tmpdir(), "takochan-search-"),
);
const corpusPath = path.join(temporaryDirectory, "corpus.json");

try {
  await runExtractor(corpusPath);
  const corpus = JSON.parse(await readFile(corpusPath, "utf8"));
  await mkdir(outputPath, { recursive: true });
  const pagefindPath = path.join(outputPath, "pagefind");
  const mapsPath = path.join(outputPath, "maps");
  await rm(pagefindPath, { recursive: true, force: true });
  await rm(mapsPath, { recursive: true, force: true });
  await mkdir(mapsPath, { recursive: true });

  const { index } = await pagefind.createIndex({
    forceLanguage: "ja",
    writePlayground: false,
    verbose: false,
  });
  const expectedDocuments = new Map();
  for (const work of corpus.works) {
    if (!/^[a-z0-9-]+$/.test(work.slug)) {
      throw new Error("Unsafe slug: " + work.slug);
    }
    for (const part of searchPartsFor(work)) {
      const documentUrl = searchDocumentUrl(work.slug, part.index);
      expectedDocuments.set(`${work.slug}:${part.index}`, {
        title: work.title,
        author: work.author,
        url: work.url,
        pdfUrl: work.pdfUrl,
      });
      const result = await index.addHTMLFile({
        url: documentUrl,
        content: documentFor(work, part),
      });
      if (result.errors?.length) {
        throw new Error(
          `${work.slug} part ${part.index}: ${result.errors.join("; ")}`,
        );
      }
    }
    const map = {
      schemaVersion: 1,
      slug: work.slug,
      title: work.title,
      author: work.author,
      originalTitle: work.originalTitle,
      originalAuthor: work.originalAuthor,
      originalPublication: work.originalPublication,
      attributedTo: work.attributedTo,
      attributionStatus: work.attributionStatus,
      attributionNote: work.attributionNote,
      canonicalUrl: work.url,
      pdfUrl: work.pdfUrl,
      masterPath: work.masterPath,
      sourceFormat: work.sourceFormat,
      sourceMode: work.sourceMode,
      pdfTextMode: work.mappingSummary.pdfTextMode,
      sourceSha256: work.sourceSha256,
      pdfSha256: work.pdfSha256,
      blocks: Object.fromEntries(
        work.chunks.map((chunk, order) => [
          chunk.id,
          [chunk.originalPage, chunk.pdfPage, order],
        ]),
      ),
    };
    await writeFile(
      path.join(mapsPath, work.slug + ".json"),
      JSON.stringify(map),
      "utf8",
    );
  }
  const written = await index.writeFiles({ outputPath: pagefindPath });
  if (written.errors?.length) {
    throw new Error(written.errors.join("; "));
  }
  await pagefind.close();
  const documentMap = await pagefindDocumentMap(
    pagefindPath,
    expectedDocuments,
  );
  await writeFile(
    path.join(outputPath, "document-map.json"),
    JSON.stringify(documentMap),
    "utf8",
  );

  // The prototype uses Pagefind's low-level API, so its optional prebuilt UI
  // bundles and highlighting helper would only add transfer weight.
  await Promise.all(
    [
      "pagefind-component-ui.css",
      "pagefind-component-ui.js",
      "pagefind-highlight.js",
      "pagefind-modular-ui.css",
      "pagefind-modular-ui.js",
      "pagefind-ui.css",
      "pagefind-ui.js",
    ].map((filename) => rm(path.join(pagefindPath, filename), { force: true })),
  );

  const books = corpus.works.filter(
    (work) => work.recordClass === "major-work",
  ).length;
  const papers = corpus.works.length - books;
  const metadata = {
    schemaVersion: 1,
    searchShard: corpus.searchShard ?? null,
    prototype: buildPrototype,
    archiveCommit: corpus.archiveCommit,
    assetManifestSha256: corpus.assetManifestSha256,
    bibliographicManifestSha256: corpus.bibliographicManifestSha256,
    works: corpus.works.length,
    workSlugs: corpus.works.map((work) => work.slug),
    books,
    papers,
    documents: documentMap.documents,
    chunks: corpus.works.reduce((sum, work) => sum + work.chunks.length, 0),
    pagefindBytes: await directorySize(pagefindPath),
    sourceModes: Object.fromEntries(
      ["canonical-master", "approved-epub-mirror"].map((mode) => [
        mode,
        corpus.works.filter((work) => work.sourceMode === mode).length,
      ]),
    ),
    mappings: Object.fromEntries(
      corpus.works.map((work) => [work.slug, work.mappingSummary]),
    ),
  };
  if (buildPrototype) {
    const browserScript = await readFile(
      path.join(projectRoot, "src/fulltext-search.js"),
      "utf8",
    );
    const archiveCss = await readFile(path.join(distRoot, "archive.css"), "utf8");
    const searchCss = await readFile(
      path.join(projectRoot, "src/fulltext-search.css"),
      "utf8",
    );
    await Promise.all([
      writeFile(
        path.join(outputPath, "index.html"),
        prototypePage({
          corpus,
          metadata,
          browserScript,
          archiveCss,
          searchCss,
        }),
        "utf8",
      ),
      writeFile(
        path.join(outputPath, "fulltext-search-modal-prototype.html"),
        prototypePage({
          corpus,
          metadata,
          browserScript,
          archiveCss,
          searchCss,
          preferEmbedded: true,
        }),
        "utf8",
      ),
    ]);
    await copyFile(
      path.join(projectRoot, "src/fulltext-search.js"),
      path.join(outputPath, "fulltext-search.js"),
    );
    await copyFile(
      path.join(projectRoot, "src/fulltext-search.css"),
      path.join(outputPath, "fulltext-search.css"),
    );
  }
  await rm(path.join(outputPath, "fulltext-search-core.mjs"), { force: true });

  await writeFile(
    path.join(outputPath, "search-meta.json"),
    JSON.stringify(metadata),
    "utf8",
  );
  process.stdout.write(
    "Search index" +
      (metadata.searchShard ? " shard " + metadata.searchShard : "") +
      ": " +
      metadata.works +
      " works, " +
      metadata.chunks +
      " chunks, " +
      metadata.pagefindBytes +
      " index bytes\n",
  );
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}
