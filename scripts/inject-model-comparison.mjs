import { readFile, writeFile } from "node:fs/promises";

const path = "dist/about/index.html";
let html = await readFile(path, "utf8");

const section = `
  <section class="policy-section" id="model-comparison" aria-labelledby="model-comparison-heading">
    <div class="policy-section__inner">
      <div class="policy-section__heading">
        <p class="eyebrow">MODEL COMPARISON</p>
        <h2 id="model-comparison-heading">推論モデルの翻訳性能比較</h2>
      </div>
      <div class="policy-copy">
        <p>
          本アーカイブでは、翻訳工程に使用する推論モデルの選定にあたり、同一底本・同一範囲・同一指示による独立初訳比較を行っています。以下は1615年刊アントニオ・デ・エレーラ『Historia general…』原刊293–312頁（20頁）を対象に、12条件を各1回実行した比較です。評価値は全文の誤訳率ではなく、あらかじめ設定した23の限定確認点についての結果です。
        </p>
        <div style="overflow-x:auto">
          <table>
            <thead><tr><th>モデル</th><th>所要時間</th><th>保持</th><th>部分</th><th>重大</th><th>段落継続</th></tr></thead>
            <tbody>
              <tr><td>GPT-5.5 medium</td><td>9分29秒</td><td>9/23</td><td>1</td><td>13</td><td>2/14</td></tr>
              <tr><td>GPT-5.5 high</td><td>9分15秒</td><td>8/23</td><td>2</td><td>13</td><td>0/14</td></tr>
              <tr><td>GPT-5.5 xhigh</td><td>13分38秒</td><td>20/23</td><td>1</td><td>2</td><td>10/14</td></tr>
              <tr><td>Sol medium</td><td>8分29秒</td><td>5/23</td><td>0</td><td>18</td><td>0/14</td></tr>
              <tr><td>Sol high</td><td>9分30秒</td><td>7/23</td><td>2</td><td>14</td><td>9/14</td></tr>
              <tr><td>Sol xhigh</td><td>21分03秒</td><td>21/23</td><td>1</td><td>1</td><td>14/14</td></tr>
              <tr><td>Sol max</td><td>27分55秒</td><td>22/23</td><td>1</td><td>0</td><td>13/14</td></tr>
              <tr><td>Astra low</td><td>14分48秒</td><td>18/23</td><td>0</td><td>5</td><td>13/14</td></tr>
              <tr><td>Astra medium</td><td>13分47秒</td><td>19/23</td><td>1</td><td>3</td><td>9/14</td></tr>
              <tr><td>Astra high</td><td>16分26秒</td><td>18/23</td><td>2</td><td>3</td><td>14/14</td></tr>
              <tr><td>Astra xhigh</td><td>29分45秒</td><td>22/23</td><td>0</td><td>1</td><td>14/14</td></tr>
              <tr><td>Astra max</td><td>35分07秒</td><td>23/23</td><td>0</td><td>0</td><td>14/14</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          この限定試験では、精度最優先ではAstra max、30分以内で精度を重視する条件ではSol maxが最良でした。短時間の初訳候補としてはGPT-5.5 xhighが良好でした。読解性能の概略は、Astra max、Sol max、Astra xhigh／Sol xhigh／GPT-5.5 xhigh、Astra low／medium／high、GPT-5.5 medium／high・Sol high／mediumの順でした。
        </p>
        <p>
          なお、これは単一の20頁標本を各条件1回だけ実行した限定的な比較であり、モデル一般の性能順位を示すものではありません。トークン使用量・費用については各条件の実測値を取得できていないため、時間や文字数から推計せず、比較対象としていません。モデルや推論設定は、資料の難度、長文での構造保持、処理速度、利用可能な計算資源を考慮して工程ごとに選択します。
        </p>
      </div>
    </div>
  </section>
`;

const marker = '  <section class="policy-section policy-section--notice" id="notice"';
if (!html.includes(marker)) throw new Error("policy notice section marker not found");
html = html.replace(marker, `${section}\n${marker}`);

const navMarker = '      <a href="#notice"><span>05</span>利用上の注意</a>';
if (html.includes(navMarker)) {
  html = html.replace(navMarker, '      <a href="#model-comparison"><span>05</span>推論モデル比較</a>\n      <a href="#notice"><span>06</span>利用上の注意</a>');
}

await writeFile(path, html);
console.log("Injected reasoning model comparison into dist/about/index.html");
