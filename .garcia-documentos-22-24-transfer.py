import base64
import hashlib
import json
import os
import pathlib
import shutil
import subprocess
import tarfile
import tempfile

assert os.environ.get("GITHUB_ACTIONS") == "true"
REPO = "takochanchan/takochanchan.github.io"
assert os.environ["GITHUB_REPOSITORY"] == REPO
REQUEST = pathlib.Path(".garcia-documentos-22-24-public-request.json")
q = json.loads(REQUEST.read_text(encoding="utf-8"))
assert q["release_tag"] == "publications-002"
assert len(q["verified_archive_commit"]) == 40 and len(q["source_site_commit"]) == 40

root = pathlib.Path(tempfile.mkdtemp(prefix="garcia-22-24-transfer-"))
bundle = root / "public.tar.gz"
digest = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def run(*args, **kw):
    return subprocess.run(args, check=True, **kw)

release = json.loads(subprocess.check_output([
    "gh", "api", f"repos/{REPO}/releases/tags/{q['release_tag']}"
]))
existing = {asset["name"] for asset in release["assets"]}
expected = {item["filename"]: item for item in q["assets"]}
assert len(expected) == 6 and len(existing) == len(release["assets"])
assert not (existing & set(expected)), "release asset name collision"
assert len(existing) + len(expected) <= 1000, "release asset limit would be exceeded"

with bundle.open("wb") as out:
    for oid in q["bundle"]["chunks"]:
        blob = json.loads(subprocess.check_output([
            "gh", "api", f"repos/{REPO}/git/blobs/{oid}"
        ]))
        assert blob["encoding"] == "base64"
        out.write(base64.b64decode(blob["content"]))
assert bundle.stat().st_size == q["bundle"]["size"]
assert digest(bundle) == q["bundle"]["sha256"]

with tarfile.open(bundle, "r:gz") as archive:
    members = archive.getmembers()
    assert {m.name for m in members} == set(expected)
    for member in members:
        assert member.isfile() and pathlib.PurePosixPath(member.name).name == member.name
    archive.extractall(root, filter="data")

epub_slugs = {
    "garcia-documentos-ineditos-mexico-v22-1909":
        "Garcia_Documentos_Ineditos_Mexico_XXII_1909_Japanese_Complete_Translation.epub",
    "garcia-documentos-ineditos-mexico-v23-1909":
        "Garcia_Documentos_Ineditos_Mexico_XXIII_1909_Japanese_Complete_Translation.epub",
    "garcia-documentos-ineditos-mexico-v24-1909":
        "Garcia_Documentos_Ineditos_Mexico_XXIV_1909_Japanese_Complete_Translation.epub",
}
validation_root = root / "epub-validation"
for slug, filename in epub_slugs.items():
    assert filename in expected
    destination = validation_root / "publications" / slug
    destination.mkdir(parents=True, exist_ok=True)
    shutil.copy2(root / filename, destination / filename)
validation_args = ["python3", "scripts/validate-epubs.py", str(validation_root)]
for slug in epub_slugs:
    validation_args.extend(["--slug", slug])
run(*validation_args)

for name, item in expected.items():
    asset = root / name
    assert asset.stat().st_size == item["size"] and digest(asset) == item["sha256"]
    run("gh", "release", "upload", q["release_tag"], "--repo", REPO, str(asset))

verification = root / "downloads"
verification.mkdir()
for name, item in expected.items():
    folder = verification / name
    folder.mkdir()
    run("gh", "release", "download", q["release_tag"], "--repo", REPO,
        "--pattern", name, "--dir", str(folder))
    downloaded = folder / name
    assert downloaded.stat().st_size == item["size"] and digest(downloaded) == item["sha256"]

sums_dir = root / "checksums"
sums_dir.mkdir()
run("gh", "release", "download", q["release_tag"], "--repo", REPO,
    "--pattern", "SHA256SUMS.txt", "--dir", str(sums_dir))
sums = sums_dir / "SHA256SUMS.txt"
rows = [line for line in sums.read_text(encoding="utf-8").splitlines()
        if line.split() and line.split()[-1].lstrip("*") not in expected]
rows.extend(f"{item['sha256']}  {name}" for name, item in expected.items())
sums.write_text("\n".join(rows) + "\n", encoding="utf-8")
run("gh", "release", "upload", q["release_tag"], "--repo", REPO,
    "--clobber", str(sums))
sum_verify = root / "checksum-verify"
sum_verify.mkdir()
run("gh", "release", "download", q["release_tag"], "--repo", REPO,
    "--pattern", "SHA256SUMS.txt", "--dir", str(sum_verify))
assert (sum_verify / "SHA256SUMS.txt").read_bytes() == sums.read_bytes()

result = {
    "verified_archive_commit": q["verified_archive_commit"],
    "source_site_commit": q["source_site_commit"],
    "release_tag": q["release_tag"],
    "release_asset_count_before": len(existing),
    "release_asset_count_after": len(existing) + len(expected),
    "bundle_size": q["bundle"]["size"],
    "bundle_sha256": q["bundle"]["sha256"],
    "assets": q["assets"],
    "epub_validation_slugs": list(epub_slugs),
    "epub_validation_passed": True,
    "all_uploaded_and_downloaded_bytes_verified": True,
    "checksums_file_downloaded_and_verified": True,
}
pathlib.Path("garcia-documentos-22-24-public-verification.json").write_text(
    json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
