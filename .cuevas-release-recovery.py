import hashlib,json,os,pathlib,subprocess,tempfile,urllib.request
assert os.environ.get('GITHUB_ACTIONS')=='true'
REPO='takochanchan/takochanchan.github.io';assert os.environ['GITHUB_REPOSITORY']==REPO
q=json.loads(pathlib.Path('.cuevas-release-recovery.json').read_text())
def api(path,*args):return json.loads(subprocess.check_output(['gh','api',f'repos/{REPO}/{path}',*args],text=True))
build_run=int(os.environ['GITHUB_RUN_ID']);build_commit=os.environ['GITHUB_SHA']
jobs=api('actions/runs/'+str(build_run)+'/jobs')['jobs']
assert any(s['name']=='Build updated publication references'and s['conclusion']=='success'for j in jobs for s in j['steps'])
run=api('actions/runs/'+str(build_run));assert run['head_sha']==build_commit
root=pathlib.Path(tempfile.mkdtemp());verified=[]
for a in q['assets']:
    actual=api('releases/assets/'+str(a['release_asset_id']))
    assert actual['size']==a['size']and actual['digest']=='sha256:'+a['sha256']
    assert actual['name']==a['filename'], 'Release asset name changed unexpectedly'
    if a['release_asset_id']not in q['already_redownload_verified']:
        p=root/a['filename'];h=hashlib.sha256();size=0
        with urllib.request.urlopen(actual['browser_download_url'],timeout=120)as response,p.open('wb')as out:
            while data:=response.read(1048576):out.write(data);h.update(data);size+=len(data)
        assert size==a['size']and h.hexdigest()==a['sha256'],a['filename']
    verified.append({'filename':a['filename'],'asset_id':a['release_asset_id'],'sha256':a['sha256'],'carried_prior_download_proof':a['release_asset_id']in q['already_redownload_verified']})
    print('Verified '+a['filename'],flush=True)
subprocess.run(['gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(root)],check=True)
cs=root/'SHA256SUMS.txt';expected={a['filename']:a for a in q['assets']};lines=[line for line in cs.read_text().splitlines()if line.split()and line.split()[-1].lstrip('*')not in expected];lines += [f"{a['sha256']}  {name}"for name,a in expected.items()];cs.write_text('\n'.join(lines)+'\n')
subprocess.run(['gh','release','upload','publications-current','--repo',REPO,'--clobber',str(cs)],check=True)
directory=root/'checksum-verify';directory.mkdir();subprocess.run(['gh','release','download','publications-current','--repo',REPO,'--pattern','SHA256SUMS.txt','--dir',str(directory)],check=True);assert (directory/'SHA256SUMS.txt').read_bytes()==cs.read_bytes()
pathlib.Path('cuevas-public-verification.json').write_text(json.dumps({'verified_archive_commit':q['verified_archive_commit'],'validated_public_build_run':build_run,'validated_public_build_commit':build_commit,'verified_assets':verified,'all_downloaded_bytes_verified':True,'checksum_manifest_redownload_verified':True},indent=2)+'\n')
