import { moraOverviews } from "./mora-obras-sueltas-1837-publication.mjs";
import { marquez1804Overviews } from "./marquez-due-antichi-monumenti-1804-publication.mjs";
import { pardo1676Overviews } from "./pardo-maria-de-jesus-1676-publication.mjs";
import { rea1643Overviews } from "./rea-michoacan-1643-publication.mjs";
import { parraBularioOverviews } from "./parra-bulario-1756-1757-publication.mjs";
import { lemus1683Overviews } from "./lemus-maria-de-jesus-1683-publication.mjs";
import { castro1588Overviews } from "./castro-juan-de-dios-1588-publication.mjs";
import { sjdDecreti1785Overviews } from "./sjd-decreti-apostolici-rome-1785-publication.mjs";
import { sjdMadrid1612Overviews } from "./san-juan-de-dios-constituciones-madrid-1612-publication.mjs";
import { sjdRome1785Overviews } from "./san-juan-de-dios-constituciones-rome-1785-publication.mjs";
import { cuggioBullarium1724Overviews } from "./cuggio-bullarium-hospitalaris-1724-publication.mjs";
import { sjdRome1617Overviews } from "./san-juan-de-dios-constituciones-rome-1617-publication.mjs";
import { sjdGranada1585Overviews } from "./san-juan-de-dios-constituciones-granada-1585-publication.mjs";
import { sjdConstitucionesOverviews } from "./san-juan-de-dios-constituciones-mexico-1774-publication.mjs";
import { orozco1853Overviews } from "./orozco-conjuracion-marques-del-valle-1853-publication.mjs";
import { santosHospitalariaOverviews } from "./santos-chronologia-hospitalaria-1715-1716-publication.mjs";
import { alegreOverviews } from "./alegre-historia-compania-jesus-nueva-espana-1841-1842-publication.mjs";
import { grijalva1624Overviews } from "./grijalva-cronica-san-augustin-nueva-espana-1624-publication.mjs";
import { levyNotAS1873Overviews } from "./levy-notas-nicaragua-1873-publication.mjs";
import { mexicoSiglosOverviews } from "./mexico-a-traves-de-los-siglos-publication.mjs";
import { ximenezScherzerLasHistoriasOverviews } from "./ximenez-scherzer-las-historias-1857-publication.mjs";
import { wagnerScherzerCostaRicaOverviews } from "./wagner-scherzer-die-republik-costa-rica-1856-publication.mjs";
import { scherzerXimenezHandschriftlicheWerkeOverviews } from "./scherzer-ximenez-handschriftliche-werke-1856-publication.mjs";
import { espinosaArricivitaChronicaOverviews } from "./espinosa-arricivita-chronica-1746-1792-publication.mjs";
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("./publication-overviews.json", import.meta.url), "utf8"));
export const publicationOverviews = Object.freeze({ ...data.records, ...moraOverviews, ...alegreOverviews, ...santosHospitalariaOverviews, ...parraBularioOverviews, ...grijalva1624Overviews, ...orozco1853Overviews, ...sjdConstitucionesOverviews, ...sjdGranada1585Overviews, ...sjdRome1617Overviews, ...cuggioBullarium1724Overviews, ...sjdDecreti1785Overviews, ...castro1588Overviews, ...lemus1683Overviews, ...pardo1676Overviews, ...rea1643Overviews, ...marquez1804Overviews, ...sjdRome1785Overviews, ...sjdMadrid1612Overviews, ...levyNotAS1873Overviews, ...mexicoSiglosOverviews, ...ximenezScherzerLasHistoriasOverviews, ...wagnerScherzerCostaRicaOverviews, ...espinosaArricivitaChronicaOverviews, ...scherzerXimenezHandschriftlicheWerkeOverviews });
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
