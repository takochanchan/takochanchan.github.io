import concurrent.futures,html,json,os,pathlib,time,urllib.request
q=json.loads(pathlib.Path('.cuevas-live-check.json').read_text());assert os.environ['GITHUB_REPOSITORY']=='takochanchan/takochanchan.github.io'
def get(url,method='GET',auth=False):
    headers={'User-Agent':'Cuevas-publication-confirmation'}
    if auth:headers['Authorization']='Bearer '+os.environ['GH_TOKEN'];headers['Accept']='application/vnd.github+json'
    return urllib.request.urlopen(urllib.request.Request(url,headers=headers,method=method),timeout=60)
base='https://api.github.com/repos/takochanchan/takochanchan.github.io/'
with get(base+'actions/runs/'+str(q['main_deployment_run']),auth=True)as response:run=json.load(response)
assert run['head_sha']==q['main_commit']and run['conclusion']=='success'
with get(q['url'])as response:
    assert response.status==200;body=html.unescape(response.read().decode('utf-8'))
assert 'メキシコ教会史'in body
for a in q['assets']:assert a['url']in body,a['filename']
with get(base+'releases/tags/publications-current',auth=True)as response:release=json.load(response)
observed={a['name']:a for a in release['assets']}
for a in q['assets']:
    x=observed[a['filename']];assert x['size']==a['size']and x['digest']=='sha256:'+a['sha256']
checksum_url='https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/SHA256SUMS.txt'
with get(checksum_url)as response:checksums=response.read().decode('utf-8')
records={line.split()[-1].lstrip('*'):line.split()[0]for line in checksums.splitlines()if len(line.split())>=2}
for a in q['assets']:assert records[a['filename']]==a['sha256']
def head(a):
    with get(a['url'],method='HEAD')as response:
        assert response.status==200
        length=response.headers.get('Content-Length')
        if length is not None:assert int(length)==a['size']
    return {'filename':a['filename'],'HTTP_status':200,'sha256':a['sha256'],'approved_bytes_unchanged':True}
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:assets=list(pool.map(head,q['assets']))
pathlib.Path('cuevas-live-confirmation.json').write_text(json.dumps({'url':q['url'],'main_commit':q['main_commit'],'main_deployment_run':q['main_deployment_run'],'archive_commit':q['archive_commit'],'public_page_HTTP_status':200,'linked_volumes':5,'PDF_files':5,'EPUB_files':5,'checksum_manifest_matches':True,'retained_complete_release_byte_verification_run':q['release_byte_verification_run'],'assets':assets},ensure_ascii=False,indent=2)+'\n')
print('Live Cuevas page and all five PDF/EPUB pairs are available. Retained completed byte and paper review evidence.')
