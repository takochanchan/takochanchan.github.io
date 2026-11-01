"""Upload and byte-verify Teatro Mexicano PDF/EPUB on publications-002."""
import hashlib
import json
import os
from pathlib import Path
import subprocess

assert os.environ.get("GITHUB_ACTIONS") == "true"
REPO = "takochanchan/takochanchan.github.io"
assert os.environ["GITHUB_REPOSITORY"] == REPO
request = json.loads(Path(".teatro-public-request.json").read_text())
ledger = json.loads(Path("master-archive.json").read_text())
assert ledger["archive_commit"] == request["verified_archive_commit"]
TAG = request["release_tag"]
assert TAG == "publications-002"
expected = {a["filename"]: a for a in request["assets"]}
root = Path(Path(".teatro-extracted-path.txt").read_text())
def sha(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()
def run(*args):
    return subprocess.run(args, check=True, stdout=subprocess.PIPE, text=True)
release = json.loads(subprocess.check_output(["gh", "api", f"repos/{REPO}/releases/tags/{TAG}"]))
assert release["tag_name"] == TAG and release["id"] == 423230864
assert not release["draft"] and not release["prerelease"]
pages = json.loads(subprocess.check_output(["gh", "api", "--paginate", "--slurp", f"repos/{REPO}/releases/{release['id']}/assets?per_page=100"]))
existing = {asset["name"]: asset for page in pages for asset in page}
assert len(existing) + sum(name not in existing for name in expected) + 1 <= 1000
for name, asset in expected.items():
    local = root / name
    assert local.is_file() and local.stat().st_size == asset["size"] and sha(local) == asset["sha256"]
    if name in existing:
        verify = root / "verify-existing"
        verify.mkdir(exist_ok=True)
        run("gh", "release", "download", TAG, "--repo", REPO, "--pattern", name, "--dir", str(verify))
        found = verify / name
        assert found.stat().st_size == asset["size"] and sha(found) == asset["sha256"], f"existing release asset collision: {name}"
    else:
        run("gh", "release", "upload", TAG, "--repo", REPO, str(local))
verify = root / "verify"
verify.mkdir(exist_ok=True)
for name, asset in expected.items():
    run("gh", "release", "download", TAG, "--repo", REPO, "--pattern", name, "--dir", str(verify))
    found = verify / name
    assert found.stat().st_size == asset["size"] and sha(found) == asset["sha256"]
run("gh", "release", "download", TAG, "--repo", REPO, "--pattern", "SHA256SUMS.txt", "--dir", str(root))
checksums = root / "SHA256SUMS.txt"
lines = checksums.read_text().splitlines()
target_names = set(expected)
unrelated = [line for line in lines if line.split() and line.split()[-1].lstrip("*") not in target_names]
unrelated_entries = [line.split()[-1].lstrip("*") for line in unrelated]
assert len(unrelated_entries) == len(set(unrelated_entries)), "preexisting checksum file has duplicate unrelated entries"
unrelated.extend(f'{asset["sha256"]}  {name}' for name, asset in expected.items())
checksums.write_text("\n".join(unrelated) + "\n")
run("gh", "release", "upload", TAG, "--repo", REPO, "--clobber", str(checksums))
run("gh", "release", "download", TAG, "--repo", REPO, "--pattern", "SHA256SUMS.txt", "--dir", str(verify))
assert (verify / "SHA256SUMS.txt").read_bytes() == checksums.read_bytes()
Path("teatro-public-verification.json").write_text(json.dumps({
    "slug": request["slug"],
    "verified_archive_commit": request["verified_archive_commit"],
    "source_site_commit": request["source_site_commit"],
    "assets": request["assets"],
    "cover": request["cover"],
    "bundle": request["bundle"],
    "release_tag": TAG,
    "release_id": release["id"],
    "asset_count_before": len(existing),
    "all_downloaded_bytes_verified": True,
    "checksums_preserved": True,
}, indent=2) + "\n")
print("Teatro PDF, EPUB and SHA256SUMS uploaded and download-verified.")
