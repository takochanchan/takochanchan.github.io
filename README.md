# 中部アメリカ歴史資料 日本語翻訳アーカイブ

中部アメリカに関する歴史資料・旅行記・調査報告の日本語翻訳を、
PDFとリフロー型EPUB 3で公開する、
GitHub Pages 用の静的アーカイブです。

## 構成

- `src/publications.mjs` — 書誌情報、分類、タグ
- `src/archive.js` — 検索、絞り込み、並べ替え、ページ送り
- `src/styles.css` — 共通デザイン
- `scripts/build.mjs` — 一覧・個別ページの生成
- `epub-sources/` — PDFのみ残っていた資料の校正済みリフロー原稿
- `scripts/build-epubs.py` — 編集原稿・構造化PDFからリフロー型EPUB 3を生成
- `scripts/validate-epubs.py` — EPUBの構造、リンク、リフロー指定を検証
- `static/publications/*/cover.jpg` — Pagesに含める表紙画像
- `assets-manifest.json` — Release配布PDF・EPUBと表紙画像の容量・SHA-256

PDF・EPUB本体はGitHub Release
[`publications-current`](https://github.com/takochanchan/takochanchan.github.io/releases/tag/publications-current)
で配布し、Gitリポジトリには収録しません。同じファイル名の改訂版はRelease資産を
置き換えるため、公開URLは変わりません。

新しい資料は `src/publications.mjs` に1件追加すると、一覧カード、検索対象、
分類、個別ページ、関連資料、サイトマップへ自動的に反映されます。

トップページは「書籍」と「論文」を同格のタブで切り替える構成です。
収録件数も書籍は冊、論文は篇に分けて表示します。論文側の資料は頁数ではなく
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

「書籍」タブには、一覧の書誌検索とは別に「Googleでサイト内を検索」を設けています。
サイトとGitHub Releases上のPDFを対象に検索語をGoogle検索へ `site:` 条件付きで送信し、
外部APIやローカル検索索引は使用しません。
