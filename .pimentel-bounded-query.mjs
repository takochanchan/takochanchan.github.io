import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { bibliographicAliases } from "./src/catalogue-publications.mjs";
import { exactSubResultsFor, snippetsFor } from "./src/fulltext-search-core.mjs";
const deadline = setTimeout(() => { console.error("Search query deadline reached"); process.exit(1); }, 110000);
const cfg = JSON.parse(await readFile("search-shards.json", "utf8"));
const base = cfg.shards.find(s => s.id === "003").baseUrl;
const get = async path => {
  const res = await fetch(new URL(path, base),{signal:AbortSignal.timeout(25000)});
  assert(res.ok, path + " returned " + res.status);
  return res;
};
const file = join(process.env.RUNNER_TEMP, "pimentel-pagefind.mjs");
await writeFile(file, await (await get("pagefind/pagefind.js")).text());
const { createInstance } = await import(pathToFileURL(file));
const engine = createInstance({ basePath: new URL("pagefind/", base).href, noWorker: true, exactDiacritics: true });
const docs = await (await get("document-map.json")).json();
const group = "pimentel-cuadro-lenguas-indigenas-1874-1875";
const terms = JSON.parse(await readFile(".pimentel-search-probes.json", "utf8"));
const assets = JSON.parse(await readFile("assets-manifest.json", "utf8")).assets;
const alternatives = ["山師", "掘った", "身振り"];
let verified=0;
for(const {v,q,page,original} of terms) {
  const slug = group + "-v" + v;
  const pg = await (await get("maps/"+slug+".json")).json();
  const pdf=assets.find(a => a.path.startsWith("publications/"+slug+"/") && a.path.endsWith(".pdf"));
  assert.equal(pg.pdfSha256,pdf.sha256);
  assert.equal(pg.canonicalUrl,"/publications/"+slug+"/");
  assert.equal(bibliographicAliases[slug],group);
  assert.equal("/publications/"+(bibliographicAliases[slug]||slug)+"/","/publications/"+group+"/");
  let results=[];
  for (const search of ['"'+q+'"', alternatives[v-1]]) {
    const response = await engine.search(search);
    const hits=response.results.filter(work=>docs.fragments[work.id]?.[0]===slug);
    for (const hit of hits) {
      const data=await hit.data();
      results.push(...snippetsFor({...data,sub_results:exactSubResultsFor(data.sub_results,q)},pg));
    }
    if(results.some(x=>x.pdfPage===page && x.originalPage.split("／").includes(original))) break;
  }
  if (!results.some(x=>x.pdfPage===page && x.originalPage.split("／").includes(original))) { console.log("UNMATCHED",q,results.map(x=>[x.pdfPage,x.originalPage])); continue; }
  verified++;
  console.log("VERIFIED",slug,q,"source",original,"PDF",page);
}
assert(verified>0,"No literal p.7 supplement match");
clearTimeout(deadline);
