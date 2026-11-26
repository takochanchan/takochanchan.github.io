import hashlib, html, json, re, os, subprocess, sys, time, urllib.parse, urllib.request, zipfile
from pathlib import Path
from tempfile import TemporaryDirectory
from html.parser import HTMLParser
assert os.environ.get('GITHUB_ACTIONS')=='true'
plan=json.loads(Path('.sjd-1612-live-manifest.json').read_text())
site='https://takochanchan.github.io'
repo='takochanchan/takochanchan.github.io'
assert os.environ['GITHUB_REPOSITORY']==repo
def get(url,timeout=50):
 assert url.startswith(('https://takochanchan.github.io/','https://github.com/takochanchan/'))
 req=urllib.request.Request(url,headers={'User-Agent':'takochan-publication-verification','Cache-Control':'no-cache'})
 with urllib.request.urlopen(req,timeout=timeout) as r:
  assert r.status==200
  return r.read()
def verify():
 g=plan['group'];pub=site+'/publications/'+g['slug']+'/'
 body=get(pub+'?verify=sjd-1612-20261127').decode()
 clean=html.unescape(body)
 assert '<h1>'+g['title']+'</h1>' in clean and '全体の詳細概要' in clean
 assert '<p class="publication-hero__subtitle"></p>' in clean
 assert '<link rel="canonical" href="'+pub+'">' in clean
 assert '1774年メキシコ版' in clean and 'https://repositorio.unam.mx/contenidos/163' in clean
 assert 'CC BY-NC-ND 4.0' in clean and 'CC BY-NC-ND 3.0' in clean
 assert '1585年グラナダ版' in clean and 'https://hdl.handle.net/10481/16392' in clean
 assert '1612年マドリード版' in clean and 'https://patrimoniodigital.ucm.es/s/patrimonio/item/682362' in clean
 assert 'CC BY 4.0' in clean and 'Googleの電子化表記' in clean and '透かしを保持' in clean
 norm=lambda s:re.sub(r'\s+','',s)
 flat=norm(re.sub(r'<[^>]*>','',clean))
 ov=[plan['meta'][s]['overview'] for s in plan['slugs']]+[g['overview']]
 for item in ov:
  s=norm(item)
  assert s in flat, s[:80]
 shared='https://github.com/'+repo+'/releases/download/publications-002/'
 cs=get(shared+'SHA256SUMS.txt').decode()
 dm=get(site+'/takochan-search-index-003/document-map.json?verify=sjd-1612-20261127').decode()
 out=[]
 for sl,rec in zip(plan['slugs'],plan['records']):
  assert sl in dm,(sl,'index')
  alias=get(site+'/publications/'+sl+'/?verify=sjd-1612').decode()
  assert '/publications/'+g['slug']+'/' in alias
  m=json.loads(get(site+'/takochan-search-index-003/maps/'+sl+'.json?verify=sjd-1612'))
  assert m['canonicalUrl']=='/publications/'+sl+'/' and m['pdfSha256']==plan['assets'][sl]['pdf']['sha256']
  assert str(rec['pageCount']) in flat
  for key,a in plan['assets'][sl].items():
   u=a['url']; assert u in clean or urllib.parse.urlsplit(u).path in clean or a['filename'] in clean,(sl,key,'link')
   raw=get(u)
   assert len(raw)==a['size'] and hashlib.sha256(raw).hexdigest()==a['sha256'],(sl,key,'hash')
   if key in ('pdf','epub'):
    assert re.search(r'^'+a['sha256']+r'\s+\*?'+re.escape(a['filename'])+'$',cs,re.M)
   if key=='pdf':
    with TemporaryDirectory() as f:
     q=Path(f)/'output.pdf';q.write_bytes(raw)
     a1=subprocess.check_output(['pdfinfo',str(q)],text=True)
     assert re.search(r'^Pages:\s+'+str(rec['pageCount'])+r'$',a1,re.M)
     if 'madrid-1612' not in sl:assert re.search(r'^Title:\s+'+re.escape(rec['title'])+r'$',a1,re.M)
     cover=subprocess.check_output(['pdftotext','-f','1','-l','1',str(q),'-'],text=True)
     assert rec['title'] in cover
     if 'granada-1585' in sl:
      content=subprocess.check_output(['pdftotext',str(q),'-'],text=True)
      assert '原刊は以下「&c.」と略記' not in re.sub(r'\s+','',content)
     else:
      assert '会則' not in cover
   if key=='epub':
    from io import BytesIO
    with zipfile.ZipFile(BytesIO(raw)) as z:assert z.read('mimetype')==b'application/epub+zip' and z.testzip() is None
   out.append(dict(slug=sl,file=key,sha256=a['sha256'],bytes=a['size']))
 return dict(publication=pub,match=True,overview_count=4,fulltext_index='003',readback=out)
for i in range(65):
 try: result=verify();break
 except (OSError,AssertionError) as e:
  print(f'waiting for publication {i+1}: {str(e)[:400]}',flush=True)
  if i==64:raise
  time.sleep(24)
Path('sjd-1612-live-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps(result,ensure_ascii=False),flush=True)

