import os,json,hashlib,pathlib,subprocess,tempfile
assert os.environ.get('GITHUB_ACTIONS')=='true'
REPO='takochanchan/takochanchan.github.io';assert os.environ['GITHUB_REPOSITORY']==REPO
q=json.loads(pathlib.Path('.publication-upload-requests/paravey-fou-sang-1844-1847.json').read_text())
root=pathlib.Path(tempfile.mkdtemp())
def run(*args):subprocess.run(args,check=True)
for a in q['assets']:
 run('gh','release','download','publications-current','--repo',REPO,'--pattern',a['filename'],'--dir',str(root))
 p=root/a['filename'];assert p.stat().st_size==a['size'] and hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256']
run('gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(root))
sums={line.split()[-1].lstrip('*'):line.split()[0] for line in (root/'SHA256SUMS.txt').read_text().splitlines() if line.split()}
assert all(sums[a['filename']]==a['sha256'] for a in q['assets'])
pathlib.Path('paravey-assets-reverified.json').write_text(json.dumps({'verified_archive_commit':q['verified_archive_commit'],'assets':q['assets'],'all_downloaded_bytes_verified':True},indent=2))
print('Four Paravey final assets and their published checksums verified.')
