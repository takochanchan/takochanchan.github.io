import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  INITIAL_SNIPPET_LIMIT,
  blockIdFor,
  countsFor,
  exactSubResultsFor,
  literalCandidateQueries,
  resultLabel,
  snippetsFor,
} from "../src/fulltext-search-core.mjs";

const browserScript = await readFile(
  new URL("../src/fulltext-search.js", import.meta.url),
  "utf8",
);

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
        excerpt: "同じPDF頁の別の原刊頁",
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
      b00001: ["原刊 fol. 12r", 4, 0],
      b00002: ["原刊 p. 8", 9, 1],
      b00003: ["原刊 fol. 12v", 4, 2],
    },
  };
  assert.deepEqual(snippetsFor(result, pageMap), [
    {
      blockId: "b00001",
      originalPage: "原刊 fol. 12r／原刊 fol. 12v",
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
});

test("Pagefind count queries are serialized and result data loads progressively", () => {
  assert.doesNotMatch(browserScript, /Promise\.all\(\[\s*api\.search\(query\)/);
  assert.match(browserScript, /exactDiacritics: true/);
  assert.match(browserScript, /noWorker: true/);
  assert.match(browserScript, /literalPagefindSearch\(api, query\)/);
  assert.match(browserScript, /const exactQuery = '\"' \+ candidate \+ '\"';/);
  assert.match(browserScript, /exactSubResultsFor\(/);
  assert.doesNotMatch(browserScript, /const all = await api\.search\(query\)/);
  assert.match(browserScript, /const RESULT_LOAD_CONCURRENCY = 2;/);
  assert.match(browserScript, /const LITERAL_FILTER_CONCURRENCY = 4;/);
  assert.match(
    browserScript,
    /resultList\.append\(resultCard\(result, pageMap\)\)[\s\S]*renderedWorks \+= loaded\.length/,
  );
});
