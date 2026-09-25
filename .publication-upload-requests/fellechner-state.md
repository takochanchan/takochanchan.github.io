# Fellechner 1845 publication — complete

Publication: https://takochanchan.github.io/publications/fellechner-mueller-hesse-mosquitoland-1845/
Canonical archive commit: 227042772cc71714aff72af2b0a60c1cb6ea6af9
Archive ingestion: run 36071895126 success.
Public source commit: 108ad763cecd5282e6ce15d9a63542794aa7c80b
Transfer and redownload verification: run 36088877747 success.
PDF asset: 587391353, 7882482 bytes, SHA256 783130494b73c58206bd44f75ed7481f78bd9217f671f490f396ac4de920af95, 325 pages.
EPUB asset: 587391352, 24902057 bytes, SHA256 7c9a575b3a7809186cb047ab76ae60d854d14ff0cd86089abea6ca9066b1f9ce.
Shard 002 controller commit: 15ee8b309dbe586f3af5260cda7c5be0208be4f9.
Shard build, verification and deployment: run 36088937600 success.
Remote search verification before main promotion: run 36089310304 success.
Pages build and deployment: run 36089365242 success.
Post-publication page, PDF page count, EPUB3 ZIP structure, asset sizes/hashes, SHA256SUMS, remote search verification: run 36089471521 success.

Reused transfer implementation: .publication-transfer/transfer-lobo.py at bd20e125797c0a8d954694cc7549467ef3df57ce, successful run 35441135173. Adapted to concatenate the already uploaded raw chunks per asset.
Resolved: large local base64 output truncation by bounded reads; preserved the original blob IDs and bytes. Updated existing fallback ledger references after confirming their master hashes and sizes in the new archive commit.
No further publication steps remain.

## Cover correction 2026-09-25

Corrected label: BERICHT · 1845. 325 pages; non-cover 324 pages are raster-identical to the approved edition. Canonical master saved at ae7ecd6743d24764640bc5524c59b1b6008118f9; run 36107555273 succeeded. Reusing fellechner-transfer.yml (run 36088877747) with checksum-pinned byte-copy delta input to avoid retransmitting unchanged images. PDF and EPUB reconstruction is checked against locally generated final bytes. Pending: public assets, shard 002, remote gate, Pages, live verification.
