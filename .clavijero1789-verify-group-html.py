"""Check the actual compiled Clavijero group page, with no network or write."""
from pathlib import Path
import hashlib,html,json,re,sys
GROUP='clavijero-storia-della-california-1789'
TITLE='カリフォルニア史'
def req(ok,msg):
    if not ok:raise ValueError(msg)
def strip(s):return html.unescape(re.sub(r'<[^>]+>','',s))
def check(page,want):
    req(want['group']['slug']==GROUP and f'<h1>{TITLE}</h1>' in page,'Not the intended title')
    req(f'<link rel="canonical" href="https://takochanchan.github.io/publications/{GROUP}/">' in page,'Wrong canonical')
    panels=re.findall(r'<details\b([^>]*\bid="overview-[^"]+"[^>]*)>([\s\S]*?)</details>',page)
    req(len(panels)==2 and 'publication-overview--group' not in page,'Two distinct per-volume overviews, no collection overview')
    hero=page[page.index('<section class="publication-hero">'):page.index('class="epub-note"')]
    req('史料集' not in strip(hero) and '文書群' not in strip(hero) and '書籍' in strip(hero),'Group is not one authored book')
    req('1789' in hero and 'STORIA DELLA CALIFORNIA' in hero,'Wrong original title/year')
    r={'overviewCount':2,'files':[]}
    for i,(at,body) in enumerate(panels,1):
        s=want['group']['memberSlugs'][i-1]
        req(f'id="overview-{s}"' in at and f'>第{i}巻の詳細概要</span>' in body,'Wrong volume disclosure')
        pars=[strip(x) for x in re.findall(r'<p>(.*?)</p>',body,re.S)]
        req(len(pars)==4 and hashlib.sha256('\n\n'.join(pars).encode()).hexdigest()==want['overview_sha256'][s],'Overview differs: '+s)
        pagecount=want['volumes'][i-1]['pageCount']; req(f'{pagecount}頁' in page,'Volume page count missing')
        for a in want['assets']:
            if a['path'].startswith(f'publications/{s}/') and a['path'].endswith(('.epub','.pdf')):
                req('href="'+a['url']+'"' in page,'Missing file URL: '+a['url']);r['files'].append(a['url'])
    req(len(r['files'])==4 and 'Courtesy of the John Carter Brown Library' in page and 'CC BY 4.0' in page,'Incorrect asset count or incomplete map credit')
    return r
if __name__=='__main__':
    p,q=(Path(x) for x in sys.argv[1:]);print(json.dumps(check(p.read_text(),json.loads(q.read_text())),ensure_ascii=False))
