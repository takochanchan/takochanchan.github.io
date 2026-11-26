import os,json,hashlib,pathlib,subprocess,tempfile,tarfile,re
assert os.environ.get('GITHUB_ACTIONS')=='true'
REPO='takochanchan/takochanchan.github.io';assert os.environ['GITHUB_REPOSITORY']==REPO
q=json.loads(pathlib.Path('.rome1617-public-request.json').read_text())
ledger=json.loads(pathlib.Path('master-archive.json').read_text())
assert re.fullmatch(r'[0-9a-f]{40}',q['verified_archive_commit'])
assert ledger['archive_commit']==q['verified_archive_commit']
assert q['slugs']==['san-juan-de-dios-constituciones-rome-1617']
for slug in q['slugs']:assert ledger['publications'][slug]==f'publications/{slug}/master.docx'
root=pathlib.Path(tempfile.mkdtemp());bundle=root/'public.tar.gz'
def h(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def run(*args,**kw):return subprocess.run(args,check=True,**kw)
with bundle.open('xb') as f:
 for i,part in enumerate(q['bundle']['parts']):
  assert part['index']==i and part['start']==f.tell()
  assert part['part']==f'{i:03}.bin'
  path='.rome1617-public-parts/'+part['part']
  b=subprocess.check_output(['git','show','HEAD:'+path])
  assert len(b)==part['size'] and hashlib.sha256(b).hexdigest()==part['sha256']
  f.write(b)
assert bundle.stat().st_size==q['bundle']['size'] and h(bundle)==q['bundle']['sha256']
expected={x['filename']:x for x in q['assets']}
assert set(expected)=={f'Constitutioni_San_Giovanni_di_Dio_Rome_1617_Japanese.{ext}' for ext in ('pdf','epub')}
with tarfile.open(bundle) as t:
 assert [m.name for m in t.getmembers()]==list(expected)
 for m in t.getmembers():assert m.isfile() and pathlib.PurePosixPath(m.name).name==m.name
 t.extractall(root,filter='data')
for name,a in expected.items():
 p=root/name;assert p.stat().st_size==a['size'] and h(p)==a['sha256']
tag='publications-002'
release=json.loads(subprocess.check_output(['gh','release','view',tag,'--repo',REPO,'--json','id,assets']))
names={x['name'] for x in release['assets']}
assert len(names | set(expected) | {'SHA256SUMS.txt'})<=1000
verify=root/'verify';verify.mkdir()
def download(name):
 run('gh','release','download',tag,'--repo',REPO,'--pattern',name,'--dir',str(verify))
 return verify/name
for name,a in expected.items():
 if name not in names:run('gh','release','upload',tag,'--repo',REPO,str(root/name))
 p=download(name)
 assert p.stat().st_size==a['size'] and h(p)==a['sha256']
cs=download('SHA256SUMS.txt');lines=cs.read_text().splitlines()
old=[line for line in lines if line.split() and line.split()[-1].lstrip('*') not in expected]
target=root/'SHA256SUMS.txt'
target.write_text('\n'.join(old+[f"{a['sha256']}  {name}" for name,a in expected.items()])+'\n')
if target.read_bytes()!=cs.read_bytes():run('gh','release','upload',tag,'--repo',REPO,'--clobber',str(target))
cs.unlink();assert download('SHA256SUMS.txt').read_bytes()==target.read_bytes()
pathlib.Path('rome1617-public-verification.json').write_text(json.dumps({'verified_archive_commit':q['verified_archive_commit'],'tag':tag,'assets':q['assets'],'all_downloaded_bytes_verified':True},indent=2))
