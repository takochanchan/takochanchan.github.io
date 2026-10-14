const status = document.querySelector("[data-stats-status]");
const content = document.querySelector("[data-stats-content]");
const number = new Intl.NumberFormat("ja-JP");
const cell = (row, text) => {
  const td = document.createElement("td");
  td.textContent = text;
  row.appendChild(td);
  return td;
};
try {
  const response = await fetch("/stats/downloads.json", { cache: "no-cache" });
  if (!response.ok) throw new Error("unavailable");
  const data = await response.json();
  if (data.status !== "ready") {
    status.textContent = "集計データはまだ公開されていません。公開開始後、このページに資料別・日別・月別の件数を掲載します。";
  } else {
    const files = new Map(data.files.map(file => [file.key, file]));
    const totals = new Map();
    const days = new Map();
    const months = new Map();
    let total = 0;
    for (const record of data.records) {
      if (!files.has(record.key) || !Number.isSafeInteger(record.count) || record.count < 0) throw new Error("invalid data");
      total += record.count;
      totals.set(record.key, (totals.get(record.key) || 0) + record.count);
      days.set(record.date, (days.get(record.date) || 0) + record.count);
      const month = record.date.slice(0, 7);
      months.set(month, (months.get(month) || 0) + record.count);
    }
    status.textContent = `${data.startDate}から${data.endDate}までの保存操作 ${number.format(total)}件。更新：${new Date(data.updatedAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}（日本時間）。直近の数値は後日補正される場合があります。`;
    const body = document.querySelector("[data-stats-files]");
    for (const [key, count] of [...totals].sort((a, b) => b[1] - a[1])) {
      const file = files.get(key);
      const row = document.createElement("tr");
      const title = cell(row, "");
      const link = document.createElement("a");
      link.href = `/publications/${encodeURIComponent(file.slug)}/`;
      link.textContent = file.title + (file.volumeLabel ? `（${file.volumeLabel}）` : "");
      title.appendChild(link);
      cell(row, file.format.toUpperCase());
      cell(row, number.format(count));
      body.appendChild(row);
    }
    for (const [selector, values] of [["[data-stats-months]", months], ["[data-stats-days]", days]]) {
      const target = document.querySelector(selector);
      for (const [date, count] of [...values].sort((a, b) => b[0].localeCompare(a[0]))) {
        const row = document.createElement("tr");
        cell(row, date);
        cell(row, number.format(count));
        target.appendChild(row);
      }
    }
    content.hidden = false;
  }
} catch {
  status.textContent = "集計データを読み込めませんでした。時間をおいて再度ご確認ください。";
}
