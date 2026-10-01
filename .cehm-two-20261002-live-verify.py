"""Verify the live article pages, exact Release bytes, and every search mapping."""
import hashlib,importlib.util,json,os,pathlib,re,subprocess,sys,tempfile,urllib.request
assert os.environ.get('GITHUB_ACTIONS')=='true'
REPO='takochanchan/takochanchan.github.io'
assert os.environ['GITHUB_REPOSITORY']==REPO
q=json.loads(pathlib.Path('.cehm-two-20261002-live-request.json').read_text())
root=pathlib.Path(tempfile.mkdtemp(prefix='cehm-two-live-verify-'))
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={'Cache-Control':'no-cache','User-Agent':'CEHM-publication-verification'}),timeout=90) as r:
        assert r.status==200,(url,r.status)
        return r.read()
spec=importlib.util.spec_from_file_location('extract_corpus',pathlib.Path('scripts/search/extract-corpus.py'))
extract=importlib.util.module_from_spec(spec);sys.modules['extract_corpus']=extract;spec.loader.exec_module(extract)
spec2=importlib.util.spec_from_file_location('epub_validator',pathlib.Path('scripts/validate-epubs.py'))
epub_check=importlib.util.module_from_spec(spec2);spec2.loader.exec_module(epub_check);epub_check.PUBLIC_ROOT=root
catalogue=get('https://takochanchan.github.io/').decode()
section=re.search(r'<section\b[^>]*\bid="short-works"[\s\S]*?</section>',catalogue)
assert section,'live article section missing'
checksums=get('https://github.com/'+REPO+'/releases/download/publications-current/SHA256SUMS.txt').decode()
search_root='https://takochanchan.github.io/takochan-search-index-002/'
metadata=json.loads(get(search_root+'search-meta.json'))
assert metadata['archiveCommit']==q['verified_archive_commit']
assert metadata['works']==131
results=[]
for d in q['publications']:
    slug=d['slug'];url='https://takochanchan.github.io/publications/'+slug+'/'
    html=get(url).decode()
    assert d['title'] in html
    assert re.search(r'class="publication-hero__record-class">\s*論文\s*</p>',html)
    assert '/publications/'+slug+'/' in section.group(0),slug
    assert 'Todos los Derechos Reservados' in html and '©2026' in html
    assert '画像を掲載・転載していません' in html
    files={}
    for a in d['assets']:
        name=a['filename'];assert name in html
        binary=get('https://github.com/'+REPO+'/releases/download/publications-current/'+name)
        assert len(binary)==a['size'] and hashlib.sha256(binary).hexdigest()==a['sha256']
        assert a['sha256']+'  '+name in checksums
        p=root/name;p.write_bytes(binary);files[p.suffix]=p
    text=subprocess.check_output(['pdftotext','-layout',str(files['.pdf']),'-']).decode()
    first=subprocess.check_output(['pdftotext','-f','1','-l','1','-layout',str(files['.pdf']),'-']).decode()
    assert 'Todos los Derechos Reservados' in first and 'Fundación Carlos Slim' in first and '2026' in first
    assert '個別ライセンス' in first and '掲載・転載しない' in first
    assert '無料。登録済み。' not in text and 'ベタンクル' not in text and 'ベタンクールト' not in text
    jp,images=epub_check.validate_epub({'slug':slug,'title':d['title'],'epub':files['.epub'].name})
    assert images==1
    query={'slug':slug,'title':d['title'],'author':d['author'],'recordClass':'short-work',
        'source':str(files['.epub']),'format':'epub','sourceMode':'approved-epub-mirror',
        'pdf':str(files['.pdf']),'pdfUrl':'https://github.com/'+REPO+'/releases/download/publications-current/'+files['.pdf'].name,
        'url':'/publications/'+slug+'/','masterPath':'publications/'+slug+'/master.docx'}
    work=extract.build_work(root/'manifest.json',query)
    mapping=json.loads(get(search_root+'maps/'+slug+'.json'))
    assert mapping['pdfSha256']==d['assets'][0]['sha256']
    assert work['pdfPageCount']==d['pages']
    assert len(mapping['blocks'])==len(work['chunks'])
    for c in work['chunks']:
        mapped=mapping['blocks'][c['id']]
        assert mapped[0]==c['originalPage'] and mapped[1]==c['pdfPage'],(slug,c['id'])
    assert any('史料画像' in c['originalPage'] for c in work['chunks'])
    assert slug in metadata['workSlugs']
    if d['code']=='XI':
        expected=[('〔原注〕「ヘブライ人への手紙」11章6節。',379),('〔原注〕トリエント公会議、第4会期。',382),('〔原注〕この行を削除するか。',386),('〔原注＋〕（＋）パドレ・ラ・クーレイである。',435)]
        # Footnotes use the cited physical PDF page rather than the EPUB chapter end.
        for needle,page in expected:
            notes=[c for c in work['chunks'] if '原注' in c['text'] and needle in c['text']]
            assert notes and all(c['pdfPage']==page for c in notes),(needle,notes)
    results.append({'slug':slug,'live_url':url,'recordClass':'short-work','type':'paper','rights_visible':True,
        'assets':d['assets'],'all_live_bytes_verified':True,'live_checksums_verified':True,
        'pdf_pages':work['pdfPageCount'],'epub_japanese_characters':jp,'search_chunks':len(work['chunks']),
        'all_search_blocks_verified':True,'search_mapping_summary':work['mappingSummary']})
result={'verified_archive_commit':q['verified_archive_commit'],'search_works':metadata['works'],'publications':results}
pathlib.Path('cehm-two-20261002-live-verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False))
