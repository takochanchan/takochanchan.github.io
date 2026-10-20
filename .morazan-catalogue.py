"""Apply this publication's two records without rewriting other records."""
import json,os,re
from pathlib import Path
assert os.environ.get('GITHUB_ACTIONS')=='true'
assert os.environ['GITHUB_REPOSITORY']=='takochanchan/takochanchan.github.io'
def read(p):return json.loads(Path(p).read_text())
def write(p,d):Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
items=read('.morazan-metadata.json');request=read('.morazan-public-request.json')
assert len(items)==2
slugs={x['publication']['slug'] for x in items}
ledger=read('master-archive.json')
assert all(s not in ledger['publications'] and s not in ledger.get('release_fallbacks',{}) for s in slugs)
assert re.fullmatch('[0-9a-f]{40}',request['verified_archive_commit'])
ledger['archive_commit']=request['verified_archive_commit']
for item in items:
    p=item['publication'];ledger['publications'][p['slug']]='publications/'+p['slug']+'/master.docx'
for entry in ledger.get('release_fallbacks',{}).values():entry['ledger_commit']=ledger['archive_commit']
write('master-archive.json',ledger)
records=[];metadata={};bib=read('bibliographic-manifest.json');fixture=read('tests/fixtures/publication-catalogue.json');overviews=read('src/publication-overviews.json')
metadata_keys=['sourceEdition','sourceProvider','sourceUrl','rights','publishedDate','updatedDate']
bibkeys=['slug','title','originalTitle','author','originalAuthor','originalPublication','year','sourceEdition','sourceProvider','rights','publishedDate','updatedDate']
for item in items:
    p=item['publication'];slug=p['slug']
    assert slug not in {x['slug'] for x in bib['records']}
    assert slug not in {x['slug'] for x in fixture['records']}
    assert slug not in overviews['records']
    records.append({k:v for k,v in p.items() if k not in metadata_keys})
    metadata[slug]={k:p[k] for k in metadata_keys}
    bib['records'].append({**{k:p[k] for k in bibkeys},'recordClass':'major-work','sourceAccess':{'status':'online','url':p['sourceUrl']}})
    fixture['records'].append({'slug':slug,'recordClass':'major-work','searchShard':'002','author':p['author']})
    overviews['records'][slug]=item['overview']
overviews['updatedDate']=max(overviews['updatedDate'],max(x['publication']['updatedDate'] for x in items))
write('bibliographic-manifest.json',bib);write('tests/fixtures/publication-catalogue.json',fixture);write('src/publication-overviews.json',overviews)
Path('src/morazan-pair-publications.mjs').write_text('export const morazanPairPublicationRecords = '+json.dumps(records,ensure_ascii=False,indent=2)+';\nexport const morazanPairPublicationMetadata = '+json.dumps(metadata,ensure_ascii=False,indent=2)+';\n')
path=Path('src/publications.mjs');s=path.read_text()
assert 'morazanPairPublication' not in s
assert s.count('const publicationRecords = [')==s.count('const publicationMetadata = {')==1
s='import { morazanPairPublicationRecords, morazanPairPublicationMetadata } from "./morazan-pair-publications.mjs";\n'+s
s=s.replace('const publicationRecords = [','const publicationRecords = [\n  ...morazanPairPublicationRecords,',1)
s=s.replace('const publicationMetadata = {','const publicationMetadata = {\n  ...morazanPairPublicationMetadata,',1);path.write_text(s)
manifest=read('assets-manifest.json')
ownpaths={a['path'] for a in request['assets']}
assert not ownpaths & {a['path'] for a in manifest['assets']}
manifest['assets'].extend({k:a[k] for k in ['path','url','size','sha256']} for a in request['assets'])
write('assets-manifest.json',manifest)
print('Added exactly two publication records, two fixture expectations, and four approved assets.')
