#!/usr/bin/env python3
"""Reproduce checksum-pinned cover revision; execute only on GitHub Actions."""
import base64,gzip,hashlib,json,os,pathlib,subprocess,tempfile,zipfile
assert os.environ.get("GITHUB_ACTIONS")=="true"
repo=os.environ["GITHUB_REPOSITORY"]
assert repo=="takochanchan/takochanchan.github.io"
slug="fellechner-mueller-hesse-mosquitoland-1845"
expected={".pdf":{"filename":"Fellechner_Mueller_Hesse_Mosquitoland_1845_Japanese_Translation.pdf","size":7882099,"sha256":"e4c96120f659dcbd8b3de77903926c8dbc7353e15ab579f05ecef2a554364c9b"},".jpg":{"filename":"cover.jpg","size":74365,"sha256":"48235f7cf4d8159507f87472c02091251d18c7a8c41d1e461991ed8e49b0c8ae"},".epub":{"filename":"Fellechner_Mueller_Hesse_Mosquitoland_1845_Japanese_Translation.epub","size":24918911,"sha256":"6158c82f12d08647d7d8d49122beb4c153509a4929204339c09138d92586f01f"},".docx":{"filename":"Fellechner_Mueller_Hesse_Mosquitoland_1845_Japanese_Translation.docx","size":26004277,"sha256":"c3d40298f5b6eee016ef7e693ee174a4e30ec3bf68145c46ce46af04d31fc81a"}}
def check(data,meta):
 assert len(data)==meta["size"],(len(data),meta["size"])
 assert hashlib.sha256(data).hexdigest()==meta["sha256"]
def run(*args):subprocess.run(args,check=True)
out=pathlib.Path(os.environ["RUNNER_TEMP"])/"fellechner-cover-assets";out.mkdir(exist_ok=True)
old=out/"old";old.mkdir(exist_ok=True)
for ext in (".pdf",".epub"):
 run("gh","release","download","publications-current","--repo",repo,"--pattern",expected[ext]["filename"],"--dir",str(old))
pdf=old/expected[".pdf"]["filename"]
patch=json.loads(gzip.decompress(pathlib.Path(".publication-transfer/fellechner-cover-pdf.delta.gz").read_bytes()))
data=pdf.read_bytes();check(data,patch["old"])
updated=b"".join(data[op[0]:op[0]+op[1]] if isinstance(op,list) else base64.b64decode(op) for op in patch["ops"])
check(updated,expected[".pdf"]);(out/pdf.name).write_bytes(updated)
cover=pathlib.Path("static/publications")/slug/"cover.jpg";check(cover.read_bytes(),expected[".jpg"])
epub=old/expected[".epub"]["filename"]
assert hashlib.sha256(epub.read_bytes()).hexdigest()=="7c9a575b3a7809186cb047ab76ae60d854d14ff0cd86089abea6ca9066b1f9ce"
with zipfile.ZipFile(epub) as z,zipfile.ZipFile(out/epub.name,"w") as target:
 for info in z.infolist():
  data=z.read(info)
  if info.filename=="EPUB/media/cover.jpg":data=cover.read_bytes()
  elif info.filename=="EPUB/text/ch001.xhtml":
   before="調査報告 · 1\u20608\u20604\u20605".encode()
   assert data.count(before)==1
   data=data.replace(before,("\u2060".join("BERICHT")+" · 1\u20608\u20604\u20605").encode())
  target.writestr(info,data)
check((out/epub.name).read_bytes(),expected[".epub"])
# Run the repository's complete EPUB validation for this publication.
validation=out/"validate";target=validation/"publications"/slug;target.mkdir(parents=True,exist_ok=True)
import shutil
shutil.copy2(out/epub.name,target/epub.name)
run("python3","scripts/validate-epubs.py",str(validation),"--slug",slug)
count=subprocess.check_output(["pdfinfo",str(out/pdf.name)],text=True)
assert "Pages:           325" in count,count
text=subprocess.check_output(["pdftotext","-f","1","-l","1",str(out/pdf.name),"-"],text=True)
assert "BERICHT" in text and "調査報告 ·" not in text
run("gh","release","upload","publications-current",str(out/pdf.name),str(out/epub.name),"--repo",repo,"--clobber")
# Download current checksums immediately before replacing only this pair.
run("gh","release","download","publications-current","--repo",repo,"--pattern","SHA256SUMS.txt","--dir",str(out))
names={pdf.name,epub.name};sums=out/"SHA256SUMS.txt"
lines=[line for line in sums.read_text().splitlines() if not (len(line.split(maxsplit=1))==2 and line.split(maxsplit=1)[1].lstrip("*").rsplit("/",1)[-1] in names)]
for ext in (".pdf",".epub"):lines.append(expected[ext]["sha256"]+"  "+expected[ext]["filename"])
sums.write_text("\n".join(lines)+"\n")
run("gh","release","upload","publications-current",str(sums),"--repo",repo,"--clobber")
verified=out/"verified";verified.mkdir(exist_ok=True)
for ext in (".pdf",".epub"):
 meta=expected[ext];run("gh","release","download","publications-current","--repo",repo,"--pattern",meta["filename"],"--dir",str(verified));check((verified/meta["filename"]).read_bytes(),meta)
run("gh","release","download","publications-current","--repo",repo,"--pattern","SHA256SUMS.txt","--dir",str(verified))
assert (verified/"SHA256SUMS.txt").read_bytes()==sums.read_bytes()
pathlib.Path("fellechner-cover-verification.json").write_text(json.dumps({"slug":slug,"assets":expected,"verified":True},indent=2)+"\n")
