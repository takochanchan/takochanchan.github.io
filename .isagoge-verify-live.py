import hashlib, html, json, pathlib, re, subprocess, tempfile, urllib.request, zipfile
slug='isagoge-historico-apologetico-1892'
base='https://takochanchan.github.io/'
def get(url):
    with urllib.request.urlopen(url,timeout=120) as r:
        assert r.status==200
        return r.read()
page=get(base+'publications/'+slug+'/').decode()
overview=json.load(open('src/publication-overviews.json'))['records'][slug]
for p in overview.split('\n\n'):
    assert html.escape(p,quote=True) in page,p
assert re.search(r'<details\b[^>]*class="publication-overview"[^>]*>',page)
assert not re.search(r'<details\b[^>]*\bopen\b[^>]*>',page)
assert '著者不明' in page and '詳細概要' in page
structured=[v for text in re.findall(r'<script type="application/ld\+json">([\s\S]*?)</script>',page) for v in json.loads(text)]
work=next(v for v in structured if v.get('identifier')==slug)
assert work['abstract']==overview
assets=[a for a in json.load(open('assets-manifest.json'))['assets'] if a['path'].startswith('publications/'+slug+'/')]
assert len(assets)==3
root=pathlib.Path(tempfile.mkdtemp())
sums=get('https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/SHA256SUMS.txt').decode()
for a in assets:
    data=get(a['url']);assert len(data)==a['size'];assert hashlib.sha256(data).hexdigest()==a['sha256']
    name=pathlib.PurePosixPath(a['path']).name;p=root/name;p.write_bytes(data)
    if p.suffix in ['.pdf','.epub']:
        assert any(line.split()==[a['sha256'],name] for line in sums.splitlines())
    if p.suffix=='.pdf':
        info=subprocess.check_output(['pdfinfo',str(p)],text=True)
        assert any(line.split()==['Pages:','393'] for line in info.splitlines())
        cover=subprocess.check_output(['pdftotext','-f','1','-l','1',str(p),'-'],text=True)
        assert '著者不明' in cover
    if p.suffix=='.epub':
        with zipfile.ZipFile(p) as z:
            assert z.testzip() is None and z.read('mimetype')==b'application/epub+zip'
            css='\n'.join(z.read(n).decode() for n in z.namelist() if n.endswith('.css'))
            assert 'p { text-align: left; }' in css and '.page-marker p { text-align: right; }' in css
    print('VERIFIED',name,a['size'],a['sha256'])
mapping=json.loads(get(base+'takochan-search-index-002/maps/'+slug+'.json'))
assert mapping['slug']==slug and mapping['author']=='著者不明'
assert mapping['pdfSha256']==next(a['sha256'] for a in assets if a['path'].endswith('.pdf'))
assert mapping['sourceSha256']==next(a['sha256'] for a in assets if a['path'].endswith('.epub'))
assert mapping['canonicalUrl'].endswith('/publications/'+slug+'/')
assert mapping['blocks'] and all(1<=m[1]<=393 for m in mapping['blocks'].values())
source_pages={int(p) for m in mapping['blocks'].values() for p in re.findall(r'原刊 p\.\s*(\d+)',m[0])}
assert {7,439,441,445}<=source_pages
print('Live Isagoge: author, 880-character overview, 393-page PDF, EPUB, checksums, cover and page map verified.')
