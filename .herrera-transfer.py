import os,json,base64,hashlib,pathlib,subprocess,tempfile,tarfile
assert os.environ.get('GITHUB_ACTIONS')=='true'
REPO='takochanchan/takochanchan.github.io';assert os.environ['GITHUB_REPOSITORY']==REPO
q=json.loads(pathlib.Path('.herrera-public-request.json').read_text());assert len(q['verified_archive_commit'])==40
root=pathlib.Path(tempfile.mkdtemp());bundle=root/'public.tar.gz';h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def run(*args,**kw):return subprocess.run(args,check=True,**kw)
with bundle.open('wb') as f:
 for oid in q['bundle']['chunks']:
  b=json.loads(subprocess.check_output(['gh','api',f'repos/{REPO}/git/blobs/{oid}']));f.write(base64.b64decode(b['content']))
assert bundle.stat().st_size==q['bundle']['size'] and h(bundle)==q['bundle']['sha256']
expected={x['filename']:x for x in q['assets']}
with tarfile.open(bundle) as t:
 assert set(m.name for m in t.getmembers())==set(expected)
 for m in t.getmembers():assert m.isfile() and pathlib.PurePosixPath(m.name).name==m.name
 t.extractall(root,filter='data')
for name,a in expected.items():
 p=root/name;assert p.stat().st_size==a['size'] and h(p)==a['sha256']
 run('gh','release','upload','publications-current','--repo',REPO,str(p))
verify=root/'verify';verify.mkdir()
for name,a in expected.items():
 run('gh','release','download','publications-current','--repo',REPO,'--pattern',name,'--dir',str(verify));p=verify/name;assert p.stat().st_size==a['size'] and h(p)==a['sha256']
# Preserve every other publication's checksum record; update only these eight names.
r=subprocess.run(['gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(root)],capture_output=True,text=True)
assert r.returncode==0,r.stderr
cs=root/'SHA256SUMS.txt';lines=[line for line in cs.read_text().splitlines() if line.split() and line.split()[-1].lstrip('*') not in expected];lines += [f"{a['sha256']}  {name}" for name,a in expected.items()];cs.write_text('\n'.join(lines)+'\n');run('gh','release','upload','publications-current','--repo',REPO,'--clobber',str(cs))
run('gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(verify));assert (verify/'SHA256SUMS.txt').read_bytes()==cs.read_bytes()
pathlib.Path('herrera-public-verification.json').write_text(json.dumps({'verified_archive_commit':q['verified_archive_commit'],'assets':q['assets'],'all_downloaded_bytes_verified':True},indent=2))
