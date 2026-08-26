import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  INITIAL_SNIPPET_LIMIT,
  blockIdFor,
  countsFor,
  exactSubResultsFor,
  groupDocumentReferences,
  literalCandidateQueries,
  literalPagefindSearch,
  markedLiteralExcerpt,
  mergePagefindReferences,
  resultLabel,
  snippetsFor,
} from "../src/fulltext-search-core.mjs";

const browserScript = await readFile(
  new URL("../src/fulltext-search.js", import.meta.url),
  "utf8",
);

const extractorScript = await readFile(
  new URL("../scripts/search/extract-corpus.py", import.meta.url),
  "utf8",
);

test("search extractor preserves the shard identifier", () => {
  assert.match(
    extractorScript,
    /"searchShard": manifest\.get\("searchShard"\)/,
  );
});

test("initial result display is capped at ten snippets", () => {
  assert.equal(INITIAL_SNIPPET_LIMIT, 10);
});

test("block IDs are resolved from Pagefind anchors or URLs", () => {
  assert.equal(blockIdFor({ anchor: { id: "b00012" } }), "b00012");
  assert.equal(blockIdFor({ url: "/publication/#b00104" }), "b00104");
  assert.equal(blockIdFor({ url: "/publication/#chapter-1" }), null);
});

test("snippets preserve labels, sort by PDF page, and merge same-page hits", () => {
  const result = {
    sub_results: [
      {
        anchor: { id: "b00002" },
        url: "/work/#b00002",
        excerpt: "二つ目",
      },
      {
        anchor: { id: "b00001" },
        url: "/work/#b00001",
        excerpt: "一つ目",
      },
      {
        anchor: { id: "b00003" },
        url: "/work/#b00003",
        excerpt: "同じPDF頁の別の底本位置",
      },
      {
        anchor: { id: "b00002" },
        url: "/work/#b00002",
        excerpt: "重複",
      },
    ],
  };
  const pageMap = {
    blocks: {
      b00001: ["写本 f. 12r", 4, 0],
      b00002: ["原刊 p. 8", 9, 1],
      b00003: ["写本 f. 12v", 4, 2],
    },
  };
  assert.deepEqual(snippetsFor(result, pageMap), [
    {
      blockId: "b00001",
      originalPage: "写本 f. 12r／写本 f. 12v",
      pdfPage: 4,
      order: 0,
      excerpt: "一つ目",
    },
    {
      blockId: "b00002",
      originalPage: "原刊 p. 8",
      pdfPage: 9,
      order: 1,
      excerpt: "二つ目",
    },
  ]);
});

test("book and paper counts use archive record classes", () => {
  const counts = countsFor([
    { meta: { recordClass: "major-work" } },
    { meta: { recordClass: "short-work" } },
    { meta: { recordClass: "short-work" } },
  ]);
  assert.deepEqual(counts, { books: 1, papers: 2 });
  assert.equal(resultLabel(counts), "書籍 1冊・論文 2篇が該当");
});

test("literal Japanese search keeps voiced kana and retries index word boundaries", () => {
  const nameQueries = literalCandidateQueries("グリハルバ");
  assert.equal(nameQueries[0], "グリハルバ");
  assert.equal(nameQueries[1], "グリ ハルバ");

  const riverQueries = literalCandidateQueries("グリハルバ川");
  assert.equal(riverQueries[0], "グリハルバ 川");
  assert.ok(riverQueries.includes("グリ ハルバ 川"));
  assert.ok(!nameQueries.includes("クリバ"));

  const piedrasNegrasQueries = literalCandidateQueries(
    "ピエドラス・ネグラス",
  );
  assert.ok(piedrasNegrasQueries.includes("ピエドラ ス ネグラス"));
});

