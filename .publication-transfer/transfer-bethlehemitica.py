#!/usr/bin/env python3
"""Execute only on the GitHub-hosted one-shot Actions runner, never locally."""
import base64, hashlib, io, json, os, pathlib, subprocess, tarfile, tempfile, urllib.request

assert os.environ.get('GITHUB_ACTIONS')=='true', 'GitHub-hosted execution required'
repo=os.environ['GITHUB_REPOSITORY']
assert repo=='takochanchan/takochanchan.github.io'
request=json.loads(pathlib.Path('.publication-upload-requests/garcia-historia-bethlehemitica-1723.json').read_text())
assert request['slug']=='garcia-historia-bethlehemitica-1723'
assert request['release_tag']=='publications-current'
assert len(request['verified_archive_commit'])==40
def digest(data):return hashlib.sha256(data).hexdigest()
def github_json(path):
    req=urllib.request.Request('https://api.github.com/repos/'+repo+'/'+path,headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'})
    with urllib.request.urlopen(req) as r:return json.load(r)
with tempfile.TemporaryDirectory() as temp:
    temp=pathlib.Path(temp);expected={a['filename']:a for a in request['assets']}
    for name,a in expected.items():
        assert name==pathlib.PurePosixPath(name).name and name.endswith(('.pdf','.epub'))
        payload=b''
        for chunk in a['chunks']:
            response=github_json('git/blobs/'+chunk['sha'])
            assert response['encoding']=='base64'
            part=base64.b64decode(response['content'])
            assert len(part)==chunk['size']
            assert hashlib.sha1(b'blob '+str(len(part)).encode()+b'\0'+part).hexdigest()==chunk['sha']
            payload+=part
        assert len(payload)==a['size'] and digest(payload)==a['sha256']
        (temp/name).write_bytes(payload)
    paths=[str(temp/name) for name in expected]
    subprocess.run(['gh','release','upload','publications-current',*paths,'--repo',repo],check=True)
    verify=temp/'verify';verify.mkdir()
    for name in expected:
        subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern',name,'--dir',str(verify)],check=True)
        payload=(verify/name).read_bytes();a=expected[name]
        assert len(payload)==a['size'] and digest(payload)==a['sha256']
    # Merge only this publication's checksums into the latest release ledger.
    sums=temp/'SHA256SUMS.txt'
    subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern','SHA256SUMS.txt','--dir',str(temp)],check=True)
    lines=sums.read_text().splitlines()
    keep=[]
    for line in lines:
        fields=line.split(maxsplit=1)
        filename=fields[1].lstrip('*').rsplit('/',1)[-1] if len(fields)==2 else ''
        if filename not in expected:keep.append(line)
    keep.extend(expected[name]['sha256']+'  '+name for name in expected)
    sums.write_text('\n'.join(keep)+'\n')
    subprocess.run(['gh','release','upload','publications-current',str(sums),'--repo',repo,'--clobber'],check=True)
    subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern','SHA256SUMS.txt','--dir',str(verify)],check=True)
    assert (verify/'SHA256SUMS.txt').read_bytes()==sums.read_bytes()
    pathlib.Path('release-byte-verification.json').write_text(json.dumps({'slug':request['slug'],'verified_archive_commit':request['verified_archive_commit'],'assets':request['assets'],'all_downloaded_bytes_verified':True},indent=2)+'\n')
