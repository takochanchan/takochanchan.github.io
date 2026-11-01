"""Stage and verify the approved Teatro Mexicano publication assets."""
import base64
import gzip
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import tarfile
import tempfile

assert os.environ.get("GITHUB_ACTIONS") == "true"
REPO = "takochanchan/takochanchan.github.io"
assert os.environ["GITHUB_REPOSITORY"] == REPO
request = json.loads(Path(".teatro-public-request.json").read_text())
ledger = json.loads(Path("master-archive.json").read_text())
assert re.fullmatch(r"[0-9a-f]{40}", request["verified_archive_commit"])
assert ledger["archive_commit"] == request["verified_archive_commit"]
assert request["verified_archive_commit"] == "3e9805a1b986f11804accf3eafcfc90db5a8afac"
assert request["source_site_commit"] == "4cc15a1969f6d40d05bb09672828aee311d431e0"
expected = {a["filename"]: a for a in request["assets"]}
assert len(expected) == len(request["assets"]) == 2
assert set(expected) == {
    "Agustin_de_Vetancurt_Teatro_Mexicano_1697_1698_Japanese_Translation.epub",
    "Agustin_de_Vetancurt_Teatro_Mexicano_1697_1698_Japanese_Translation.pdf",
}
assert expected["Agustin_de_Vetancurt_Teatro_Mexicano_1697_1698_Japanese_Translation.epub"] == {
    "filename": "Agustin_de_Vetancurt_Teatro_Mexicano_1697_1698_Japanese_Translation.epub",
    "size": 1191403,
    "sha256": "5f16f2aa4894c14403616e03ca8c9e385e431751343c929454f5a09475937582",
}
assert expected["Agustin_de_Vetancurt_Teatro_Mexicano_1697_1698_Japanese_Translation.pdf"] == {
    "filename": "Agustin_de_Vetancurt_Teatro_Mexicano_1697_1698_Japanese_Translation.pdf",
    "size": 13358215,
    "sha256": "d2f0b3bfd86551746f72edc02367e7398bc24c2db1dfeeefb929aa19c6986701",
}
def sha(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()
cover = request["cover"]
cover_path = Path(cover["path"])
assert str(cover_path) == "static/publications/teatro-mexicano-vetancurt-1697-1698-ja/cover.jpg"
assert cover_path.is_file() and cover_path.stat().st_size == cover["size"] == 50358
assert sha(cover_path) == cover["sha256"] == "88c96388dbd4c0e04d80b17d759bbd2a5553e9f8f16e4ffba4e8ed14d93e29e9"
bundle_spec = request["bundle"]
assert len(bundle_spec["chunks"]) == 35
assert all(re.fullmatch(r"[0-9a-f]{40}", oid) for oid in bundle_spec["chunks"])
root = Path(tempfile.mkdtemp(prefix="teatro-transfer-"))
bundle = root / "public.tar.gz"
def run(*args):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, text=True)
with bundle.open("wb") as out:
    for oid in bundle_spec["chunks"]:
        blob = json.loads(subprocess.check_output(["gh", "api", f"repos/{REPO}/git/blobs/{oid}"]))
        assert blob["sha"] == oid and blob["encoding"] == "base64"
        data = base64.b64decode(re.sub(r"\s+", "", blob["content"]), validate=True)
        assert hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest() == oid
        assert blob["size"] == len(data)
        out.write(data)
assert bundle.stat().st_size == bundle_spec["size"] == 8600643
assert sha(bundle) == bundle_spec["sha256"] == "068e3b5a0becda96e2286b741ccc7e9e64b211c56cb83c54db6cbb59e392e331"
with gzip.open(bundle, "rb") as check:
    while check.read(1024 * 1024):
        pass
with tarfile.open(bundle, "r:gz") as archive:
    members = archive.getmembers()
    assert len(members) == 2 and {m.name for m in members} == set(expected)
    assert all(m.isfile() and PurePosixPath(m.name).name == m.name for m in members)
    archive.extractall(root, filter="data")
for name, asset in expected.items():
    local = root / name
    assert local.is_file() and local.stat().st_size == asset["size"] and sha(local) == asset["sha256"]
Path(".teatro-extracted-path.txt").write_text(str(root))
print("Teatro asset bundle, cover, private archive commit, SHA and exact two-file set verified.")
