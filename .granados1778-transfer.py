"""One-shot Granados 1778 transfer via hosted Actions; Herrera 00546abc / run 34007198613."""
from __future__ import annotations

import base64
from collections import Counter
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
import tarfile
from tempfile import TemporaryDirectory

REPO = "takochanchan/takochanchan.github.io"
SLUG = "granados-tardes-americanas-1778"
TAG = "publications-002"
ARCHIVE = "f99d41d57f99f90284d45e1424308d7e8cb6cb3f"
REQ_SHA = "a149ba3bca815dedca337e9e26129038c7d72a69ac813cfec6a67a209ed8ee0d"
CHECKSUM = "SHA256SUMS.txt"
ROOT = f"https://github.com/{REPO}/releases/download/{TAG}"
NAMES = {'granados-tardes-americanas-1778-ja.epub', 'granados-tardes-americanas-1778-ja.pdf'}

def need(cond, explanation):
    if not cond:
        raise RuntimeError(explanation)

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def run(*args, **kwargs):
    return subprocess.run(args, check=True, timeout=180, **kwargs)

def gh_json(*args):
    return json.loads(run("gh", *args, stdout=subprocess.PIPE).stdout)

def require_asset(path, asset):
    need(path.is_file() and path.stat().st_size == asset["size"]
         and digest(path) == asset["sha256"], f"Asset does not match fixed bytes: {path.name}")

def request_and_candidate(candidate):
    request = Path(".granados1778-public-request.json")
    need(digest(request) == REQ_SHA, "Fixed transfer request hash differs")
    q = json.loads(request.read_text())
    need((q["slug"], q["release_tag"], q["verified_archive_commit"]) == (SLUG, TAG, ARCHIVE),
         "Unexpected release, slug, or archive pin")
    expected = {x["filename"]: x for x in q["assets"]}
    need(len(q["assets"]) == 2 and set(expected) == NAMES, "Unexpected release asset set")
    for name, a in expected.items():
        need(a["url"] == f"{ROOT}/{name}", f"Unexpected public URL for {name}")
    master = json.loads((candidate / "master-archive.json").read_text())
    need(master["repository"] == "takochanchan/-archive-masters" and
         master["archive_commit"] == ARCHIVE and
         master["publications"].get(SLUG) == f"publications/{SLUG}/master.docx",
         "Candidate does not pin the verified private master")
    manifest = json.loads((candidate / "assets-manifest.json").read_text())
    for name, a in expected.items():
        matches = [row for row in manifest["assets"]
                   if row["path"] == f"publications/{a['slug']}/{name}"]
        need(len(matches) == 1 and all(matches[0][key] == a[key]
            for key in ("url", "size", "sha256")), f"Candidate ledger mismatch: {name}")
    commit = run("git", "-C", str(candidate), "rev-parse", "HEAD", stdout=subprocess.PIPE,
                 text=True).stdout.strip()
    need(re.fullmatch(r"[0-9a-f]{40}", commit) is not None, "Invalid tested candidate commit")
    need(commit == q["verified_candidate_commit"], "Unexpected candidate SHA")
    return q, expected, commit

def stage(destination, q, expected, commit):
    destination.mkdir(mode=0o700)
    bundle = destination / "public.tar.gz"
    with bundle.open("wb") as stream:
        for oid in q["bundle"]["chunks"]:
            need(re.fullmatch(r"[0-9a-f]{40}", oid) is not None, "Invalid chunk object")
            b = gh_json("api", f"repos/{REPO}/git/blobs/{oid}")
            piece = base64.b64decode("".join(b["content"].split()), validate=True)
            git_blob = hashlib.sha1(b"blob " + str(len(piece)).encode() + b"\0" + piece).hexdigest()
            need(git_blob == oid and b["sha"] == oid and b["size"] == len(piece), "Chunk SHA/size mismatch")
            stream.write(piece)
    need(bundle.stat().st_size == q["bundle"]["size"] and digest(bundle) == q["bundle"]["sha256"],
         "Closed bundle SHA/size mismatch")
    run("gzip", "-t", str(bundle))
    with tarfile.open(bundle, "r:gz") as archive:
        members = archive.getmembers()
        need(Counter(m.name for m in members) == Counter(expected.keys()), "Unexpected tar contents")
        for m in members:
            need(m.isfile() and PurePosixPath(m.name).name == m.name and
                 m.size == expected[m.name]["size"], f"Unexpected archive member {m.name}")
        archive.extractall(destination, filter="data")
    for name, a in expected.items():
        require_asset(destination / name, a)
    (destination / "candidate-sha").write_text(commit + "\n")

def list_assets():
    release = gh_json("api", f"repos/{REPO}/releases/tags/{TAG}")
    need(release["tag_name"] == TAG and not release["draft"], "Expected an existing public release")
    pages = gh_json("api", "--paginate", "--slurp",
                    f"repos/{REPO}/releases/{release['id']}/assets?per_page=100")
    assets = [item for page in pages for item in page]
    need(len(set(item["name"] for item in assets)) == len(assets), "Duplicate remote asset names")
    return {a["name"]: a for a in assets}

