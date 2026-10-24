import hashlib, json, os, pathlib, subprocess
assert os.environ.get('GITHUB_ACTIONS')=='true'
REPO='takochanchan/takochanchan.github.io'
assert os.environ['GITHUB_REPOSITORY']==REPO
q=json.loads(pathlib.Path('.juarros-public-request.json').read_text())
assert q['verified_archive_commit']=='ec8f332159971ec03b6dd0bbb05b767a68444484'
root=pathlib.Path('juarros-stage')
def run(*args): return subprocess.run(args,check=True)
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
expected={x['filename']:x for x in q['assets']}
for name,a in expected.items():
    p=root/name
    assert p.stat().st_size==a['size'] and digest(p)==a['sha256']
    run('gh','release','upload','publications-current','--repo',REPO,'--clobber',str(p))
verify=root/'verify';verify.mkdir(exist_ok=True)
for name,a in expected.items():
    run('gh','release','download','publications-current','--repo',REPO,'--pattern',name,'--dir',str(verify))
    p=verify/name
    assert p.stat().st_size==a['size'] and digest(p)==a['sha256']
# Re-read shared checksums immediately before replacing only these two lines.
run('gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(root))
cs=root/'SHA256SUMS.txt'
before=cs.read_text().splitlines()
other=[x for x in before if x.split() and x.split()[-1].lstrip('*') not in expected]
cs.write_text('\n'.join(other+[f"{a['sha256']}  {name}" for name,a in expected.items()])+'\n')
run('gh','release','upload','publications-current','--repo',REPO,'--clobber',str(cs))
run('gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(verify))
assert (verify/'SHA256SUMS.txt').read_bytes()==cs.read_bytes()
assets=json.loads(subprocess.check_output(['gh','release','view','publications-current','--repo',REPO,'--json','assets']))['assets']
records=[x for x in assets if x['name'] in expected]
assert len(records)==2
pathlib.Path('juarros-public-verification.json').write_text(json.dumps({'verified_archive_commit':q['verified_archive_commit'],'assets':q['assets'],'release_records':records,'all_downloaded_bytes_verified':True,'unrelated_checksum_lines_preserved':len(other)},indent=2)+'\n')
