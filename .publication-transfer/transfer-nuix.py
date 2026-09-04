#!/usr/bin/env python3
"""Execute only on the GitHub-hosted one-shot Actions runner, never locally."""
import base64, hashlib, io, json, os, pathlib, subprocess, tarfile, tempfile, urllib.request

assert os.environ.get('GITHUB_ACTIONS')=='true', 'GitHub-hosted execution required'
repo=os.environ['GITHUB_REPOSITORY']
assert repo=='takochanchan/takochanchan.github.io'
request=json.loads(pathlib.Path('.publication-upload-requests/nuix-reflexiones-imparciales-1783-ja.json').read_text())
assert request['slug']=='nuix-reflexiones-imparciales-1783-ja'
assert request['release_tag']=='publications-current'
assert len(request['verified_archive_commit'])==40
def digest(data):return hashlib.sha256(data).hexdigest()
def github_json(path):
    req=urllib.request.Request('https://api.github.com/repos/'+repo+'/'+path,headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'})
    with urllib.request.urlopen(req) as r:return json.load(r)
data=b''
for blob in request['bundle']['chunks']:
    assert len(blob)==40 and all(c in '0123456789abcdef' for c in blob)
    response=github_json('git/blobs/'+blob)
    assert response['encoding']=='base64'
    data+=base64.b64decode(response['content'])
assert len(data)==request['bundle']['size'] and digest(data)==request['bundle']['sha256']
with tempfile.TemporaryDirectory() as temp:
    temp=pathlib.Path(temp);expected={a['filename']:a for a in request['assets']}
    with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as archive:
        files=[m for m in archive.getmembers() if m.isfile()]
        assert len(files)==len(expected)
        assert {m.name for m in files}==set(expected)
        for member in archive.getmembers():
            assert member.isfile() and member.name==pathlib.PurePosixPath(member.name).name
            assert member.name.endswith(('.pdf','.epub'))
            payload=archive.extractfile(member).read();a=expected[member.name]
            assert len(payload)==a['size'] and digest(payload)==a['sha256']
            (temp/member.name).write_bytes(payload)
    paths=[str(temp/name) for name in expected]
    subprocess.run(['gh','release','upload','publications-current',*paths,'--repo',repo],check=True)
    verify=temp/'verify';verify.mkdir()
    for name in expected:
        subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern',name,'--dir',str(verify)],check=True)
        payload=(verify/name).read_bytes();a=expected[name]
        assert len(payload)==a['size'] and digest(payload)==a['sha256']
    pathlib.Path('release-byte-verification.json').write_text(json.dumps({'slug':request['slug'],'verified_archive_commit':request['verified_archive_commit'],'assets':request['assets'],'all_downloaded_bytes_verified':True},indent=2)+'\n')