def download(name, target):
    target.mkdir(exist_ok=True)
    run("gh", "release", "download", TAG, "--repo", REPO,
        "--pattern", name, "--dir", str(target))
    return target / name

def public_download(name, target):
    target.mkdir(exist_ok=True)
    path = target / name
    run("curl", "--fail", "--location", "--silent", "--show-error", "--retry", "4",
        "--retry-all-errors", "--max-time", "120", f"{ROOT}/{name}", "--output", str(path))
    return path

def check_release_assets(records, expected, folder):
    for name, a in expected.items():
        if name in records:
            need(records[name]["browser_download_url"] == a["url"], f"Unexpected remote URL: {name}")
            require_asset(download(name, folder), a)

def make_checksum(original, expected):
    current = original.splitlines(keepends=True)
    seen = set()
    for line in current:
        fields = line.split(None, 1)
        if len(fields) != 2:
            continue
        for name, a in expected.items():
            if fields[1].rstrip(b"\r\n").lstrip(b"*") == name.encode():
                need(name not in seen and fields[0] == a["sha256"].encode(),
                     f"Existing checksum conflicts with approved bytes: {name}")
                seen.add(name)
    missing = [f"{a['sha256']}  {name}\n".encode() for name, a in expected.items() if name not in seen]
    if missing and original and not original.endswith(b"\n"):
        original += b"\n"
    return original + b"".join(missing)

def transfer(destination, q, expected, commit):
    need((destination / "candidate-sha").read_text().strip() == commit, "Tested candidate changed")
    for name, a in expected.items():
        require_asset(destination / name, a)
    with TemporaryDirectory(prefix="granados1778-readback-") as temp:
        rd = Path(temp)
        before = list_assets()
        new_names = NAMES - before.keys()
        need(CHECKSUM in before, "Existing shared checksum list is missing; refuse to create a partial list")
        need(len(before) + len(new_names) <= 1000, "Shared release lacks asset capacity")
        check_release_assets(before, expected, rd / "previous")
        previous_checksum = download(CHECKSUM, rd / "previous").read_bytes()
        merged = make_checksum(previous_checksum, expected)
        for name in sorted(new_names):
            # Never clobber an existing PDF or EPUB, even on a race or rerun.
            run("gh", "release", "upload", TAG, "--repo", REPO, str(destination / name))
        after = list_assets()
        need(NAMES <= after.keys() and CHECKSUM in after, "A transfer asset is missing")
        check_release_assets(after, expected, rd / "verified")
        for name, a in expected.items():
            require_asset(public_download(name, rd / "public"), a)
        if merged != previous_checksum:
            need(after[CHECKSUM]["id"] == before[CHECKSUM]["id"] and
                 after[CHECKSUM]["updated_at"] == before[CHECKSUM]["updated_at"] and
                 download(CHECKSUM, rd / "fresh").read_bytes() == previous_checksum,
                 "Shared checksum changed during transfer; preserve it and rejoin from current bytes")
            cs = destination / CHECKSUM
            cs.write_bytes(merged)
            run("gh", "release", "upload", TAG, "--repo", REPO, "--clobber", str(cs))
        need(download(CHECKSUM, rd / "verified").read_bytes() == merged,
             "Read-back checksum bytes differ")
        need(public_download(CHECKSUM, rd / "public").read_bytes() == merged,
             "Anonymous checksum read-back differs")
        final = list_assets()
        need(len(final) <= 1000 and NAMES <= final.keys(), "Unexpected final release inventory")
        verification = {
            "verified_archive_commit": q["verified_archive_commit"],
            "tested_catalogue_commit": commit,
            "release_tag": TAG,
            "assets": [{**a, "id": final[name]["id"]} for name, a in expected.items()],
            "final_asset_count": len(final),
            "checksum_id": final[CHECKSUM]["id"],
            "checksum_sha256": hashlib.sha256(merged).hexdigest(),
            "all_downloaded_bytes_verified": True,
        }
        Path("granados1778-public-verification.json").write_text(json.dumps(verification, indent=2) + "\n")

def main():
    need(os.environ.get("GITHUB_ACTIONS") == "true" and
         os.environ.get("GITHUB_REPOSITORY") == REPO and
         os.environ.get("GITHUB_REF") == "refs/heads/agent/granados1778-publish-20261122",
         "This transfer runs only on the approved hosted workflow branch")
    mode, root, candidate = sys.argv[1:]
    q, expected, commit = request_and_candidate(Path(candidate))
    if mode == "stage":
        stage(Path(root), q, expected, commit)
    else:
        need(mode == "transfer", "Unknown runner mode")
        transfer(Path(root), q, expected, commit)

if __name__ == "__main__":
    main()

