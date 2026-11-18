from pathlib import Path
import hashlib,json,html,urllib.request,zipfile,tempfile,subprocess
slug='sosa-biografias-de-mexicanos-distinguidos-1884'
url='https://takochanchan.github.io/publications/'+slug+'/'
raw=urllib.request.urlopen(url,timeout=90).read().decode()
decoded=html.unescape(raw)
for s in ['著名メキシコ人伝','Francisco Sosa','Biografías de mexicanos distinguidos','1884','294','1075頁','https://archive.org/details/biografasdemexic00sosa','スマザーズ','個別の利用許諾表示がありません']:
 assert s in decoded,s
for para in json.load(open('src/publication-overviews.json'))['records'][slug].split('\n\n'):assert para in decoded,para
assets=[r for r in json.load(open('assets-manifest.json'))['assets'] if r['path'].startswith('publications/'+slug+'/')]
assert len(assets)==3
sums=urllib.request.urlopen('https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/SHA256SUMS.txt',timeout=90).read().decode().splitlines()
with tempfile.TemporaryDirectory() as tmp:
 for a in assets:
  p=Path(tmp)/Path(a['path']).name
  if p.suffix!='.jpg':assert a['url'] in decoded and any(l.split()==[a['sha256'],p.name] for l in sums)
  data=urllib.request.urlopen(a['url'],timeout=180).read();p.write_bytes(data)
  assert len(data)==a['size'] and hashlib.sha256(data).hexdigest()==a['sha256']
  if p.suffix=='.pdf':
   assert any(line.split()==['Pages:','1075'] for line in subprocess.check_output(['pdfinfo',str(p)],text=True).splitlines())
  elif p.suffix=='.epub':
   from xml.etree import ElementTree as ET
   with zipfile.ZipFile(p) as z:
    assert z.testzip() is None
    docs=[ET.fromstring(z.read(n)) for n in z.namelist() if n.endswith('.xhtml')]
    assert sum(1 for d in docs for e in d.iter() if e.get('class')=='source-page')==1134
    assert sum(1 for d in docs for e in d.iter() if e.get('{http://www.idpf.org/2007/ops}type')=='footnote')==198
  print('Verified',p.name,len(data),a['sha256'])
base='https://takochanchan.github.io/takochan-search-index-003/'
meta=json.load(urllib.request.urlopen(base+'search-meta.json',timeout=90))
assert slug in meta['workSlugs'] and meta['archiveCommit']==json.load(open('master-archive.json'))['archive_commit']
m=json.load(urllib.request.urlopen(base+'maps/'+slug+'.json',timeout=90))
print('Verified public bibliography, detailed overview, downloads and search page mapping',list(m)[:9])
assert m['slug']==slug and m['canonicalUrl']=='/publications/'+slug+'/'
assert m['pdfSha256']==next(a['sha256'] for a in assets if a['path'].endswith('.pdf'))
assert m['sourceSha256']==next(a['sha256'] for a in assets if a['path'].endswith('.epub'))
assert len(m['blocks'])==9262
assert any(label=='原刊 p. 11' and pdf_page==21 for label,pdf_page,_ in m['blocks'].values())
assert any(label=='原刊 p. 1068' and pdf_page==1009 for label,pdf_page,_ in m['blocks'].values())
print('Verified 9,262 live search mappings, including Aguilar and Veytia.')
