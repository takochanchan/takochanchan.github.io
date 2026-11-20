"""Self-contained hosted readback except adjacent verify_html.py and live_expectations.json."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib,subprocess,json,re,gzip,sys
"""Check the actual built (or served) bibliography, not simulated UI data. Standard library only."""
import hashlib,html,re,sys
from pathlib import Path
ROOT='bustamante-el-nuevo-bernal-diaz-del-castillo'
GROUP=ROOT+'-1847'
MEMBERS=[ROOT+f'-tomo-{i}-1847' for i in (1,2)]
EXPECTED_HASHES=['d223482886d32abb36f835da0b5a148a953cec82159256836017dbf74f3f48a8','cd863142e81847eda4ed3ddfcfb3d6f34bcfee1c220993627b509da73f0e124c']
def digest(t):return hashlib.sha256(t.encode()).hexdigest()
def check(page):
 title="新たなベルナル・ディアス・デル・カスティリョ"
 assert f"<h1>{title}</h1>" in page and "新ベルナル・ディアス・デル・カスティリョ" not in page
 for n in (1,2): assert f"<h3>{title} 第{n}巻</h3>" in page
 panes=re.findall(r'<details\b([^>]*\bid="overview-[^"]+"[^>]*)>([\s\S]*?)</details>',page)
 assert len(panes)==2 and 'publication-overview--group' not in page, 'Exactly two per-volume disclosures and no overall disclosure'
 assert '全体の詳細概要' not in page and f'id="overview-{GROUP}"' not in page
 hero=page[page.index('<section class="publication-hero">'):page.index('class="epub-note"')]
 assert '史料集' not in re.sub(r'<[^>]+>','',hero)
 for i,(attributes,body) in enumerate(panes,1):
  slug=MEMBERS[i-1]
  assert f'id="overview-{slug}"' in attributes and f'>第{i}巻の詳細概要</span>' in body and f'>第{i}巻の詳細概要を閉じる</span>' in body
  paras=[html.unescape(re.sub(r'<[^>]*>','',s)) for s in re.findall(r'<p>(.*?)</p>',body,re.S)]
  assert len(paras)==3 and digest('\n\n'.join(paras))==EXPECTED_HASHES[i-1],(i,'Volume summary content mismatch')
  for e in ['pdf','epub']:
   u=f'https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/{slug}.{e}'
   assert 'href="'+u+'"' in page,(slug,e)
 assert '1847' in hero and '歴史書' in hero
 return {'panelCount':len(panes),'groupPanel':False,'volumeOverviewHashes':EXPECTED_HASHES,'fileLinks':4}

D=Path(__file__).resolve().parent
S='https://takochanchan.github.io/'
IDX=S+'takochan-search-index-003/'
sha=lambda b:hashlib.sha256(b).hexdigest()
def fetch(url):
 return subprocess.check_output(['curl','-fsSL','--retry','3','--retry-all-errors','--max-time','90',url])
def getjson(url):return json.loads(fetch(url))
def main():
 x=json.loads('{"archive": "63f848e26b5361faaae7d73ce1614d4488cfefc9", "manifestHashes": {"assetManifestSha256": "9c6de8939e8842dfe10ac9af3f02ece02f729bb0d85b87156b55975609fd77a8", "bibliographicManifestSha256": "3fd2459d6862eebab3e3c052d7f872d5f07ddc7911875551af9cf98f5eb91cbc"}, "group": "bustamante-el-nuevo-bernal-diaz-del-castillo-1847", "title": "新たなベルナル・ディアス・デル・カスティリョ", "volumes": [{"slug": "bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847", "title": "新たなベルナル・ディアス・デル・カスティリョ 第1巻", "originalTitle": "El nuevo Bernal Díaz del Castillo, ó sea Historia de la invasión de los anglo-americanos en México, tomo I", "pages": 184, "author": "カルロス・マリア・デ・ブスタマンテ", "assets": {"pdf": {"path": "publications/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847.pdf", "url": "https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847.pdf", "size": 1871410, "sha256": "07c6278ce6928c594bba5a45acd453d530f82d1e53a00a9cf9c7466a55d9aa3e"}, "epub": {"path": "publications/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847.epub", "url": "https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847.epub", "size": 311316, "sha256": "1534e5108832563f4e0db66d0df8f67f350e4b1d6e7c238cb65ba4f4c7393966"}, "cover": {"path": "publications/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847/cover.jpg", "url": "https://takochanchan.github.io/publications/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847/cover.jpg", "size": 51510, "sha256": "0bfb86fa07979a690b6c808c40320c99874745bf2d4ba9259e30152e8e8dc297"}}, "master": "46b82180e017a1103e7b6dde96f58b1746f06d5c4c90014d5f1d81bcd19a1a2c", "search": {"epub": {"chunks": 1410, "pages": 184, "alignment": {"exact": 1275, "fingerprint": 104, "fuzzy": 2, "sourcePage": 27, "inherited": 2, "unmapped": 0, "verifiedRate": 1.0, "pdfTextMode": "embedded"}, "checks": {"4": true, "90": true, "162": true}, "mapSha256": "c12af934dca72b37b8433b61462cf0c3bd4e4c8fcf1b2d6c0867605d0b544d4b", "expectedPages": {"4": [7], "90": [100], "162": [179, 180, 181, 182, 183, 184]}}, "docx": {"chunks": 1374, "pages": 184, "alignment": {"exact": 1245, "fingerprint": 101, "fuzzy": 0, "sourcePage": 28, "inherited": 0, "unmapped": 0, "verifiedRate": 1.0, "pdfTextMode": "embedded"}, "checks": {"4": true, "90": true, "162": true}, "mapSha256": "163cb82d8d604195563433b62b84533e715d044e3c4a74cee31d8ff1e6b846eb", "expectedPages": {"4": [7], "90": [100], "162": [172, 179, 180, 181, 182, 183, 184]}}}}, {"slug": "bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847", "title": "新たなベルナル・ディアス・デル・カスティリョ 第2巻", "originalTitle": "El nuevo Bernal Díaz del Castillo, ó sea Historia de la invasión de los anglo-americanos en México, tomo II", "pages": 257, "author": "カルロス・マリア・デ・ブスタマンテ", "assets": {"pdf": {"path": "publications/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847.pdf", "url": "https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847.pdf", "size": 2468840, "sha256": "d70a10894252b62c6cfd3a8843d9ffcbeb17c955a8041daa0b3e7811e13b6c9b"}, "epub": {"path": "publications/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847.epub", "url": "https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847.epub", "size": 370996, "sha256": "b3f112d3c6b85f353013b7026ba491fcd49a0390416c86ae7526b6935abef1f2"}, "cover": {"path": "publications/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847/cover.jpg", "url": "https://takochanchan.github.io/publications/bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847/cover.jpg", "size": 51903, "sha256": "8bfd59c40b4721473be0249e7bb92b5f8057208fb32a7ac25a0ee8fe05531c83"}}, "master": "64a5267c0fff9d9fe0c00dd334eadcc475755b29cc616203be6cc9a66176c338", "search": {"epub": {"chunks": 2110, "pages": 257, "alignment": {"exact": 1894, "fingerprint": 119, "fuzzy": 1, "sourcePage": 93, "inherited": 3, "unmapped": 0, "verifiedRate": 1.0, "pdfTextMode": "embedded"}, "checks": {"4": true, "86": true, "162": true, "163": true, "234": true, "235": true}, "mapSha256": "8bcb6accaa8e39c463b0fff41ff0c6ab8c4686ccd4465c120cd8d0bb211e1207", "expectedPages": {"4": [5], "86": [92], "162": [171], "163": [172], "234": [247], "235": [248, 249, 250, 251, 252, 253, 254, 255, 256, 257]}}, "docx": {"chunks": 2086, "pages": 257, "alignment": {"exact": 1874, "fingerprint": 118, "fuzzy": 0, "sourcePage": 94, "inherited": 0, "unmapped": 0, "verifiedRate": 1.0, "pdfTextMode": "embedded"}, "checks": {"4": true, "86": true, "162": true, "163": true, "234": true, "235": true}, "mapSha256": "e9e0ece96cf9aa1c9158a42f3d9205b08ebe86a559d37c9bb04dde49b2271778", "expectedPages": {"4": [5], "86": [92], "162": [171], "163": [172], "234": [247], "235": [19, 32, 100, 134, 202, 216, 225, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257]}}}}]}')
 all_live='maps-only' not in sys.argv
 result=dict(maps={},group=None,downloads={},checksumLines=0,fragmentTitles={})
 meta=getjson(IDX+'search-meta.json')
 assert meta['archiveCommit']==x['archive'],('archive pin',meta['archiveCommit'])
 for k,h in x['manifestHashes'].items():assert meta[k]==h,(k,meta[k],h)
 document_map=getjson(IDX+'document-map.json')['fragments']
 if all_live:
  home=fetch(S).decode()
  script=re.search(r'<script>window\.ARCHIVE_PUBLICATIONS=(.*?);</script>',home,re.S)
  assert script,'Home catalogue data unavailable'
  [group]=[r for r in json.loads(script[1]) if r['slug']==x['group']]
  assert group['title']==x['title'] and [(v['slug'],v['title']) for v in group['volumes']]==[(v['slug'],v['title']) for v in x['volumes']]
  assert f'<h3><a href="/publications/{x["group"]}/">{x["title"]}</a></h3>' in home
  assert '新ベルナル・ディアス・デル・カスティリョ' not in home
  result['homeCatalogue']={'groupTitle':group['title'],'volumeTitles':[v['title'] for v in group['volumes']]}
  info=check(fetch(S+'publications/'+x['group']+'/').decode());result['group']=info
  digest_url=x['volumes'][0]['assets']['pdf']['url'].rsplit('/',1)[0]+'/SHA256SUMS.txt'
  lines=fetch(digest_url).splitlines()
 for vol in x['volumes']:
  slug,title=vol['slug'],vol['title'];assets=vol['assets'];pdf,epub=assets['pdf'],assets['epub']
  assert title==x['title']+f" 第{x['volumes'].index(vol)+1}巻"
  if all_live:
   alias=fetch(S+'publications/'+slug+'/').decode()
   assert '/publications/'+x['group']+'/' in alias and title in alias
   for kind,a in assets.items():
    b=fetch(a['url']);assert len(b)==a['size'] and sha(b)==a['sha256'],(a['url'],len(b),sha(b))
    result['downloads'][a['path']]=sha(b)
    if kind!='cover':
     n=a['path'].rsplit('/',1)[-1].encode()
     rows=[m[1].decode() for ln in lines if (m:=re.fullmatch(rb'([0-9a-f]{64})[ \t]+\*?(.+)',ln)) and m[2]==n]
     assert rows==[a['sha256']],(n,rows);result['checksumLines']+=1
  m=getjson(IDX+'maps/'+slug+'.json');b=m['blocks']
  assert (m['slug'],m['title'],m['originalTitle'],m['author'],m['canonicalUrl'])==(slug,title,vol['originalTitle'],vol['author'],'/publications/'+slug+'/')
  assert m['pdfSha256']==pdf['sha256'] and m['sourceSha256'] in [epub['sha256'],vol['master']],(slug,m['pdfSha256'],m['sourceSha256'])
  ext='epub' if m['sourceSha256']==epub['sha256'] else 'docx';ref=vol['search'][ext]
  assert len(b)==ref['chunks'] and all(isinstance(v[1],int) and 1<=v[1]<=vol['pages'] for v in b.values()),slug
  exactmap=sha(json.dumps(b,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode())
  # Whole-map hash documented; independently verify each physical anchor and every stable block index.
  assert sorted(v[2] for v in b.values())==list(range(len(b)))
  result['maps'][slug]=dict(title=title,blocks=len(b),pages=vol['pages'],pdfSha256=m['pdfSha256'],sourceSha256=m['sourceSha256'],mapSha256=exactmap,identicalToLocal=exactmap==ref['mapSha256'],anchors={})
  for k,nums in ref['expectedPages'].items():
   got=sorted({v[1] for v in b.values() if f'原刊 p. {k}' in v[0].split('／')})
   assert nums==got,(slug,k,nums,got);result['maps'][slug]['anchors'][k]=got
  parts=sorted((int(v[2]),file) for file,v in document_map.items() if v[0]==slug)
  assert parts and len({p for p,f in parts})==len(parts),slug
  def frag(kf):
   k,f=kf;assert re.fullmatch(r'[a-zA-Z0-9_-]+',f),f
   buf=gzip.decompress(fetch(IDX+'pagefind/fragment/'+f+'.pf_fragment'));prefix=b'pagefind_dcd';assert buf.startswith(prefix)
   z=json.loads(buf[len(prefix):])['meta']
   assert z['title']==title and z['slug']==slug and z['author']==vol['author'] and int(z['searchPart'])==k and z['url']==m['canonicalUrl']
   return f
  with ThreadPoolExecutor(max_workers=6) as pool:verified=list(pool.map(frag,parts))
  result['fragmentTitles'][slug]=dict(title=title,parts=len(verified))
 print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
