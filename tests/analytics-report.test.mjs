import test from "node:test";
import assert from "node:assert/strict";
import { catalogueFiles, reportRecords, reportCsv } from "../scripts/analytics-report.mjs";

const base = "https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/";
const catalogue = [{ slug: "book", title: "資料", volumes: [
  { slug: "vol1", volumeLabel: "第1巻", pdfUrl: base + "vol1.pdf", epubUrl: base + "vol1.epub" },
  { slug: "vol2", volumeLabel: "第2巻", pdfUrl: base + "vol2.pdf", epubUrl: base + "vol2.epub" },
] }];
const files = catalogueFiles(catalogue);
const row = (date, key, count) => ({ dimensionValues: [{ value: date }, { value: key }], metricValues: [{ value: count }] });
test("maps distinct volumes and formats to one canonical bibliography", () => {
  assert.equal(files.length, 4);
  assert.equal(new Set(files.map(file => file.key)).size, 4);
  assert.ok(files.every(file => file.slug === "book"));
});
test("uses daily aggregate counts and rejects missing mappings or lossy reports", () => {
  assert.deepEqual(reportRecords([{ rows: [row("20261014", files[0].key, "3")] }], files), [
    { date: "2026-10-14", key: files[0].key, count: 3 },
  ]);
  for (const page of [
    { rows: [row("20261014", "(not set)", "3")] },
    { rows: [row("20261014", files[0].key, "-3")] },
    { rows: [row("20261314", files[0].key, "3")] },
    { metadata: { subjectToThresholding: true } },
    { metadata: { dataLossFromOtherRow: true } },
  ]) assert.throws(() => reportRecords([page], files));
});
test("CSV includes public aggregates, quotes titles, and prevents spreadsheet formulas", () => {
  const csv = reportCsv({ files: [{ ...files[0], title: '=HYPERLINK("bad")' }], records: [
    { date: "2026-10-14", key: files[0].key, count: 2 },
  ] });
  assert.ok(csv.includes("'=HYPERLINK"));
  assert.ok(csv.includes('"2026-10-14"'));
  assert.ok(!csv.includes("client_id"));
});
