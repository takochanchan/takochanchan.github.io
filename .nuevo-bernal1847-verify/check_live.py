"""Public read-back; run with maps-only before live deployment, then no arguments after."""
from pathlib import Path
import hashlib,json,sys,tempfile,subprocess
from verify_html import check
D=Path(__file__).resolve().parent
X=json.loads((D/'candidate_receipt.json').read_text())
S='https://takochanchan.github.io/'
def fetch(url,p):
 subprocess.run(['curl','-fsSL','--retry','3','--retry-all-errors','--max-time','150',url,'-o',str(p)],check=True)
def main():
 with tempfile.TemporaryDirectory() as tmp:
  P=Path(tmp);T={'downloads':[],'maps':{},'group':None};assets=[a for a in X['assets'] if a['path'].endswith(('.epub','.pdf'))];g=X['group'];assert len(assets)==4
  if 'maps-only' not in sys.argv:
   fetch(S+'publications/'+g['slug']+'/',P/'group');page=(P/'group').read_text();T['group']=check(page)
   for a in assets:
    n=a['path'].split('/')[-1];p=P/n;fetch(a['url'],p);assert a['size']==p.stat().st_size and a['sha256']==hashlib.sha256(p.read_bytes()).hexdigest(),n;T['downloads'].append(n)
   for res in X['volumes']:
    fetch(S+'publications/'+res['slug']+'/',P/'alias');assert '/publications/'+g['slug']+'/' in (P/'alias').read_text(),res['slug']
  for i,r in enumerate(X['volumes'],1):
   fetch(S+'takochan-search-index-003/maps/'+r['slug']+'.json',P/'map');oo=json.loads((P/'map').read_text());blocks=oo['blocks']
   e=next(a for a in assets if a['path']==r['epub']);p=next(a for a in assets if a['path']==r['pdf'])
   master={"bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847":"db16e8b15c0c152952cdab9c9077080ed231dbbef8c5975065037a61996d7706","bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847":"551776872e2017d3d3933ce77111000819e3c6eba286f1375acd7af214bc8492"}[r['slug']]
   assert oo['pdfSha256']==p['sha256'] and oo['sourceSha256'] in (e['sha256'],master) and oo['slug']==r['slug'] and oo['canonicalUrl']=='/publications/'+r['slug']+'/'
   ref=json.loads((D/'quality/local_search_measurement.json').read_text())[r['slug']]['epub' if oo['sourceSha256']==e['sha256'] else 'docx']
   assert len(blocks)==ref['chunks'] and ref['pages']==r['pageCount'] and all(1<=int(v[1])<=r['pageCount'] for v in blocks.values()),(r['slug'],len(blocks),ref)
   locs={z for v in blocks.values() for z in v[0].split('／')}
   for target in ([4,90,162] if i==1 else [4,86,162,163,234,235]):assert f'原刊 p. {target}' in locs,(r['slug'],target)
   T['maps'][r['slug']]={'blocks':len(blocks),'pages':r['pageCount']}
  print(json.dumps(T,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
