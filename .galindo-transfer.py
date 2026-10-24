"""Actions-only Galindo adaptation of the verified Garcia/Herrera transfer."""
import argparse,base64,gzip,hashlib,json,os,re,subprocess,tarfile,tempfile,shutil
from pathlib import Path,PurePosixPath

assert os.environ.get('GITHUB_ACTIONS')=='true'
REPO='takochanchan/takochanchan.github.io'
assert os.environ['GITHUB_REPOSITORY']==REPO
request=json.loads(Path('.galindo-public-request.json').read_text())
assert re.fullmatch(r'[0-9a-f]{40}',request['verified_archive_commit'])
expected={a['filename']:a for a in request['assets']}
assert len(expected)==len(request['assets'])==9
assert len([a for a in expected.values() if a['kind']=='release'])==6
cache=Path('.cache/galindo-approved-assets');flat=cache/'flat'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def run(*args,**kw):return subprocess.run(args,check=True,**kw)
def fixed_assets():
    for name,a in expected.items():
        p=flat/name
        assert p.is_file() and p.stat().st_size==a['size'] and sha(p)==a['sha256'],name

parser=argparse.ArgumentParser();parser.add_argument('mode',choices=['prepare','upload']);args=parser.parse_args()
if args.mode=='prepare':
    flat.mkdir(parents=True,exist_ok=True);bundle=cache/'public.tar.gz'
    with bundle.open('wb') as out:
        for oid in request['bundle']['chunks']:
            assert re.fullmatch(r'[0-9a-f]{40}',oid)
            blob=json.loads(subprocess.check_output(['gh','api',f'repos/{REPO}/git/blobs/{oid}']))
            data=base64.b64decode(blob['content'])
            assert blob['sha']==oid and blob['size']==len(data)
            assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==oid
            out.write(data)
    assert bundle.stat().st_size==request['bundle']['size'] and sha(bundle)==request['bundle']['sha256']
    with gzip.open(bundle,'rb') as stream:
        while stream.read(1024*1024):pass
    with tarfile.open(bundle) as archive:
        members=archive.getmembers()
        assert len(members)==9 and {m.name for m in members}==set(expected)
        assert all(m.isfile() and PurePosixPath(m.name).name==m.name for m in members)
        archive.extractall(flat,filter='data')
    fixed_assets()
    for name,a in expected.items():
        relative=PurePosixPath(a['path']);assert relative.parts[0]=='publications' and '..' not in relative.parts
        local=cache/'public'/relative;local.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(flat/name,local)
        if a['kind']=='cover':
            target=Path('static')/relative;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(flat/name,target)
    run('python3','.galindo-prepare.py')
    assert json.loads(Path('master-archive.json').read_text())['archive_commit']==request['verified_archive_commit']
    for p in request['publications']:
        info=subprocess.check_output(['pdfinfo',str(cache/'public'/p['pdf'])],text=True)
        assert any(line.split()==['Pages:',str(p['pageCount'])] for line in info.splitlines())
    print('Approved bytes, PDF page counts, covers, and catalogue inputs verified.')
else:
    fixed_assets()
    assert json.loads(Path('master-archive.json').read_text())['archive_commit']==request['verified_archive_commit']
    verify=cache/'verify';verify.mkdir(exist_ok=True)
    assets={n:a for n,a in expected.items() if a['kind']=='release'}
    release=json.loads(subprocess.check_output(['gh','api',f'repos/{REPO}/releases/tags/publications-current']))
    pages=json.loads(subprocess.check_output(['gh','api','--paginate','--slurp',f'repos/{REPO}/releases/{release["id"]}/assets?per_page=100']))
    existing={a['name'] for page in pages for a in page}
    for name,a in assets.items():
        run('gh','release','upload','publications-current','--repo',REPO,'--clobber',str(flat/name))
        run('gh','release','download','publications-current','--repo',REPO,'--pattern',name,'--dir',str(verify))
        assert (verify/name).stat().st_size==a['size'] and sha(verify/name)==a['sha256']
    run('gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(cache))
    sums=cache/'SHA256SUMS.txt'
    lines=[line for line in sums.read_text().splitlines() if line.split() and line.split()[-1].lstrip('*') not in assets]
    lines.extend(f'{a["sha256"]}  {name}' for name,a in assets.items());sums.write_text('\n'.join(lines)+'\n')
    run('gh','release','upload','publications-current','--repo',REPO,'--clobber',str(sums))
    run('gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(verify))
    assert (verify/'SHA256SUMS.txt').read_bytes()==sums.read_bytes()
    receipt={'verified_archive_commit':request['verified_archive_commit'],'archive_success_run':request['archive_success_run'],'assets':request['assets'],'bundle':request['bundle'],'all_downloaded_bytes_verified':True,'source_paragraphs_and_notes':request['coverage'],'visual_qa':request['visual_qa'],'provenance':request['provenance']}
    Path('galindo-public-verification.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    print('Six public files re-downloaded and checksum verified; unrelated release checksums retained.')
