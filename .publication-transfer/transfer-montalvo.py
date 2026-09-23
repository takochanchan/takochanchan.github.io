#!/usr/bin/env python3
"""Transfer checksum-pinned Montalvo assets on a GitHub-hosted runner only."""

import base64
import hashlib
import io
import json
import os
import pathlib
import subprocess
import tarfile
import tempfile
import urllib.request


assert os.environ.get("GITHUB_ACTIONS") == "true"
REPOSITORY = os.environ["GITHUB_REPOSITORY"]
assert REPOSITORY == "takochanchan/takochanchan.github.io"
REQUEST = json.loads(pathlib.Path(".publication-upload-requests/montalvo-betancur-1683.json").read_text())
assert REQUEST["slug"] == "montalvo-betancur-1683"
assert REQUEST["release_tag"] == "publications-current"
assert len(REQUEST["verified_archive_commit"]) == 40


def digest(data):
    return hashlib.sha256(data).hexdigest()


def github_json(path):
    req = urllib.request.Request(
        "https://api.github.com/repos/" + REPOSITORY + "/" + path,
        headers={
            "Authorization": "Bearer " + os.environ["GH_TOKEN"],
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    with urllib.request.urlopen(req) as response:
        return json.load(response)


bundle = b""
for oid in REQUEST["bundle"]["chunks"]:
    assert len(oid) == 40 and all(c in "0123456789abcdef" for c in oid)
    blob = github_json("git/blobs/" + oid)
    assert blob["encoding"] == "base64"
    bundle += base64.b64decode(blob["content"])
assert len(bundle) == REQUEST["bundle"]["size"]
assert digest(bundle) == REQUEST["bundle"]["sha256"]

expected = {item["filename"]: item for item in REQUEST["assets"]}
assert len(expected) == 2
with tempfile.TemporaryDirectory() as tmp:
    directory = pathlib.Path(tmp)
    with tarfile.open(fileobj=io.BytesIO(bundle), mode="r:gz") as archive:
        members = archive.getmembers()
        assert len(members) == 2
        assert {member.name for member in members} == set(expected)
        for member in members:
            assert member.isfile() and member.name == pathlib.PurePosixPath(member.name).name
            assert member.name.endswith((".pdf", ".epub"))
            payload = archive.extractfile(member).read()
            item = expected[member.name]
            assert len(payload) == item["size"] and digest(payload) == item["sha256"]
            (directory / member.name).write_bytes(payload)

    subprocess.run(
        ["gh", "release", "upload", "publications-current",
         *(str(directory / name) for name in expected), "--repo", REPOSITORY, "--clobber"],
        check=True,
    )
    verified = directory / "verified"
    verified.mkdir()
    for name, item in expected.items():
        subprocess.run(
            ["gh", "release", "download", "publications-current", "--repo", REPOSITORY,
             "--pattern", name, "--dir", str(verified)],
            check=True,
        )
        payload = (verified / name).read_bytes()
        assert len(payload) == item["size"] and digest(payload) == item["sha256"]

    sums = directory / "SHA256SUMS.txt"
    subprocess.run(
        ["gh", "release", "download", "publications-current", "--repo", REPOSITORY,
         "--pattern", sums.name, "--dir", str(directory)], check=True,
    )
    kept = []
    for line in sums.read_text().splitlines():
        fields = line.split(maxsplit=1)
        filename = fields[1].lstrip("*").rsplit("/", 1)[-1] if len(fields) == 2 else ""
        if filename not in expected:
            kept.append(line)
    kept.extend(item["sha256"] + "  " + name for name, item in expected.items())
    sums.write_text("\n".join(kept) + "\n")
    subprocess.run(
        ["gh", "release", "upload", "publications-current", str(sums),
         "--repo", REPOSITORY, "--clobber"], check=True,
    )
    subprocess.run(
        ["gh", "release", "download", "publications-current", "--repo", REPOSITORY,
         "--pattern", sums.name, "--dir", str(verified)], check=True,
    )
    assert (verified / sums.name).read_bytes() == sums.read_bytes()

pathlib.Path("release-byte-verification.json").write_text(json.dumps({
    "slug": REQUEST["slug"],
    "verified_archive_commit": REQUEST["verified_archive_commit"],
    "assets": REQUEST["assets"],
    "all_downloaded_bytes_verified": True,
}, indent=2) + "\n")
