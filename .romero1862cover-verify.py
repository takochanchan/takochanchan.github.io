import html,hashlib,json,os,re,subprocess,sys,time,urllib.request,zipfile
from pathlib import Path
from io import BytesIO
from tempfile import TemporaryDirectory
assert os.environ.get('GITHUB_ACTIONS')=='true'
assert os.environ['GITHUB_REPOSITORY']=='takochanchan/takochanchan.github.io'
P=json.loads(Path('.romero1862cover-live-plan.json').read_text())
B='https://takochanchan.github.io/'
D='https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/'
A=P['assets'];group=P['group'];url=B+'publications/'+group['slug']+'/'
norm=lambda s:re.sub(r'[\s\u2060]','',s)
def get(u):
 assert u.startswith((B,D)),u
 with urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'takochan-publication-verification','Cache-Control':'no-cache'}),timeout=50) as r:
  assert r.status==200,u
  return r.read()
def maps():
 p=B+'takochan-search-index-003/'; q='?check=romero1862cover'
 meta=json.loads(get(p+'search-meta.json'+q))
 assert meta['archiveCommit']==P['archive_commit']
 assert meta['bibliographicManifestSha256']==hashlib.sha256(Path('bibliographic-manifest.json').read_bytes()).hexdigest()
 dm=get(p+'document-map.json'+q).decode(); result=[]
 for rd in P['records']:
  slug=rd['slug'];assert slug in dm,slug
  m=json.loads(get(p+'maps/'+slug+'.json'+q))
  assert m['canonicalUrl'] in ('/publications/'+slug+'/','/publications/'+group['slug']+'/'),m['canonicalUrl']
  assert m['pdfSha256']==next(a['sha256'] for a in A if a['path']==rd['pdf']),slug
  rows=list(m['blocks'].values());pages={v[1] for v in rows if isinstance(v[1],int)}
  assert len(rows)>400 and min(pages)<=3 and max(pages)>=rd['pageCount']-8,(slug,len(rows),min(pages),max(pages))
  result.append(dict(slug=slug,blocks=len(rows),first=min(pages),last=max(pages),verified_sha=m['pdfSha256']))
 return result
def live():
 s=html.unescape(get(url+'?check=romero1862cover').decode())
 assert '<h1>'+group['title']+'</h1>' in s and '<link rel="canonical" href="'+url+'">' in s,url
 flat=norm(re.sub(r'<[^>]+>','',s))
 for t in [group['author'],group['originalTitle'],group['rights'],str(P['records'][0]['pageCount'])+'頁']:
  assert norm(t) in flat,t[:60]
 for m in P['metadata'].values(): assert m['sourceUrl'] in s and norm(m['rights']) in flat,m['sourceUrl']

 cs=get(D+'SHA256SUMS.txt').decode();checks=[]
 for a in A:
  kind=a['path'].rsplit('.',1)[-1];u=a['url']
  if kind in ('pdf','epub'):assert u in s,u
  payload=get(u);assert len(payload)==a['size'] and hashlib.sha256(payload).hexdigest()==a['sha256'],u
  if kind in ('pdf','epub'):
   assert re.search(r'^'+a['sha256']+r'\s+\*?'+re.escape(Path(a['path']).name)+r'$',cs,re.M),u
  if kind=='pdf':
   rd=next(r for r in P['records'] if r['pdf']==a['path'])
   with TemporaryDirectory() as d:
    f=Path(d)/'edition.pdf';f.write_bytes(payload)
    assert re.search(r'^Pages:\s+'+str(rd['pageCount'])+r'$',subprocess.check_output(['pdfinfo',str(f)],text=True),re.M),u
    assert group['title'] in subprocess.check_output(['pdftotext','-f','1','-l','1',str(f),'-'],text=True),u
  if kind=='epub':
   with zipfile.ZipFile(BytesIO(payload)) as z:
    assert z.testzip() is None and z.read('mimetype')==b'application/epub+zip',u
    assert any(hashlib.sha256(z.read(f)).hexdigest()==P['cover_sha256'] for f in z.namelist() if f.endswith('_cover.jpg')),u
  checks.append(dict(kind=kind,sha256=a['sha256']))
 return dict(url=url,assets=checks)
for i in range(85):
 try:
  v={'maps':maps()}
  if sys.argv[-1]=='live':v['live']=live()
  break
 except (OSError,ValueError,AssertionError) as ex:
  print(f'Waiting for verified deployment: attempt {i+1}: {ex}',flush=True)
  if i==84:raise
  time.sleep(15)
Path('romero1862cover-verification.json').write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(v,ensure_ascii=False))
