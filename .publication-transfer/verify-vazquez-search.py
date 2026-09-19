import hashlib, io, json, urllib.request, zipfile
slug="vazquez-pedro-betancur-1962"
base="https://takochanchan.github.io/"
assets=[{"path":"publications/vazquez-pedro-betancur-1962/Francisco_Vazquez_Pedro_de_San_Jose_de_Betancur_Japanese_Translation.epub","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Francisco_Vazquez_Pedro_de_San_Jose_de_Betancur_Japanese_Translation.epub","size":681167,"sha256":"27b113e4366b65e4a42142c3a4026fed4048c9364fe9601c954a3acbf6b018cd"},{"path":"publications/vazquez-pedro-betancur-1962/Francisco_Vazquez_Pedro_de_San_Jose_de_Betancur_Japanese_Translation.pdf","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Francisco_Vazquez_Pedro_de_San_Jose_de_Betancur_Japanese_Translation.pdf","size":4601713,"sha256":"667f618478f1674d763ea9a9eb5b5b6ed67a728b5dc674aa291bc21a90474005"}]
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
assert all(v[0].startswith("底本") for v in m["blocks"].values())
assert any("底本 p. XV" in v[0] for v in m["blocks"].values())
assert any("底本 p. 343" in v[0] for v in m["blocks"].values())
print(json.dumps({"slug":slug,"search_blocks":len(m["blocks"]),"physical_pdf_pages_verified":True,"approved_asset_bytes_verified":True},ensure_ascii=False))
