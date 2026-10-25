"""Actions-only transfer of the approved Dancer PDF and EPUB to publications-002."""
import base64, gzip, hashlib, json, os, re, subprocess, tarfile, tempfile
from pathlib import Path, PurePosixPath

assert os.environ.get("GITHUB_ACTIONS") == "true"
REPO = "takochanchan/takochanchan.github.io"
assert os.environ["GITHUB_REPOSITORY"] == REPO
request = json.loads(Path(".dancer-public-request-final.json").read_text())
assert re.fullmatch(r"[0-9a-f]{40}", request["verified_archive_commit"])
assert json.loads(Path("master-archive.json").read_text())["archive_commit"] == request["verified_archive_commit"]
TAG = request["release_tag"]
assert TAG == "publications-002"
expected = {asset["filename"]: asset for asset in request["assets"]}
assert set(expected) == {
    "Thomas_Dancer_San_Juan_1781_Japanese_Complete_Translation.pdf",
    "Thomas_Dancer_San_Juan_1781_Japanese_Complete_Translation.epub",
}
root = Path(tempfile.mkdtemp())
bundle = root / "public.tar.gz"
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def run(*args, **kwargs):
    return subprocess.run(args, check=True, **kwargs)
with bundle.open("wb") as out:
    for oid in request["bundle"]["chunks"]:
        assert re.fullmatch(r"[0-9a-f]{40}", oid)
        blob = json.loads(subprocess.check_output(["gh", "api", f"repos/{REPO}/git/blobs/{oid}"]))
        assert blob["sha"] == oid and blob["encoding"] == "base64"
        data = base64.b64decode(blob["content"])
        assert blob["size"] == len(data)
        assert hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest() == oid
        out.write(data)
assert bundle.stat().st_size == request["bundle"]["size"] and sha(bundle) == request["bundle"]["sha256"]
with gzip.open(bundle, "rb") as check:
    while check.read(1024 * 1024):
        pass
with tarfile.open(bundle) as archive:
    members = archive.getmembers()
    assert len(members) == len(expected) and {PurePosixPath(m.name).name for m in members} == set(expected)
    assert all(m.isfile() and PurePosixPath(m.name).name == m.name for m in members)
    archive.extractall(root, filter="data")
for name, asset in expected.items():
    local = root / name
    assert local.stat().st_size == asset["size"] and sha(local) == asset["sha256"]
release = json.loads(subprocess.check_output(["gh", "api", f"repos/{REPO}/releases/tags/{TAG}"]))
assert release["tag_name"] == TAG
pages = json.loads(subprocess.check_output(["gh", "api", "--paginate", "--slurp", f"repos/{REPO}/releases/{release['id']}/assets?per_page=100"]))
existing = {asset["name"]: asset for page in pages for asset in page}
missing = [name for name in expected if name not in existing]
assert len(existing) + len(missing) + (0 if "SHA256SUMS.txt" in existing else 1) <= 1000
verify = root / "verify"
verify.mkdir()
for name, asset in expected.items():
    if name in existing:
        run("gh", "release", "download", TAG, "--repo", REPO, "--pattern", name, "--dir", str(verify))
        local = verify / name
        assert local.stat().st_size == asset["size"] and sha(local) == asset["sha256"]
    else:
        run("gh", "release", "upload", TAG, "--repo", REPO, str(root / name))
        run("gh", "release", "download", TAG, "--repo", REPO, "--pattern", name, "--dir", str(verify))
        local = verify / name
        assert local.stat().st_size == asset["size"] and sha(local) == asset["sha256"]
checksums = root / "SHA256SUMS.txt"
if "SHA256SUMS.txt" in existing:
    run("gh", "release", "download", TAG, "--repo", REPO, "--pattern", "SHA256SUMS.txt", "--dir", str(root))
    lines = [line for line in checksums.read_text().splitlines() if line.split() and line.split()[-1].lstrip("*") not in expected]
else:
    lines = []
lines.extend(f'{asset["sha256"]}  {name}' for name, asset in expected.items())
checksums.write_text("\n".join(lines) + "\n")
run("gh", "release", "upload", TAG, "--repo", REPO, "--clobber", str(checksums))
verify_sums = root / "checksum-verify"
verify_sums.mkdir()
run("gh", "release", "download", TAG, "--repo", REPO, "--pattern", "SHA256SUMS.txt", "--dir", str(verify_sums))
assert (verify_sums / "SHA256SUMS.txt").read_bytes() == checksums.read_bytes()
after = json.loads(subprocess.check_output(["gh", "api", "--paginate", "--slurp", f"repos/{REPO}/releases/{release['id']}/assets?per_page=100"]))
asset_count_after = sum(len(page) for page in after)
Path("dancer-san-juan-public-verification.json").write_text(json.dumps({
    "verified_archive_commit": request["verified_archive_commit"], "release_tag": TAG,
    "release_id": release["id"], "asset_count_before": len(existing),
    "asset_count_after": asset_count_after, "assets": request["assets"],
    "bundle": request["bundle"], "all_downloaded_bytes_verified": True,
}, indent=2) + "\n")
