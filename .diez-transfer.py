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
request = json.loads(Path('.diez-public-request.json').read_text())
assert re.fullmatch(r'[0-9a-f]{40}', request['verified_archive_commit'])
assert json.loads(Path('master-archive.json').read_text())['archive_commit'] == request['verified_archive_commit']
expected = {a['filename']: a for a in request['assets']}
assert len(expected) == len(request['assets']) == 2
assert all(re.fullmatch(r'Diez_Noticias_MSS3023_Vol1_JA_Reviewed\.(pdf|epub)', name) for name in expected)
root=Path(Path('.diez-extracted-path.txt').read_text())
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def run(*args,**kwargs): return subprocess.run(args,check=True,**kwargs)
release = json.loads(subprocess.check_output(['gh', 'api', f'repos/{REPO}/releases/tags/publications-current']))
pages = json.loads(subprocess.check_output(['gh', 'api', '--paginate', '--slurp', f'repos/{REPO}/releases/{release["id"]}/assets?per_page=100']))
existing_names = {asset['name'] for page in pages for asset in page}
verify = root / 'verify'
verify.mkdir()
for name, asset in expected.items():
    if name not in existing_names:
        run('gh', 'release', 'upload', 'publications-current', '--repo', REPO, str(root / name))
    run('gh', 'release', 'download', 'publications-current', '--repo', REPO, '--pattern', name, '--dir', str(verify))
    assert (verify / name).stat().st_size == asset['size'] and sha(verify / name) == asset['sha256']
# Preserve all checksum entries belonging to other publications.
run('gh', 'release', 'download', 'publications-current', '--repo', REPO, '--pattern', 'SHA256SUMS.txt', '--dir', str(root))
checksums = root / 'SHA256SUMS.txt'
lines = [line for line in checksums.read_text().splitlines() if line.split() and line.split()[-1].lstrip('*') not in expected]
lines.extend(f'{asset["sha256"]}  {name}' for name, asset in expected.items())
checksums.write_text('\n'.join(lines) + '\n')
run('gh', 'release', 'upload', 'publications-current', '--repo', REPO, '--clobber', str(checksums))
run('gh', 'release', 'download', 'publications-current', '--repo', REPO, '--pattern', 'SHA256SUMS.txt', '--dir', str(verify))
assert (verify / 'SHA256SUMS.txt').read_bytes() == checksums.read_bytes()
Path('diez-public-verification.json').write_text(json.dumps({'verified_archive_commit': request['verified_archive_commit'], 'assets': request['assets'], 'bundle': request['bundle'], 'all_downloaded_bytes_verified': True}, indent=2) + '\n')

