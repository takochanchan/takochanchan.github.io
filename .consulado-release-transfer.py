import base64
import hashlib
import io
import json
import os
import pathlib
import tarfile
import urllib.error
import urllib.parse
import urllib.request


REPO = "takochanchan/takochanchan.github.io"
API = "https://api.github.com"
UPLOADS = "https://uploads.github.com"
TAG = "publications-002"
REQUEST = pathlib.Path(".consulado-public-request.json")
RESULT = pathlib.Path("consulado-public-verification.json")


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


token = os.environ.get("GH_TOKEN")
require(os.environ.get("GITHUB_ACTIONS") == "true", "must run in GitHub Actions")
require(os.environ.get("GITHUB_REPOSITORY") == REPO, "unexpected repository")
require(token, "GH_TOKEN is required")
request = json.loads(REQUEST.read_text(encoding="utf-8"))
require(request.get("release_tag") == TAG, "unexpected release tag")
require(len(request.get("verified_archive_commit", "")) == 40, "invalid archive commit")
require(len(request.get("verified_public_commit", "")) == 40, "invalid public commit")


def http(url, method="GET", data=None, content_type="application/vnd.github+json"):
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "consulado-publication-transfer",
    }
    if content_type:
        headers["Content-Type"] = content_type
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=120) as response:
        return response.read(), response.headers


def api_json(path, method="GET", payload=None):
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    raw, _ = http(API + path, method=method, data=body)
    return json.loads(raw.decode("utf-8")) if raw else None


def get_public_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": "consulado-publication-transfer"})
    with urllib.request.urlopen(req, timeout=120) as response:
        return response.read()


# Reconstruct the exact staged bundle from Git blobs and validate it before release writes.
bundle = request["bundle"]
bundle_bytes = bytearray()
for oid in bundle["chunks"]:
    blob = api_json(f"/repos/{REPO}/git/blobs/{oid}")
    require(blob.get("encoding") == "base64", f"chunk {oid} is not base64")
    bundle_bytes.extend(base64.b64decode(blob["content"], validate=True))
bundle_bytes = bytes(bundle_bytes)
require(len(bundle_bytes) == bundle["size"], "bundle size mismatch")
require(sha256(bundle_bytes) == bundle["sha256"], "bundle SHA-256 mismatch")

expected = {asset["filename"]: asset for asset in request["assets"]}
require(len(expected) == 2, "exactly the PDF and EPUB must be transferred")
members = {}
with tarfile.open(fileobj=io.BytesIO(bundle_bytes), mode="r:gz") as archive:
    entries = archive.getmembers()
    require({item.name for item in entries} == set(expected), "bundle members differ from request")
    for item in entries:
        require(item.isfile() and pathlib.PurePosixPath(item.name).name == item.name,
                f"unsafe bundle member: {item.name}")
        stream = archive.extractfile(item)
        require(stream is not None, f"cannot read {item.name}")
        data = stream.read()
        asset = expected[item.name]
        require(len(data) == asset["size"], f"size mismatch: {item.name}")
        require(sha256(data) == asset["sha256"], f"SHA-256 mismatch: {item.name}")
        members[item.name] = data

release = api_json(f"/repos/{REPO}/releases/tags/{urllib.parse.quote(TAG, safe='')}")
asset_map = {item["name"]: item for item in release["assets"]}
require(not (set(expected) & set(asset_map)), "release already contains a target asset; refusing duplicate upload")
require(len(release["assets"]) + 2 <= 1000, "release asset limit would be exceeded")


def upload_asset(name, data):
    url = release["upload_url"].split("{", 1)[0] + "?name=" + urllib.parse.quote(name, safe="")
    raw, _ = http(url, method="POST", data=data, content_type="application/octet-stream")
    return json.loads(raw.decode("utf-8"))


def verify_asset(asset, expected_size, expected_sha):
    data = get_public_bytes(asset["browser_download_url"])
    require(len(data) == expected_size, f"downloaded size mismatch: {asset['name']}")
    require(sha256(data) == expected_sha, f"downloaded SHA-256 mismatch: {asset['name']}")
    return data


uploaded = {}
for name, descriptor in expected.items():
    asset = upload_asset(name, members[name])
    verify_asset(asset, descriptor["size"], descriptor["sha256"])
    uploaded[name] = asset

# Update only the two newly published checksum rows and preserve every other line.
sum_asset = asset_map.get("SHA256SUMS.txt")
require(sum_asset is not None, "release is missing SHA256SUMS.txt")
old_sums = get_public_bytes(sum_asset["browser_download_url"]).decode("utf-8")
lines = []
for line in old_sums.splitlines():
    fields = line.split()
    require(len(fields) >= 2, f"malformed checksum line: {line!r}")
    filename = fields[-1].lstrip("*")
    if filename not in expected:
        lines.append(line)
lines.extend(f"{descriptor['sha256']}  {name}" for name, descriptor in expected.items())
new_sums = ("\n".join(lines) + "\n").encode("utf-8")
api_json(f"/repos/{REPO}/releases/assets/{sum_asset['id']}", method="DELETE")
replacement_sum = upload_asset("SHA256SUMS.txt", new_sums)
downloaded_sums = get_public_bytes(replacement_sum["browser_download_url"])
require(downloaded_sums == new_sums, "replacement SHA256SUMS.txt download differs")

RESULT.write_text(json.dumps({
    "verified_archive_commit": request["verified_archive_commit"],
    "verified_public_commit": request["verified_public_commit"],
    "release_tag": TAG,
    "release_id": release["id"],
    "assets": [
        {"name": name, "id": uploaded[name]["id"], "size": descriptor["size"],
         "sha256": descriptor["sha256"], "download_verified": True}
        for name, descriptor in expected.items()
    ],
    "checksum_asset": {"name": "SHA256SUMS.txt", "id": replacement_sum["id"],
                        "size": len(new_sums), "sha256": sha256(new_sums),
                        "preserved_existing_rows": True, "download_verified": True},
    "release_asset_count_after": len(release["assets"]) + 2,
    "all_downloaded_bytes_verified": True,
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
