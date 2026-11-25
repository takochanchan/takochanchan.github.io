import { levyNotAS1873Overviews } from "./levy-notas-nicaragua-1873-publication.mjs";
import { mexicoSiglosOverviews } from "./mexico-a-traves-de-los-siglos-publication.mjs";
import { ximenezScherzerLasHistoriasOverviews } from "./ximenez-scherzer-las-historias-1857-publication.mjs";
import { wagnerScherzerCostaRicaOverviews } from "./wagner-scherzer-die-republik-costa-rica-1856-publication.mjs";
import { scherzerXimenezHandschriftlicheWerkeOverviews } from "./scherzer-ximenez-handschriftliche-werke-1856-publication.mjs";
import { espinosaArricivitaChronicaOverviews } from "./espinosa-arricivita-chronica-1746-1792-publication.mjs";
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("./publication-overviews.json", import.meta.url), "utf8"));
export const publicationOverviews = Object.freeze({ ...data.records, ...levyNotAS1873Overviews, ...mexicoSiglosOverviews, ...ximenezScherzerLasHistoriasOverviews, ...wagnerScherzerCostaRicaOverviews, ...espinosaArricivitaChronicaOverviews, ...scherzerXimenezHandschriftlicheWerkeOverviews });
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
