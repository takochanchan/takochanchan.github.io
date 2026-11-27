import html,hashlib,json,os,re,subprocess,sys,time,urllib.request,zipfile
from pathlib import Path
from io import BytesIO
from tempfile import TemporaryDirectory
assert os.environ.get('GITHUB_ACTIONS')=='true'
assert os.environ['GITHUB_REPOSITORY']=='takochanchan/takochanchan.github.io'
P=json.loads(Path('.castro1588-live-plan.json').read_text())
B='https://takochanchan.github.io/'
D='https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/'
SLUG='castro-juan-de-dios-1588'
A=P['assets'];rd=P['record'];url=B+'publications/'+SLUG+'/'
norm=lambda s:re.sub(r'[\s\u2060]','',s)
def get(url):
 assert url.startswith((B,D)),url
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'takochan-publication-verification','Cache-Control':'no-cache'}),timeout=50) as r:
  assert r.status==200,url
  return r.read()
def maps():
 p=B+'takochan-search-index-003/'
 dm=get(p+'document-map.json?check=castro1588').decode();assert SLUG in dm,SLUG
 m=json.loads(get(p+'maps/'+SLUG+'.json?check=castro1588'))
 assert m['canonicalUrl']=='/publications/'+SLUG+'/',m['canonicalUrl']
 assert m['pdfSha256']==A[0]['sha256'],m['pdfSha256']
 rows=list(m['blocks'].values());assert len(rows)>400,len(rows)
 pages={v[1] for v in rows if isinstance(v[1],int)}
 assert min(pages)<=3 and max(pages)==92,(min(pages),max(pages))
 return dict(blocks=len(rows),first=min(pages),last=max(pages),verified_sha=m['pdfSha256'])
def live():
 s=html.unescape(get(url+'?check=castro1588').decode())
 assert '<h1>'+rd['title']+'</h1>' in s and '<link rel="canonical" href="'+url+'">' in s,url
 flat=norm(re.sub(r'<[^>]+>','',s))
 for t in [rd['description'],rd['overview'],rd['author'],rd['rights'],'92頁','詳細概要']:
  assert norm(t) in flat,t[:60]
 assert rd['sourceUrl'] in s,rd['sourceUrl']
 group=html.unescape(get(B+'publications/san-juan-de-dios-constituciones/?check=castro1588').decode())
 labels=re.findall(r'<p class="volume-bibliography__label">([^<]+)</p>',group)
 assert labels==['1585年グラナダ版','1612年マドリード版','1617年ローマ版','1774年メキシコ版','1785年ローマ版']
 assert SLUG not in re.findall(r'data-(?:pdf-label|volume-slug)="([^"]+)"',group)
 cs=get(D+'SHA256SUMS.txt').decode();checks=[]
 for a in A:
  kind=a['path'].rsplit('.',1)[-1];u=a['url']
  if kind in ('pdf','epub'):assert u in s,u
  payload=get(u);assert len(payload)==a['size'] and hashlib.sha256(payload).hexdigest()==a['sha256'],u
  if kind in ('pdf','epub'):
   assert re.search(r'^'+a['sha256']+r'\s+\*?'+re.escape(Path(a['path']).name)+r'$',cs,re.M),u
  if kind=='pdf':
   with TemporaryDirectory() as d:
    f=Path(d)/'edition.pdf';f.write_bytes(payload)
    assert re.search(r'^Pages:\s+92$',subprocess.check_output(['pdfinfo',str(f)],text=True),re.M),u
  if kind=='epub':
   with zipfile.ZipFile(BytesIO(payload)) as z:assert z.testzip() is None and z.read('mimetype')==b'application/epub+zip',u
  checks.append(dict(kind=kind,sha256=a['sha256']))
 return dict(url=url,assets=checks)
for i in range(85):
 try:
  v={'map':maps()}
  if sys.argv[-1]=='live':v['live']=live()
  break
 except (OSError,ValueError,AssertionError) as ex:
  print(f'Waiting for verified deployment: attempt {i+1}: {ex}',flush=True)
  if i==84:raise
  time.sleep(15)
Path('castro1588-verification.json').write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(v,ensure_ascii=False))
