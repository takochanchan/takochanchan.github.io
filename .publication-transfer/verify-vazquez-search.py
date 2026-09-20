import hashlib, io, json, urllib.request, zipfile
slug="vazquez-pedro-betancur-1962"
base="https://takochanchan.github.io/"
assets=[{"path":"publications/vazquez-pedro-betancur-1962/Francisco_Vazquez_Pedro_de_San_Jose_de_Betancur_Japanese_Translation.epub","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Francisco_Vazquez_Pedro_de_San_Jose_de_Betancur_Japanese_Translation.epub","size":681164,"sha256":"7baa7388254cc721d84f77c0dd678a426b1b4dd43df34800822aae37cf2d8194"},{"path":"publications/vazquez-pedro-betancur-1962/Francisco_Vazquez_Pedro_de_San_Jose_de_Betancur_Japanese_Translation.pdf","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Francisco_Vazquez_Pedro_de_San_Jose_de_Betancur_Japanese_Translation.pdf","size":4626862,"sha256":"a414df21138e344b2af4f1d32d1691c2db15fad8ad028982f525a3d623b29b08"}]
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Publication-Verification"}),timeout=120) as r:
        assert r.status==200
        return r.read()
for a in assets:
    data=get(a["url"])
    assert len(data)==a["size"] and hashlib.sha256(data).hexdigest()==a["sha256"]
m=json.loads(get(base+"takochan-search-index-002/maps/"+slug+".json"))
assert m["slug"]==slug and m["canonicalUrl"]=="/publications/"+slug+"/"
assert m["pdfSha256"]==next(a["sha256"] for a in assets if a["path"].endswith(".pdf"))
assert m["sourceSha256"]==next(a["sha256"] for a in assets if a["path"].endswith(".epub"))
assert len(m["blocks"])>2000
assert all(isinstance(v[1],int) and 1<=v[1]<=602 for v in m["blocks"].values())
front = {k:v for k,v in m["blocks"].items() if not v[0].startswith("原刊")}
assert set(front)=={f"b{i:05d}" for i in range(1,54)}
assert all(v[0]=="底本位置なし（前付）" and 1<=v[1]<=4 for v in front.values())
assert all(v[0].startswith("原刊 p. ") for k,v in m["blocks"].items() if k not in front)
assert not any("底本 p." in v[0] for v in m["blocks"].values())
assert any("原刊 p. XV" in v[0] for v in m["blocks"].values())
assert any("原刊 p. 343" in v[0] for v in m["blocks"].values())
print(json.dumps({"slug":slug,"search_blocks":len(m["blocks"]),"physical_pdf_pages_verified":True,"approved_asset_bytes_verified":True},ensure_ascii=False))
