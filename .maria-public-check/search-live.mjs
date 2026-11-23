import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const n = Number(process.argv[2]);
assert(Number.isInteger(n) && n >= 1 && n <= 12, "usage: node search-live.mjs PART [REPO] [FIXTURE]");
const repo = resolve(process.argv[3] || ".");
const read = async p => JSON.parse(await readFile(p, "utf8"));
const fixture = await read(process.argv[4] || new URL("./maria-live-fixture.json", import.meta.url));
const part = fixture.parts.find(p=>p.part===n);
assert(part?.probes.length && fixture.parts.length===12);
const { bibliographicAliases } = await import(pathToFileURL(join(repo,"src/catalogue-publications.mjs")));
const { exactSubResultsFor, snippetsFor } = await import(pathToFileURL(join(repo,"src/fulltext-search-core.mjs")));
const cfg = await read(join(repo,"search-shards.json"));
const shard = cfg.shards.find(s=>s.id===fixture.search_shard);
assert(shard?.baseUrl,"expected shard");
const base = new URL(shard.baseUrl);
const deadline=setTimeout(()=>{console.error("Search deadline",part.slug);process.exit(1)},115000);
const get=async p=>{const r=await fetch(new URL(p,base),{signal:AbortSignal.timeout(20000)});assert(r.ok,p+" HTTP "+r.status);return r;};
const temp=await mkdtemp(join(process.env.RUNNER_TEMP||tmpdir(),"maria-pagefind-"));
try {
  const moduleFile=join(temp,"pagefind.mjs");
  const [js,docs,map]=await Promise.all([
    get("pagefind/pagefind.js").then(x=>x.text()),
    get("document-map.json").then(x=>x.json()),
    get("maps/"+part.slug+".json").then(x=>x.json())
  ]);
  await writeFile(moduleFile,js);
  const {createInstance}=await import(pathToFileURL(moduleFile));
  const engine=createInstance({basePath:new URL("pagefind/",base).href,noWorker:true,exactDiacritics:true});
  const pdf=part.files.find(x=>x.role==="pdf");
  const assets=(await read(join(repo,"assets-manifest.json"))).assets;
  assert.equal(assets.find(x=>x.path==="publications/"+part.slug+"/"+pdf.name)?.sha256,pdf.sha256);
  assert.equal(map.pdfSha256,pdf.sha256);
  assert.equal(map.canonicalUrl,"/publications/"+part.slug+"/");
  assert.equal(bibliographicAliases[part.slug],fixture.group);
  // Map can omit typographic brackets/spacing; keep manuscript vs digital label and digits distinct.
  const label = v => v.normalize("NFKC").replace(/[〔〕\s]/gu,"");
  let verified;
  for(const {page,original,queries} of part.probes){
    for(const term of queries){
      for(const query of ['"'+term+'"',term]){
        const got=await engine.search(query);
        for(const hit of got.results.filter(w=>docs.fragments[w.id]?.[0]===part.slug)){
          const data=await hit.data();
          const targets=snippetsFor({...data,sub_results:exactSubResultsFor(data.sub_results,term)},map);
          if(targets.some(x=>x.pdfPage===page && String(x.originalPage??"").split("／").some(y=>label(y)===label(original)))){
            verified={term,page,original}; break;
          }
        }
        if(verified)break;
      }
      if(verified)break;
    }
    if(verified)break;
  }
  assert(verified,part.slug+" exact literal, physical page and manuscript locator not jointly verified");
  console.log(JSON.stringify({status:"VERIFIED",slug:part.slug,bibliography:fixture.group,pdf_sha256:pdf.sha256,...verified}));
} finally {
  clearTimeout(deadline);
  await rm(temp,{recursive:true,force:true});
}
