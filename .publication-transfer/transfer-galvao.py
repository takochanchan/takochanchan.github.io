#!/usr/bin/env python3
"""Execute only on the GitHub-hosted one-shot Actions runner, never locally."""
import base64, hashlib, io, json, os, pathlib, subprocess, tarfile, tempfile, urllib.request, importlib.util

assert os.environ.get('GITHUB_ACTIONS')=='true', 'GitHub-hosted execution required'
repo=os.environ['GITHUB_REPOSITORY']
assert repo=='takochanchan/takochanchan.github.io'
request=json.loads(pathlib.Path('.publication-upload-requests/galvao-tratado-descobrimentos-1563.json').read_text())
assert request['slug']=='galvao-tratado-descobrimentos-1563'
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
    spec=importlib.util.spec_from_file_location('epub_validator', 'scripts/validate-epubs.py')
    validator=importlib.util.module_from_spec(spec);spec.loader.exec_module(validator)
    validator.PUBLIC_ROOT=temp
    epub_name=next(name for name in expected if name.endswith('.epub'))
    validator.validate_epub({'slug':request['slug'],'title':'発見誌','epub':epub_name})
    paths=[str(temp/name) for name in expected]
    subprocess.run(['gh','release','upload','publications-current',*paths,'--repo',repo],check=True)
    verify=temp/'verify';verify.mkdir()
    for name in expected:
        subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern',name,'--dir',str(verify)],check=True)
        payload=(verify/name).read_bytes();a=expected[name]
        assert len(payload)==a['size'] and digest(payload)==a['sha256']
    # Merge only these two new asset checksums into the current shared list.
    sums=temp/'checksums';sums.mkdir()
    subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern','SHA256SUMS.txt','--dir',str(sums)],check=True)
    old=(sums/'SHA256SUMS.txt').read_text()
    lines=[line for line in old.splitlines() if line.strip() and line.split()[-1].lstrip('*') not in expected]
    lines.extend(expected[name]['sha256']+'  '+name for name in expected)
    checksum_file=sums/'SHA256SUMS.txt';checksum_file.write_text('\n'.join(lines)+'\n')
    subprocess.run(['gh','release','upload','publications-current',str(checksum_file),'--repo',repo,'--clobber'],check=True)
    checked=temp/'checksums-verify';checked.mkdir()
    subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern','SHA256SUMS.txt','--dir',str(checked)],check=True)
    current=(checked/'SHA256SUMS.txt').read_text()
    for name in expected:
        assert expected[name]['sha256']+'  '+name in current
    pathlib.Path('release-byte-verification.json').write_text(json.dumps({'slug':request['slug'],'verified_archive_commit':request['verified_archive_commit'],'assets':request['assets'],'all_downloaded_bytes_verified':True},indent=2)+'\n')

