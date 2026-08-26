# takochan full-text search shard

This public Project Pages repository contains one generated Pagefind shard. It
does not contain PDFs, EPUBs, working masters, or hand-edited search data.

`source.json` pins the exact public archive commit and three-digit shard ID.
The Pages workflow checks out that commit, downloads checksum-verified public
PDF/EPUB inputs, builds only the assigned shard, verifies its page maps, and
deploys `dist/search`.

To update a shard, replace only `sourceCommit` with the exact reviewed archive
commit. Do not move old publication slugs between shards to rebalance catalogue
order.
