import argparse, concurrent.futures, hashlib, html, json, pathlib, re, subprocess, tempfile, urllib.request, zipfile
from html.parser import HTMLParser
from urllib.parse import urljoin
from xml.etree import ElementTree as ET

HERE=pathlib.Path(__file__).resolve().parent
p=argparse.ArgumentParser()
p.add_argument('--repo',type=pathlib.Path,default=pathlib.Path('.'))
p.add_argument('--base',default='https://takochanchan.github.io')
p.add_argument('--fixture',type=pathlib.Path,default=HERE/'maria-live-fixture.json')
p.add_argument('--workers',type=int,default=4)
a=p.parse_args()
base=a.base.rstrip('/')
f=json.loads(a.fixture.read_text())
def check(x,msg): 
    if not x: raise RuntimeError(msg)
def read(url):
    req=urllib.request.Request(url,headers={"Cache-Control":"no-cache","User-Agent":"takochan-maria-release-verifier"})
    with urllib.request.urlopen(req,timeout=30) as response:
        check(response.status==200,(url,response.status))
        return response.read()
class Page(HTMLParser):
    def __init__(self, data, url):
        super().__init__(convert_charrefs=True); self.ids=[]; self.canon=[]; self.links=set();self.text=[]
        self.feed(data);self.body=' '.join(' '.join(self.text).split());self.url=url
    def handle_starttag(self,tag,attrs):
        d=dict(attrs)
        if d.get('id'): self.ids.append(d['id'])
        if tag=='link' and d.get('rel')=='canonical': self.canon.append(d.get('href'))
        for k in ('href','src','data-src'):
            if k in d and d[k]: self.links.add(d[k])
    def handle_data(self,data): self.text.append(data)
    def contains(self,t): return ' '.join(t.split()) in self.body
def check_asset(record):
    slug,item,ref,count,checks=record
    data=read(ref['url'])
    h=hashlib.sha256(data).hexdigest()
    check(h==ref['sha256']==item['sha256'] and len(data)==ref['size']==item['size'],ref['url'])
    if item['role'] in ('pdf','epub'):
        check((h,item['name']) in checks,('release checksum not listed',slug,item['name']))
    with tempfile.TemporaryDirectory(prefix='maria-live-') as d:
        path=pathlib.Path(d)/item['name'];path.write_bytes(data)
        if item['role']=='pdf':
            info=subprocess.check_output(['pdfinfo',str(path)],text=True)
            check(re.search(rf'^Pages:\s+{count}$',info,re.M),('PDF pages',slug))
        if item['role']=='epub':
            with zipfile.ZipFile(path) as z:
                check(z.testzip() is None and z.read('mimetype')==b'application/epub+zip',('EPUB zip',slug))
        if item['role']=='cover':check(data.startswith(b'\xff\xd8\xff'),('JPEG',slug))
    return {'slug':slug,'role':item['role'],'url':ref['url'],'sha256':h}
group=f['group']; members=f['parts']; check(len(members)==12,'12 members expected')
root=f'{base}/publications/{group}/'
page=read(root).decode()
canonical=Page(page,root)
check([urljoin(root,x) for x in canonical.canon]==[root],('canonical',canonical.canon))
for t in ['霊的自叙伝','マリア・デ・サン・ホセ','全12部','全体の詳細概要','ジョン・カーター・ブラウン図書館','著作権保護期間満了','CC BY 4.0','底本画像は掲載していない']:
    check(canonical.contains(t),('canonical text',t))
check(not canonical.contains('史料集全体の詳細概要'),'one work, not a document collection')
check('https://jcblibrary.org/permissions/' in canonical.body or 'https://jcblibrary.org/permissions/' in canonical.links,'rights URL')
for t in f['overall'].split('\n\n'):check(canonical.contains(t),'overall overview paragraph')
home=read(base+'/').decode()
m=re.search(r'window\.BIBLIOGRAPHIC_ALIASES\s*=\s*(\{.*?\});',home,re.S)
check(m,'catalogue aliases')
aliases=json.loads(m.group(1))
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
locs=[x.text for x in ET.fromstring(read(base+'/sitemap-books.xml')).findall('s:url/s:loc',ns)]
check(locs.count(root)==1,'one bibliography canonical in sitemap')
old=json.loads((a.repo/'assets-manifest.json').read_text())['assets']
assets={}
for x in old:
    if x['path'].split('/')[1:2] in [[r['slug']] for r in members]:
        check(x['path'] not in assets,('duplicate asset',x['path']));assets[x['path']]=x
check(len(assets)==36,'36 Maria assets in manifest')
checks_by_dir={}; jobs=[]
for v in members:
    slug=v['slug']; alias=f'{base}/publications/{slug}/'
    check(aliases.get(slug)==group and alias not in locs,('public alias',slug))
    check(canonical.ids.count('overview-'+slug)==1,('unique overview anchor',slug))
    check(canonical.contains(f'第{v["part"]}部の詳細概要'),('overview heading',slug))
    for t in v['overview'].split('\n\n'):check(canonical.contains(t),('overview paragraph',slug))
    def parse_alias():
        return Page(read(alias).decode(),alias)
    ali=parse_alias()
    check([urljoin(alias,x) for x in ali.canon]==[root] or root in {urljoin(alias,x) for x in ali.links},('member route to canonical',slug))
    check(v['source_url'] in canonical.links|ali.links or v['source_url'] in canonical.body or v['source_url'] in ali.body,('source URL',slug))
    for item in v['files']:
        ref=assets['publications/'+slug+'/'+item['name']]
        assert ref['sha256']==item['sha256']
        if item['role'] in ('pdf','epub'):
            check(ref['url'] in canonical.links|ali.links,('reader download link',slug,item['role']))
            tag=ref['url'].rsplit('/',1)[0]
            if tag not in checks_by_dir:checks_by_dir[tag]={tuple(x.split(maxsplit=1)) for x in read(tag+'/SHA256SUMS.txt').decode().splitlines() if x.strip()}
            checks=checks_by_dir[tag]
        else:
            checks=set()
        jobs.append((slug,item,ref,v['pages'],checks))
with concurrent.futures.ThreadPoolExecutor(max_workers=a.workers) as pool:
    checked=list(pool.map(check_asset,jobs))
for x in checked:print(json.dumps(x,ensure_ascii=False))
print(json.dumps({'status':'VERIFIED','canonical':root,'members':12,'assets':len(checked)},ensure_ascii=False))
