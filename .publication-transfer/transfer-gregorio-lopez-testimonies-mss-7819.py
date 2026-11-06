#!/usr/bin/env python3
"""GitHub Actions-only release upload and byte verification for López testimony collection MSS/7819."""
import base64
import hashlib
import io
import json
import os
import pathlib
import re
import subprocess
import tarfile
import tempfile

assert os.environ.get("GITHUB_ACTIONS") == "true", "GitHub-hosted execution required"
REPO = "takochanchan/takochanchan.github.io"
assert os.environ.get("GITHUB_REPOSITORY") == REPO
SLUG = "gregorio-lopez-testimonies-mss-7819"
request = json.loads(pathlib.Path(f".publication-upload-requests/{SLUG}.json").read_text())
assert request["slug"] == SLUG and request["release_tag"] == "publications-002"
archive_head = json.loads(pathlib.Path("master-archive.json").read_text())["archive_commit"]
assert request["verified_archive_commit"] == archive_head and re.fullmatch(r"[0-9a-f]{40}", archive_head)

expected_names = {
    "Gregorio_Lopez_Testimonies_MSS7819_Japanese_Translation_Source_Format.pdf",
    "Gregorio_Lopez_Testimonies_MSS7819_Japanese_Translation_Source_Format.epub",
}
expected = {asset["filename"]: asset for asset in request["assets"]}
assert set(expected) == expected_names and len(expected) == 2

manifest = json.loads(pathlib.Path("assets-manifest.json").read_text())
manifest_by_path = {asset["path"]: asset for asset in manifest["assets"]}
for name, asset in expected.items():
    path = f"publications/{SLUG}/{name}"
    recorded = manifest_by_path[path]
    assert asset["path"] == path
    assert asset["url"] == recorded["url"]
    assert asset["size"] == recorded["size"]
    assert asset["sha256"] == recorded["sha256"]

def sha(data):
    return hashlib.sha256(data).hexdigest()

def gh_json(path):
    return json.loads(subprocess.check_output(["gh", "api", path], text=True))

bundle = bytearray()
for blob in request["bundle"]["chunks"]:
    assert re.fullmatch(r"[0-9a-f]{40}", blob)
    response = gh_json(f"repos/{REPO}/git/blobs/{blob}")
    assert response["sha"] == blob and response["encoding"] == "base64"
    data = base64.b64decode(response["content"])
    assert hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest() == blob
    bundle.extend(data)
assert len(bundle) == request["bundle"]["size"] and sha(bundle) == request["bundle"]["sha256"]

with tempfile.TemporaryDirectory() as tmp:
    root = pathlib.Path(tmp)
    with tarfile.open(fileobj=io.BytesIO(bundle), mode="r:gz") as archive:
        members = [member for member in archive.getmembers() if member.isfile()]
        assert len(members) == 2 and {member.name for member in members} == expected_names
        for member in members:
            assert member.name == pathlib.PurePosixPath(member.name).name
            data = archive.extractfile(member).read()
            asset = expected[member.name]
            assert len(data) == asset["size"] and sha(data) == asset["sha256"]
            (root / member.name).write_bytes(data)

    release = gh_json(f"repos/{REPO}/releases/tags/{request['release_tag']}")
    assert release["tag_name"] == request["release_tag"]
    asset_pages = json.loads(subprocess.check_output([
        "gh", "api", "--paginate", "--slurp",
        f"repos/{REPO}/releases/{release['id']}/assets?per_page=100"
    ], text=True))
    existing = {item["name"] for page in asset_pages for item in page}
    projected = len(existing) + sum(name not in existing for name in expected) + ("SHA256SUMS.txt" not in existing)
    assert projected <= 1000, f"Projected release asset count exceeds limit: {projected}"
    for name in expected:
        if name not in existing:
            subprocess.run(["gh", "release", "upload", request["release_tag"], "--repo", REPO, str(root / name)], check=True)

    verify = root / "verify"
    verify.mkdir()
    for name, asset in expected.items():
        subprocess.run(["gh", "release", "download", request["release_tag"], "--repo", REPO, "--pattern", name, "--dir", str(verify)], check=True)
        downloaded = (verify / name).read_bytes()
        assert len(downloaded) == asset["size"] and sha(downloaded) == asset["sha256"]

    subprocess.run(["gh", "release", "download", request["release_tag"], "--repo", REPO, "--pattern", "SHA256SUMS.txt", "--dir", str(root)], check=True)
    sums = root / "SHA256SUMS.txt"
    lines = [
        line for line in sums.read_text().splitlines()
        if line.split() and pathlib.PurePosixPath(line.split()[-1].lstrip("*")).name not in expected
    ]
    lines.extend(f'{asset["sha256"]}  {name}' for name, asset in expected.items())
    sums.write_text("\n".join(lines) + "\n")
    subprocess.run(["gh", "release", "upload", request["release_tag"], "--repo", REPO, "--clobber", str(sums)], check=True)
    subprocess.run(["gh", "release", "download", request["release_tag"], "--repo", REPO, "--pattern", "SHA256SUMS.txt", "--dir", str(verify)], check=True)
    assert (verify / "SHA256SUMS.txt").read_bytes() == sums.read_bytes()
    for name, asset in expected.items():
        assert f'{asset["sha256"]}  {name}' in sums.read_text().splitlines()

pathlib.Path("lopez7819-release-verification.json").write_text(json.dumps({
    "slug": SLUG,
    "release_tag": request["release_tag"],
    "verified_archive_commit": archive_head,
    "bundle": request["bundle"],
    "assets": request["assets"],
    "checksum_asset_updated_and_downloaded": True,
    "all_downloaded_bytes_verified": True,
}, ensure_ascii=False, indent=2) + "\n")

