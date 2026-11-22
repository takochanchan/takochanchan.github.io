import html,json,re,urllib.request
base="https://takochanchan.github.io"
slug="pimentel-cuadro-lenguas-indigenas-1874-1875"
def get(url):
    req=urllib.request.Request(url,headers={"Cache-Control":"no-cache","User-Agent":"takochan-live-label-verifier"})
    with urllib.request.urlopen(req,timeout=30) as res:
        assert res.status==200
        return res.read().decode("utf-8")
url=f"{base}/publications/{slug}/"
page=get(url+"?heading-check="+json.load(open(".pimentel-verify.json"))["head"][:10])
hero=re.search(r'<section class="publication-hero">[\s\S]*?</section>',page).group()
assert '<span class="publication-overview__show">全体の詳細概要</span>' in hero
assert '史料集' not in hero and '全3巻の詳細概要' not in hero
for i in range(1,4):
    assert f'<span class="publication-overview__show">第{i}巻の詳細概要</span>' in hero
home=get(base+"/")
cards=re.findall(r'<article class="record-card">[\s\S]*?</article>',home)
card,=[x for x in cards if f'href="/publications/{slug}/"' in x]
assert "史料集" not in card
print("VERIFIED",url, "全体の詳細概要 plus 3 per-volume headings; no 史料集 in the bibliography heading section or its card")
