"""One-shot Bustamante 1847 transfer via hosted Actions; Herrera 00546abc / run 34007198613."""
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
SLUG = "bustamante-el-nuevo-bernal-diaz-del-castillo-1847"
TAG = "publications-002"
ARCHIVE = "63f848e26b5361faaae7d73ce1614d4488cfefc9"
REQ_SHA = "a81e2873133b75800533cb1ebdf2c0f197f4a3998fc56217ffaf29354ab5f9d8"
CHECKSUM = "SHA256SUMS.txt"
ROOT = f"https://github.com/{REPO}/releases/download/{TAG}"
NAMES = {'bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847.pdf', 'bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847.epub', 'bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847.epub', 'bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847.pdf'}

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
    request = Path(".nuevobernal1847title-public-request.json")
    need(digest(request) == REQ_SHA, "Fixed transfer request hash differs")
    q = json.loads(request.read_text())
    need((q["slug"], q["release_tag"], q["verified_archive_commit"]) == (SLUG, TAG, ARCHIVE),
         "Unexpected release, slug, or archive pin")
    expected = {x["filename"]: x for x in q["assets"]}
    need(len(q["assets"]) == 4 and set(expected) == NAMES, "Unexpected release asset set")
    for name, a in expected.items():
        need(a["url"] == f"{ROOT}/{name}", f"Unexpected public URL for {name}")
    master = json.loads((candidate / "master-archive.json").read_text())
    need(master["repository"] == "takochanchan/-archive-masters" and
         master["archive_commit"] == ARCHIVE and
         all(master["publications"].get(s) == f"publications/{s}/master.docx" for s in ['bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-1-1847', 'bustamante-el-nuevo-bernal-diaz-del-castillo-tomo-2-1847']),
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
    need(release["id"] == 423230864 and release["tag_name"] == TAG and not release["draft"], "Expected an existing public release")
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

def check_record(rec, a, require_old_id=False):
    need(bool(rec) and rec.get('browser_download_url') == a['url'] and rec.get('size') == a['size']
         and rec.get('digest') == 'sha256:'+a['sha256'] and rec.get('state') == 'uploaded'
         and (not require_old_id or rec['id'] == a['id']), 'Unexpected release bytes/ID: '+a['filename'])

def same_bytes(rec, a):
    return bool(rec) and rec.get('size') == a['size'] and rec.get('digest') == 'sha256:'+a['sha256'] and rec.get('browser_download_url') == a['url']

def revised_checksum(blob, previous, replacement, permit_already=False):
    """Keep every byte other than the four existing 64-byte digest fields (including newlines)."""
    need(set(previous)==set(replacement)==NAMES,'Target checksum set changed')
    out=[]; seen=set()
    for line in blob.splitlines(keepends=True):
        m=re.fullmatch(rb'([0-9a-f]{64})([ \t]+\*?)([^\r\n]+)(\r?\n)?',line)
        if m:
            name=m[3].decode('utf-8')
            if name in previous:
                need(name not in seen,'Duplicate checksum row: '+name); seen.add(name)
                h=m[1].decode()
                need(h==previous[name]['sha256'] or (permit_already and h==replacement[name]['sha256']), 'Unknown checksum row: '+name)
                line=replacement[name]['sha256'].encode()+line[64:]
        out.append(line)
    need(seen==NAMES, 'A target checksum row is absent')
    return b''.join(out)

def bounded_public(name, dest, a):
    import time
    dest.mkdir(exist_ok=True); path=dest/name
    for attempt in range(4):
        try:
            run("curl","--fail","--location","--silent","--show-error","--retry","2","--retry-all-errors",
                "--max-time","90",f"{ROOT}/{name}?revision={a['sha256']}&attempt={attempt}","--output",str(path))
            require_asset(path,a); return
        except (RuntimeError,subprocess.CalledProcessError):
            if attempt==3: raise
            time.sleep(3+attempt*2)

def upload(path):
    run("gh","release","upload",TAG,"--repo",REPO,"--clobber",str(path))

def transfer(destination, q, expected, commit):
    need((destination/"candidate-sha").read_text().strip()==commit,"Tested candidate changed")
    previous={a['filename']:a for a in q['previous_assets']}
    need(len(previous)==4 and set(previous)==NAMES and all(previous[n]['sha256']!=expected[n]['sha256'] for n in NAMES),"Fixed revisions required")
    for name in NAMES:require_asset(destination/name,expected[name])
    old_dir=destination/'previous';old_dir.mkdir(exist_ok=False)
    before=list_assets()
    need(CHECKSUM in before and before[CHECKSUM]['state']=='uploaded',"Shared checksum missing")
    for n in sorted(NAMES):
        check_record(before.get(n),previous[n],True); require_asset(download(n,old_dir),previous[n])
    old_cs=download(CHECKSUM,old_dir).read_bytes()
    need(before[CHECKSUM]['size']==len(old_cs) and before[CHECKSUM]['digest']=='sha256:'+hashlib.sha256(old_cs).hexdigest(), 'Shared checksum bytes did not match inventory')
    merged=revised_checksum(old_cs,previous,expected)
    changed=[];checksum_write_started=False
    try:
        for n in sorted(NAMES):
            check_record(list_assets().get(n),previous[n],True)
            changed.append(n);upload(destination/n);check_record(list_assets().get(n),expected[n])
        after=list_assets()
        for n in sorted(NAMES):
            check_record(after.get(n),expected[n]);require_asset(download(n,destination/'verified'),expected[n])
            bounded_public(n,destination/'public',expected[n])
        need(after[CHECKSUM]['id']==before[CHECKSUM]['id'] and after[CHECKSUM]['updated_at']==before[CHECKSUM]['updated_at']
             and download(CHECKSUM,destination/'fresh').read_bytes()==old_cs, 'Shared checksum changed before write')
        (destination/CHECKSUM).write_bytes(merged)
        checksum_write_started=True;upload(destination/CHECKSUM)
        need(download(CHECKSUM,destination/'verified').read_bytes()==merged, 'Verified checksum differs')
        bounded_public(CHECKSUM,destination/'public',dict(sha256=hashlib.sha256(merged).hexdigest(),size=len(merged)))
        final=list_assets()
        for n in NAMES:check_record(final.get(n),expected[n])
        need(final[CHECKSUM]['digest']=='sha256:'+hashlib.sha256(merged).hexdigest(),'Final checksum inventory differs')
        verification=dict(verified_archive_commit=q['verified_archive_commit'],tested_catalogue_commit=commit,release_tag=TAG,
            assets=[{**a,'id':final[n]['id'],'prior_id':previous[n]['id'],'prior_sha256':previous[n]['sha256']} for n,a in expected.items()],
            final_asset_count=len(final),checksum_id=final[CHECKSUM]['id'],checksum_sha256=hashlib.sha256(merged).hexdigest(),
            all_downloaded_bytes_verified=True,unrelated_checksum_bytes_unchanged=True)
        Path("nuevobernal1847title-public-verification.json").write_text(json.dumps(verification,indent=2)+"\n")
    except BaseException as cause:
        errors=[]
        # Never overwrite unrecognised concurrent asset bytes; retain all backups and report conflicts.
        for n in reversed(changed):
            try:
                rec=list_assets().get(n)
                if not same_bytes(rec, previous[n]):
                    need(not rec or same_bytes(rec,expected[n]),'Unknown bytes during rollback: '+n)
                    if rec:upload(old_dir/n)
                    else:run("gh","release","upload",TAG,"--repo",REPO,str(old_dir/n))
                check_record(list_assets().get(n),previous[n]);require_asset(download(n,destination/'rollback-readback'),previous[n])
            except Exception as ex:errors.append(str(ex))
        if checksum_write_started and not errors:
            try:
                rec=list_assets().get(CHECKSUM)
                if rec:
                    live=download(CHECKSUM,destination/'rollback-current').read_bytes()
                    undo=revised_checksum(live,expected,previous,permit_already=True)
                    if undo!=live:
                        fresh=list_assets()[CHECKSUM]
                        need((fresh['id'],fresh['updated_at'],fresh['digest'])==(rec['id'],rec['updated_at'],rec['digest']) and download(CHECKSUM,destination/'rollback-fresh').read_bytes()==live,'Checksum changed before rollback')
                        p=destination/'undo'/CHECKSUM;p.parent.mkdir();p.write_bytes(undo);upload(p)
                else:
                    undo=old_cs
                    run("gh","release","upload",TAG,"--repo",REPO,str(old_dir/CHECKSUM))
                need(download(CHECKSUM,destination/'rollback-readback').read_bytes()==undo,'Restored checksum mismatch')
            except Exception as ex:errors.append(str(ex))
        result=dict(error=str(cause),potentially_changed_names=changed,rollback_conflicts=errors,old_assets_verified=not errors)
        Path('nuevobernal1847title-rollback.json').write_text(json.dumps(result,indent=2)+'\n')
        raise RuntimeError('Transfer failed; rollback: '+str(result)) from cause

def main():
    need(os.environ.get("GITHUB_ACTIONS") == "true" and
         os.environ.get("GITHUB_REPOSITORY") == REPO and
         os.environ.get("GITHUB_REF") == "refs/heads/agent/nuevo-bernal1847-title-revision-20261120",
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
