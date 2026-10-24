import assert from 'node:assert/strict';
import {writeFile,readFile,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {literalPagefindSearch,snippetsFor} from './src/fulltext-search-core.mjs';
import {createPrefixSearch} from './src/fulltext-prefix-search.mjs';
const req=JSON.parse(await readFile('.nazarenos-gagini-public-request.json','utf8'));
const root='https://takochanchan.github.io/';
const search=root+'takochan-search-index-002/';
async function get(url){const r=await fetch(url,{cache:'no-store'});assert.equal(r.status,200,url);return r;}
const dm=await (await get(search+'document-map.json')).json();
const metadata=await (await get(search+'search-meta.json')).json();
assert.equal(metadata.archiveCommit,req.verified_archive_commit);
const temp=path.join(process.env.RUNNER_TEMP,'nazarenos-gagini-live');await mkdir(temp,{recursive:true});
const modulePath=path.join(temp,'pagefind.mjs');await writeFile(modulePath,await (await get(search+'pagefind/pagefind.js')).text());
const module=await import(pathToFileURL(modulePath));
const api=module.createInstance({basePath:search+'pagefind/',exactDiacritics:true,noWorker:true});
api.expandLiteralQueries=createPrefixSearch([search+'pagefind/']);
const checks=[];
try{
 for(const book of req.publications){
  const html=await (await get(root+'publications/'+book.slug+'/')).text();
  assert(html.includes(book.pdf_filename));
  assert(html.includes('class="publication-overview"'));
  const mapping=await (await get(search+'maps/'+book.slug+'.json')).json();
  const expected=req.assets.find(a=>a.filename===book.pdf_filename);assert.equal(mapping.pdfSha256,expected.sha256);
  const query=book.slug.startsWith('milla-')?'日本紙':'没収';
  const grouped=await literalPagefindSearch(api,query,dm);
  let found=false,pages=[];
  for(const ref of grouped.results){const preview=await ref.data();const data=preview.__partialSearch?await preview.__loadFull():preview;if(data.meta.slug!==book.slug)continue;found=true;pages=snippetsFor(data,mapping);assert(pages.length>0);}
  assert(found,book.slug+' query '+query);
  checks.push({slug:book.slug,query,search_result:true,pages});
 }
 const sumText=await (await get('https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/SHA256SUMS.txt')).text();
 for(const a of req.assets){
  const response=await get('https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/'+a.filename);
  const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.length,a.size);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);assert(sumText.includes(a.sha256+'  '+a.filename));
 }
 await writeFile('nazarenos-gagini-live-verification.json',JSON.stringify({success:true,archiveCommit:req.verified_archive_commit,checks,assets:req.assets},null,2));
 console.log(JSON.stringify({success:true,checks:checks.map(c=>({slug:c.slug,query:c.query,pages:c.pages.length})),assetsVerified:req.assets.length}));
}finally{await api.destroy();}
