# Fellechner 1845 publication — cover revision complete

Publication: https://takochanchan.github.io/publications/fellechner-mueller-hesse-mosquitoland-1845/

## Current edition: 2026-09-25 cover correction

- Cover label: BERICHT · 1845. Corrected in the editable DOCX, PDF, EPUB and catalogue image.
- Canonical archive commit: ae7ecd6743d24764640bc5524c59b1b6008118f9.
- Archive validation and LFS save: run 36107555273 success.
- Public revision commit: aef3dd54d682c58df1851cf60fa85b616e116efa.
- PDF/EPUB replacement, formal EPUB 3 validation, redownload byte verification: run 36107819458 success.
- Shard 002 controller commit: 711d97e71b9d2bf295c9a9a73342fad20f083212.
- Search build, verification and deployment: run 36107976973 success.
- Main Pages build, tests, remote search gate and deployment: run 36108519926 success.
- Live bibliography, cover image, PDF, EPUB, SHA256SUMS and remote search verification: run 36108660351 success.
- PDF has 325 pages. All 324 non-cover pages are raster-identical to the approved prior edition.
- Immediate DOCX/PDF reproduction: pdfplumber 0.11.8; 201254 characters; maximum coordinate difference 0 pt.
- Completed temporary public transfer workflow and temporary revision/verification branches were removed. Other publication branches and assets were preserved.

## Final file identities

- Fellechner_Mueller_Hesse_Mosquitoland_1845_Japanese_Translation.pdf: 7882099 bytes; SHA-256 e4c96120f659dcbd8b3de77903926c8dbc7353e15ab579f05ecef2a554364c9b.
- cover.jpg: 74365 bytes; SHA-256 48235f7cf4d8159507f87472c02091251d18c7a8c41d1e461991ed8e49b0c8ae.
- Fellechner_Mueller_Hesse_Mosquitoland_1845_Japanese_Translation.epub: 24918911 bytes; SHA-256 6158c82f12d08647d7d8d49122beb4c153509a4929204339c09138d92586f01f.
- Fellechner_Mueller_Hesse_Mosquitoland_1845_Japanese_Translation.docx: 26004277 bytes; SHA-256 c3d40298f5b6eee016ef7e693ee174a4e30ec3bf68145c46ce46af04d31fc81a.

## Reused implementation and resolved failures

Used the existing fellechner-transfer.yml route (successful run 36088877747) and existing search/Pages gates. Reused verified existing remote bytes with a checksum-pinned byte-copy delta for the PDF; rebuilt the EPUB cover entries from the corrected authoring-master label and PDF cover image. All reconstructed files matched the local corrected final files before upload.

The private whitespace check initially treated the repository's existing TSV CRLF as trailing whitespace; enabled Git's cr-at-eol recognition while retaining whitespace checks. The transfer runner initially lacked pdfinfo; installed Poppler as in the prior successful remote verification workflow. No unverified asset was uploaded by either failed attempt.

## Initial publication provenance

Original archive commit: 227042772cc71714aff72af2b0a60c1cb6ea6af9.
Initial archive ingestion: run 36071895126.
Initial release transfer: run 36088877747.
Initial live verification: run 36089471521.

No publication or cover-replacement steps remain.