test("literal filtering keeps every real occurrence and rejects fuzzy kana hits", () => {
  const subResults = [
    { plain_excerpt: "チクソイ川、グリハルバ川、サンタ・バルバラ川" },
    { plain_excerpt: "ラ・クリバその他の植民地" },
    { plain_excerpt: "グリ ハルバ川という分かち書き" },
  ];
  assert.deepEqual(exactSubResultsFor(subResults, "グリハルバ"), [
    subResults[0],
    subResults[2],
  ]);
  assert.deepEqual(exactSubResultsFor(subResults, "グリハルバ川"), [
    subResults[0],
    subResults[2],
  ]);
  assert.equal(
    markedLiteralExcerpt(
      "ピエドラス・ネグラスではネグラスだけを強調しない",
      "ピエドラス・ネグラス",
    ),
    "<mark>ピエドラス・ネグラス</mark>ではネグラスだけを強調しない",
  );
});

test("candidate references merge every literal block without duplicate fragments", async () => {
  const reference = (score, subResults) => ({
    id: "ja_same",
    score,
    data: async () => ({
      meta: { slug: "book-a", recordClass: "major-work" },
      sub_results: subResults,
    }),
  });
  const merged = mergePagefindReferences(
    [
      reference(1, [
        {
          anchor: { id: "b00001" },
          plain_excerpt: "ピエドラス川",
          excerpt: "<mark>ピエドラス</mark>川",
        },
      ]),
      reference(4, [
        {
          anchor: { id: "b00001" },
          plain_excerpt: "ピエドラス川",
          excerpt: "ピエドラ<mark>ス</mark>川",
        },
        {
          anchor: { id: "b00002" },
          plain_excerpt: "ピエドラス・ネグラス",
          excerpt: "ピエドラ<mark>ス</mark>・ネグラス",
        },
        {
          anchor: { id: "b00003" },
          plain_excerpt: "ネグラスだけ",
          excerpt: "<mark>ネグラス</mark>だけ",
        },
      ]),
    ],
    "ピエドラス",
  );
  assert.equal(merged.length, 1);
  assert.equal(merged[0].score, 4);
  const data = await merged[0].data();
  assert.deepEqual(
    data.sub_results.map((subResult) => subResult.anchor.id),
    ["b00001", "b00002"],
  );
  assert.deepEqual(
    data.sub_results.map((subResult) => subResult.excerpt),
    [
      "<mark>ピエドラス</mark>川",
      "<mark>ピエドラス</mark>・ネグラス",
    ],
  );
});

test("literal Pagefind search combines later word-boundary candidates", async () => {
  const dataFor = (slug, text, block) => async () => ({
    meta: { slug, recordClass: "major-work", title: slug },
    sub_results: [
      { plain_excerpt: text, anchor: { id: block }, url: `/#${block}` },
    ],
  });
  const early = {
    id: "ja_early",
    score: 1,
    data: dataFor("early", "ピエドラス川", "b00001"),
  };
  const later = {
    id: "ja_later",
    score: 2,
    data: dataFor("later", "ピエドラス・ネグラス", "b00002"),
  };
  const api = {
    search: async (query) => {
      if (query === '"ピエドラス"' || query === "ピエドラス") {
        return { results: [early] };
      }
      if (query === '"ピエドラ ス"' || query === "ピエドラ ス") {
        return { results: [later] };
      }
      return { results: [] };
    },
  };
  const grouped = await literalPagefindSearch(api, "ピエドラス", {
    fragments: {
      ja_early: ["early", "major-work", 0],
      ja_later: ["later", "major-work", 0],
    },
  });
  assert.equal(grouped.books, 2);
  assert.deepEqual(
    grouped.results.map((result) => result.id),
    ["later", "early"],
  );
});

