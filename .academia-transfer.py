import os,json,base64,hashlib,pathlib,subprocess,tempfile,tarfile
assert os.environ.get('GITHUB_ACTIONS')=='true'
REPO='takochanchan/takochanchan.github.io';assert os.environ['GITHUB_REPOSITORY']==REPO
q=json.loads(pathlib.Path('.academia-public-request.json').read_text());assert len(q['verified_archive_commit'])==40
root=pathlib.Path(tempfile.mkdtemp());bundle=root/'public.tar.gz';h=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def run(*args,**kw):return subprocess.run(args,check=True,**kw)
def api(endpoint):return json.loads(subprocess.check_output(['gh','api',endpoint]))
with bundle.open('wb') as f:
 for oid in q['bundle']['chunks']:
  b=api(f'repos/{REPO}/git/blobs/{oid}');f.write(base64.b64decode(b['content']))
assert bundle.stat().st_size==q['bundle']['size'] and h(bundle)==q['bundle']['sha256']
expected={x['filename']:x for x in q['assets']};assert len(expected)==2
with tarfile.open(bundle) as t:
 assert set(m.name for m in t.getmembers())==set(expected)
 for m in t.getmembers():assert m.isfile() and pathlib.PurePosixPath(m.name).name==m.name
 t.extractall(root,filter='data')
for name,a in expected.items():
 p=root/name;assert p.stat().st_size==a['size'] and h(p)==a['sha256']
 release=api(f'repos/{REPO}/releases/tags/publications-current')
 prior=[v for v in release['assets'] if v['name']==name]
 if prior:
  assert len(prior)==1 and prior[0]['size']==a['size'] and prior[0]['digest']=='sha256:'+a['sha256'],'Existing target differs; do not overwrite'
 else:run('gh','release','upload','publications-current','--repo',REPO,str(p))
verify=root/'verify';verify.mkdir()
for name,a in expected.items():
 run('gh','release','download','publications-current','--repo',REPO,'--pattern',name,'--dir',str(verify));p=verify/name;assert p.stat().st_size==a['size'] and h(p)==a['sha256']
def checksum_asset():
 r=api(f'repos/{REPO}/releases/tags/publications-current');items=[x for x in r['assets'] if x['name']=='SHA256SUMS.txt'];assert len(items)==1
 return {k:items[0][k] for k in ['id','size','digest','updated_at']}
def values(path):
 out={}
 for line in path.read_text().splitlines():
  if line.split():
   fields=line.split();assert len(fields)==2;name=fields[1].lstrip('*');assert name not in out;out[name]=fields[0]
 return out
# The established global Actions group serializes compliant writers. Re-read
# the current shared checksum asset immediately before this target-only edit.
cs=root/'SHA256SUMS.txt';preserved=None
for attempt in range(3):
 before=checksum_asset()
 run('gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(root),'--clobber')
 if checksum_asset()!=before:continue
 baseline=values(cs);preserved={k:v for k,v in baseline.items() if k not in expected}
 lines=[line for line in cs.read_text().splitlines() if line.split() and line.split()[-1].lstrip('*') not in expected]
 lines += [f"{a['sha256']}  {name}" for name,a in expected.items()]
 cs.write_text('\n'.join(lines)+'\n')
 if checksum_asset()!=before:continue
 run('gh','release','upload','publications-current','--repo',REPO,'--clobber',str(cs));break
else:raise RuntimeError('Concurrent checksum updates; retain current publication and retry against fresh state')
run('gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(verify));remote=values(verify/'SHA256SUMS.txt')
assert all(remote.get(k)==v for k,v in preserved.items())
assert all(remote.get(k)==v['sha256'] for k,v in expected.items())
pathlib.Path('academia-public-verification.json').write_text(json.dumps({'verified_archive_commit':q['verified_archive_commit'],'assets':q['assets'],'all_downloaded_bytes_verified':True,'all_other_checksum_entries_preserved':True,'preserved_checksum_entries':len(preserved),'checksum_asset':checksum_asset()},indent=2))
