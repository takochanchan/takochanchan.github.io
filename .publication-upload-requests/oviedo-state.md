# Oviedo publication state

2026-09-25: Publication owner is the current completion session.

- All four masters ingested: run 36081030544 succeeded; archive commit 13305fe31483eea196474e98fde340a9cd5b85b8.
- Current archive commit ae7ecd6743d24764640bc5524c59b1b6008118f9 includes that commit and subsequent unrelated publications. Preserve it.
- Public bundle: 151274651 bytes, SHA256 477744305940ba56032ae7d4ce1c78805c7cb055981d8780fff74bb89f91b314; all 19 chunks already present on agent/oviedo-publish-b5a at 519acc408aa058dd78328d09d9357b5c8d56da08. Do not retransmit.
- Reuse .publication-transfer/transfer-fellechner.py and .github/workflows/fellechner-transfer.yml at successful commit 108ad763cecd5282e6ce15d9a63542794aa7c80b, run 36088877747. Bundle decoding follows the existing Robertson transfer implementation.
- Metadata: four volume records, one grouped bibliography, 4129 PDF pages, 8 release assets, shard 002.
- Next: run build/tests and transfer on completion branch; verify Release bytes; update shard source.json to tested commit; after search success fast-forward main; verify live page, assets and search. No publishing completion is claimed yet.

## Release completed
- Build and all tests passed; all eight public assets uploaded and re-downloaded with exact SHA256 verification.
- Successful run: 36118787614; source commit 4bdf2d48ab21699ef1b05d1bbbf4d85135a8f59c.
- Release SHA256SUMS.txt updated only for these eight assets and re-downloaded successfully.
- Shard 002 requested from 4bdf2d48ab21699ef1b05d1bbbf4d85135a8f59c; controller commit eb73da42bae2e2f9650186986a694168648ea287.
- Transfer workflow removed after successful completion. Awaiting shard deployment, Pages and live verification.
