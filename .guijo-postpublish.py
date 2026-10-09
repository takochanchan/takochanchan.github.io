import hashlib, io, json, pathlib, re, subprocess, urllib.request, zipfile
assert __import__('os').environ.get('GITHUB_ACTIONS')=='true'
slug="guijo-diario-sucesos-notables-1853-vol-1"
assets=[{"filename":"Gregorio_Martin_de_Guijo_Diario_1853_Vol1_Japanese_Complete_Translation.epub","size":394101,"sha256":"3888c8ee61364800093e3d1b40bfa1b3f02bbdffa9bb77fab57248fb32b2c83c","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Gregorio_Martin_de_Guijo_Diario_1853_Vol1_Japanese_Complete_Translation.epub","path":"publications/guijo-diario-sucesos-notables-1853-vol-1/Gregorio_Martin_de_Guijo_Diario_1853_Vol1_Japanese_Complete_Translation.epub"},{"filename":"Gregorio_Martin_de_Guijo_Diario_1853_Vol1_Japanese_Complete_Translation.pdf","size":3964946,"sha256":"38159ca4bd5c7ecfdecc5cc4380445f1039a959fc45dd47d6b2b889553064837","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Gregorio_Martin_de_Guijo_Diario_1853_Vol1_Japanese_Complete_Translation.pdf","path":"publications/guijo-diario-sucesos-notables-1853-vol-1/Gregorio_Martin_de_Guijo_Diario_1853_Vol1_Japanese_Complete_Translation.pdf"}]
base='https://takochanchan.github.io/'
def fetch(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers={'Cache-Control':'no-cache'}),timeout=120) as r:
  assert r.status==200
  return r.read()
page=fetch(base+'publications/'+slug+'/').decode()
for term in ['重要事件日誌','グレゴリオ・マルティン・デ・ギホ','1853','Biblioteca Nacional de España','CC BY 4.0','https://www.bne.es/es/aviso-legal','https://creativecommons.org/licenses/by/4.0/']:
 assert term in page,term
sums=fetch('https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/SHA256SUMS.txt').decode()
verified=[]
for a in assets:
 data=fetch(a['url']);assert len(data)==a['size'] and hashlib.sha256(data).hexdigest()==a['sha256']
 assert a['url'] in page
 matches=[line for line in sums.splitlines() if line.split() and line.split()[-1].lstrip('*').rsplit('/',1)[-1]==a['filename']]
 assert len(matches)==1 and matches[0].split()[0]==a['sha256']
 if a['filename'].endswith('.epub'):
  with zipfile.ZipFile(io.BytesIO(data)) as z:assert z.testzip() is None
 verified.append({k:a[k] for k in ['filename','size','sha256']})
search=json.loads(fetch(base+'takochan-search-index-002/maps/'+slug+'.json'))
assert search['pdfSha256']==next(a['sha256'] for a in assets if a['filename'].endswith('.pdf'))
labels=set();pdfpages=set()
for mapping in search['blocks'].values():
 labels.update(re.findall(r'原刊 p[.] *([IVXLCDM]+|[0-9]+)',str(mapping[0])))
 pdfpages.add(mapping[1])
expected=set(['III','IV','V','VI','VII','VIII','IX'])|set(map(str,range(3,564)))
assert expected<=labels,(len(expected-labels),sorted(expected-labels)[:10])
assert pdfpages and all(isinstance(n,int) and 1<=n<=402 for n in pdfpages)
assert search['canonicalUrl']=='/publications/'+slug+'/'
subprocess.run(['npm','run','verify:remote-search'],check=True)
result=dict(status='published_and_verified',url=base+'publications/'+slug+'/',assets=verified,pdf_pages=402,source_labels_verified=len(expected),search_pdf_pages=len(pdfpages),archive_commit="a7c713dfd252c9a06d5a74d6495973307a8f604c")
pathlib.Path('guijo-live-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+chr(10))
print(json.dumps(result,ensure_ascii=False))
