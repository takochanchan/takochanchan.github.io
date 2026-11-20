"""Verify deployed Clavijero group, volume routes, downloadable files and search maps. Read-only."""
from pathlib import Path
from argparse import ArgumentParser
from tempfile import TemporaryDirectory
import hashlib,json,subprocess
from verify_group_html import check,req,GROUP,TITLE
SITE='https://takochanchan.github.io/'
RELEASE='https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002/'
def obj(p):return json.loads(p.read_text())
def sha(p):return hashlib.file_digest(p.open('rb'),'sha256').hexdigest()
def fetch(url,path):
    subprocess.run(['curl','-fsSL','--retry','3','--retry-all-errors','--max-time','175',url,'-o',str(path)],check=True)
def verify_map(entry,x,assets):
    s=entry['slug'];rows=x['blocks'];rec=x['sourceSha256']
    req(x['slug']==s and x['canonicalUrl']==f'/publications/{s}/','Incorrect public search canonical '+s)
    req(x['pdfSha256']==assets[s+'.pdf']['sha256'],'Indexed PDF differs')
    ms=[v for v in entry['search'] if v['sourceSha256']==rec]
    req(len(ms)==1 and rec in (assets[s+'.epub']['sha256'],entry['master_sha256']),'Actual map must refer to a verified input')
    sup=ms[0];pages=entry['pageCount']
    req(sup['pdfPageCount']==pages and sup['chunks']==len(rows) and sup['mappingSummary']['unmapped']==0,'Map coverage changed')
    req(all(1<=int(v[1])<=pages for v in rows.values()),'PDF link out of range')
    locs={q for v in rows.values() for q in v[0].split('／')}
    req({'原刊 p. 3','原刊 p. 114'}<=locs,'Missing representative native locators')
    if s.endswith('-tomo-1-1789'):
        req(any('巻末・正誤表' in v[0] for v in rows.values()),'No original errata searchable')
    else:
        mp={int(r[1]) for r in rows.values() if '原刊 巻末折込' in r[0]}
        req(len([r for r in rows.values() if '原刊 巻末折込' in r[0]])==sup['map_results'],'Count of search index foldout locations differs')
        needed={y['pdfPage'] for a in sup['map_checks'].values() for y in a if '原刊 巻末折込' in y['originalPage']}
        req(needed<=mp and {141,151,168}<=mp,'Map origin or endfolio lost in search')
    return dict(slug=s,blocks=len(rows),pages=pages,source=rec,pdf=x['pdfSha256'])
def live(expect,maps_only):
    assets={r['path'].split('/')[-1]:r for r in expect['assets'] if r['path'].endswith(('.pdf','.epub'))}
    req(len(assets)==4,'Expected four public assets')
    with TemporaryDirectory() as temp:
        t=Path(temp);ret={}
        if not maps_only:
            p=t/'canonical.html';fetch(SITE+'publications/'+GROUP+'/',p);ret['catalogue']=check(p.read_text(),expect)
            for v in expect['volumes']:
                p=t/'alias.html';fetch(SITE+'publications/'+v['slug']+'/',p)
                req('/publications/'+GROUP+'/' in p.read_text(),'Missing group redirect '+v['slug'])
            for n,a in assets.items():
                p=t/n;fetch(a['url'],p);req(p.stat().st_size==a['size'] and sha(p)==a['sha256'],'Changed download '+n)
            for a in (a for a in expect['assets'] if a['path'].endswith('/cover.jpg')):
                p=t/'cover.jpg';fetch(a['url'],p);req(p.stat().st_size==a['size'] and sha(p)==a['sha256'],'Changed cover '+a['path'])
            p=t/'SHA256SUMS.txt';fetch(RELEASE+p.name,p)
            for n,a in assets.items():
                checks=[l.split(None,1)[0] for l in p.read_text().splitlines() if len(l.split(None,1))==2 and l.split(None,1)[1].lstrip('*')==n]
                req(checks==[a['sha256']],'Wrong published checksum '+n)
            ret['shared_checksum']=sha(p)
        ret['search_maps']=[]
        for v in expect['volumes']:
            p=t/'map.json';fetch(SITE+'takochan-search-index-003/maps/'+v['slug']+'.json',p)
            ret['search_maps'].append(verify_map(v,obj(p),assets))
    return ret
def main():
    a=ArgumentParser(description=__doc__);a.add_argument('--expect',type=Path,required=True);a.add_argument('--maps-only',action='store_true');q=a.parse_args()
    print(json.dumps(live(obj(q.expect),q.maps_only),ensure_ascii=False,indent=2))
if __name__=='__main__':main()
