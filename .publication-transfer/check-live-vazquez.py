import hashlib,json,time,urllib.request
from html.parser import HTMLParser
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.links=[]; self.text=[]
    def handle_starttag(self,tag,attrs):
        if tag=="a": self.links += [v for k,v in attrs if k=="href"]
    def handle_data(self,data): self.text.append(data)
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Publication-Live-Verification"}),timeout=60) as r:
        assert r.status==200
        return r.read()
base="https://takochanchan.github.io/"
url=base+"publications/vazquez-pedro-betancur-1962/"
assets=[{"path":"publications/vazquez-pedro-betancur-1962/Francisco_Vazquez_Pedro_de_San_Jose_de_Betancur_Japanese_Translation.epub","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Francisco_Vazquez_Pedro_de_San_Jose_de_Betancur_Japanese_Translation.epub","size":681164,"sha256":"7baa7388254cc721d84f77c0dd678a426b1b4dd43df34800822aae37cf2d8194"},{"path":"publications/vazquez-pedro-betancur-1962/Francisco_Vazquez_Pedro_de_San_Jose_de_Betancur_Japanese_Translation.pdf","url":"https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/Francisco_Vazquez_Pedro_de_San_Jose_de_Betancur_Japanese_Translation.pdf","size":4626862,"sha256":"a414df21138e344b2af4f1d32d1691c2db15fad8ad028982f525a3d623b29b08"},{"path":"publications/vazquez-pedro-betancur-1962/cover.jpg","url":"https://takochanchan.github.io/publications/vazquez-pedro-betancur-1962/cover.jpg","size":41546,"sha256":"bf6b1b960781e205add197e205a66789e53d89bad94eadc9a36b5429491d9eea"}]
for attempt in range(18):
    try:
        raw=get(url); p=Page(); p.feed(raw.decode("utf-8"))
        assert "ベタンクールの生涯と徳行" in "".join(p.text)
        for a in assets:
            if not a["path"].endswith("cover.jpg"): assert a["url"] in p.links, a["path"]
        cover=next(a for a in assets if a["path"].endswith("cover.jpg"))
        b=get(cover["url"])
        assert len(b)==cover["size"] and hashlib.sha256(b).hexdigest()==cover["sha256"]
        print(json.dumps({"url":url,"title_verified":True,"pdf_and_epub_links_verified":True,"cover_bytes_verified":True},ensure_ascii=False))
        break
    except Exception:
        if attempt==17: raise
        time.sleep(10)
