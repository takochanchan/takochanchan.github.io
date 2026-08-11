# Publication archive gate

This public repository is paired with the private working-master repository
`takochanchan/-archive-masters`.

## Mandatory order for every new or revised publication

1. Finalise the editable working master and its `BIBLIOGRAPHY.json`.
2. Store the master in the private repository under `publications/<slug>/`.
3. Verify that the private repository's validation and Git LFS checks pass.
4. Verify the resulting full 40-character archive commit SHA on GitHub.
5. Update `master-archive.json` with that SHA and the canonical master path.
6. Run `npm run build` and `npm test`.
7. Upload/replace the public PDF and EPUB, update their checksum manifest, then
   regenerate the full-text search index from the canonical master (or its
   checksum-approved final EPUB mirror in the public build) and the exact final PDF.
8. Run `npm run verify:search`; require complete slug coverage, canonical
   bibliography URLs, original-page labels, physical PDF pages, and the current
   archive/PDF checksums.
9. Only after all prior steps pass, publish the site with the generated search
   index in the Pages artifact.

The release is incomplete if the working master or current search index is
missing. If archival, remote verification, page mapping, search coverage, or
the master gate fails, stop the public release. Never publish first with a
promise to archive or index later.

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
