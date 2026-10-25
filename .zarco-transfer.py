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
release = subprocess.run(
    ["gh", "release", "view", release_tag, "--repo", REPO],
    capture_output=True,
    text=True,
)
if release.returncode != 0:
    run(
        "gh", "release", "create", release_tag, "--repo", REPO,
        "--title", "Francisco Zarco: Historia del Congreso (1856–1857)",
        "--notes", "PDF and EPUB files for the two-volume Japanese edition.",
    )
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
run(
    "gh", "release", "upload", release_tag, "--repo", REPO,
    "--clobber", *[str(temp / name) for name in assets], str(checksums)
)

verify = temp / "verify"
verify.mkdir()
for name, asset in assets.items():
    run(
        "gh", "release", "download", release_tag, "--repo", REPO,
        "--pattern", name, "--dir", str(verify)
    )
    downloaded = verify / name
    assert downloaded.stat().st_size == asset["size"]
    assert sha256(downloaded) == asset["sha256"]

run(
    "gh", "release", "download", release_tag, "--repo", REPO,
    "--pattern", "SHA256SUMS.txt", "--dir", str(verify)
)
assert (verify / "SHA256SUMS.txt").read_bytes() == checksums.read_bytes()

pathlib.Path("zarco-public-verification.json").write_text(
    json.dumps(
        {
            "verified_archive_commit": request["verified_archive_commit"],
            "release_tag": release_tag,
            "assets": request["assets"],
            "all_downloaded_bytes_verified": True,
        },
        indent=2,
    )
)
