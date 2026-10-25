import base64
import hashlib
import json
import os
import pathlib
import subprocess
import tarfile
import tempfile


REPO = "takochanchan/takochanchan.github.io"
assert os.environ.get("GITHUB_ACTIONS") == "true"
assert os.environ["GITHUB_REPOSITORY"] == REPO

request = json.loads(pathlib.Path(".zarco-public-request.json").read_text())
assert len(request["verified_archive_commit"]) == 40
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
    run("gh", "release", "upload", "publications-current", "--repo", REPO, str(path))

verify = temp / "verify"
verify.mkdir()
for name, asset in assets.items():
    run(
        "gh", "release", "download", "publications-current", "--repo", REPO,
        "--pattern", name, "--dir", str(verify)
    )
    downloaded = verify / name
    assert downloaded.stat().st_size == asset["size"]
    assert sha256(downloaded) == asset["sha256"]

run(
    "gh", "release", "download", "publications-current", "--repo", REPO,
    "--pattern", "SHA256SUMS.txt", "--dir", str(temp)
)
checksums = temp / "SHA256SUMS.txt"
lines = [
    line for line in checksums.read_text().splitlines()
    if line.split() and line.split()[-1].lstrip("*") not in assets
]
lines.extend(f'{asset["sha256"]}  {name}' for name, asset in assets.items())
checksums.write_text("\n".join(lines) + "\n")
run(
    "gh", "release", "upload", "publications-current", "--repo", REPO,
    "--clobber", str(checksums)
)
run(
    "gh", "release", "download", "publications-current", "--repo", REPO,
    "--pattern", "SHA256SUMS.txt", "--dir", str(verify)
)
assert (verify / "SHA256SUMS.txt").read_bytes() == checksums.read_bytes()

pathlib.Path("zarco-public-verification.json").write_text(
    json.dumps(
        {
            "verified_archive_commit": request["verified_archive_commit"],
            "assets": request["assets"],
            "all_downloaded_bytes_verified": True,
        },
        indent=2,
    )
)
