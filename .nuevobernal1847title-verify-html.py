"""Check the actual built (or served) bibliography, not simulated UI data. Standard library only."""
import hashlib,html,re,sys
from pathlib import Path
ROOT='bustamante-el-nuevo-bernal-diaz-del-castillo'
GROUP=ROOT+'-1847'
MEMBERS=[ROOT+f'-tomo-{i}-1847' for i in (1,2)]
EXPECTED_HASHES=['d223482886d32abb36f835da0b5a148a953cec82159256836017dbf74f3f48a8','cd863142e81847eda4ed3ddfcfb3d6f34bcfee1c220993627b509da73f0e124c']
def digest(t):return hashlib.sha256(t.encode()).hexdigest()
def check(page):
 title="新たなベルナル・ディアス・デル・カスティリョ"
 assert f"<h1>{title}</h1>" in page and "新ベルナル・ディアス・デル・カスティリョ" not in page
 for n in (1,2): assert f"<h3>{title} 第{n}巻</h3>" in page
 panes=re.findall(r'<details\b([^>]*\bid="overview-[^"]+"[^>]*)>([\s\S]*?)</details>',page)
 assert len(panes)==2 and 'publication-overview--group' not in page, 'Exactly two per-volume disclosures and no overall disclosure'
 assert '全体の詳細概要' not in page and f'id="overview-{GROUP}"' not in page
 hero=page[page.index('<section class="publication-hero">'):page.index('class="epub-note"')]
 assert '史料集' not in re.sub(r'<[^>]+>','',hero)
 for i,(attributes,body) in enumerate(panes,1):
  slug=MEMBERS[i-1]
  assert f'id="overview-{slug}"' in attributes and f'>第{i}巻の詳細概要</span>' in body and f'>第{i}巻の詳細概要を閉じる</span>' in body
  paras=[html.unescape(re.sub(r'<[^>]*>','',s)) for s in re.findall(r'<p>(.*?)</p>',body,re.S)]
  assert len(paras)==3 and digest('\n\n'.join(paras))==EXPECTED_HASHES[i-1],(i,'Volume summary content mismatch')
  for e in ['pdf','epub']:
   u=f'https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/{slug}.{e}'
   assert 'href="'+u+'"' in page,(slug,e)
 assert '1847' in hero and '歴史書' in hero
 return {'panelCount':len(panes),'groupPanel':False,'volumeOverviewHashes':EXPECTED_HASHES,'fileLinks':4}
if __name__=='__main__':print(check(Path(sys.argv[1]).read_text()))
