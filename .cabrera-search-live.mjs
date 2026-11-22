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
const file=join(process.env.RUNNER_TEMP,"cabrera-pagefind.mjs");
await writeFile(file,await(await get("pagefind/pagefind.js")).text());
const {createInstance}=await import(pathToFileURL(file));
const engine=createInstance({basePath:new URL("pagefind/",base).href,noWorker:true,exactDiacritics:true});
const documents=await(await get("document-map.json")).json();
const group="cabrera-escudo-de-armas-de-mexico-1746";
const assets=JSON.parse(await readFile("assets-manifest.json","utf8")).assets;
for(const {v,page,original,queries} of JSON.parse(await readFile(".cabrera-search-probes.json","utf8"))){
  const slug=group+"-v"+v;
  const map=await (await get("maps/"+slug+".json")).json();
  const pdf=assets.find(x=>x.path.startsWith("publications/"+slug+"/")&&x.path.endsWith(".pdf"));
  assert.equal(map.pdfSha256,pdf.sha256);
  assert.equal(map.canonicalUrl,"/publications/"+slug+"/");
  assert.equal(bibliographicAliases[slug],group);
  let success=false;
  for(const term of queries){
    for(const query of ['"'+term+'"',term]){
      const got=await engine.search(query);
      for(const hit of got.results.filter(w=>documents.fragments[w.id]?.[0]===slug)){
        const data=await hit.data();
        const targets=snippetsFor({...data,sub_results:exactSubResultsFor(data.sub_results,term)},map);
        if(targets.some(x=>x.pdfPage===page&&x.originalPage.split("／").includes(original))){
          console.log("VERIFIED",slug,term,original,"PDF",page,"bibliography",bibliographicAliases[slug]);
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
