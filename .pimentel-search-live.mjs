import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { literalPagefindSearch, snippetsFor } from "./src/fulltext-search-core.mjs";
import { createPrefixSearch } from "./src/fulltext-prefix-search.mjs";
const cfg = JSON.parse(await readFile("search-shards.json", "utf8"));
const base = cfg.shards.find(s => s.id === "003").baseUrl;
const get = async path => {
  const res = await fetch(new URL(path, base));
  assert(res.ok, path + " returned " + res.status);
  return res;
};
const file = join(process.env.RUNNER_TEMP, "pimentel-pagefind.mjs");
await writeFile(file, await (await get("pagefind/pagefind.js")).text());
const { createInstance } = await import(pathToFileURL(file));
const engine = createInstance({ basePath: new URL("pagefind/", base).href, noWorker: true, exactDiacritics: true });
engine.expandLiteralQueries = createPrefixSearch([new URL("pagefind/", base).href]);
const docs = await (await get("document-map.json")).json();
const group = "pimentel-cuadro-lenguas-indigenas-1874-1875";
const assets = JSON.parse(await readFile("assets-manifest.json", "utf8")).assets;
const terms = JSON.parse(await readFile(".pimentel-search-probes.json", "utf8"));
for(const {v,q,page,original} of terms) {
  const slug = group + "-v" + v;
  const r = await literalPagefindSearch(engine,q,docs);
  const ref = r.results.find(work => work.id === slug);
  assert(ref, slug+" no result for "+q);
  const preview = await ref.data();
  const full = preview.__partialSearch ? await preview.__loadFull() : preview;
  const pg = await (await get("maps/"+slug+".json")).json();
  const pdf = assets.find(a => a.path.startsWith("publications/"+slug+"/") && a.path.endsWith(".pdf"));
  assert.equal(pg.pdfSha256,pdf.sha256);
  assert.equal(pg.canonicalUrl,"/publications/"+group+"/");
  const results = snippetsFor(full,pg);
  assert(results.some(x => x.pdfPage === page && x.originalPage.split("／").includes(original)),JSON.stringify({slug,q,page,original,observed:results.map(x=>[x.pdfPage,x.originalPage])}));
  console.log("VERIFIED",slug,q,"source",original,"PDF",page);
}

