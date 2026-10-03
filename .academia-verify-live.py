"""Public URL verification; executed only by the requested GitHub Actions job."""
import os,json,hashlib,urllib.request,pathlib,zipfile,tempfile
from xml.etree import ElementTree as E
assert os.environ.get('GITHUB_ACTIONS')=='true'
SLUG='academia-guatemalteca-biografias-literatos-nacionales-1889'
STEM='Academia_Guatemalteca_Biografias_de_Literatos_Nacionales_1889_Japanese_Translation'
SITE='https://takochanchan.github.io'
RELEASE='https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/'
ASSETS={STEM+'.pdf':(3262781,'d6cef4c8799b3fda33ffb83613e8b3b55fbc9a820911fb53e058f8a9d56c3125'),STEM+'.epub':(341777,'aef6c1a610ba6523f14ef4e43a160f31e811d0a1a80c057dfbc458e500ba729e')}
def fetch(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Academia-publication-byte-verification','Cache-Control':'no-cache'})
 with urllib.request.urlopen(req,timeout=90) as response:
  assert response.status==200
  return response.read(),response.geturl()
html,final_url=fetch(SITE+'/publications/'+SLUG+'/');text=html.decode()
for phrase in ['グアテマラ文人伝','Academia Guatemalteca','1889','Marco legal','第4.3節','第5節','cervantesvirtual.com/marco-legal/']:
 assert phrase in text,phrase
for name in ASSETS:assert RELEASE+name in text,name
cover,url=fetch(SITE+'/publications/'+SLUG+'/japanese-cover.jpg')
assert len(cover)==42486 and hashlib.sha256(cover).hexdigest()=='b94f1f0aa99b48e3de25c195e8af9908a8fe4e65057104f8913eb8e2ae5eae6e'
checksums,_=fetch(RELEASE+'SHA256SUMS.txt');lines={l.split()[1].lstrip('*'):l.split()[0] for l in checksums.decode().splitlines() if l.split()}
verified=[];root=pathlib.Path(tempfile.mkdtemp())
for name,(size,digest) in ASSETS.items():
 data,url=fetch(RELEASE+name);actual=hashlib.sha256(data).hexdigest()
 assert len(data)==size and actual==digest and lines[name]==digest
 p=root/name;p.write_bytes(data)
 if name.endswith('.pdf'):assert data.startswith(b'%PDF-')
 else:
  with zipfile.ZipFile(p) as z:
   assert z.testzip() is None and z.namelist()[0]=='mimetype' and z.read('mimetype')==b'application/epub+zip'
   c=E.fromstring(z.read('META-INF/container.xml'));rp=c.find('.//{urn:oasis:names:tc:opendocument:xmlns:container}rootfile').get('full-path')
   opf=E.fromstring(z.read(rp));assert opf.get('version')=='3.0'
   items=opf.findall('.//{http://www.idpf.org/2007/opf}manifest/{http://www.idpf.org/2007/opf}item')
   assert sum('nav' in v.get('properties','').split() for v in items)==1
   assert sum('cover-image' in v.get('properties','').split() for v in items)==1
   assert opf.findall('.//{http://www.idpf.org/2007/opf}spine/{http://www.idpf.org/2007/opf}itemref')
 verified.append({'filename':name,'size':len(data),'sha256':actual,'public_url':RELEASE+name,'http_status':200})
report={'publication_url':SITE+'/publications/'+SLUG+'/','rights_and_source_displayed':True,'cover_verified':True,'assets':verified,'shared_checksums_match':True,'unchanged_verified_pdf_pages':408,'epub3_structure':'PASS','result':'PASS'}
pathlib.Path('academia-live-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps(report,ensure_ascii=False))
