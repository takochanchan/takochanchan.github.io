"""Actions-only adaptation of the verified Herrera release transfer."""
import base64
import gzip
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import tarfile
import tempfile

assert os.environ.get('GITHUB_ACTIONS') == 'true'
REPO = 'takochanchan/takochanchan.github.io'
assert os.environ['GITHUB_REPOSITORY'] == REPO
request = json.loads(Path('.morazan-public-request.json').read_text())
assert re.fullmatch(r'[0-9a-f]{40}', request['verified_archive_commit'])
assert json.loads(Path('master-archive.json').read_text())['archive_commit'] == request['verified_archive_commit']
expected = {a['filename']: a for a in request['assets']}
assert len(expected) == len(request['assets']) == 4
assert set(expected) == {b['stem']+'.'+ext for b in json.loads(Path('.morazan-books.json').read_text()) for ext in ['pdf','epub']}
root = Path(tempfile.mkdtemp())
bundle = root / 'public.tar.gz'
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def run(*args, **kwargs):
    return subprocess.run(args, check=True, **kwargs)
with bundle.open('wb') as out:
    for oid in request['bundle']['chunks']:
        assert re.fullmatch(r'[0-9a-f]{40}', oid)
        blob = json.loads(subprocess.check_output(['gh', 'api', f'repos/{REPO}/git/blobs/{oid}']))
        assert blob['sha'] == oid and blob['encoding'] == 'base64'
        data = base64.b64decode(blob['content'])
        assert blob['size'] == len(data)
        assert hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest() == oid
        out.write(data)
assert bundle.stat().st_size == request['bundle']['size'] and sha(bundle) == request['bundle']['sha256']
with gzip.open(bundle, 'rb') as check:
    while check.read(1024 * 1024):
        pass
with tarfile.open(bundle) as archive:
    members = archive.getmembers()
    assert len(members) == 4 and {m.name for m in members} == set(expected)
    assert all(m.isfile() and PurePosixPath(m.name).name == m.name for m in members)
    archive.extractall(root, filter='data')
for name, asset in expected.items():
    local = root / name
    assert local.stat().st_size == asset['size'] and sha(local) == asset['sha256']

# Derive catalogue thumbnails from approved PDFs and update only own assets.
manifest=json.loads(Path('assets-manifest.json').read_text())
for b in json.loads(Path('.morazan-books.json').read_text()):
    cover_path='publications/'+b['slug']+'/cover.jpg'
    cover=Path('static')/cover_path
    cover.parent.mkdir(parents=True,exist_ok=True)
    run('pdftoppm','-f','1','-singlefile','-scale-to','1000','-jpeg',str(root/(b['stem']+'.pdf')),str(cover.with_suffix('')))
    manifest['assets']=[a for a in manifest['assets'] if a['path']!=cover_path]
    manifest['assets'].append({'path':cover_path,'url':'https://takochanchan.github.io/'+cover_path,'size':cover.stat().st_size,'sha256':sha(cover)})
Path('assets-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
Path('.morazan-extracted-path.txt').write_text(str(root))
# The EPUB validator uses the approved bytes, not a fresh document conversion.
for a in request['assets']:
    if a['filename'].endswith('.epub'):
        destination=Path('.morazan-epub-validation')/a['path'];destination.parent.mkdir(parents=True,exist_ok=True)
        destination.write_bytes((root/a['filename']).read_bytes())
