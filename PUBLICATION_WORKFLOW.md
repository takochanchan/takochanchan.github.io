# 公開手順

## 完了条件

新規公開・改訂公開は、公開版の作業正本が非公開リポジトリに保存され、
GitHub上のコミットSHAが公開側の台帳に記録された後にのみ完了とします。

## 手順

1. 図版・地図・複雑な表・ページ依存の組版を含む資料はWord、本文中心の資料は
   Markdownで正本を確定する。HTMLは正本にしない。
2. 正本、`BIBLIOGRAPHY.json`、必要な素材を
   `takochanchan/-archive-masters` の `publications/<slug>/` に保存する。
3. 正本リポジトリの検証、SHA-256照合、DOCXまたはMarkdown検証、
   Git LFS検証を通す。
4. GitHub上で保存後の40桁コミットSHAを確認する。
5. 本リポジトリの `master-archive.json` に、そのSHAと正本パスを記録する。
6. `npm run build` と `npm test` を実行する。
7. 以上が成功した後に、PDF・EPUBをReleaseへ反映し、サイトを公開する。

正本保存、リモート確認、台帳検証のいずれかに失敗した場合は、公開処理を停止します。

## 台帳

`master-archive.json` の `archive_commit` は、全掲載資料を含む正本リポジトリの
最新確認済みコミットです。`publications` は公開資料のslugと正本パスを一対一で対応させます。
資料追加時に台帳を更新しなければ、ビルドとテストは失敗します。

