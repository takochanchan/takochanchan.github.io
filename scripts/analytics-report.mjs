import { downloadFile } from "../src/analytics.mjs";

export const startDate = "2026-10-14";
export const pendingReport = { version: 1, status: "pending", startDate, records: [], files: [] };

export function catalogueFiles(publications) {
  const files = new Map();
  for (const item of publications) {
    for (const volume of item.volumes) {
      for (const format of ["pdf", "epub"]) {
        const file = downloadFile(volume[`${format}Url`]);
        if (!file) throw new Error(`Invalid analytics file: ${volume.slug} ${format}`);
        const previous = files.get(file.key);
        if (previous && previous.name !== file.name) throw new Error("Analytics file ID collision");
        if (previous && previous.slug !== item.slug) throw new Error("Analytics file belongs to multiple catalogue entries");
        files.set(file.key, {
          key: file.key, name: file.name, slug: item.slug, title: item.title,
          volumeLabel: item.volumes.length > 1 ? volume.volumeLabel : "", format,
        });
      }
    }
  }
  return [...files.values()];
}

export function reportRecords(pages, files) {
  const keys = new Set(files.map(file => file.key));
  const records = new Map();
  for (const page of pages) {
    if (page.metadata?.subjectToThresholding || page.metadata?.dataLossFromOtherRow || page.metadata?.samplingMetadatas?.length) {
      throw new Error("GA4 report is thresholded, sampled or incomplete; keep the previous public report");
    }
    for (const row of page.rows || []) {
      const [rawDate, key] = row.dimensionValues.map(value => value.value);
      const countText = row.metricValues[0]?.value;
      const count = Number(countText);
      if (!/^\d{8}$/.test(rawDate) || !/^\d+$/.test(countText || "") || !Number.isSafeInteger(count)) throw new Error("Invalid GA4 report row");
      if (!keys.has(key)) throw new Error("GA4 returned an unrecognized file identifier; review the report before publication");
      const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
      if (new Date(date).toISOString().slice(0, 10) !== date) throw new Error("Invalid report date");
      const recordKey = `${date}/${key}`;
      if (records.has(recordKey)) throw new Error("Duplicate GA4 report row");
      records.set(recordKey, { date, key, count });
    }
  }
  return [...records.values()].sort((a, b) => a.date.localeCompare(b.date) || a.key.localeCompare(b.key));
}
