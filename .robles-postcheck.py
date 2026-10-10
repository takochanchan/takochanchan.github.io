"""Read-only verification of the actual deployed Robles URLs and final bytes."""
from pathlib import Path
from html.parser import HTMLParser
from datetime import datetime, timezone
import hashlib
import html
import io
import json
import os
import re
import urllib.request
import zipfile
import xml.etree.ElementTree as ET
from pypdf import PdfReader

assert os.environ.get('GITHUB_ACTIONS') == 'true'
assert os.environ.get('GITHUB_REPOSITORY') == 'takochanchan/takochanchan.github.io'
spec = json.loads(Path('.robles-post-request.json').read_text())
credit = 'Imágenes procedentes de los fondos de la Biblioteca Nacional de España.'
disallowed = ('利用者から提供', '提供されたPDF', 'Volumen-2.pdf', 'Volumen-3.pdf')

def get(url):
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Robles-publication-final-verification',
        'Cache-Control': 'no-cache',
    })
    with urllib.request.urlopen(req, timeout=120) as response:
        assert response.status == 200, (url, response.status)
        return response.read(), response.geturl()

def sha(data):
    return hashlib.sha256(data).hexdigest()

class Links(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.hrefs = set()
        self.canonical = []
        self.refresh = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'href' in attrs:
            self.hrefs.add(attrs['href'])
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical.append(attrs.get('href'))
        if tag == 'meta' and attrs.get('http-equiv', '').lower() == 'refresh':
            self.refresh.append(attrs.get('content', ''))

page_bytes, final_url = get(spec['canonical_url'] + '?robles-check=' + spec['public_source_commit'])
page = html.unescape(page_bytes.decode('utf-8'))
links = Links()
links.feed(page)
assert credit in page and 'bdh0000147570' in page
assert 'Biblioteca Nacional de España' in page
assert 'https://www.bne.es/es/servicios/reproduccion-documentos/uso-reproducciones' in links.hrefs or 'uso-reproducciones' in page
assert not any(value in page for value in disallowed)
assert '.docx' not in page
assert spec['canonical_url'] in links.canonical
for volume in (1, 2):
    assert f'第{volume}巻' in page
for asset in spec['assets']:
    assert asset['url'] in links.hrefs, ('Missing actual release link', asset['name'])

checksums_url = 'https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/SHA256SUMS.txt'
checksum_bytes, _ = get(checksums_url)
checksums = {}
for line in checksum_bytes.decode('utf-8').splitlines():
    match = re.fullmatch(r'([0-9a-f]{64})\s+\*?(.+)', line)
    if match:
        checksums[match.group(2)] = match.group(1)
verified_assets = []
for asset in spec['assets']:
    data, download_url = get(asset['url'])
    assert len(data) == asset['bytes'] and sha(data) == asset['sha256'], asset['name']
    assert checksums[asset['name']] == asset['sha256']
    volume = asset['volume']
    if asset['format'] == 'pdf':
        reader = PdfReader(io.BytesIO(data))
        expected_pages = 481 if volume == 1 else 487
        assert len(reader.pages) == expected_pages
        front = '\n'.join(p.extract_text() for p in reader.pages[:8])
        assert re.search(r'DIARIO\s*·\s*1853', front), 'Cover eyebrow is not Latin'
        normalized_front = ' '.join(front.split())
        assert 'Biblioteca Nacional de España' in normalized_front and credit in normalized_front
        assert not any(value in front for value in disallowed)
    else:
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            assert z.testzip() is None
            assert z.namelist()[0] == 'mimetype'
            assert z.getinfo('mimetype').compress_type == zipfile.ZIP_STORED
            assert z.read('mimetype') == b'application/epub+zip'
            opf = ET.fromstring(z.read('EPUB/package.opf'))
            namespaces = {'opf': 'http://www.idpf.org/2007/opf', 'dc': 'http://purl.org/dc/elements/1.1/'}
            source = opf.findtext('opf:metadata/dc:source', namespaces=namespaces)
            rights = opf.findtext('opf:metadata/dc:rights', namespaces=namespaces)
            assert 'BNE bdh0000147570' in source
            assert f'tomo {volume} ' in source
            assert credit in rights and 'パブリックドメイン' in rights
            assert 'SIL Open Font License 1.1' in rights
            cover = z.read('EPUB/cover.xhtml').decode('utf-8')
            assert 'DIARIO' in cover and '1853' in cover
            assert not any(value in rights or value in source for value in disallowed)
    verified_assets.append({**asset, 'actual_download_bytes_verified': True})

verified_covers = []
for cover in spec['covers']:
    data, _ = get(cover['url'])
    assert data[:2] == b'\xff\xd8'
    assert len(data) == cover['bytes'] and sha(data) == cover['sha256']
    verified_covers.append({**cover, 'actual_download_bytes_verified': True})

meta_bytes, _ = get(spec['search_base_url'] + 'search-meta.json')
meta = json.loads(meta_bytes)
assert meta['archiveCommit'] == spec['private_archive_commit']
assert meta['searchShard'] == '002' and meta['works'] == 160
assert meta['assetManifestSha256'] == sha(Path('assets-manifest.json').read_bytes())
assert meta['bibliographicManifestSha256'] == sha(Path('bibliographic-manifest.json').read_bytes())
maps = []
for volume in (1, 2):
    slug = f'robles-diario-sucesos-notables-1853-vol-{volume}'
    map_bytes, _ = get(spec['search_base_url'] + 'maps/' + slug + '.json')
    mapping = json.loads(map_bytes)
    pdf = next(x for x in spec['assets'] if x['volume'] == volume and x['format'] == 'pdf')
    assert slug in meta['workSlugs']
    assert mapping['pdfSha256'] == pdf['sha256']
    assert mapping['canonicalUrl'] == f'/publications/{slug}/'
    assert mapping['pdfUrl'] == pdf['url']
    assert mapping['blocks']
    member_bytes, _ = get('https://takochanchan.github.io/publications/' + slug + '/')
    member = member_bytes.decode('utf-8')
    member_links = Links()
    member_links.feed(member)
    assert spec['canonical_url'] in member_links.canonical
    assert any('robles-diario-sucesos-notables-1853/' in refresh for refresh in member_links.refresh)
    maps.append({'slug': slug, 'map_sha256': sha(map_bytes), 'pdf_sha256': mapping['pdfSha256'],
                 'canonical_url': mapping['canonicalUrl'], 'blocks': len(mapping['blocks']),
                 'member_route_redirects_to_single_canonical_page': True})

result = {'schema': 'robles-two-volume-actual-publication-postcheck-v1',
          'verified_at_utc': datetime.now(timezone.utc).isoformat(),
          'public_source_commit': spec['public_source_commit'],
          'private_archive_commit': spec['private_archive_commit'],
          'search_controller_commit': spec['search_controller_commit'],
          'pages_run_id': spec['pages_run_id'], 'search_run_id': spec['search_run_id'],
          'canonical_url': spec['canonical_url'], 'canonical_page_sha256': sha(page_bytes),
          'bne_attribution_and_reuse_terms_verified': True,
          'user_supplied_pdf_history_absent': True, 'public_word_link_absent': True,
          'assets': verified_assets, 'covers': verified_covers,
          'search_metadata_sha256': sha(meta_bytes), 'search_works': meta['works'],
          'search_maps': maps, 'all_checks_passed': True}
Path('robles-postcheck-result.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('ROBLES_PUBLICATION_POSTCHECK=' + json.dumps(result, ensure_ascii=False))
