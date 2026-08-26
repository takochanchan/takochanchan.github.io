# 中部アメリカ歴史資料 日本語翻訳アーカイブ

中部アメリカに関する歴史資料・旅行記・調査報告の日本語翻訳を、
PDFとリフロー型EPUB 3で公開する、
GitHub Pages 用の静的アーカイブです。

公開サイト: [https://takochanchan.github.io/](https://takochanchan.github.io/)

## 構成

- `src/publications.mjs` — 書誌情報、分類、タグ
- `src/archive.js` — 検索、絞り込み、並べ替え、ページ送り
- `src/styles.css` — 共通デザイン
- `scripts/build.mjs` — 一覧・個別ページの生成
- `epub-sources/` — PDFのみ残っていた資料の校正済みリフロー原稿
- `scripts/build-epubs.py` — 編集原稿・構造化PDFからリフロー型EPUB 3を生成
- `scripts/validate-epubs.py` — EPUBの構造、リンク、リフロー指定を検証
- `scripts/search/` — 正本と最終PDFから全文検索索引・原刊頁／PDF頁対応を生成・検証
- `search-shards.json` — 外部全文検索索引のProject Pages配置と容量上限
- `static/publications/*/cover.jpg` — Pagesに含める表紙画像
- `assets-manifest.json` — Release配布PDF・EPUBと表紙画像の容量・SHA-256

PDF・EPUB本体はGitHub Release
[`publications-current`](https://github.com/takochanchan/takochanchan.github.io/releases/tag/publications-current)
で配布し、Gitリポジトリには収録しません。同じファイル名の改訂版はRelease資産を
置き換えるため、公開URLは変わりません。

新しい資料は `src/publications.mjs` に1件追加すると、一覧カード、検索対象、
分類、個別ページ、関連資料、サイトマップへ自動的に反映されます。

トップページの一覧内検索と資料種別・地域・原刊言語・年代の絞り込みは、
書籍と論文の両方を対象にします。検索条件に該当する件数を分類別に示し、
その下の同格タブで「書籍」と「論文」の結果を切り替えます。
収録総数は書籍を冊、論文を篇に分けて表示します。論文側の資料は頁数ではなく
初出形態を確認して明示的に分類し、同ファイルの
`shortWorkAuthorBySlug` にslugと安定した著者キーを追加します。同じ著者キーを
持つ論文・報告は、著者見出しの下へ刊行年順で自動的に積み上がります。短い単行本は
この指定を行わず、書籍側に残します。

## ローカル確認

```sh
npm run build
npm test
```

`main` ブランチが更新されると、GitHub Actions がサイト一式を生成し、
GitHub Pages へ公開します。
成果物検証ワークフローが Actions bot として `main` に確定コミットを作成した場合は、
そのコミットから別ワークフローが自動起動しないため、続けて Pages ワークフローを
手動実行するか、通常のレビュー済みコミットで配信を開始します。

共通検索領域には、一覧の書誌検索とは別に、公開版全文を対象とする静的検索を設けています。
検索結果は資料単位のモーダルで表示し、1資料につき最初の10頁を示します。同じPDF頁の
複数一致は1件にまとめ、各スニペットに底本位置標識と日本語版PDFの物理頁を併記します。
資料名からは必ず既存の書誌ページへ移動します。

検索索引と一時的な本文データは本体のGit履歴・Pages artifactへ収録しません。正本または
SHA-256を固定した最終EPUBと最終PDFから、300作品を上限とする外部Project Pages索引を
生成します。`001` は現行277作品で封印し、次の新規資料から予約済みの `002` を使用します。
`002` は最初の索引を配備するまで本体から参照しません。本体Pagesには検索UIだけを置き、
Pagefindの複数索引機能で外部索引群を横断します。
新規・改訂公開ではPDF・EPUBと同様に外部索引の更新を完了条件とし、全資料の収録、
正本コミット、PDF SHA-256、頁対応、索引容量を検査します。外部索引が現行書誌と一致しない
場合、本体Pagesの配備は停止し、直前の完全な公開版を維持します。
