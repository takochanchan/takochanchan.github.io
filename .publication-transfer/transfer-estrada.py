#!/usr/bin/env python3
"""GitHub Actions-only release upload and byte verification for Estrada."""
import base64, hashlib, io, json, os, pathlib, re, subprocess, tarfile, tempfile

assert os.environ.get('GITHUB_ACTIONS') == 'true', 'GitHub-hosted execution required'
REPO = 'takochanchan/takochanchan.github.io'
assert os.environ.get('GITHUB_REPOSITORY') == REPO
SLUG = 'estrada-descripcion-zapotitlan-suchitepeques-1579'
request = json.loads(pathlib.Path(f'.publication-upload-requests/{SLUG}.json').read_text())
assert request['slug'] == SLUG and request['release_tag'] == 'publications-002'
archive_head = json.loads(pathlib.Path('master-archive.json').read_text())['archive_commit']
assert request['verified_archive_commit'] == archive_head and re.fullmatch(r'[0-9a-f]{40}', archive_head)

def sha(data): return hashlib.sha256(data).hexdigest()
def gh_json(path):
    return json.loads(subprocess.check_output(['gh', 'api', path], text=True))

bundle = bytearray()
for blob in request['bundle']['chunks']:
    assert re.fullmatch(r'[0-9a-f]{40}', blob)
    response = gh_json(f'repos/{REPO}/git/blobs/{blob}')
    assert response['encoding'] == 'base64'
    bundle.extend(base64.b64decode(response['content']))
assert len(bundle) == request['bundle']['size'] and sha(bundle) == request['bundle']['sha256']
expected = {asset['filename']: asset for asset in request['assets']}
assert len(expected) == 2 and set(expected) == {
    'Juan_de_Estrada_Descripcion_de_Zapotitlan_y_Suchitepeques_1579_Japanese_Translation.pdf',
    'Juan_de_Estrada_Descripcion_de_Zapotitlan_y_Suchitepeques_1579_Japanese_Translation.epub',
}
with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    with tarfile.open(fileobj=io.BytesIO(bundle), mode='r:gz') as archive:
        members = [m for m in archive.getmembers() if m.isfile()]
        assert len(members) == len(expected) and {m.name for m in members} == set(expected)
        for member in members:
            assert member.name == pathlib.PurePosixPath(member.name).name
            data = archive.extractfile(member).read()
            record = expected[member.name]
            assert len(data) == record['size'] and sha(data) == record['sha256']
            (root / member.name).write_bytes(data)

    release = gh_json(f'repos/{REPO}/releases/tags/{request["release_tag"]}')
    asset_pages = json.loads(subprocess.check_output([
        'gh', 'api', '--paginate', '--slurp',
        f'repos/{REPO}/releases/{release["id"]}/assets?per_page=100'
    ], text=True))
    existing = {item['name'] for page in asset_pages for item in page}
    assert len(existing) <= 1000 and not (set(expected) & (existing - set(expected)))
    for name in expected:
        if name not in existing:
            subprocess.run(['gh', 'release', 'upload', request['release_tag'], '--repo', REPO, str(root / name)], check=True)

    verify = root / 'verify'
    verify.mkdir()
    for name, record in expected.items():
        subprocess.run(['gh', 'release', 'download', request['release_tag'], '--repo', REPO, '--pattern', name, '--dir', str(verify)], check=True)
        downloaded = (verify / name).read_bytes()
        assert len(downloaded) == record['size'] and sha(downloaded) == record['sha256']

    subprocess.run(['gh', 'release', 'download', request['release_tag'], '--repo', REPO, '--pattern', 'SHA256SUMS.txt', '--dir', str(root)], check=True)
    sums = root / 'SHA256SUMS.txt'
    lines = [line for line in sums.read_text().splitlines() if line.split() and pathlib.PurePosixPath(line.split()[-1].lstrip('*')).name not in expected]
    lines.extend(f'{asset["sha256"]}  {name}' for name, asset in expected.items())
    sums.write_text('\n'.join(lines) + '\n')
    subprocess.run(['gh', 'release', 'upload', request['release_tag'], '--repo', REPO, '--clobber', str(sums)], check=True)
    subprocess.run(['gh', 'release', 'download', request['release_tag'], '--repo', REPO, '--pattern', 'SHA256SUMS.txt', '--dir', str(verify)], check=True)
    assert (verify / 'SHA256SUMS.txt').read_bytes() == sums.read_bytes()
    for name, record in expected.items():
        assert f'{record["sha256"]}  {name}' in sums.read_text().splitlines()

pathlib.Path('estrada-release-verification.json').write_text(json.dumps({
    'slug': SLUG,
    'release_tag': request['release_tag'],
    'verified_archive_commit': archive_head,
    'bundle': request['bundle'],
    'assets': request['assets'],
    'checksum_asset_updated_and_downloaded': True,
    'all_downloaded_bytes_verified': True,
}, ensure_ascii=False, indent=2) + '\n')
