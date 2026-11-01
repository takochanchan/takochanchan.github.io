"""Actions-only validator and staging for Arce 1762 PDF/EPUB release."""
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
request = json.loads(Path(".arce-public-request.json").read_text())
ledger = json.loads(Path("master-archive.json").read_text())
assert re.fullmatch(r"[0-9a-f]{40}", request["verified_archive_commit"])
assert ledger["archive_commit"] == request["verified_archive_commit"]
assert request["verified_archive_commit"] == "c555db16009a44a21e11ac7b41673917517fff0c"
expected = {a["filename"]: a for a in request["assets"]}
assert len(expected) == len(request["assets"]) == 2
assert set(expected) == {
    "Juan_Diaz_de_Arce_Bernardino_Alvarez_1762_Japanese_Translation.epub",
    "Juan_Diaz_de_Arce_Bernardino_Alvarez_1762_Japanese_Translation.pdf",
}
assert expected["Juan_Diaz_de_Arce_Bernardino_Alvarez_1762_Japanese_Translation.epub"] == {
    "filename": "Juan_Diaz_de_Arce_Bernardino_Alvarez_1762_Japanese_Translation.epub",
    "size": 47056585,
    "sha256": "7282ce71d117ce2103d7c64e8575be63f33d746a83c3b16581b02ae4bac5f190",
}
assert expected["Juan_Diaz_de_Arce_Bernardino_Alvarez_1762_Japanese_Translation.pdf"] == {
    "filename": "Juan_Diaz_de_Arce_Bernardino_Alvarez_1762_Japanese_Translation.pdf",
    "size": 6524937,
    "sha256": "f6c07528522222bb45f602ab7f58e9a2271b81c3aedf531952fc86803bcf6598",
}
cover = request["cover"]
cover_path = Path(cover["path"])
assert str(cover_path) == "static/publications/arce-libro-vida-proximo-evangelico-1762/cover.jpg"
def sha(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()
assert cover_path.stat().st_size == cover["size"] == 87995
assert sha(cover_path) == cover["sha256"] == "9a59250ab56d4564849b52aaeba8be011f5a7ceb31528c274a68e4251317fb46"
bundle_spec = request["bundle"]
assert len(bundle_spec["chunks"]) == 101
assert all(re.fullmatch(r"[0-9a-f]{40}", oid) for oid in bundle_spec["chunks"])
root = Path(tempfile.mkdtemp(prefix="arce-transfer-"))
bundle = root / "public.tar.gz"
def run(*args):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, text=True)
with bundle.open("wb") as out:
    for oid in bundle_spec["chunks"]:
        blob = json.loads(subprocess.check_output(["gh", "api", f"repos/{REPO}/git/blobs/{oid}"]))
        assert blob["sha"] == oid and blob["encoding"] == "base64"
        data = base64.b64decode("".join(blob["content"].split()), validate=True)
        assert hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest() == oid
        assert blob["size"] == len(data)
        out.write(data)
assert bundle.stat().st_size == bundle_spec["size"]
assert sha(bundle) == bundle_spec["sha256"]
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
Path(".arce-extracted-path.txt").write_text(str(root))
print("Arce asset bundle, cover, private archive commit, SHA and file set verified.")
