import html,hashlib,json,os,re,subprocess,sys,time,urllib.request,zipfile
from pathlib import Path
from io import BytesIO
from tempfile import TemporaryDirectory
assert os.environ.get('GITHUB_ACTIONS')=='true'
assert os.environ['GITHUB_REPOSITORY']=='takochanchan/takochanchan.github.io'
P=json.loads(Path('.rome1785-live-plan.json').read_text())
B='https://takochanchan.github.io/'
D='https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/'
SLUG='san-juan-de-dios-constituciones-rome-1785'
GROUP='san-juan-de-dios-constituciones'
A=P['assets'];rd=P['record'];group=P['group']
norm=lambda s:re.sub(r'[\s\u2060]','',s)
def get(url):
 assert url.startswith((B,D)),url
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'takochan-publication-verification','Cache-Control':'no-cache'}),timeout=50) as r:
  assert r.status==200,url
  return r.read()
def maps():
 p=B+'takochan-search-index-003/'
 dm=get(p+'document-map.json?check=rome1785').decode();assert SLUG in dm,SLUG
 m=json.loads(get(p+'maps/'+SLUG+'.json?check=rome1785'))
 assert m['canonicalUrl']=='/publications/'+SLUG+'/',m['canonicalUrl']
 assert m['pdfSha256']==A[0]['sha256'],m['pdfSha256']
 rows=list(m['blocks'].values());assert len(rows)>1000,len(rows)
 pages={v[1] for v in rows if isinstance(v[1],int)}
 assert min(pages)<=3 and max(pages)==231,(min(pages),max(pages))
 return dict(blocks=len(rows),first=min(pages),last=max(pages),verified_sha=m['pdfSha256'])
def live():
 url=B+'publications/'+GROUP+'/'
 s=html.unescape(get(url+'?check=rome1785').decode())
 assert '<h1>'+rd['title']+'</h1>' in s and '<link rel="canonical" href="'+url+'">' in s,url
 flat=norm(re.sub(r'<[^>]+>','',s))
 for word in ('全体の詳細概要','755頁','1585年グラナダ版','1612年マドリード版','1617年ローマ版','1774年メキシコ版',rd['rights']):assert norm(word) in flat,word
 for term in [group['short'],group['detail'],rd['overview']]:assert norm(term) in flat,term[:100]
 labels=re.findall(r'<p class="volume-bibliography__label">([^<]+)</p>',s)
 assert labels==group['labels'],labels
 downloads=re.findall(r'data-pdf-label="([^"]+)"',s)
 assert downloads==group['labels'],downloads
 assert rd['sourceUrl'] in s,rd['sourceUrl']
 for slug in group['slugs']:
  page=get(B+'publications/'+slug+'/?check=rome1785').decode()
  assert '/publications/'+GROUP+'/' in page,slug
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
    assert re.search(r'^Pages:\s+231$',subprocess.check_output(['pdfinfo',str(f)],text=True),re.M),u
  if kind=='epub':
   with zipfile.ZipFile(BytesIO(payload)) as z:assert z.testzip() is None and z.read('mimetype')==b'application/epub+zip',u
  checks.append(dict(kind=kind,sha256=a['sha256']))
 return dict(url=url,assets=checks)
for i in range(73):
 try:
  v={'map':maps()}
  if sys.argv[-1]=='live':v['live']=live()
  break
 except (OSError,ValueError,AssertionError) as ex:
  print(f'Waiting for verified deployment: attempt {i+1}: {ex}',flush=True)
  if i==72:raise
  time.sleep(15)
Path('rome1785-verification.json').write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(v,ensure_ascii=False))
