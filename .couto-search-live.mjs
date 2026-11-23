import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { bibliographicAliases } from "./src/catalogue-publications.mjs";
import { literalPagefindSearch, snippetsFor } from "./src/fulltext-search-core.mjs";
import { createPrefixSearch } from "./src/fulltext-prefix-search.mjs";
const deadline=setTimeout(()=>{console.error("Search query deadline");process.exit(1)},120000);
const cfg=JSON.parse(await readFile("search-shards.json","utf8"));
const base=cfg.shards.find(t=>t.id==="003").baseUrl;
const get=async p=>{const r=await fetch(new URL(p,base),{signal:AbortSignal.timeout(22000)});assert(r.ok,p);return r;};
const file=join(process.env.RUNNER_TEMP,"couto-pagefind.mjs");
await writeFile(file,await(await get("pagefind/pagefind.js")).text());
const {createInstance}=await import(pathToFileURL(file));
const engine=createInstance({basePath:new URL("pagefind/",base).href,noWorker:true,exactDiacritics:true});
engine.expandLiteralQueries=createPrefixSearch([new URL("pagefind/",base).href],url=>fetch(url,{signal:AbortSignal.timeout(22000)}));
await engine.init();
const documents=await(await get("document-map.json")).json();
const slug="couto-dialogo-pintura-mexico-1889";
const assets=JSON.parse(await readFile("assets-manifest.json","utf8")).assets;
const map=await (await get("maps/"+slug+".json")).json();
const pdf=assets.find(x=>x.path==="publications/"+slug+"/Couto_Dialogo_Pintura_Mexico_1889_Japanese.pdf");
assert(pdf, "Couto PDF missing from the asset manifest");
const request=JSON.parse(await readFile(".couto-verify.json","utf8"));
assert.equal(pdf.sha256,request.pdfSha256,"probes are pinned to the exact proofed PDF");
const canonical="/publications/"+slug+"/";
assert.equal(map.pdfSha256,pdf.sha256);
assert.equal(map.canonicalUrl,canonical);
assert(!Object.hasOwn(bibliographicAliases,slug));
assert(!Object.values(bibliographicAliases).includes(slug));
const probes=JSON.parse(await readFile(".couto-search-probes.json","utf8"));
assert(probes.length>=4,"the four independently confirmed printed page destinations are required");
assert.equal(new Set(probes.map(p=>p.original)).size,probes.length);
for(const {page,original,queries} of probes){
  let success=false;
  for(const term of queries){
    const got=await literalPagefindSearch(engine,term,documents);
    const hit=got.results.find(x=>x.id===slug);
    if(!hit) { console.log("NO COUTO HIT",term,"results",got.results.length); continue; }
    const data=await (hit.fullData ? hit.fullData() : hit.data());
    const targets=snippetsFor(data,map);
    if(targets.some(x=>x.pdfPage===page&&x.originalPage.split("／").includes(original))){
      console.log("VERIFIED",slug,term,original,"PDF",page,"bibliography",canonical);
      success=true; break;
    }
    console.log("COUTO CANDIDATE PAGES",term,JSON.stringify(targets.map(x=>[x.pdfPage,x.originalPage])));
  }
  assert(success,slug+" literal probes did not match "+original+"/PDF "+page);
}
clearTimeout(deadline);
