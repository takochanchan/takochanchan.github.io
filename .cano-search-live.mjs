import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { bibliographicAliases } from "./src/catalogue-publications.mjs";
import { exactSubResultsFor, snippetsFor } from "./src/fulltext-search-core.mjs";
const deadline=setTimeout(()=>{console.error("Search query deadline");process.exit(1)},120000);
const cfg=JSON.parse(await readFile("search-shards.json","utf8"));
const base=cfg.shards.find(t=>t.id==="003").baseUrl;
const get=async p=>{const r=await fetch(new URL(p,base),{signal:AbortSignal.timeout(22000)});assert(r.ok,p);return r;};
const file=join(process.env.RUNNER_TEMP,"cano-pagefind.mjs");
await writeFile(file,await(await get("pagefind/pagefind.js")).text());
const {createInstance}=await import(pathToFileURL(file));
const engine=createInstance({basePath:new URL("pagefind/",base).href,noWorker:true,exactDiacritics:true});
const documents=await(await get("document-map.json")).json();
const slug="cano-manche-y-peten-1696";
const assets=JSON.parse(await readFile("assets-manifest.json","utf8")).assets;
const map=await (await get("maps/"+slug+".json")).json();
const pdf=assets.find(x=>x.path==="publications/"+slug+"/Cano_Manche_y_Peten.pdf");
assert(pdf, "Cano PDF missing from the asset manifest");
const request=JSON.parse(await readFile(".cano-verify.json","utf8"));
assert.equal(pdf.sha256,request.pdfSha256,"probes are pinned to the exact proofed PDF");
const canonical="/publications/"+slug+"/";
assert.equal(map.pdfSha256,pdf.sha256);
assert.equal(map.canonicalUrl,canonical);
assert(!Object.hasOwn(bibliographicAliases,slug));
assert(!Object.values(bibliographicAliases).includes(slug));
const probes=JSON.parse(await readFile(".cano-search-probes.json","utf8"));
assert(probes.length>=4,"the four independently confirmed manuscript destinations are required");
assert.equal(new Set(probes.map(p=>p.original)).size,probes.length);
for(const {page,original,queries} of probes){
  let success=false;
  for(const term of queries){
    for(const query of ['"'+term+'"',term]){
      const got=await engine.search(query);
      for(const hit of got.results.filter(w=>documents.fragments[w.id]?.[0]===slug)){
        const data=await hit.data();
        const targets=snippetsFor({...data,sub_results:exactSubResultsFor(data.sub_results,term)},map);
        if(targets.some(x=>x.pdfPage===page&&x.originalPage.split("／").includes(original))){
          console.log("VERIFIED",slug,term,original,"PDF",page,"bibliography",canonical);
          success=true; break;
        }
      }
      if(success) break;
    }
    if(success) break;
  }
  assert(success,slug+" literal probes did not match "+original+"/PDF "+page);
}
clearTimeout(deadline);
