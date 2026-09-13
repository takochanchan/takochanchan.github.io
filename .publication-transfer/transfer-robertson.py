#!/usr/bin/env python3
"""Execute only on the GitHub-hosted one-shot Actions runner, never locally."""

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


assert os.environ.get("GITHUB_ACTIONS") == "true", "GitHub-hosted execution required"
repo = os.environ["GITHUB_REPOSITORY"]
assert repo == "takochanchan/takochanchan.github.io"
request = json.loads(
    pathlib.Path(
        ".publication-upload-requests/robertson-history-america-1777-1796.json"
    ).read_text()
)
assert request["slug"] == "robertson-history-america-1777-1796"
assert request["release_tag"] == "publications-current"
assert len(request["verified_archive_commit"]) == 40


def digest(data):
    return hashlib.sha256(data).hexdigest()


def github_json(path):
    api_request = urllib.request.Request(
        "https://api.github.com/repos/" + repo + "/" + path,
        headers={
            "Authorization": "Bearer " + os.environ["GH_TOKEN"],
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )
    with urllib.request.urlopen(api_request) as response:
        return json.load(response)


data = b""
for blob in request["bundle"]["chunks"]:
    assert len(blob) == 40 and all(c in "0123456789abcdef" for c in blob)
    response = github_json("git/blobs/" + blob)
    assert response["encoding"] == "base64"
    data += base64.b64decode(response["content"])
assert len(data) == request["bundle"]["size"]
assert digest(data) == request["bundle"]["sha256"]

with tempfile.TemporaryDirectory() as temporary:
    temporary = pathlib.Path(temporary)
    expected = {asset["filename"]: asset for asset in request["assets"]}
    assert len(expected) == 6
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as archive:
        members = archive.getmembers()
        assert len(members) == len(expected)
        assert all(member.isfile() for member in members)
        assert {member.name for member in members} == set(expected)
        for member in members:
            assert member.name == pathlib.PurePosixPath(member.name).name
            assert member.name.endswith((".pdf", ".epub"))
            payload = archive.extractfile(member).read()
            asset = expected[member.name]
            assert len(payload) == asset["size"]
            assert digest(payload) == asset["sha256"]
            (temporary / member.name).write_bytes(payload)

    paths = [str(temporary / name) for name in expected]
    subprocess.run(
        [
            "gh",
            "release",
            "upload",
            "publications-current",
            *paths,
            "--repo",
            repo,
            "--clobber",
        ],
        check=True,
    )

    verification = temporary / "verify"
    verification.mkdir()
    for name, asset in expected.items():
        subprocess.run(
            [
                "gh",
                "release",
                "download",
                "publications-current",
                "--repo",
                repo,
                "--pattern",
                name,
                "--dir",
                str(verification),
            ],
            check=True,
        )
        payload = (verification / name).read_bytes()
        assert len(payload) == asset["size"]
        assert digest(payload) == asset["sha256"]

    pathlib.Path("release-byte-verification.json").write_text(
        json.dumps(
            {
                "slug": request["slug"],
                "verified_archive_commit": request["verified_archive_commit"],
                "assets": request["assets"],
                "all_downloaded_bytes_verified": True,
            },
            indent=2,
        )
        + "\n"
    )

