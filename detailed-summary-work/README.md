# 詳細概要の修正作業

## 確定指示

- 従来の概要文を一字も変更せず、従来どおり常時表示する。
- その直下に「詳細概要」の開閉ボタンを追加し、詳細本文は初期状態で閉じる。
- 詳細概要は約1000字、上限1000字。全468資料・分冊の内容に即して個別に執筆する。
- 先に従来の公開状態へ戻し、その後で全件の詳細概要を追加する。

## 完了した復元

- 復元コミット: `62276910718a0c135483ba625b1204a53d83cbd1`
- 復元ツリー: `dc662402247b82c5d6e35737187e7b2c6400c9fa`（変更前と完全一致）
- Pages公開: run `38866294978` success。
- 全413書誌ページの従来概要を公開HTMLで照合: run `38866525203`, job `116860531985`, `ORIGINAL_DESCRIPTIONS_RESTORED 413`。

## 原資料と原稿

- 全468 EPUBのSHA-256、見出し、本文抜粋を取得済み。失敗0件。
- 原資料取得: `.github/workflows/read-detailed-overview-sources.yml`、run `38866525203`、artifact `12031198357`。
- 本文抽出の短かった28資料は同一SHA-256のEPUBを再取得し、全spine文書から本文を追加抽出した。
- 補足取得: `.github/workflows/read-overview-supplement.yml`、run `38870003500` success、artifact `12033455288`。
- 補足初回run `38869876819` は既存EPUB内のXML不整合で失敗。本文読取をHTMLParserへ修正して上記runで解決済み。公開EPUBは変更していない。
- 原稿は `drafts.json` の22件と `agent-1.json`〜`agent-6.json` に保存する。割当は各 `assignment-N.json`。
- チェックポイント `d6c03cf5c88605199d74ee1b9f767985fc331c7d` に299件保存済み。その後の本チェックポイントで369件を保存。残る原稿と初期原稿の敬体整備・事実照合を継続中。
- 前回の短い `src/publication-overviews.json` は採用しない。全468件の最終原稿で置き換えるまで公開しない。

## 実装・検証

`publication-hero__description` をそのまま残し、直下へ巻ごとに native `details/summary` を追加する。初期open属性なし。全文は静的HTMLに含め、単巻の `abstract`、分冊の各 `hasPart.abstract` に同じ本文を出力する。旧メタ説明も保持する。

UI差分は `interface-draft.patch` に保存済み。全件完成後、本番用8ファイルだけを統合する。ビルドで欠落、空白を除いて800字未満、改行込み1000字超過、余分なslug、同一作品内の巻別重複を拒否する。

- QAは既存成功経路 `.github/workflows/check-overviews.yml`（旧run `38864885183`）を今回の要件に合わせて更新する。全ビルド、正本・書誌・検索ゲートと全413ページ検査、1440/375px・JavaScript有効/無効でクリック/Enter/Space・巻別独立開閉・横はみ出しを検査する。
- 全件原稿、QA、画像確認後に最新mainへ対象8ファイルのみを適用し、既存Pages workflowを再利用する。
- 公開後は `.github/workflows/verify-live-detailed-overviews.yml` で全413ページ・468本文とCSSを実URLから照合する。
- 作業用原稿・ワンショットworkflowはmainへ入れない。

## 次の操作

残り原稿と編集確認を完了し、468件を統合する。その後QA、Pages公開、公開後の全ページ照合を順に実施する。詳細概要の追加公開は未完了。
