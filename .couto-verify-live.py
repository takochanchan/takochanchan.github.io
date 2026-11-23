import hashlib, html, json, pathlib, re, subprocess, tempfile, urllib.request, zipfile
from xml.etree import ElementTree as ET

def read(url):
    request = urllib.request.Request(
        url,
        headers={"Cache-Control": "no-cache", "User-Agent": "takochan-couto-release-verifier"},
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        return response.read()

slug = "couto-dialogo-pintura-mexico-1889"
stem = "Couto_Dialogo_Pintura_Mexico_1889_Japanese"
base = "https://takochanchan.github.io"
url = f"{base}/publications/{slug}/"
tag = "https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-002"
cfg = json.loads(pathlib.Path(".couto-verify.json").read_text())
assert cfg["mode"] == "live"
description = cfg["description"].strip()
assert description and not description.startswith("<")
assert type(cfg["pdfPages"]) is int and cfg["pdfPages"] > 0

page = read(url).decode("utf-8")
body = html.unescape(page)
assert f'<link rel="canonical" href="{url}">' in page
assert '<p class="publication-hero__record-class">書籍</p>' in body
for text in (
    "メキシコ絵画史対話", "ホセ・ベルナルド・コウト",
    "著作権保護期間は満了", "https://archive.org/details/dialogosobrelahi00cout", "ゲティ研究所",
    description,
):
    assert text in body, text
assert "1889年" in body and "原注65件" in body
overviews = json.loads(pathlib.Path("src/publication-overviews.json").read_text())["records"]
assert page.count(f'id="overview-{slug}"') == 1
assert '<span class="publication-overview__show">詳細概要</span>' in body
assert "publication-overview--group" not in body and "publication-actions--multi" not in body
overview = overviews[slug]
assert overview.strip()
for para in re.split(r"\n\s*\n", overview):
    assert f"<p>{para}</p>" in body, slug

home = read(base + "/").decode("utf-8")
sections = re.findall(r"<section\b[^>]*>.*?</section>", home, flags=re.S)
docs = [s for s in sections if re.match(r'<section[^>]*id="publications"',s)]
assert len(docs) == 1 and f'href="/publications/{slug}/"' in docs[0]
assert all(f'href="/publications/{slug}/"' not in s for s in sections if s not in docs)
print("VERIFIED category", slug, "books")
m = re.search(r"window\.BIBLIOGRAPHIC_ALIASES=(\{.*?\});</script>", home)
assert m is not None
aliases = json.loads(m.group(1))
assert slug not in aliases and slug not in aliases.values()

site_ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
sitemap_class = {"major-work": "books", "short-work": "papers", "document-collection": "documents"}
assert cfg["recordClass"] in sitemap_class
locs_by_class = {
    cls: [node.text for node in ET.fromstring(read(f"{base}/sitemap-{file}.xml")).findall("s:url/s:loc", site_ns)]
    for cls, file in sitemap_class.items()
}
assert locs_by_class[cfg["recordClass"]].count(url) == 1, "canonical bibliography in the expected sitemap"
all_locs = [link for locs in locs_by_class.values() for link in locs]
assert all_locs.count(url) == 1, "one canonical bibliography across all sitemaps"
assert not any(link.startswith(f"{base}/publications/{slug}-v") for link in all_locs)

prefix = f"publications/{slug}/"
assets = [
    a for a in json.loads(pathlib.Path("assets-manifest.json").read_text())["assets"]
    if a["path"].startswith(prefix)
]
assert len(assets) == 3
assert {a["path"] for a in assets} == {prefix + stem + ".pdf", prefix + stem + ".epub", prefix + "cover.jpg"}
checksums = {
    tuple(line.split()) for line in read(f"{tag}/SHA256SUMS.txt").decode().splitlines()
    if line.strip()
}
with tempfile.TemporaryDirectory() as d:
    for a in assets:
        p = pathlib.Path(d) / pathlib.PurePosixPath(a["path"]).name
        p.write_bytes(read(a["url"]))
        assert p.stat().st_size == a["size"]
        assert hashlib.sha256(p.read_bytes()).hexdigest() == a["sha256"]
        if p.suffix in (".pdf", ".epub"):
            assert a["url"] == f"{tag}/{p.name}"
            assert (a["sha256"], p.name) in checksums
            assert a["url"] in body
        if p.suffix == ".pdf":
            assert a["sha256"] == cfg["pdfSha256"]
            images = subprocess.check_output(["pdfimages", "-list", str(p)], text=True)
            assert len(images.splitlines()) == 2, "The PDFs must not reproduce original images"
            assert re.search(
                rf"^Pages:\s+{cfg['pdfPages']}$",
                subprocess.check_output(["pdfinfo", str(p)], text=True),
                re.M,
            )
        elif p.suffix == ".epub":
            with zipfile.ZipFile(p) as z:
                assert z.testzip() is None and z.read("mimetype") == b"application/epub+zip"
                assert len([m for m in z.namelist() if pathlib.Path(m).suffix.lower() in {".jpg",".jpeg",".png",".webp",".svg",".gif"}]) == 1, "EPUB should have only its typeset cover"
        else:
            assert a["url"] == f"{base}/{a['path']}"
            assert f'src="/{a["path"]}"' in page
        print("VERIFIED", a["path"], a["size"], a["sha256"])
print("VERIFIED", url, "one ungrouped canonical bibliography, exact complete overview, three assets")
