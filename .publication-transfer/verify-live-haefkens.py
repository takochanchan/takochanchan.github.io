#!/usr/bin/env python3
"""Verify public Haefkens delivery on the GitHub-hosted Actions runner."""
import hashlib, io, json, os, pathlib, urllib.request, zipfile

assert os.environ.get('GITHUB_ACTIONS') == 'true'
assert os.environ.get('GITHUB_REPOSITORY') == 'takochanchan/takochanchan.github.io'
request = json.loads(pathlib.Path('.publication-upload-requests/haefkens-1827-1832.json').read_text())
manifest = json.loads(pathlib.Path('assets-manifest.json').read_text())
site = 'https://takochanchan.github.io/'
release = 'https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/'

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'Cache-Control': 'no-cache'}), timeout=180) as response:
        return response.read(), response.url

checksums, _ = get(release + 'SHA256SUMS.txt')
checksum_map = {line.split(maxsplit=1)[1].lstrip('*').rsplit('/', 1)[-1]: line.split()[0] for line in checksums.decode().splitlines() if len(line.split(maxsplit=1)) == 2}
results = []
for item in request['assets']:
    data, delivered = get(release + item['filename'])
    assert len(data) == item['size']
    assert hashlib.sha256(data).hexdigest() == item['sha256'] == checksum_map[item['filename']]
    if item['filename'].endswith('.pdf'):
        assert data.startswith(b'%PDF-')
    else:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            assert archive.testzip() is None
            assert archive.read('mimetype') == b'application/epub+zip'
    results.append({'filename': item['filename'], 'size': len(data), 'sha256': item['sha256'], 'verified': True})

for slug in request['slugs']:
    url = site + 'publications/' + slug + '/'
    data, _ = get(url)
    html = data.decode()
    note = '第II部（1828年）は底本未入手のため未収録' if 'reize' in slug else '折込図3葉は全体画像を入手できず未収録'
    assert note in html, (slug, 'scope note missing')
    assets = [a for a in manifest['assets'] if a['path'].startswith('publications/' + slug + '/')]
    assert len(assets) == 3
    for asset in assets:
        if asset['path'].endswith('.jpg'):
            cover, _ = get(site + asset['path'])
            assert len(cover) == asset['size']
            assert hashlib.sha256(cover).hexdigest() == asset['sha256']
        else:
            assert asset['url'] in html, (slug, 'download link missing')
    search, _ = get(site + 'takochan-search-index-002/maps/' + slug + '.json')
    mapping = json.loads(search)
    pdf = next(a for a in assets if a['path'].endswith('.pdf'))
    assert mapping['pdfSha256'] == pdf['sha256']
    assert mapping.get('blocks'), (slug, 'empty search map')
    results.append({'slug': slug, 'url': url, 'scope_note': note, 'search_blocks': len(mapping['blocks']), 'verified': True})

pathlib.Path('haefkens-live-verification.json').write_text(json.dumps({'verified_archive_commit': request['verified_archive_commit'], 'results': results}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(results, ensure_ascii=False, indent=2))
