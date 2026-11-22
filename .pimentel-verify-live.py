import hashlib, html, json, pathlib, re, subprocess, tempfile, urllib.request, zipfile
def read(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"Cache-Control":"no-cache","User-Agent":"takochan-pimentel-release-verifier"}),timeout=120) as response:
        return response.read()
group="pimentel-cuadro-lenguas-indigenas-1874-1875"
slugs=[f"{group}-v{i}" for i in range(1,4)]
base="https://takochanchan.github.io"
url=f"{base}/publications/{group}/"
page=read(url).decode("utf-8")
body=html.unescape(page)
for text in ["メキシコ先住民諸語の記述と比較", "フランシスコ・ピメンテル", "ジョン・カーター・ブラウン図書館", "CC BY 4.0", "ハーバード大学図書館", *[f"cuadrodescriptiv0{i}pime" for i in range(1,4)]]:
    assert text in body, text
overviews=json.loads(pathlib.Path("src/publication-overviews.json").read_text())["records"]
for i,slug in enumerate(slugs,1):
    overview=overviews[slug]
    assert f'id="overview-{slug}"' in page
    assert f'第{i}巻の詳細概要' in body
    for para in overview.split("\n\n"):
        assert para in body, slug
assert f'{base}/publications/{group}/' in page
sitemap=read(f"{base}/sitemap.xml").decode()
assert sitemap.count(url)==1, "one canonical bibliography only"
assert not any(f"{base}/publications/{slug}/" in sitemap for slug in slugs)
assets=[a for a in json.loads(pathlib.Path("assets-manifest.json").read_text())["assets"] if a["path"].split("/")[1] in slugs]
assert len(assets)==9
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
            i=int(p.stem.rsplit("_",1)[1]); pg=[409,402,485][i-1]
            assert re.search(rf"^Pages:\s+{pg}$",subprocess.check_output(["pdfinfo",str(p)],text=True),re.M)
        elif p.suffix==".epub":
            with zipfile.ZipFile(p) as z:
                assert z.testzip() is None and z.read("mimetype")==b"application/epub+zip"
        print("VERIFIED",a["path"],a["size"],a["sha256"])
print("VERIFIED",url,"one canonical bibliography, all three complete detailed overviews, nine assets")

