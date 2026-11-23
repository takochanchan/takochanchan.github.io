import hashlib, html, json, pathlib, re, subprocess, sys, tempfile, urllib.request, zipfile
from html.parser import HTMLParser
from urllib.parse import unquote,urljoin
from xml.etree import ElementTree as ET
P=pathlib.Path(__file__).resolve().parent
R=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '.')
F=json.loads((P/'florencia-live-fixture.json').read_text())
BASE='https://takochanchan.github.io'
SLUG=F['slug'];URL=f'{BASE}/publications/{SLUG}/'
def read(url):
 req=urllib.request.Request(url,headers={'Cache-Control':'no-cache','User-Agent':'takochan-florencia-release-verifier'})
 with urllib.request.urlopen(req,timeout=55) as s:
  assert s.status==200 and s.readable(),url
  return s.read()
class Page(HTMLParser):
 def __init__(self,b):
  super().__init__();self.parts=[];self.links=set();self.canon=[];self.feed(b.decode())
  self.body=' '.join(' '.join(self.parts).split())
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='link' and a.get('rel')=='canonical':self.canon.append(urljoin(URL,a['href']))
  for key in ('href','src','data-src'):
   if a.get(key):self.links.add(urljoin(URL,a[key]))
 def handle_data(self,s):self.parts.append(s)
page=Page(read(URL))
assert page.canon==[URL],page.canon
assert not any(word in page.body.lower() or any(word in s.lower() for s in page.links) for word in ('topoi','scielo','john carter brown'))
for s in (F['title'],F['originalTitle'],F['author'],F['originalAuthor'],F['sourceProvider'],F['rights'].split('https://')[0],f'翻訳版 {F["pages"]}頁','詳細概要'):
 assert ' '.join(s.split()) in page.body,s
for paragraph in F['overview'].split('\n\n'):
 assert ' '.join(paragraph.split()) in page.body,'published detailed overview'
for link in (F['sourceUrl'],F['rightsUrl']):
 assert unquote(link) in {unquote(a) for a in page.links} or unquote(link) in unquote(page.body),link
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
urls=[a.text for a in ET.fromstring(read(BASE+'/sitemap-books.xml')).findall('s:url/s:loc',ns)]
assert urls.count(URL)==1
data=json.loads((R/'assets-manifest.json').read_text())['assets']
assert sorted([a for a in data if a['path'].startswith(f'publications/{SLUG}/')],key=lambda v:v['path'])==sorted(F['assets'],key=lambda v:v['path'])
release=f'https://github.com/takochanchan/takochanchan.github.io/releases/download/{F["releaseTag"]}'
checks=[tuple(re.split(r'\s+\*?',line,maxsplit=1)) for line in read(release+'/SHA256SUMS.txt').decode().splitlines() if line.strip()]
with tempfile.TemporaryDirectory() as d:
 for a in F['assets']:
  p=pathlib.Path(d)/a['path'].split('/')[-1]
  assert a['url'] in page.links,(p.name,'unlinked live asset')
  b=read(a['url'])
  assert len(b)==a['size'] and hashlib.sha256(b).hexdigest()==a['sha256'],p.name
  if p.suffix in ('.pdf','.epub'):
   assert [c for c in checks if c[1]==p.name]==[(a['sha256'],p.name)],p.name
  p.write_bytes(b)
  if p.suffix=='.pdf':
   info=subprocess.check_output(['pdfinfo',str(p)],text=True)
   assert not subprocess.check_output(['pdfimages','-list',str(p)],text=True).strip().splitlines()[2:], 'PDF contains an image'
   assert re.search(r'^Pages:\s+'+str(F['pages'])+r'$',info,re.M)
  elif p.suffix=='.epub':
   with zipfile.ZipFile(p) as z:
    assert z.testzip() is None and z.read('mimetype')==b'application/epub+zip'
    root=ET.fromstring(z.read('META-INF/container.xml'))
    opf_path=next(n.attrib['full-path'] for n in root.iter() if n.tag.endswith('}rootfile'))
    pkg=ET.fromstring(z.read(opf_path))
    opf={'o':'http://www.idpf.org/2007/opf'}
    assert pkg.get('version')=='3.0'
    assert not any(word in z.read(s).decode().lower() for s in z.namelist() if s.endswith(('.xhtml','.opf')) for word in ('topoi','scielo','john carter brown'))
    assert sum(x.get('media-type','').startswith('image/') for x in pkg.findall('o:manifest/o:item',opf))==F['plates']+1
  else:assert b.startswith(b'\xff\xd8\xff') and b.endswith(b'\xff\xd9')
  print('VERIFIED',a['url'],a['sha256'],a['size'])
print('VERIFIED',URL,'canonical/rightsholder and source/overview, 505 pages, no original images')

