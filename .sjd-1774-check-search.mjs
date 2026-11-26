import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const q=JSON.parse(await readFile(".sjd-1774-search-expected.json","utf8"));
const {bibliographicAliases}=await import("./src/catalogue-publications.mjs");
assert.equal("/publications/"+bibliographicAliases[q.slug]+"/",q.catalogueUrl);
const base="https://takochanchan.github.io/takochan-search-index-003/";
const nap=ms=>new Promise(r=>setTimeout(r,ms));
for(let tryNo=1;tryNo<=35;tryNo++){
 try{
  const resp=await fetch(base+"maps/"+q.slug+".json?v="+q.pdfSha256.slice(0,12),{cache:"no-store",signal:AbortSignal.timeout(12000)});
  assert.equal(resp.status,200);
  const d=await resp.json();
  assert.equal(d.slug,q.slug);assert.equal(d.title,q.title);
  assert.equal(d.canonicalUrl,q.canonicalUrl);assert.equal(d.pdfSha256,q.pdfSha256);
  const b=Object.values(d.blocks);
  assert(b.length>=281&&b.every(z=>Number.isInteger(z[1])&&z[1]>=1&&z[1]<=265));
  assert(b.some(z=>z[0]==="原刊 p. 1"||z[0]?.includes("原刊 p. 1")));
  console.log(JSON.stringify({checkedPages:b.length,pageMapped:true,title:d.title,canonicalUrl:d.canonicalUrl,pdfSha256:d.pdfSha256}));
  break;
 }catch(e){
  if(tryNo===35)throw e;
  console.log("Waiting for published shard page map:",e.message.slice(0,240));
  await nap(10000);
 }
}
