import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
const repo=resolve(process.argv[2]||".");
const read=async p=>JSON.parse(await readFile(p,"utf8"));
const f=await read(new URL("./laf-live-fixture.json",import.meta.url));
const {bibliographicAliases}=await import(pathToFileURL(join(repo,"src/catalogue-publications.mjs")));
const {exactSubResultsFor,literalPagefindSearch,snippetsFor}=await import(pathToFileURL(join(repo,"src/fulltext-search-core.mjs")));
const {createPrefixSearch}=await import(pathToFileURL(join(repo,"src/fulltext-prefix-search.mjs")));
const cfg=await read(join(repo,"search-shards.json"));
const shard=cfg.shards.find(s=>s.id===f.searchShard);
assert.equal(shard.repository,"takochanchan/takochan-search-index-003");
const base=new URL(shard.baseUrl);
const deadline=setTimeout(()=>{console.error("Search deadline",f.slug);process.exit(1)},115000);
const get=async p=>{const r=await fetch(new URL(p,base),{signal:AbortSignal.timeout(20000),cache:"no-store"});assert(r.ok,p+" HTTP "+r.status);return r;};
const temp=await mkdtemp(join(process.env.RUNNER_TEMP||tmpdir(),"laf-pagefind-"));
try {
  const moduleFile=join(temp,"pagefind.mjs");
  const [js,docs,map]=await Promise.all([
    get("pagefind/pagefind.js").then(x=>x.text()),
    get("document-map.json").then(x=>x.json()),
    get("maps/"+f.slug+".json").then(x=>x.json())]);
  await writeFile(moduleFile,js);
  const {createInstance}=await import(pathToFileURL(moduleFile));
  const engine=createInstance({basePath:new URL("pagefind/",base).href,noWorker:true,exactDiacritics:true});
  engine.expandLiteralQueries=createPrefixSearch([new URL("pagefind/",base).href]);
  await engine.init();
  const pdf=f.assets.find(x=>x.path.endsWith(".pdf"));
  const assets=(await read(join(repo,"assets-manifest.json"))).assets;
  assert.deepEqual(assets.filter(x=>x.path===pdf.path),[pdf]);
  assert.equal(map.pdfSha256,pdf.sha256);
  assert.equal(map.canonicalUrl,"/publications/"+f.slug+"/");
  assert(!bibliographicAliases[f.slug]||bibliographicAliases[f.slug]===f.slug,"unexpected group");
  const label=v=>v.normalize("NFKC").replace(/[〔〕\s]/gu,"");
  for(const {term,pdfPage,originalPage} of f.probes){
    const got=await literalPagefindSearch(engine,term,docs);
    const hit=got.results.find(v=>v.id===f.slug);
    const data=hit&&await hit.data();
    const exact=exactSubResultsFor(data?.sub_results,term);
    const targets=snippetsFor({...data,sub_results:exact},map);
    const verified=targets.some(x=>x.pdfPage===pdfPage&&String(x.originalPage??"").split("／").some(y=>label(y)===label(originalPage)));
    if(!verified){
      console.error(JSON.stringify({term,results:got.results.length,foundWork:Boolean(hit),exactSubResults:exact.length,expected:{pdfPage,originalPage},mapped:targets.map(({pdfPage,originalPage,blockId})=>({pdfPage,originalPage,blockId}))}));
    }
    assert(verified,`Laf exact phrase /${originalPage}/ PDF ${pdfPage} not verified: ${term}`);
    console.log(JSON.stringify({status:"VERIFIED",slug:f.slug,pdfPage,originalPage,term,pdf_sha256:pdf.sha256}));
  }
} finally {
  clearTimeout(deadline);
  await rm(temp,{recursive:true,force:true});
}
