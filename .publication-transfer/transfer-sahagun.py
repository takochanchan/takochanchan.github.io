#!/usr/bin/env python3
"""Run only on the approved GitHub-hosted publication workflow."""
import base64,hashlib,io,json,os,pathlib,subprocess,tarfile,tempfile,urllib.request
from concurrent.futures import ThreadPoolExecutor
assert os.environ.get('GITHUB_ACTIONS')=='true'
repo=os.environ['GITHUB_REPOSITORY'];assert repo=='takochanchan/takochanchan.github.io'
request=json.loads(pathlib.Path('.publication-upload-requests/sahagun-20260909.json').read_text())
assert request['slug']=='sahagun-historia-general-nueva-espana'
assert request['release_tag']=='publications-current' and len(request['verified_archive_commit'])==40
def digest(data):return hashlib.sha256(data).hexdigest()
def api(path):
 req=urllib.request.Request('https://api.github.com/repos/'+repo+'/'+path,headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json'})
 with urllib.request.urlopen(req,timeout=60) as r:return json.load(r)
def chunk(oid):
 assert len(oid)==40 and all(c in '0123456789abcdef' for c in oid)
 r=api('git/blobs/'+oid);assert r['encoding']=='base64';return base64.b64decode(r['content'])
with ThreadPoolExecutor(max_workers=8) as pool:data=b''.join(pool.map(chunk,request['bundle']['chunks']))
assert len(data)==request['bundle']['size'] and digest(data)==request['bundle']['sha256']
with tempfile.TemporaryDirectory() as temp:
 temp=pathlib.Path(temp);expected={a['filename']:a for a in request['assets']}
 assert len(expected)==2
 with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as archive:
  members=archive.getmembers();assert {m.name for m in members}==set(expected)
  for m in members:
   assert m.isfile() and m.name==pathlib.PurePosixPath(m.name).name and m.name.endswith(('.pdf','.epub'))
   content=archive.extractfile(m).read();a=expected[m.name]
   assert len(content)==a['size'] and digest(content)==a['sha256'];(temp/m.name).write_bytes(content)
 release=api('releases/tags/publications-current');existing={a['name'] for a in release['assets']}
 verify=temp/'verify';verify.mkdir()
 for name,a in expected.items():
  if name not in existing:subprocess.run(['gh','release','upload','publications-current',str(temp/name),'--repo',repo],check=True)
  subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern',name,'--dir',str(verify)],check=True)
  content=(verify/name).read_bytes();assert len(content)==a['size'] and digest(content)==a['sha256']
 # Preserve all unrelated checksums from the latest release ledger.
 subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern','SHA256SUMS.txt','--dir',str(temp)],check=True)
 sums=temp/'SHA256SUMS.txt';keep=[]
 for line in sums.read_text().splitlines():
  fields=line.split(maxsplit=1);name=fields[1].lstrip('*').rsplit('/',1)[-1] if len(fields)==2 else ''
  if name not in expected:keep.append(line)
 keep.extend(a['sha256']+'  '+name for name,a in expected.items());sums.write_text('\n'.join(keep)+'\n')
 subprocess.run(['gh','release','upload','publications-current',str(sums),'--repo',repo,'--clobber'],check=True)
 subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern','SHA256SUMS.txt','--dir',str(verify)],check=True)
 assert (verify/'SHA256SUMS.txt').read_bytes()==sums.read_bytes()
 pathlib.Path('sahagun-release-verification.json').write_text(json.dumps({'slug':request['slug'],'verified_archive_commit':request['verified_archive_commit'],'assets':request['assets'],'all_downloaded_bytes_verified':True},indent=2)+'\n')
 # This branch holds transfer bytes only and is never merged into main.
 subprocess.run(['gh','api','--method','DELETE','repos/'+repo+'/git/refs/heads/agent%2Fsahagun-assets-20260909'],check=True)