test("split search documents are regrouped into unique works", async () => {
  const dataFor = (slug, recordClass, subResults) => async () => ({
    meta: { slug, recordClass, title: slug },
    sub_results: subResults,
  });
  const exactReferences = [
    {
      id: "ja_a",
      score: 1,
      data: dataFor("book-a", "major-work", [
        { plain_excerpt: "上流のグリハルバ川", anchor: { id: "b00001" } },
      ]),
    },
    {
      id: "ja_b",
      score: 1,
      data: dataFor("book-a", "major-work", [
        { plain_excerpt: "グリハルバ川流域", anchor: { id: "b00008" } },
      ]),
    },
    {
      id: "ja_c",
      score: 1,
      data: dataFor("paper-c", "short-work", [
        { plain_excerpt: "グリハルバを渡る", anchor: { id: "b00002" } },
      ]),
    },
  ];
  const broadReferences = [
    {
      id: "ja_a",
      score: 4,
      data: dataFor("book-a", "major-work", [
        { plain_excerpt: "上流のグリハルバ川", anchor: { id: "b00001" } },
      ]),
    },
    {
      id: "ja_b",
      score: 3,
      data: dataFor("book-a", "major-work", [
        { plain_excerpt: "グリハルバ川流域", anchor: { id: "b00008" } },
        { plain_excerpt: "ラ・クリバ", anchor: { id: "b00009" } },
      ]),
    },
    {
      id: "ja_c",
      score: 2,
      data: dataFor("paper-c", "short-work", [
        { plain_excerpt: "グリハルバを渡る", anchor: { id: "b00002" } },
      ]),
    },
  ];
  const grouped = groupDocumentReferences(
    exactReferences,
    broadReferences,
    {
      fragments: {
        ja_a: ["book-a", "major-work", 0],
        ja_b: ["book-a", "major-work", 1],
        ja_c: ["paper-c", "short-work", 0],
      },
    },
    "グリハルバ",
  );
  assert.deepEqual(
    { books: grouped.books, papers: grouped.papers },
    { books: 1, papers: 1 },
  );
  assert.deepEqual(
    grouped.results.map((reference) => reference.id),
    ["book-a", "paper-c"],
  );
  const book = await grouped.results[0].data();
  assert.equal(book.__partialSearch, true);
  assert.deepEqual(
    book.sub_results.map((result) => result.anchor.id),
    ["b00001"],
  );
  const fullBook = await book.__loadFull();
  assert.deepEqual(
    fullBook.sub_results.map((result) => result.anchor.id),
    ["b00001", "b00008"],
  );
});

test("Pagefind groups small documents and result data loads progressively", () => {
  assert.doesNotMatch(browserScript, /Promise\.all\(\[\s*api\.search\(query\)/);
  assert.match(browserScript, /exactDiacritics: true/);
  assert.match(browserScript, /root\.setAttribute\("lang", "und"\)/);
  assert.doesNotMatch(browserScript, /noWorker: true/);
  assert.match(browserScript, /ensureDocumentMap\(\)/);
  assert.match(browserScript, /Array\.isArray\(config\.shards\)/);
  assert.match(browserScript, /instance\.mergeIndex\(shard\.pagefindBase/);
  assert.match(browserScript, /const mapBaseBySlug = new Map\(\)/);
  assert.match(browserScript, /Publication occurs in multiple shards/);
  assert.match(browserScript, /ensureSearchMetadata\(\)/);
  assert.match(browserScript, /literalPagefindSearch\(api, query, documentMap\)/);
  assert.match(browserScript, /groupDocumentResults\(/);
  assert.match(browserScript, /const exactSearches = await Promise\.all\(/);
  assert.match(browserScript, /matchedSearches\.flatMap/);
  assert.match(browserScript, /mergePagefindReferences\(/);
  assert.match(browserScript, /surfaceWords\(query\)/);
  assert.match(browserScript, /markedLiteralExcerpt\(/);
  assert.match(browserScript, /exactSubResultsFor\(/);
  assert.doesNotMatch(browserScript, /filters: \{ recordClass:/);
  assert.match(browserScript, /const INITIAL_WORK_BATCH_SIZE = 6;/);
  assert.match(browserScript, /const RESULT_LOAD_CONCURRENCY = 2;/);
  assert.match(browserScript, /const DOCUMENT_LOAD_CONCURRENCY = 6;/);
  assert.match(browserScript, /const LITERAL_FILTER_CONCURRENCY = 4;/);
  assert.match(browserScript, /全一致頁を表示/);
  assert.match(
    browserScript,
    /resultList\.append\(resultCard\(result, pageMap\)\)[\s\S]*renderedWorks \+= 1/,
  );
});
