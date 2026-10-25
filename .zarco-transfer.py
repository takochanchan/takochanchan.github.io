import base64
import hashlib
import json
import os
import pathlib
import re
import subprocess
import tarfile
import tempfile


REPO = "takochanchan/takochanchan.github.io"
assert os.environ.get("GITHUB_ACTIONS") == "true"
assert os.environ["GITHUB_REPOSITORY"] == REPO

request = json.loads(pathlib.Path(".zarco-public-request.json").read_text())
assert len(request["verified_archive_commit"]) == 40
release_tag = request["release_tag"]
assert re.fullmatch(r"[A-Za-z0-9._-]+", release_tag)
release_id = request["existing_release_id"]
previous_release_tag = request["previous_release_tag"]
assert release_tag == "publications-002"
assert release_id == 423230864
assert previous_release_tag == "zarco-publication-20261025"
temp = pathlib.Path(tempfile.mkdtemp())
bundle = temp / "public.tar.gz"


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(*args):
    return subprocess.run(args, check=True)


with bundle.open("wb") as out:
    for oid in request["bundle"]["chunks"]:
        blob = json.loads(
            subprocess.check_output(
                ["gh", "api", f"repos/{REPO}/git/blobs/{oid}"]
            )
        )
        out.write(base64.b64decode(blob["content"]))

assert bundle.stat().st_size == request["bundle"]["size"]
assert sha256(bundle) == request["bundle"]["sha256"]
assets = {item["filename"]: item for item in request["assets"]}
with tarfile.open(bundle) as archive:
    members = archive.getmembers()
    assert {member.name for member in members} == set(assets)
    for member in members:
        assert member.isfile()
        assert pathlib.PurePosixPath(member.name).name == member.name
    archive.extractall(temp, filter="data")

for name, asset in assets.items():
    path = temp / name
    assert path.stat().st_size == asset["size"]
    assert sha256(path) == asset["sha256"]

checksums = temp / "SHA256SUMS.txt"
checksums.write_text(
    "".join(f'{asset["sha256"]}  {name}\n' for name, asset in assets.items())
)

tag_probe = subprocess.run(
    ["gh", "api", f"repos/{REPO}/releases/tags/{release_tag}"],
    capture_output=True,
    text=True,
)
assert tag_probe.returncode != 0 and "404" in tag_probe.stderr
release_api = f"repos/{REPO}/releases/{release_id}"
release_before = json.loads(subprocess.check_output(["gh", "api", release_api]))
assert release_before["id"] == release_id
assert release_before["tag_name"] == previous_release_tag
expected_asset_names = set(assets) | {"SHA256SUMS.txt"}
release_assets_before = {asset["name"]: asset for asset in release_before["assets"]}
assert set(release_assets_before) == expected_asset_names
for name, asset in assets.items():
    existing = release_assets_before[name]
    assert existing["size"] == asset["size"]
    assert existing["digest"] == f'sha256:{asset["sha256"]}'

verify_before = temp / "verify-before"
verify_before.mkdir()
for name, asset in assets.items():
    run(
        "gh", "release", "download", previous_release_tag, "--repo", REPO,
        "--pattern", name, "--dir", str(verify_before)
    )
    downloaded = verify_before / name
    assert downloaded.stat().st_size == asset["size"]
    assert sha256(downloaded) == asset["sha256"]
run(
    "gh", "release", "download", previous_release_tag, "--repo", REPO,
    "--pattern", "SHA256SUMS.txt", "--dir", str(verify_before)
)
assert (verify_before / "SHA256SUMS.txt").read_bytes() == checksums.read_bytes()

subprocess.check_output([
    "gh", "api", "--method", "PATCH", release_api,
    "-f", f"tag_name={release_tag}",
    "-f", "name=Publications 002",
    "-f", "body=PDF and EPUB files for the public digital collection.",
])
release_after = json.loads(subprocess.check_output(["gh", "api", release_api]))
assert release_after["tag_name"] == release_tag
release_assets_after = {asset["name"]: asset for asset in release_after["assets"]}
assert {
    name: asset["id"] for name, asset in release_assets_after.items()
} == {
    name: asset["id"] for name, asset in release_assets_before.items()
}
for name, asset in assets.items():
    existing = release_assets_after[name]
    assert existing["size"] == asset["size"]
    assert existing["digest"] == f'sha256:{asset["sha256"]}'

verify_after = temp / "verify-after"
verify_after.mkdir()
for name, asset in assets.items():
    run(
        "gh", "release", "download", release_tag, "--repo", REPO,
        "--pattern", name, "--dir", str(verify_after)
    )
    downloaded = verify_after / name
    assert downloaded.stat().st_size == asset["size"]
    assert sha256(downloaded) == asset["sha256"]
run(
    "gh", "release", "download", release_tag, "--repo", REPO,
    "--pattern", "SHA256SUMS.txt", "--dir", str(verify_after)
)
assert (verify_after / "SHA256SUMS.txt").read_bytes() == checksums.read_bytes()

pathlib.Path("zarco-public-verification.json").write_text(
    json.dumps(
        {
            "verified_archive_commit": request["verified_archive_commit"],
            "release_id": release_id,
            "previous_release_tag": previous_release_tag,
            "release_tag": release_tag,
            "assets": request["assets"],
            "asset_ids_preserved": {
                name: asset["id"] for name, asset in release_assets_after.items()
            },
            "all_downloaded_bytes_verified": True,
        },
        indent=2,
    )
)
