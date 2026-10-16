import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("./publication-overviews.json", import.meta.url), "utf8"));
export const publicationOverviews = Object.freeze(data.records);
export const overviewUpdatedDate = data.updatedDate;

export function validatePublicationOverviews(publications, records = publicationOverviews) {
  const required = new Set(publications.flatMap(item => item.volumes.map(volume => volume.slug)));
  for (const slug of required) {
    const overview = records[slug];
    if (typeof overview !== "string" || !overview.trim()) {
      throw new Error(`Missing publication overview: ${slug}`);
    }
    if (Array.from(overview).length > 1000) {
      throw new Error(`Publication overview exceeds 1000 characters: ${slug}`);
    }
    if (Array.from(overview.replace(/\s/gu, "")).length < 800) {
      throw new Error(`Detailed publication overview must be approximately 1000 characters: ${slug}`);
    }
  }
  for (const slug of Object.keys(records)) {
    if (!required.has(slug)) throw new Error(`Unknown publication overview: ${slug}`);
  }
  for (const item of publications.filter(item => item.volumes.length > 1)) {
    const summaries = item.volumes.map(volume => records[volume.slug]);
    if (new Set(summaries).size !== summaries.length) {
      throw new Error(`Volume overviews must be individually written: ${item.slug}`);
    }
  }
}
