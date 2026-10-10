import os,json,base64,hashlib,pathlib,subprocess,tempfile,tarfile
assert os.environ.get('GITHUB_ACTIONS')=='true'
REPO='takochanchan/takochanchan.github.io';assert os.environ['GITHUB_REPOSITORY']==REPO
q=json.loads(pathlib.Path('.robles-public-request.json').read_text());assert q['verified_archive_commit']=='be383785c5a89daeb0b8d87e5f69fc7d5cc703ca'
assert q['visual_review']['all_pages_reviewed'] is True
assert q['visual_review']['page_counts']==[481,487]
assert q['visual_review']['reviewed_page_count']==968 and q['visual_review']['defect_count']==0
assert q['visual_review']['volume_1_reviewed_ranges']==[[1,481]] and q['visual_review']['volume_2_reviewed_ranges']==[[1,487]]
assert q['visual_review']['volume_1_pdf_sha256']=='ea431574a740c0ec3856da0cb30c805625290c68e7b671e35acd0e32bb22eaee'
assert q['visual_review']['volume_2_pdf_sha256']=='7ac10a0c5f7f13c19f796c159bacc5702e9f61ad59498963fd2bec4aed7e028b'
assert len(q['assets'])==4 and all(x['filename'].endswith(('.pdf','.epub')) for x in q['assets'])
assert q['bundle']['sha256']=='bb8d7315dc99757539288e64f6a2fa23dd5f7a1a16765a90d1f06ce7556aa71e'
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
# Preserve every other publication's checksum record; update only these four names.
r=subprocess.run(['gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(root)],capture_output=True,text=True)
assert r.returncode==0,r.stderr
cs=root/'SHA256SUMS.txt';lines=[line for line in cs.read_text().splitlines() if line.split() and line.split()[-1].lstrip('*') not in expected];lines += [f"{a['sha256']}  {name}" for name,a in expected.items()];cs.write_text('\n'.join(lines)+'\n');run('gh','release','upload','publications-current','--repo',REPO,'--clobber',str(cs))
run('gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(verify));assert (verify/'SHA256SUMS.txt').read_bytes()==cs.read_bytes()
pathlib.Path('robles-public-verification.json').write_text(json.dumps({'verified_archive_commit':q['verified_archive_commit'],'assets':q['assets'],'all_downloaded_bytes_verified':True},indent=2))
