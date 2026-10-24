"""Apply this publication's records to the current checkout only."""
from pathlib import Path
import json,hashlib,shutil

ROOT=Path.cwd()
request=json.loads(Path('.galindo-public-request.json').read_text())
items=request['publications'];slugs={p['slug'] for p in items}
assert len(items)==len(slugs)==3
def save(p,d):Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')

metadata_keys=['sourceEdition','sourceProvider','sourceUrl','rights','publishedDate','updatedDate']
records=[{k:v for k,v in p.items() if k not in metadata_keys and k!='recordClass'} for p in items]
metadata={p['slug']:{k:p[k] for k in metadata_keys} for p in items}
Path('src/galindo-publications.mjs').write_text(
 'export const galindoPublicationRecords = '+json.dumps(records,ensure_ascii=False,indent=2)+';\n\n'+
 'export const galindoPublicationMetadata = '+json.dumps(metadata,ensure_ascii=False,indent=2)+';\n')
p=Path('src/publications.mjs');s=p.read_text()
assert 'galindoPublicationRecords' not in s,'publication already registered'
s='import { galindoPublicationRecords, galindoPublicationMetadata } from "./galindo-publications.mjs";\n'+s
s=s.replace('const publicationRecords = [','const publicationRecords = [\n  ...galindoPublicationRecords,',1)
s=s.replace('const publicationMetadata = {','const publicationMetadata = {\n  ...galindoPublicationMetadata,',1)
p.write_text(s)

group=request['group'];p=Path('src/catalogue-publications.mjs');s=p.read_text()
assert group['slug'] not in s
s=s.replace('export const publicationGroupDefinitions = [','export const publicationGroupDefinitions = [\n'+json.dumps(group,ensure_ascii=False,indent=2)+',',1)
p.write_text(s)

path='bibliographic-manifest.json';data=json.loads(Path(path).read_text())
assert not slugs&{p['slug'] for p in data['records']}
for p in items:
 keys=['slug','title','originalTitle','author','originalAuthor','originalPublication','year','sourceEdition','sourceProvider','rights','publishedDate','updatedDate','recordClass']
 rec={k:p[k] for k in keys};rec['sourceAccess']={'status':'online','url':p['sourceUrl']}
 data['records'].append(rec)
save(path,data)

path='master-archive.json';data=json.loads(Path(path).read_text())
assert not slugs&(set(data['publications'])|set(data.get('release_fallbacks',{})))
data['archive_commit']=request['verified_archive_commit']
for p in items:data['publications'][p['slug']]='publications/'+p['slug']+'/master.docx'
# Existing fallback records are still present in the verified new archive.
for rec in data.get('release_fallbacks',{}).values():rec['ledger_commit']=request['verified_archive_commit']
save(path,data)

path='tests/fixtures/publication-catalogue.json';data=json.loads(Path(path).read_text())
assert not slugs&{p['slug'] for p in data['records']}
for p in items:data['records'].append({'slug':p['slug'],'recordClass':'major-work','searchShard':'002','author':p['author']})
data['groups'].append({'slug':group['slug'],'memberSlugs':group['memberSlugs']})
save(path,data)

path='src/publication-overviews.json';data=json.loads(Path(path).read_text())
for slug,text in request['overviews'].items():
 assert slug in slugs and slug not in data['records']
 assert 100<=len(text)<=1000
 data['records'][slug]=text
save(path,data)

path='assets-manifest.json';data=json.loads(Path(path).read_text())
assert not any(any(a['path'].startswith('publications/'+s+'/') for s in slugs) for a in data['assets'])
for a in request['assets']:
 data['assets'].append({k:a[k] for k in ('path','url','size','sha256')})
save(path,data)
print('Registered three Galindo volumes and one canonical work page.')
