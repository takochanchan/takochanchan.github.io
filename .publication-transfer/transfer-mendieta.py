#!/usr/bin/env python3
"""One-shot release transfer; run exclusively in GitHub-hosted Actions."""
import base64
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import subprocess
import tarfile
import tempfile
import urllib.request

assert os.environ.get('GITHUB_ACTIONS') == 'true'
repo = os.environ['GITHUB_REPOSITORY']
assert repo == 'takochanchan/takochanchan.github.io'
r = json.loads(Path('.publication-upload-requests/mendieta-1870.json').read_text())
assert r['slug'] == 'mendieta-historia-eclesiastica-indiana-1870'
assert len(r['verified_archive_commit']) == 40
assert json.loads(Path('master-archive.json').read_text())['archive_commit'] == r['verified_archive_commit']

def sha(data):
    return hashlib.sha256(data).hexdigest()

def api(path):
    req = urllib.request.Request('https://api.github.com/repos/' + repo + '/' + path, headers={'Authorization':'Bearer ' + os.environ['GH_TOKEN'], 'Accept':'application/vnd.github+json'})
    with urllib.request.urlopen(req) as response:
        return json.load(response)

data = b''
for blob in r['bundle']['chunks']:
    d = api('git/blobs/' + blob)
    assert d['encoding'] == 'base64'
    data += base64.b64decode(d['content'])
assert len(data) == r['bundle']['size'] and sha(data) == r['bundle']['sha256']
expected = {a['filename']:a for a in r['assets']}
assert len(expected) == 2 and {Path(n).suffix for n in expected} == {'.pdf','.epub'}
with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp)
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as tar:
        members = tar.getmembers()
        assert len(members) == 2 and {m.name for m in members} == set(expected)
        for m in members:
            assert m.isfile() and m.name == PurePosixPath(m.name).name
            b = tar.extractfile(m).read()
            assert len(b) == expected[m.name]['size'] and sha(b) == expected[m.name]['sha256']
            (tmp / m.name).write_bytes(b)
    # Preserve the latest checksum lines of all other publications.
    release = api('releases/tags/publications-current')
    names = {a['name'] for a in release['assets']}
    checksums = tmp / 'SHA256SUMS.txt'
    if 'SHA256SUMS.txt' in names:
        subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern','SHA256SUMS.txt','--dir',str(tmp)], check=True)
        lines = checksums.read_text().splitlines()
    else:
        lines = []
    lines = [line for line in lines if line.split() and line.split()[-1].lstrip('*') not in expected]
    lines += [f"{a['sha256']}  {name}" for name,a in expected.items()]
    checksums.write_text('\n'.join(lines) + '\n')
    subprocess.run(['gh','release','upload','publications-current','--repo',repo,*[str(tmp/n) for n in expected],str(checksums),'--clobber'],check=True)
    verify = tmp / 'verify'
    verify.mkdir()
    for name,a in expected.items():
        subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern',name,'--dir',str(verify)],check=True)
        b = (verify/name).read_bytes()
        assert len(b) == a['size'] and sha(b) == a['sha256']
    subprocess.run(['gh','release','download','publications-current','--repo',repo,'--pattern','SHA256SUMS.txt','--dir',str(verify)],check=True)
    assert (verify/'SHA256SUMS.txt').read_bytes() == checksums.read_bytes()
Path('release-byte-verification.json').write_text(json.dumps({'slug':r['slug'],'verified_archive_commit':r['verified_archive_commit'],'assets':r['assets'],'all_downloaded_bytes_verified':True},indent=2)+'\n')
