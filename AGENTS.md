# Publication archive gate

This public repository is paired with the private working-master repository
`takochanchan/-archive-masters`.

## GitHub control path

- Agents must not execute GitHub CLI (`gh`) from a local runtime or ChatGPT Work
  environment, even when it is installed.
- Do not install GitHub CLI, run `gh auth login`, request CLI credentials, or
  propose local CLI use as a prerequisite, fallback, or recovery path.
- Perform repository reads and writes through the connected GitHub app. Perform
  Release transfers and remote verification through the repository's one-shot
  GitHub Actions workflows created through that app.
- Repository-controlled commands executed inside a GitHub-hosted Actions runner
  are part of the approved remote workflow; they do not authorize local CLI use.
- If the app or workflow is temporarily blocked, preserve the current state and
  resume through the same approved path. Do not switch to local GitHub CLI.

## Mandatory order for every new or revised publication

1. Finalise the editable working master and its `BIBLIOGRAPHY.json`.
2. Store the master in the private repository under `publications/<slug>/`.
3. Verify that the private repository's validation and Git LFS checks pass.
   If Git LFS cannot accept new bytes because its bandwidth or storage quota is
   exhausted, use the private repository's documented Release fallback instead:
   create a new version-specific Release, upload the master, bibliography,
   rights information, and checksums, re-download and verify every byte, then
   commit a permanent `pending_lfs` record to `MASTER_RELEASE_LEDGER.json`.
4. Verify the resulting full 40-character archive commit SHA on GitHub.
5. Update `master-archive.json` with that SHA and the canonical master path.
6. Run `npm run build` and `npm test`.
7. Upload/replace the public PDF and EPUB and update their checksum manifest.
8. Determine the publication's stable shard from `searchShard` (legacy records
   default to `001`), regenerate only that external Pagefind shard from the
   canonical master or checksum-approved final EPUB mirror and the exact final
   PDF, and deploy it from the repository named in `search-shards.json`.
9. Run `SEARCH_SHARD=<id> npm run verify:search` before deploying the shard.
   Require complete shard slug coverage, canonical bibliography URLs,
   original-page labels, physical PDF pages, and current archive/PDF checksums.
10. Run `npm run verify:remote-search`; it must prove that the deployed shards
    cover the exact current catalogue once, use the current archive and asset
    manifests, and remain below their work-count and byte budgets.
11. Only after all prior steps pass, publish the main site. The main Pages
    artifact contains the catalogue and search client, never the Pagefind index.

The release is incomplete if the working master or current external search
shard is missing. The main Pages workflow deliberately fails before deployment
when a shard is stale, so the previously complete live site remains in place.
If archival, remote verification, page mapping, search coverage, or the master
gate fails, stop the public release. Never publish first with a promise to
archive or index later.

Search shards are append-stable. `001` accepts at most 300 works; when it is
full, add the next Project Pages repository and assign new publications to its
three-digit ID. Never rebalance old slugs merely because catalogue order changes.

Release fallback records and their assets are permanent provenance. After Git
LFS becomes available, migrate the exact verified bytes to the canonical path,
but do not delete or overwrite the version-specific Release or its ledger
record.

## Canonical master

- Figure-, map-, plate-, table-, or layout-heavy work: `master.docx`.
- Text-centred work: `master.md`.
- Do not create or treat HTML as a working master.
- Prefer the original authoring file. EPUB reconstruction is recovery-only and
  must be labelled as such in the private bibliography.

## Safety

- Never place private-repository credentials, deploy keys, or private contents
  in this public repository.
- Re-read remote `main` immediately before any write and never force-update it.
- Preserve concurrent publication work and unrelated user changes.
