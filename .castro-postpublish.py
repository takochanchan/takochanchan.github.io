import hashlib, io, json, pathlib, re, subprocess, urllib.request, zipfile, tempfile, importlib.util
assert __import__('os').environ.get('GITHUB_ACTIONS')=='true'
slug="castro-santa-anna-diario-1854"
assets=[{"filename":"Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol4_Japanese_Complete_Translation.pdf","path":"publications/castro-santa-anna-diario-1854-v4/Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol4_Japanese_Complete_Translation.pdf","size":1824312,"sha256":"99c7c5ba13bebbc73bcc4a81b2ba0fadd12e1bf8c8327cfc463868d6b5eec975","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol4_Japanese_Complete_Translation.pdf"},{"filename":"Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol4_Japanese_Complete_Translation.epub","path":"publications/castro-santa-anna-diario-1854-v4/Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol4_Japanese_Complete_Translation.epub","size":250328,"sha256":"3ad77335788b13808bfc09bd6b8dd9ec43f98cc5125372a0bc341fdceb2e2c21","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol4_Japanese_Complete_Translation.epub"},{"filename":"Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol5_Japanese_Complete_Translation.pdf","path":"publications/castro-santa-anna-diario-1854-v5/Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol5_Japanese_Complete_Translation.pdf","size":1931529,"sha256":"cecd30268a4d945d08754a61123b5721e0a1e465261e841d595fd2b9287b5259","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol5_Japanese_Complete_Translation.pdf"},{"filename":"Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol5_Japanese_Complete_Translation.epub","path":"publications/castro-santa-anna-diario-1854-v5/Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol5_Japanese_Complete_Translation.epub","size":258853,"sha256":"8fbeb1f22527c7302dca3b8e9bd95afda16808761a17d4ffcca824ec27a1434c","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol5_Japanese_Complete_Translation.epub"},{"filename":"Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol6_Japanese_Complete_Translation.pdf","path":"publications/castro-santa-anna-diario-1854-v6/Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol6_Japanese_Complete_Translation.pdf","size":1896855,"sha256":"803e0d1d34d80d6ba990ce5d9989a555155ed30368a679703a3e901f151d7337","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol6_Japanese_Complete_Translation.pdf"},{"filename":"Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol6_Japanese_Complete_Translation.epub","path":"publications/castro-santa-anna-diario-1854-v6/Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol6_Japanese_Complete_Translation.epub","size":250766,"sha256":"4d6cb38c352a01d7966086499c955fea306d2554cc2e3c3a11164d6b84196f04","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Jose_Manuel_de_Castro_Santa_Anna_Diario_1854_Vol6_Japanese_Complete_Translation.epub"}]
base='https://takochanchan.github.io/'
def fetch(url):
 with urllib.request.urlopen(urllib.request.Request(url,headers={'Cache-Control':'no-cache'}),timeout=120) as r:
  assert r.status==200
  return r.read()
page=fetch(base+'publications/'+slug+'/').decode()
for term in ["注目すべき出来事の日誌","ホセ・マヌエル・デ・カストロ・サンタ＝アンナ","1854","Biblioteca Nacional de España","底本の画像","https://www.bne.es/es/servicios/reproduccion-documentos/uso-reproducciones","1752年6月12日","1758年6月14日"]:
 assert term in page,term
assert "原刊画像" not in page
sums=fetch('https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/SHA256SUMS.txt').decode()
verified=[]
scratch=pathlib.Path(tempfile.mkdtemp(prefix='castro-live-'))
spec=importlib.util.spec_from_file_location('epub_validator',pathlib.Path('scripts/validate-epubs.py'));validator=importlib.util.module_from_spec(spec);spec.loader.exec_module(validator);validator.PUBLIC_ROOT=scratch
items=json.loads(subprocess.check_output(['node','--input-type=module','-e','import {publications} from "./src/publications.mjs";process.stdout.write(JSON.stringify(publications.filter(x=>x.slug.startsWith("castro-santa-anna-diario-1854-v"))));'],text=True))
assert len(items)==3
for a in assets:
 data=fetch(a['url']);assert len(data)==a['size'] and hashlib.sha256(data).hexdigest()==a['sha256']
 assert a['url'] in page
 matches=[line for line in sums.splitlines() if line.split() and line.split()[-1].lstrip('*').rsplit('/',1)[-1]==a['filename']]
 assert len(matches)==1 and matches[0].split()[0]==a['sha256']
 if a['filename'].endswith('.epub'):
  p=scratch/a['filename'];p.write_bytes(data);item=next(x for x in items if x['epub'].endswith(a['filename']));validator.validate_epub({**item,'epub':a['filename']})
 else:
  p=scratch/a['filename'];p.write_bytes(data);v=int(re.search('_Vol([456])_',a['filename']).group(1));info=subprocess.check_output(['pdfinfo',str(p)],text=True);assert int(re.search(r'^Pages:\s*(\d+)',info,re.M).group(1))=={4:185,5:189,6:181}[v]
  text=subprocess.check_output(['pdftotext','-f','2','-l','2',str(p),'-'],text=True);compact=re.sub(r'\s+','',text.replace('\u2060',''));assert '底本の画像' in compact and '原刊画像' not in compact
 verified.append({k:a[k] for k in ['filename','size','sha256']})
search_results=[]
home=fetch(base).decode()
aliases=json.loads(re.search(r'window[.]BIBLIOGRAPHIC_ALIASES=(.*?);</script>',home,re.S).group(1))
live_ui=fetch(base+'fulltext-search.js')
assert live_ui==pathlib.Path('src/fulltext-search.js').read_bytes()
assert 'window.BIBLIOGRAPHIC_ALIASES?.[slug] || slug' in live_ui.decode()
assert 'publication.href = bibliographyUrlFor(result.meta?.slug);' in live_ui.decode()
for v,n,first,last in [(4,185,5,260),(5,189,5,269),(6,181,5,262)]:
 unit=slug+'-v'+str(v)
 search=json.loads(fetch(base+'takochan-search-index-002/maps/'+unit+'.json'))
 assert search['pdfSha256']==next(a['sha256'] for a in assets if a['filename'].endswith('.pdf') and '_Vol'+str(v)+'_' in a['filename'])
 labels=set();pdfpages=set()
 for mapping in search['blocks'].values():
  labels.update(re.findall(r'原刊 p[.] *([0-9]+)',str(mapping[0])))
  pdfpages.add(mapping[1])
 expected=set(map(str,range(first,last+1)))
 if v==6:expected-=set(map(str,range(181,191)))
 assert expected<=labels,(v,len(expected-labels),sorted(expected-labels)[:10])
 assert pdfpages and all(isinstance(p,int) and 1<=p<=n for p in pdfpages)
 assert search['canonicalUrl']=='/publications/'+unit+'/'
 assert aliases[unit]==slug
 public_search_result_url='/publications/'+aliases[unit]+'/'
 assert public_search_result_url=='/publications/'+slug+'/'
 search_results.append(dict(volume=v,pdf_pages=n,source_labels_verified=len(expected),search_pdf_pages=len(pdfpages),public_search_result_url=public_search_result_url))
subprocess.run(['npm','run','verify:remote-search'],check=True)
result=dict(status='published_and_verified',url=base+'publications/'+slug+'/',assets=verified,volumes=search_results,archive_commit="d9847a063b08181d3f20c10634745dfcb29ceaad")
pathlib.Path('castro-live-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+chr(10))
print(json.dumps(result,ensure_ascii=False))

