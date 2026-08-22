import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  literalPagefindSearch,
  snippetsFor,
} from "../../src/fulltext-search-core.mjs";

const argument = (name, fallback = null) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const directory = path.resolve(
  process.cwd(),
  argument("--directory", "dist/search"),
);

const contentTypeFor = (filename) => {
  if (filename.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filename.endsWith(".wasm")) return "application/wasm";
  if (filename.endsWith(".json")) return "application/json; charset=utf-8";
  return "application/octet-stream";
};

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url || "/", "http://127.0.0.1").pathname,
    );
    const filename = path.resolve(directory, pathname.replace(/^\/+/, ""));
    if (!filename.startsWith(directory + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    const bytes = await readFile(filename);
    response.writeHead(200, { "content-type": contentTypeFor(filename) });
    response.end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});
server.keepAliveTimeout = 120_000;
server.headersTimeout = 125_000;
server.requestTimeout = 0;

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

const address = server.address();
if (!address || typeof address === "string") {
  server.close();
  throw new Error("Could not start the local search verifier");
}

const documentMap = JSON.parse(
  await readFile(path.join(directory, "document-map.json"), "utf8"),
);
const pagefindModule = await import(
  pathToFileURL(path.join(directory, "pagefind", "pagefind.js")).href +
    `?verify=${Date.now()}`
);
const api = pagefindModule.createInstance({
  basePath: `http://127.0.0.1:${address.port}/pagefind/`,
  exactDiacritics: true,
  noWorker: true,
});

const searchLiteral = (query) =>
  literalPagefindSearch(api, query, documentMap);

const verifyQuery = async (query, expected) => {
  const grouped = await searchLiteral(query);
  if (
    grouped.books !== expected.books ||
    grouped.papers !== expected.papers
  ) {
    throw new Error(
      `${query}: expected ${expected.books} books/${expected.papers} papers, ` +
        `got ${grouped.books}/${grouped.papers}`,
    );
  }

  let pages = 0;
  for (let index = 0; index < grouped.results.length; index += 4) {
    const batch = await Promise.all(
      grouped.results.slice(index, index + 4).map(async (reference) => {
        const preview = await reference.data();
        const result = preview.__partialSearch
          ? await preview.__loadFull()
          : preview;
        const pageMap = JSON.parse(
          await readFile(
            path.join(directory, "maps", result.meta.slug + ".json"),
            "utf8",
          ),
        );
        if (
          result.sub_results.some(
            (subResult) =>
              !String(subResult.plain_excerpt || "")
                .normalize("NFC")
                .replace(/\s+/gu, "")
                .includes(query.normalize("NFC").replace(/\s+/gu, "")),
          )
        ) {
          throw new Error(`${query}: non-literal fragment survived filtering`);
        }
        const comparableQuery = query.normalize("NFC").replace(/\s+/gu, "");
        if (
          result.sub_results.some((subResult) => {
            const marks = [
              ...String(subResult.excerpt || "").matchAll(
                /<mark>([\s\S]*?)<\/mark>/gu,
              ),
            ];
            return !marks.some(
              (match) =>
                match[1].normalize("NFC").replace(/\s+/gu, "") ===
                comparableQuery,
            );
          })
        ) {
          throw new Error(`${query}: literal query is not highlighted as a unit`);
        }
        return snippetsFor(result, pageMap).length;
      }),
    );
    pages += batch.reduce((sum, count) => sum + count, 0);
  }
  return pages;
};

const verifyCounts = async (query, expected) => {
  const grouped = await searchLiteral(query);
  if (
    grouped.books !== expected.books ||
    grouped.papers !== expected.papers
  ) {
    throw new Error(
      `${query}: expected ${expected.books} books/${expected.papers} papers, ` +
        `got ${grouped.books}/${grouped.papers}`,
    );
  }
};


const verifyPublicationQuery = async (query, slug, expectedPages) => {
  const grouped = await searchLiteral(query);
  let found = false;
  let pages = 0;
  for (let index = 0; index < grouped.results.length; index += 4) {
    const batch = await Promise.all(
      grouped.results.slice(index, index + 4).map(async (reference) => {
        const preview = await reference.data();
        const result = preview.__partialSearch
          ? await preview.__loadFull()
          : preview;
        if (result.meta.slug !== slug) return 0;
        found = true;
        const comparableQuery = query.normalize("NFC").replace(/\s+/gu, "");
        if (
          result.sub_results.some(
            (subResult) =>
              !String(subResult.plain_excerpt || "")
                .normalize("NFC")
                .replace(/\s+/gu, "")
                .includes(comparableQuery),
          )
        ) {
          throw new Error(`${query}: non-literal target fragment survived filtering`);
        }
        const pageMap = JSON.parse(
          await readFile(
            path.join(directory, "maps", result.meta.slug + ".json"),
            "utf8",
          ),
        );
        return snippetsFor(result, pageMap).length;
      }),
    );
    pages += batch.reduce((sum, count) => sum + count, 0);
  }
  if (!found || pages !== expectedPages) {
    throw new Error(
      `${query}: ${slug} expected ${expectedPages} pages, got ${pages}`,
    );
  }
  return pages;
};

try {
  const grijalva = await verifyQuery("グリハルバ", {
    books: 41,
    papers: 7,
  });
  const grijalvaRiver = await verifyQuery("グリハルバ川", {
    books: 22,
    papers: 5,
  });
  const piedras = await verifyQuery("ピエドラス", {
    books: 20,
    papers: 9,
  });
  const piedrasNegras = await verifyQuery("ピエドラス・ネグラス", {
    books: 12,
    papers: 8,
  });
  await verifyCounts("ラカンドン", { books: 50, papers: 15 });
  await verifyCounts("ポ", { books: 48, papers: 11 });
  const duranFlaying = await verifyPublicationQuery(
    "人の皮剥ぎ",
    "duran-historia-indias-nueva-espana-1581",
    6,
  );
  const pageChecks = [
    ["グリハルバ", grijalva, 253],
    ["グリハルバ川", grijalvaRiver, 72],
    ["ピエドラス", piedras, 145],
    ["ピエドラス・ネグラス", piedrasNegras, 119],
  ];
  const pageMismatches = pageChecks.filter(([, actual, expected]) =>
    actual !== expected
  );
  if (pageMismatches.length) {
    throw new Error(
      "Literal PDF-page count regression: " +
        pageMismatches
          .map(
            ([query, actual, expected]) =>
              `${query} expected ${expected}, got ${actual}`,
          )
          .join("; "),
    );
  }
  process.stdout.write(
    `Literal search OK: グリハルバ ${grijalva} pages, ` +
      `グリハルバ川 ${grijalvaRiver} pages, ` +
      `ピエドラス ${piedras} pages, ` +
      `ピエドラス・ネグラス ${piedrasNegras} pages, ` +
      `ラカンドン and ポ counts, 人の皮剥ぎ ${duranFlaying} pages.\n`,
  );
} finally {
  await api.destroy();
  await new Promise((resolve) => server.close(resolve));
}
