from pathlib import Path
import importlib.util,json,subprocess,base64,sys,hashlib
BASELINE='939ee7ce9845a76441e0e2114305404438b03ccd'
slug_prefix='vazquez-cronica-guatemala-volume-'
manifest_path=Path('.cache/fulltext-search-manifest.json').resolve();manifest=json.loads(manifest_path.read_text())
old_data=json.loads(subprocess.check_output(['gh','api',f'repos/takochanchan/takochanchan.github.io/contents/scripts/search/extract-corpus.py?ref={BASELINE}'],text=True))
baseline=Path('.cache/vazquez-baseline-extractor.py');baseline.write_bytes(base64.b64decode(old_data['content']))
assert hashlib.sha1(b'blob '+str(baseline.stat().st_size).encode()+b'\0'+baseline.read_bytes()).hexdigest()==old_data['sha']
def load(path,name):
 spec=importlib.util.spec_from_file_location(name,path);module=importlib.util.module_from_spec(spec);sys.modules[name]=module;spec.loader.exec_module(module);return module
old=load(baseline,'old_extractor');new=load(Path('scripts/search/extract-corpus.py'),'new_extractor')
# Preserve evidence for the rejected broad marker change without deploying it.
rejected_commit='b71709164fb974f21f04922ed67fb7c3aab62c8b'
rejected_data=json.loads(subprocess.check_output(['gh','api',f'repos/takochanchan/takochanchan.github.io/contents/scripts/search/extract-corpus.py?ref={rejected_commit}'],text=True))
rejected_path=Path('.cache/vazquez-rejected-extractor.py');rejected_path.write_bytes(base64.b64decode(rejected_data['content']));rejected=load(rejected_path,'rejected_extractor')
existing=[x for x in manifest['works'] if not x['slug'].startswith(slug_prefix)];added=[x for x in manifest['works'] if x['slug'].startswith(slug_prefix)];assert len(added)==4
report={'baseline_commit':BASELINE,'existing_work_count':len(existing),'compared':[],'changed_existing':[],'new_works':[],'rejected_broad_change':[]}
for x in existing:
 a=old.build_work(manifest_path,x);b=new.build_work(manifest_path,x);same=a==b
 report['compared'].append({'slug':x['slug'],'identical':same,'chunks':len(a['chunks']),'pdfSha256':a['pdfSha256'],'sourceSha256':a['sourceSha256']})
 if not same:report['changed_existing'].append(x['slug'])
 print(x['slug'],'IDENTICAL' if same else 'CHANGED',flush=True)
 if x['slug'] in {'blanchard-dauzats-san-juan-de-ulua-1839','argaiz-vida-escritos-1678'}:
  rejected_work=rejected.build_work(manifest_path,x)
  old_labels=set(c['originalPage'] for c in a['chunks']);rejected_labels=set(c['originalPage'] for c in rejected_work['chunks'])
  detail={'slug':x['slug'],'old_chunk_count':len(a['chunks']),'rejected_chunk_count':len(rejected_work['chunks']),'added_labels':sorted(rejected_labels-old_labels),'removed_labels':sorted(old_labels-rejected_labels),'scoped_change_identical_to_original':same}
  report['rejected_broad_change'].append(detail);print('REJECTED_CHANGE_DIAGNOSIS '+json.dumps(detail,ensure_ascii=False),flush=True)
Path('vazquez-search-regression.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
assert not report['changed_existing'],report['changed_existing']
for x in added:
 b=new.build_work(manifest_path,x);labels=set(c['originalPage'] for c in b['chunks']);year='1940' if '-iii-' in x['slug'] else '1944' if '-iv-' in x['slug'] else None
 if year:assert any(l.startswith('底本 '+year+'年再録誌面 p.') for l in labels),labels
 report['new_works'].append({'slug':x['slug'],'chunks':len(b['chunks']),'mappingSummary':b['mappingSummary'],'pdfPageCount':b['pdfPageCount'],'pdfSha256':b['pdfSha256'],'sourceSha256':b['sourceSha256'],'source_labels':sorted(labels)})
Path('vazquez-search-regression.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('All existing search records unchanged; four new volumes verified.')
