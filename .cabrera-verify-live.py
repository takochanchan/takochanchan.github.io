import hashlib, html, json, pathlib, re, subprocess, tempfile, urllib.request, zipfile
from xml.etree import ElementTree as ET
def read(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"Cache-Control":"no-cache","User-Agent":"takochan-cabrera-release-verifier"}),timeout=120) as response:
        return response.read()
group="cabrera-escudo-de-armas-de-mexico-1746"
slugs=[f"{group}-v{i}" for i in range(1,5)]
base="https://takochanchan.github.io"
url=f"{base}/publications/{group}/"
page=read(url).decode("utf-8")
body=html.unescape(page)
for text in ["メキシコの紋章", "カエタノ・デ・カブレラ・イ・キンテロ", "トロント大学トマス・フィッシャー稀覯書図書館", "著作権保護期間満了", "原刊の複製画像は転載していない", "escudodearmasdem00cabr_1"]:
    assert text in body, text
assert "一七三六年にメキシコ市で広がり始めた疫病と、翌年グアダルーペの聖母を市の守護者に選んだ経緯を、大司教兼副王フアン・アントニオ・デ・ビサロンの命を受けた司祭カエタノ・デ・カブレラ・イ・キンテロが全四巻に記した。流行の観察、家々と病院での救護、小教区や修道会による祈願、守護者選定の審議、聖像の由来をめぐる論証、祭礼、死者集計を、一つの歴史叙述にまとめている。著者は病の衰えを聖母の加護と結び付けるが、医師の報告、行政・教会の文書、出現伝承、著者自身の見解は同じ確かさで語られてはいない。標題紙は一七四六年、巻末には翌年一月の大司教の死去を記す追補がある。" in body
overviews=json.loads(pathlib.Path("src/publication-overviews.json").read_text())["records"]
for i,slug in enumerate(slugs,1):
    overview=overviews[slug]
    assert f'id="overview-{slug}"' in page
    assert "全体の詳細概要" in body and "史料集全体の詳細概要" not in body
    assert f'第{i}巻の詳細概要' in body
    for para in overview.split("\n\n"):
        assert para in body, slug
assert f'{base}/publications/{group}/' in page
home=read(base+'/').decode("utf-8")
m=re.search(r"window\.BIBLIOGRAPHIC_ALIASES=(\{.*?\});</script>",home)
assert m is not None
aliases=json.loads(m.group(1))
for slug in slugs:
    assert aliases[slug]==group, slug
    alias_page=read(f"{base}/publications/{slug}/").decode("utf-8")
    assert f"/publications/{group}/" in alias_page, slug

sitemap=read(f"{base}/sitemap-books.xml").decode()
site_ns={"s":"http://www.sitemaps.org/schemas/sitemap/0.9"}
locs=[node.text for node in ET.fromstring(sitemap).findall("s:url/s:loc",site_ns)]
assert locs.count(url)==1, "one canonical bibliography only"
assert not any(f"{base}/publications/{slug}/" in locs for slug in slugs)
assets=[a for a in json.loads(pathlib.Path("assets-manifest.json").read_text())["assets"] if a["path"].split("/")[1] in slugs]
assert len(assets)==12
tag="https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002"
checksums={tuple(line.split()) for line in read(f"{tag}/SHA256SUMS.txt").decode().splitlines() if line.strip()}
with tempfile.TemporaryDirectory() as d:
    for a in assets:
        p=pathlib.Path(d)/pathlib.PurePosixPath(a["path"]).name
        p.write_bytes(read(a["url"]))
        assert p.stat().st_size==a["size"]
        assert hashlib.sha256(p.read_bytes()).hexdigest()==a["sha256"]
        if p.suffix in (".pdf",".epub"):
            assert (a["sha256"],p.name) in checksums
            assert a["url"] in body
        if p.suffix==".pdf":
            i=int(p.stem.rsplit("_",1)[1]); pg=[231,204,363,286][i-1]
            assert re.search(rf"^Pages:\s+{pg}$",subprocess.check_output(["pdfinfo",str(p)],text=True),re.M)
        elif p.suffix==".epub":
            with zipfile.ZipFile(p) as z:
                assert z.testzip() is None and z.read("mimetype")==b"application/epub+zip"
        print("VERIFIED",a["path"],a["size"],a["sha256"])
print("VERIFIED",url,"one canonical bibliography, all four complete detailed overviews, twelve assets")

