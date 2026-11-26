from pathlib import Path
import hashlib,html,json,re,os,time,subprocess,sys,urllib.request,zipfile
from io import BytesIO
from tempfile import TemporaryDirectory
assert os.environ.get('GITHUB_ACTIONS')=='true'
assert os.environ['GITHUB_REPOSITORY']=='takochanchan/takochanchan.github.io'
P=json.loads(Path('.santos-live-plan.json').read_text())
B='https://takochanchan.github.io/'
G=P['group'];records=P['records']
A={a['path']:a for a in P['assets']}
digest=lambda b:hashlib.sha256(b).hexdigest()
norm=lambda x:re.sub(r'[\s\u2060]','',x)
def get(url):
 assert url.startswith((B,'https://github.com/takochanchan/takochanchan.github.io/'))
 with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'takochan-publication-verification','Cache-Control':'no-cache'}),timeout=55) as r:
  assert r.status==200
  return r.read()
def maps():
 p=B+'takochan-search-index-003/'
 dm=get(p+'document-map.json?check=santos-1715-1716').decode()
 out=[]
 for r in records:
  n=r['seriesVolumeNumber'];sl=r['slug'];assert sl in dm
  a=A[r['pdf']]
  m=json.loads(get(p+'maps/'+sl+'.json?check=santos-1715-1716'))
  assert m['canonicalUrl']=='/publications/'+sl+'/' and m['pdfSha256']==a['sha256'],(sl,m['canonicalUrl'],m['pdfSha256'])
  rows=list(m['blocks'].values())
  assert len(rows)>3200,(sl,len(rows))
  pages={q[1] for q in rows if isinstance(q[1],int)}
  assert min(pages)<=3 and max(pages)>=r['pageCount']-2 and max(pages)<=r['pageCount'],(sl,min(pages),max(pages))
  final=578 if n==1 else 600
  assert any(re.search(r'(?<!\d)'+str(final)+r'(?!\d)',str(q[0])) for q in rows),(sl,final)
  out.append(dict(slug=sl,blocks=len(rows),firstPdfPage=min(pages),lastPdfPage=max(pages)))
 return out
def live():
 url=B+'publications/'+G['slug']+'/'
 s=html.unescape(get(url+'?check=santos-1715-1716').decode())
 assert '<h1>'+G['title']+'</h1>' in s and '<link rel="canonical" href="'+url+'">' in s
 flat=norm(re.sub(r'<[^>]+>','',s))
 for word in ['全体の詳細概要','第1部の詳細概要','第2部の詳細概要','NoCopyright–Non-CommercialUseOnly','digitizedbyGoogle']:assert word in flat,word
 for row in [G['groupOverview'],*P['overviews'].values()]:assert norm(row) in flat,row[:80]
 for r in records:
  archive_url=P['metadata'][r['slug']]['sourceUrl'];assert archive_url in s,archive_url
 cs=get('https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/SHA256SUMS.txt').decode()
 down=[]
 for r in records:
  slug=r['slug'];alias=get(B+'publications/'+slug+'/?check=santos-1715-1716').decode();assert '/publications/'+G['slug']+'/' in alias
  for kind in ('pdf','epub','cover'):
   a=A[r[kind]];u=a['url'];assert u in s or '/'+a['path'] in s
   b=get(u);assert len(b)==a['size'] and digest(b)==a['sha256'],(slug,kind)
   if kind!='cover':assert re.search(r'^'+a['sha256']+r'\s+\*?'+re.escape(Path(a['path']).name)+r'$',cs,re.M)
   if kind=='pdf':
    with TemporaryDirectory() as f:
     tmp=Path(f)/'test.pdf';tmp.write_bytes(b)
     info=subprocess.check_output(['pdfinfo',str(tmp)],text=True)
     assert re.search(r'^Pages:\s+'+str(r['pageCount'])+r'$',info,re.M),info[:400]
   if kind=='epub':
    with zipfile.ZipFile(BytesIO(b)) as z:assert z.read('mimetype')==b'application/epub+zip' and z.testzip() is None
   down.append(dict(slug=slug,format=kind,sha256=a['sha256']))
 return dict(url=url,readbacks=down)
for i in range(46):
 try:
  v={'maps':maps()}
  if sys.argv[-1]=='live':v['live']=live()
  break
 except (OSError,ValueError,AssertionError) as e:
  print(f'Waiting for verified publication: attempt {i+1}: {str(e)[:350]}',flush=True)
  if i==45:raise
  time.sleep(20)
Path('santos-verification.json').write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(v,ensure_ascii=False))

