"""Verify the exact built or deployed Aparicio publication and its live search map, read-only."""
from argparse import ArgumentParser
from pathlib import Path
import hashlib,html,json,re,subprocess,tempfile
SLUG='ramirez-aparicio-los-conventos-suprimidos-en-mejico-1861'
TITLE='メキシコの廃止修道院'
SITE='https://takochanchan.github.io/'
SOURCE='https://archive.org/details/losconventossupr00rami'
RELEASE='https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/'
MAP=SITE+'takochan-search-index-003/maps/'+SLUG+'.json'
BASE=Path(__file__).parent
def req(ok,msg):
    if not ok:raise ValueError(msg)
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def untag(s):return html.unescape(re.sub(r'<[^>]+>','',s))
def obj(p):return json.loads(p.read_text())
def check_html(page,want):
    r=want['publication']
    req(r['title']==TITLE and r['slug']==SLUG and f'<h1>{TITLE}</h1>' in page,'Wrong title')
    req(f'<link rel="canonical" href="{SITE}publications/{SLUG}/">' in page,'Wrong canonical link')
    hero=page[page.index('<section class="publication-hero">'):page.index('class="epub-note"')]
    req('史料集' not in untag(hero) and '文書群' not in untag(hero) and '書籍' in untag(hero),'Wrong classification')
    req('LOS CONVENTOS SUPRIMIDOS EN MÉJICO · 1861' in hero,'Wrong title or year')
    for s in [r['originalTitle'],r['author'],r['description']]:
        req(s in untag(hero),'Missing bibliography value: '+s)
    panels=re.findall(r'<details\b([^>]*\bid="overview-[^"]+"[^>]*)>([\s\S]*?)</details>',page)
    req(len(panels)==1 and f'id="overview-{SLUG}"' in panels[0][0] and 'publication-overview--group' not in page,'Wrong detail disclosure count')
    paragraphs=[untag(m) for m in re.findall(r'<p>(.*?)</p>',panels[0][1],re.S)]
    ov=hashlib.sha256('\n\n'.join(paragraphs).encode()).hexdigest()
    req(len(paragraphs)==4 and ov==want['overview_sha256'],'Detailed synopsis changed')
    req(untag(panels[0][1]).strip().startswith('詳細概要'),'Wrong disclosure label')
    p=untag(page)
    for s in ['630頁','33点','1861年','1862年','初版','ゲティ研究所','パブリックドメイン','Public domain','HathiTrust']:
        req(s in p,'Missing public fact/rights: '+s)
    expected=[RELEASE+SLUG+'.pdf',RELEASE+SLUG+'.epub']
    for u in [SOURCE,*expected]:req('href="'+u+'"' in page,'Missing link: '+u)
    req('/publications/'+SLUG+'/cover.jpg' in page,'Missing cover')
    return dict(title=TITLE,overview_sha256=ov,paragraphs=4,canonical=SITE+'publications/'+SLUG+'/',files=expected)
def fetch(url,path):
    subprocess.run(['curl','--fail','--silent','--show-error','--location','--retry','3','--retry-all-errors','--max-time','160',url,'--output',str(path)],check=True)
def check_map(m,want):
    r=want['publication']; a={x['path'].split('/')[-1]:x for x in want['assets']}
    req(m['slug']==SLUG and m['canonicalUrl']==f'/publications/{SLUG}/','Search canonical mismatch')
    req(m['pdfSha256']==a[SLUG+'.pdf']['sha256'],'Search PDF hash mismatch')
    refs=want.get('search',{})
    source=m['sourceSha256']; modes=[x for x in refs.values() if x['sha256']==source]
    req(len(modes)==1 and source in (a[SLUG+'.epub']['sha256'],want['master']['sha256']),'Search source hash/proof differs')
    measured=modes[0]; blocks=m['blocks']
    req(len(blocks)==measured['actual_chunk_count'] and measured['physical_page_count']==r['pageCount']==630,'Wrong indexed chunk/page count')
    req(all(len(v)>=2 and 1<=int(v[1])<=630 for v in blocks.values()),'One map points out of bounds')
    for name,mark in measured['same_number_page_samples'].items():
        req(mark['chunk_id'] in blocks,'Missing exact indexed sample '+name)
        v=blocks[mark['chunk_id']]
        req(mark['original_label']==v[0] and mark['expected_physical_page']==int(v[1]),'Changed duplicated-page index '+name)
    locs={s for v in blocks.values() for s in v[0].split('／')}
    req({'原刊 p. 416','原刊 p. 419','原刊 p. 433','原刊 p. 434'}<=locs and not {'原刊 p. 417','原刊 p. 418'}&locs,'False or missing original page labels')
    return dict(blocks=len(blocks),pages=630,source_sha256=source,pdf_sha256=m['pdfSha256'],duplicate_samples=len(measured['same_number_page_samples']))
def check_live(want,maps_only=False):
    result={}
    with tempfile.TemporaryDirectory() as tmp:
        p=Path(tmp)
        if not maps_only:
            fetch(SITE+'publications/'+SLUG+'/',p/'page')
            result['page']=check_html((p/'page').read_text(),want)
            downloads=[]
            for a in want['assets']:
                file=p/a['path'].split('/')[-1];fetch(a['url'],file)
                req(file.stat().st_size==a['size'] and digest(file)==a['sha256'],'Public asset changed: '+file.name)
                downloads.append(file.name)
            sums=p/'SHA256SUMS.txt';fetch(RELEASE+sums.name,sums)
            for a in want['assets']:
                n=a['path'].split('/')[-1]
                if n.endswith(('.pdf','.epub')):
                    rows=[l.split(None,1)[0] for l in sums.read_text().splitlines() if len(l.split(None,1))==2 and l.split(None,1)[1].lstrip('*')==n]
                    req(rows==[a['sha256']],'Wrong published checksum line: '+n)
            result['release_files']=downloads
            result['checksum_sha256']=digest(sums)
        fetch(MAP,p/'map')
        result['map']=check_map(obj(p/'map'),want)
    return result
def main():
    a=ArgumentParser(description=__doc__);a.add_argument('--expect',type=Path,default=BASE/'live-expectations.json')
    a.add_argument('--html',type=Path);a.add_argument('--map',type=Path);a.add_argument('--live',action='store_true');a.add_argument('--maps-only',action='store_true')
    z=a.parse_args(); w=obj(z.expect)
    if z.html:r=check_html(z.html.read_text(),w)
    elif z.map:r=check_map(obj(z.map),w)
    elif z.live:r=check_live(w,z.maps_only)
    else:a.error('choose --html or --map local checks or --live read-only verification')
    print(json.dumps(r,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
