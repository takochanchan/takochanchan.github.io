#!/usr/bin/env python3
"""Execute only on the GitHub-hosted one-shot Actions runner, never locally."""
import base64, hashlib, io, json, os, pathlib, subprocess, tarfile, tempfile, urllib.request

assert os.environ.get('GITHUB_ACTIONS')=='true', 'GitHub-hosted execution required'
repo=os.environ['GITHUB_REPOSITORY']
assert repo=='takochanchan/takochanchan.github.io'
request=json.loads(pathlib.Path('.publication-upload-requests/oviedo.json').read_text())
assert request['slug']=='oviedo-historia-general-natural-indias-1851-1855'
assert request['release_tag']=='publications-current'
assert len(request['verified_archive_commit'])==40
def digest(data):return hashlib.sha256(data).hexdigest()
def github_json(path):
    req=urllib.request.Request('https://api.github.com/repos/'+repo+'/'+path,headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'})
    with urllib.request.urlopen(req) as r:return json.load(r)
with tempfile.TemporaryDirectory() as temp:
    temp=pathlib.Path(temp);expected={a['filename']:a for a in request['assets']}
    assert len(expected)==8
    payload=b''.join(base64.b64decode(github_json('git/blobs/'+sha)['content']) for sha in request['bundle']['chunks'])
    assert len(payload)==request['bundle']['size'] and digest(payload)==request['bundle']['sha256']
    import gzip
    gzip.decompress(payload)
    with tarfile.open(fileobj=io.BytesIO(payload),mode='r:gz') as archive:
        members=archive.getmembers()
        assert len(members)==8 and {m.name for m in members}==set(expected)
        for member in members:
            assert member.isfile() and member.name==pathlib.PurePosixPath(member.name).name
            data=archive.extractfile(member).read(); a=expected[member.name]
            assert len(data)==a['size'] and digest(data)==a['sha256']
            (temp/member.name).write_bytes(data)
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

