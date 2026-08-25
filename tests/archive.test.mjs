import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  majorPublications,
  publications,
  shortPublicationAuthors,
  shortPublications,
  taxonomy,
} from "../src/publications.mjs";
import { perignyRemainingSlugs } from "../src/perigny-remaining-publications.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const dist = path.join(root, "dist");

const exists = async (file) => {
  await access(file);
  return true;
};

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

test("catalogue metadata is complete and unique", () => {
  assert.equal(publications.length, 266);
  assert.equal(new Set(publications.map((item) => item.slug)).size, publications.length);
  for (const item of publications) {
    for (const key of [
      "title",
      "originalTitle",
      "author",
      "description",
      "cover",
      "pdf",
      "epub",
      "pdfUrl",
      "epubUrl",
      "year",
      "types",
      "regions",
      "languages",
      "tags",
      "sourceEdition",
      "sourceProvider",
      "rights",
      "publishedDate",
      "updatedDate",
    ]) {
      assert.ok(item[key] && item[key].length !== 0, `${item.slug}: ${key}`);
    }
  }
  assert.ok(taxonomy.types.length >= 8);
  assert.ok(taxonomy.regions.includes("ウスマシンタ川流域"));
  assert.ok(taxonomy.languages.includes("フランス語"));
});

test("public bibliography omits production boilerplate", () => {
  const prohibited =
    /原刊の前付、本文、各巻索引、欄外注|段落と頁順を(?:保持|維持)/u;
  for (const item of publications) {
    assert.doesNotMatch(
      `${item.extent ?? ""}\n${item.description}`,
      prohibited,
      item.slug,
    );
  }

  const torquemada = publications.find(
    (item) => item.slug === "torquemada-monarquia-indiana-1615",
  );
  assert.ok(torquemada);
  assert.equal(torquemada.extent, "日本語版PDF 3701頁・全3巻・全21書");
  assert.equal(
    torquemada.description,
    "フアン・デ・トルケマダが1615年に刊行した全三巻二十一書のヌエバ・エスパニャ史・民族誌・宣教史の日本語全訳です。John Carter Brown Library所蔵初版本をInternet Archive公開画像から底本として用いました。",
  );
});

test("Strangeways Mosquito Shore retains the approved complete scope", () => {
  const item = publications.find(
    (publication) => publication.slug === "strangeways-mosquito-shore-1822",
  );
  assert.ok(item);
  assert.equal(item.pageCount, 239);
  assert.equal(item.figureCount, 3);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /原刊前付viii頁・本文355頁/);
  assert.match(item.description, /原刊位置標識374件/);
  assert.match(item.sourceProvider, /Library of Congress/);
  assert.match(item.rights, /再利用ライセンスを設定していない/);
});

test("Fernández Costa Rica history retains the approved complete scope", () => {
  const item = publications.find(
    (publication) => publication.slug === "fernandez-historia-costa-rica-1889",
  );
  assert.ok(item);
  assert.equal(item.pageCount, 613);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 24);
  assert.match(item.extent, /原刊前付V–VII頁・本文1–640頁/);
  assert.match(item.description, /原刊の段落、引用、表、注、頁順/);
  assert.match(item.sourceProvider, /Internet Archive/);
  assert.match(item.rights, /再利用ライセンスを設定していません/);
});

test("century-only catalogue dates sort at each century's final year", async () => {
  const tolteca = publications.find(
    (item) => item.slug === "historia-tolteca-chichimeca",
  );
  assert.ok(tolteca);
  assert.equal(tolteca.year, "16世紀");

  for (const relative of ["src/archive.js", "scripts/build.mjs"]) {
    const source = await readFile(path.join(root, relative), "utf8");
    const helperAt = source.indexOf("const catalogueYearForSort =");
    const comparatorAt = source.indexOf("const compareYears =", helperAt);
    const comparatorTail = source.slice(comparatorAt).match(/\n\s*};/);
    assert.ok(helperAt >= 0, `${relative}: century helper`);
    assert.ok(comparatorAt > helperAt, `${relative}: year comparator`);
    assert.ok(comparatorTail, `${relative}: comparator end`);
    const comparatorEnd =
      comparatorAt + comparatorTail.index + comparatorTail[0].length;
    const helpers = Function(
      `${source.slice(helperAt, comparatorEnd)}
return { catalogueYearForSort, compareYears };`,
    )();

    assert.equal(helpers.catalogueYearForSort(1619), 1619, relative);
    assert.equal(helpers.catalogueYearForSort("16世紀"), 1599, relative);
    assert.equal(helpers.catalogueYearForSort("17世紀"), 1699, relative);
    assert.equal(helpers.catalogueYearForSort("16世紀後半"), null, relative);

    const sample = [
      { year: 1600 },
      { year: "16世紀" },
      { year: 1598 },
      { year: "年代不明" },
    ];
    assert.deepEqual(
      [...sample].sort(helpers.compareYears).map((item) => item.year),
      [1598, "16世紀", 1600, "年代不明"],
      `${relative}: ascending`,
    );
    assert.deepEqual(
      [...sample]
        .sort((a, b) => helpers.compareYears(a, b, true))
        .map((item) => item.year),
      [1600, "16世紀", 1598, "年代不明"],
      `${relative}: descending`,
    );
  }

  const html = await readFile(path.join(dist, "index.html"), "utf8");
  const catalogueStart = html.indexOf(
    '<div class="archive-grid" data-archive>',
  );
  const catalogueEnd = html.indexOf(
    '<nav class="pagination"',
    catalogueStart,
  );
  assert.ok(catalogueStart >= 0 && catalogueEnd > catalogueStart);
  const catalogue = html.slice(catalogueStart, catalogueEnd);
  const toltecaAt = catalogue.indexOf(
    "/publications/historia-tolteca-chichimeca/",
  );
  const remesalAt = catalogue.indexOf(
    "/publications/remesal-historia-general-1619/",
  );
  assert.ok(toltecaAt >= 0 && remesalAt > toltecaAt);
  const toltecaCardStart = catalogue.lastIndexOf(
    '<article class="record-card">',
    toltecaAt,
  );
  const toltecaCardEnd = catalogue.indexOf("</article>", toltecaAt);
  assert.match(
    catalogue.slice(toltecaCardStart, toltecaCardEnd),
    /<span>16世紀<\/span>/,
  );
});

test("Apuntes catalogo 1866 preserves bilingual authors and titles", () => {
  const item = publications.find(
    (publication) =>
      publication.slug ===
      "garcia-icazbalceta-apuntes-escritores-lenguas-indigenas-america-1866",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.title, "アメリカ先住民諸語著述家目録のための覚書");
  assert.equal(
    item.originalTitle,
    "Apuntes para un catálogo de escritores en lenguas indígenas de América",
  );
  assert.equal(item.author, "ホアキン・ガルシア・イカスバルセタ");
  assert.equal(item.pageCount, 178);
  assert.equal(item.figureCount, 1);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /全175項目/);
  assert.ok(item.majorSources.length >= 12);
  assert.ok(
    item.majorSources.every(
      (entry) => /（[^）]+）/.test(entry) && /『[^』]+（[^）]+）』/.test(entry),
    ),
  );
  for (const source of [
    "Doctrina Christiana, y Pláticas doctrinales",
    "Grammar of the Mutsun Language",
    "Arte y Dictionario en lengua Michuacana",
    "Arte de la lengua Maya",
    "Arte en Lengua Mixteca",
    "Arte en Lengua Zapoteca",
    "Sermones en mexicano",
  ]) {
    assert.ok(item.majorSources.some((entry) => entry.includes(source)), source);
  }
  assert.match(item.sourceEdition, /1866年初版、60部限定印刷/);
  assert.match(item.sourceProvider, /Real Academia Española/);
  assert.match(item.sourceProvider, /請求記号40-IX-75/);
  assert.match(item.sourceProvider, /Google Books/);
  assert.match(item.rights, /頁画像.*転載していません/);
  assert.match(item.rights, /再利用ライセンスを設定していません/);
});

test("Bibliografia mexicana lists representative included works bilingually", () => {
  const item = publications.find(
    (publication) =>
      publication.slug ===
      "garcia-icazbalceta-bibliografia-mexicana-siglo-xvi-1886",
  );
  assert.ok(item);
  assert.equal(item.author, "ホアキン・ガルシア・イカスバルセタ");
  assert.equal(item.pageCount, 921);
  assert.ok(item.majorSources.length >= 10);
  for (const source of [
    "Breve y más compendiosa doctrina christiana",
    "Vocabulario en la lengua Castellana y Mexicana",
    "Túmulo Imperial de la gran Ciudad de México",
    "Psalmodia Cristiana",
    "Problemas y Secretos Maravillosos de las Indias",
    "Arte Mexicana",
    "Advertencias para los confessores de los Naturales",
  ]) {
    assert.ok(item.majorSources.some((entry) => entry.includes(source)), source);
  }
  assert.ok(item.majorSources.every((entry) => /（[^）]+）/.test(entry)));
});

test("Baqueiro Yucatan history retains the approved three-volume scope", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "baqueiro-ensayo-revoluciones-yucatan-1878-1887",
  );
  assert.ok(item);
  assert.equal(item.author, "セラピオ・バケイロ");
  assert.equal(item.pageCount, 1251);
  assert.equal(item.plateCount, 1);
  assert.match(item.extent, /改訂全3巻/);
  assert.match(item.description, /全24章/);
  assert.match(item.sourceProvider, /British Library/);
  assert.match(item.sourceProvider, /9781\.dd\.11/);
  assert.match(item.rights, /再利用ライセンスを設定していません/);
});

test("Alva confessionary metadata retains the approved complete scope", () => {
  const item = publications.find((publication) => publication.slug === "alva-confessionario-mayor-menor-1634");
  assert.ok(item);
  assert.equal(item.pageCount, 66);
  assert.equal(item.figureCount, 12);
  assert.match(item.extent, /底本位置標識57件/);
  assert.match(item.description, /四つの祈り/);
  assert.match(item.sourceProvider, /John Carter Brown Library/);
  assert.match(item.rights, /CC BY 4\.0/);
});

test("Roberts voyage metadata retains the approved complete scope", () => {
  const item = publications.find(
    (publication) => publication.slug === "roberts-voyages-central-america-1827",
  );
  assert.ok(item);
  assert.equal(item.pageCount, 202);
  assert.equal(item.figureCount, 3);
  assert.match(item.extent, /原刊頁標識289件/);
  assert.match(item.description, /本文全14章/);
  assert.match(item.description, /付録注IからVIII/);
  assert.match(item.sourceProvider, /Getty Research Institute/);
  assert.match(item.sourceProvider, /Library of Congress/);
  assert.match(item.rights, /再利用ライセンスを設定していません/);
});

test("Barraza Aquino study metadata retains the approved complete scope", () => {
  const item = publications.find(
    (publication) => publication.slug === "barraza-anastasio-aquino-2001",
  );
  assert.ok(item);
  assert.equal(item.pageCount, 210);
  assert.equal(item.figureCount, 19);
  assert.match(item.extent, /底本位置標識149件/);
  assert.match(item.extent, /原注131件/);
  assert.match(item.description, /全4部/);
  assert.match(item.sourceProvider, /Universidad Tecnológica de El Salvador/);
  assert.match(item.sourceProvider, /11298\/1290/);
  assert.match(item.rights, /CC BY-NC-SA 4\.0/);
  assert.match(item.rights, /同じCC BY-NC-SA 4\.0/);
});

test("Villavicencio confessionary metadata retains the approved complete scope", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "villavicencio-luz-metodo-idolatras-1692",
  );
  assert.ok(item);
  assert.equal(item.pageCount, 218);
  assert.equal(item.figureCount, 2);
  assert.match(item.extent, /底本位置標識213件/);
  assert.match(item.description, /告解質問76問/);
  assert.match(item.description, /説教4篇/);
  assert.match(item.sourceProvider, /Memoria Chilena/);
  assert.match(item.rights, /Public Domain Mark 1\.0/);
});

test("González Tehuacán paper retains its approved article scope", () => {
  const item = publications.find(
    (publication) => publication.slug === "gonzalez-ruinas-tehuacan-1892",
  );
  assert.ok(item);
  assert.equal(item.type, "paper");
  assert.equal(item.recordClass, "short-work");
  assert.equal(item.authorKey, "dario-gonzalez");
  assert.equal(item.author, "ダリオ・ゴンサレス");
  assert.equal(item.originalAuthor, "Darío González");
  assert.equal(item.pageCount, 9);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /原刊203–206頁/);
  assert.match(item.sourceProvider, /launi36guat/);
  assert.match(item.sourceUrl, /archive\.org\/details\/launi36guat/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /再利用ライセンスを設定していません/);
  assert.equal(item.publishedDate, "2026-08-25");
  assert.equal(item.updatedDate, "2026-08-25");
});

test("González Central America geography retains its approved complete scope", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "gonzalez-compendio-geografia-centro-america-1881",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.author, "ダリオ・ゴンサレス");
  assert.equal(item.originalAuthor, "Darío González");
  assert.equal(item.pageCount, 123);
  assert.equal(item.figureCount, 32);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /原刊本文1–131頁/);
  assert.match(item.extent, /索引133–135頁/);
  assert.match(item.description, /中央アメリカ五共和国/);
  assert.match(item.sourceProvider, /Google Books/);
  assert.match(item.sourceProvider, /zGVqAAAAMAAJ/);
  assert.match(item.sourceUrl, /books\.google\.com\/books\?id=zGVqAAAAMAAJ/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.doesNotMatch(item.rights, /CC BY|CCSA/);
  assert.equal(item.publishedDate, "2026-08-25");
  assert.equal(item.updatedDate, "2026-08-25");
});

test("Leonard Sigüenza monograph retains its approved complete scope", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "leonard-don-carlos-de-siguenza-y-gongora-1929",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.author, "アーヴィング・A・レナード");
  assert.equal(item.originalAuthor, "Irving A. Leonard");
  assert.equal(item.pageCount, 318);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 1);
  assert.match(item.extent, /脚注422件/);
  assert.match(item.extent, /付録A\/B/);
  assert.match(item.description, /全10章/);
  assert.match(item.description, /白紙葉は収録していません/);
  assert.match(item.sourceProvider, /doncarlosdesigen18berk/);
  assert.match(item.sourceUrl, /archive\.org\/details\/doncarlosdesigen18berk/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /再利用ライセンスを設定していません/);
  assert.equal(item.publishedDate, "2026-08-25");
  assert.equal(item.updatedDate, "2026-08-25");
});

test("short works use explicit author groups instead of page-count rules", () => {
  assert.equal(majorPublications.length, 128);
  assert.equal(shortPublications.length, 138);
  assert.equal(shortPublicationAuthors.length, 33);
  assert.deepEqual(
    new Set(shortPublications.map((item) => item.slug)),
    new Set([
      "gonzalez-ruinas-tehuacan-1892",
      "esquinca-usumacinta",
      "sapper-eastern-lacandons-1891",
      "berendt-central-america-explorations-1867",
      "berendt-baumwollenbau-yucatan-1863",
      "berendt-analytical-alphabet-1869",
      "berendt-escritos-garcia-icazbalceta-1870",
      "berendt-trabajos-linguisticos-juan-pio-perez-1871",
      "berendt-el-ramie-1871",
      "berendt-mexico-1872",
      "berendt-indianer-tehuantepec-1873",
      "berendt-carib-karif-language-1873",
      "berendt-darien-language-1874",
      "berendt-ethnologie-nicaragua-1874",
      "berendt-ethnologie-nicaragua-1875",
      "berendt-ancient-central-american-civilization-1876",
      "berendt-historical-documents-guatemala-1877",
      "berendt-veracruz-correspondence-1861-1862",
      "berendt-drei-tage-cuba-1860",
      "berendt-acasaguastlan-jilotepec-1878",
      "berendt-indigenas-america-central-1877",
      "berendt-palabras-modismos-nicaragua-1874",
      "berendt-mangue-subtiaba-dossier-1874",
      "berendt-vermessungsarbeiten-mexiko-1862",
      "berendt-maasse-gewichte-mexiko-1862",
      "berendt-handel-veracruz-1862",
      "berendt-cochenille-produktion-oaxaca-1862",
      "berendt-mexikanische-geographische-literatur-1862-1",
      "us-senate-central-america-correspondence-1853",
      "galindo-ruins-palenque-literary-gazette-1831",
      "galindo-noticias-peten-1831",
      "galindo-usumacinta-1833",
      "galindo-caribs-central-america-1833",
      "galindo-copan-full-report-1834",
      "galindo-antiquities-peten-1834",
      "galindo-eruption-cosiguina-1835",
      "galindo-copan-literary-gazette-1835",
      "galindo-on-central-america-1836",
      "galindo-ruins-copan-aas-1836",
      "friedrichsthal-yucatan-1841",
      "galindo-palenque-1832",
      "arthes-peten-1893",
      "chonay-totonicapan-title-1886",
      "societe-geographie-central-america-report-1836",
      "marimon-lacandones-1695",
      "peniche-relaciones-belice-1869",
      "dieseldorff-ausgrabungen-coban-1893",
      "dieseldorff-alte-bemalte-thongefaesse-guatemala-1893",
      "dieseldorff-gefaess-chama-1895",
      "dieseldorff-reliefbild-chipolem-1895",
      "dieseldorff-cuculcan-1895",
      "dieseldorff-tolteken-1896",
      "dieseldorff-gegenstaende-guatemala-1893",
      "dieseldorff-bemaltes-thongefaess-chama-1894",
      "dieseldorff-vampyrkoepfige-gottheit-1894",
      "dieseldorff-neue-ausgrabungen-chajcar-1895",
      "dieseldorff-two-vases-chama-1904",
      "dieseldorff-jadeit-schmuck-1905",
      "dieseldorff-klassifizierung-funde-1909",
      "dieseldorff-tzultaca-mam-1926",
      "dieseldorff-kunst-religion-band-i-1926",
      "dieseldorff-kunst-religion-band-ii-1931",
      "dieseldorff-kekchi-will-1583-1932",
      "dieseldorff-cauac-thunderbolt-signs-1932",
      "dieseldorff-arqueologia-alta-verapaz-1936",
      "dieseldorff-calendario-maya-quirigua-1936",
      "dieseldorff-plantas-medicinales-alta-verapaz-1939-1940",
      "dieseldorff-causa-calendario-quirigua-1940",
      "schellhas-virchow-deformierter-schaedel-ulpan-1894",
      "virchow-graeberschaedel-guatemala-1897",
      "perigny-ruines-nacun-1906",
      "perigny-exploration-yucatan-1906",
      "lemoine-travers-peten-yucatan-1906",
      "perigny-peten-1907",
      "perigny-maya-ruins-quintana-roo-1907",
      "perigny-yucatan-inconnu-1908",
      "perigny-maler-discoveries-yucatan-1908",
      "perigny-yucatan-inconnu-geographie-1908",
      "perigny-ruines-rio-bec-1909",
      "perigny-villes-mortes-amerique-centrale-1909",
      "perigny-lettre-costa-rica-1910",
      "perigny-costa-rica-pays-habitants-ressources-1910",
      "perigny-ruines-nakcun-1911",
      "perigny-costa-rica-nantes-1911",
      "perigny-amerique-centrale-1911",
      "morelet-exploration-guatemala-1850",
      "morelet-testacea-novissima-pars-i-1849",
      "morelet-testacea-novissima-pars-ii-1851",
      "flint-antiquities-nicaragua-palenque-builders-1882",
      "flint-human-foot-prints-nicaragua-1884",
      "flint-human-foot-prints-nicaragua-1885",
      "flint-pre-adamite-foot-prints-1886",
      "flint-human-footprints-eocene-1888",
      "flint-paleolithics-nicaragua-1888",
      "flint-nicaragua-foot-prints-1889",
      "flint-what-dr-flint-says-nicaragua-footprints-1890",
      "flint-prehistoric-horse-america-1891",
      "flint-rainfall-rivas-nicaragua-1898",
      "flint-rainfall-central-western-nicaragua-1899",
      "putnam-antiquity-man-america-1884",
      "mca-pre-adamite-track-1885",
      "unsigned-nicaragua-footprints-again-1886",
      "brinton-ancient-human-footprint-nicaragua-1887",
      "editorial-age-nicaragua-footprints-1889",
      "crawford-neolithic-man-nicaragua-1891",
      ...perignyRemainingSlugs,
    ]),
  );
  const galindo = shortPublicationAuthors.find(
    (author) => author.key === "juan-galindo",
  );
  assert.ok(galindo);
  assert.equal(galindo.name, "フアン・ガリンド");
  assert.deepEqual(
    galindo.publications.map((item) => item.slug),
    [
      "galindo-ruins-palenque-literary-gazette-1831",
      "galindo-noticias-peten-1831",
      "galindo-palenque-1832",
      "galindo-usumacinta-1833",
      "galindo-caribs-central-america-1833",
      "galindo-copan-full-report-1834",
      "galindo-antiquities-peten-1834",
      "galindo-eruption-cosiguina-1835",
      "galindo-copan-literary-gazette-1835",
      "galindo-on-central-america-1836",
      "galindo-ruins-copan-aas-1836",
    ],
  );
  const moreletCommittee = shortPublicationAuthors.find(
    (author) => author.key === "arthur-morelet-achille-valenciennes",
  );
  assert.ok(moreletCommittee);
  assert.equal(
    moreletCommittee.name,
    "ピエール＝マリー＝アルテュール・モルレ／アシル・ヴァランシエンヌ",
  );
  assert.deepEqual(
    moreletCommittee.publications.map((item) => item.slug),
    ["morelet-exploration-guatemala-1850"],
  );
  const morelet = shortPublicationAuthors.find(
    (author) => author.key === "arthur-morelet",
  );
  assert.ok(morelet);
  assert.equal(morelet.name, "ピエール＝マリー＝アルテュール・モルレ");
  assert.deepEqual(
    morelet.publications.map((item) => item.slug),
    [
      "morelet-testacea-novissima-pars-i-1849",
      "morelet-testacea-novissima-pars-ii-1851",
    ],
  );
  const committee = shortPublicationAuthors.find(
    (author) => author.key === "societe-de-geographie-committee",
  );
  assert.ok(committee);
  assert.equal(committee.name, "フランス地理学会委員会");
  assert.deepEqual(
    committee.publications.map((item) => item.slug),
    ["societe-geographie-central-america-report-1836"],
  );
  const stateDepartment = shortPublicationAuthors.find(
    (author) => author.key === "united-states-department-of-state",
  );
  assert.ok(stateDepartment);
  assert.equal(stateDepartment.name, "アメリカ合衆国国務省（編）");
  assert.deepEqual(
    stateDepartment.publications.map((item) => item.slug),
    ["us-senate-central-america-correspondence-1853"],
  );
  const marimon = shortPublicationAuthors.find(
    (author) => author.key === "sebastian-marimon-y-tudo",
  );
  assert.ok(marimon);
  assert.equal(marimon.name, "セバスティアン・マリモン・イ・トゥドー");
  assert.deepEqual(
    marimon.publications.map((item) => item.slug),
    ["marimon-lacandones-1695"],
  );
  const peniche = shortPublicationAuthors.find(
    (author) => author.key === "manuel-peniche",
  );
  assert.ok(peniche);
  assert.equal(peniche.name, "マヌエル・ペニチェ");
  assert.deepEqual(
    peniche.publications.map((item) => item.slug),
    ["peniche-relaciones-belice-1869"],
  );
  const perigny = shortPublicationAuthors.find(
    (author) => author.key === "maurice-de-perigny",
  );
  assert.ok(perigny);
  assert.equal(perigny.name, "モーリス・ド・ペリニー");
  assert.deepEqual(
    perigny.publications.map((item) => item.slug),
    [
      "perigny-francais-mexique-1905",
      "perigny-ruines-nacun-1906",
      "perigny-henequen-yucatan-1906",
      "perigny-merida-ville-florissante-1906",
      "perigny-exploration-yucatan-1906",
      "perigny-maya-ruins-quintana-roo-1907",
      "perigny-peten-1907",
      "perigny-modern-mexico-1907",
      "perigny-industrie-chicle-1908",
      "perigny-maler-discoveries-yucatan-1908",
      "perigny-hokkaido-ainos-1908",
      "perigny-yucatan-inconnu-1908",
      "perigny-yucatan-inconnu-geographie-1908",
      "perigny-iles-riou-kiou-1908",
      "perigny-emigration-asiatique-mexique-1909",
      "perigny-ruines-rio-bec-1909",
      "perigny-villes-mortes-amerique-centrale-1909",
      "perigny-pays-ainos-1910",
      "perigny-port-amapala-honduras-1910",
      "perigny-ancienne-route-galions-1910",
      "perigny-costa-rica-pays-habitants-ressources-1910",
      "perigny-lettre-costa-rica-1910",
      "perigny-ruines-nakcun-1910",
      "perigny-ecole-cadets-honduras-1910",
      "perigny-honduras-ecole-militaire-1910",
      "perigny-principaute-japonaise-riou-kiou-1910",
      "perigny-mission-central-america-nakcun-1911",
      "perigny-costa-rica-nantes-1911",
      "perigny-ruines-nakcun-1911",
      "perigny-mexico-economic-development-1911",
      "perigny-mexique-developpement-revised-typescript-1911",
      "perigny-amerique-centrale-1911",
      "perigny-communications-central-america-1911",
      "perigny-villes-mortes-nakcun-1911",
      "perigny-quechis-kekchis-1912",
      "perigny-review-gates-perez-codex-1912",
      "perigny-costa-rica-pays-gens-choses-1912",
      "perigny-ruines-nakcun-mission-1912",
      "perigny-plein-cintre-architecture-maya-1912",
      "perigny-morelos-revolution-1912",
      "perigny-riou-kiou-coree-1912",
      "perigny-coree-impressions-voyage-1913",
      "perigny-costa-rica-guerre-1917",
      "perigny-amerique-centrale-guerre-1919",
      "perigny-lettre-guatemala-cafe",
    ],
  );
  const americanistes = shortPublicationAuthors.find(
    (author) => author.key === "societe-des-americanistes",
  );
  assert.equal(americanistes?.name, "パリ・アメリカニスト協会会報（無署名）");
  assert.deepEqual(
    americanistes?.publications.map((item) => item.slug),
    ["societe-americanistes-maler-tozzer-tikal-1912"],
  );
  const mexicoCommittee = shortPublicationAuthors.find(
    (author) => author.key === "reynaud-perigny-honnorat",
  );
  assert.equal(
    mexicoCommittee?.name,
    "ポール・レノー／モーリス・ド・ペリニー／アンドレ・オノラ",
  );
  assert.deepEqual(
    mexicoCommittee?.publications.map((item) => item.slug),
    ["reynaud-perigny-honnorat-interets-mexique-1914"],
  );
  const lemoine = shortPublicationAuthors.find(
    (author) => author.key === "frederic-lemoine",
  );
  assert.ok(lemoine);
  assert.equal(lemoine.name, "フレデリック・ルモワーヌ");
  assert.deepEqual(
    lemoine.publications.map((item) => item.slug),
    ["lemoine-travers-peten-yucatan-1906"],
  );
  assert.equal(
    publications.find((item) => item.slug === "cook-balise-merida-1769")
      .recordClass,
    "major-work",
  );
});

test("Dieseldorff Bands I and II are catalogued as papers", () => {
  const bandI = publications.find(
    (item) => item.slug === "dieseldorff-kunst-religion-band-i-1926",
  );
  const bandII = publications.find(
    (item) => item.slug === "dieseldorff-kunst-religion-band-ii-1931",
  );

  assert.ok(bandI);
  assert.ok(bandII);
  assert.equal(bandI.recordClass, "short-work");
  assert.equal(bandI.pageCount, 107);
  assert.ok(bandI.types.includes("考古学論文"));
  assert.equal(bandII.recordClass, "short-work");
  assert.ok(bandII.types.includes("考古学論文"));
  assert.match(bandI.rights, /CC BY-NC-SA 4\.0/);
  assert.match(bandII.rights, /CC BY-NC-SA 4\.0/);
  assert.match(bandI.sourceProvider, /Springer.*画像データは収録していない/);
  assert.match(bandII.sourceProvider, /Springer.*画像データは収録していない/);
});

test("San Buenaventura 1684 uses the approved first-edition scope and public-domain statement", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "san-buenaventura-arte-lengua-maya-1684",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 131);
  assert.equal(item.figureCount, 1);
  assert.equal(item.plateCount, 0);
  assert.match(item.sourceEdition, /1684年初版/);
  assert.match(item.sourceProvider, /Biblioteca Nazionale Centrale di Roma/);
  assert.match(item.sourceProvider, /1888年.*用いていない/);
  assert.match(item.rights, /Public Domain Mark 1\.0/);
  assert.match(item.rights, /商用利用/);
  assert.doesNotMatch(item.rights, /日本語翻訳版|再利用ライセンス/);
});

test("Tezozomoc Kraus 117 keeps the manuscript scope and concise rights statement", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "tezozomoc-cronica-mexicana-kraus-117",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 513);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 0);
  assert.match(item.sourceEdition, /mss31013-11700/);
  assert.match(item.sourceProvider, /f\.1r–160v の316面/);
  assert.match(item.sourceProvider, /判読と位置照合の補助/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /利用・複製に既知の制限なし/);
  assert.match(item.rights, /再利用ライセンスを設定していません/);
  assert.doesNotMatch(item.sourceProvider, /翻訳プロジェクト/);
  assert.doesNotMatch(item.rights, /CC BY|Creative Commons/);
});

test("Gemelli Careri 1700 keeps the approved source, figures, and reuse statements", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "gemelli-careri-giro-del-mondo-nuova-spagna-1700",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 342);
  assert.equal(item.figureCount, 17);
  assert.equal(item.plateCount, 0);
  assert.match(item.sourceEdition, /1700年初版/);
  assert.match(item.sourceProvider, /Getty Research Institute/);
  assert.match(item.sourceProvider, /セビーリャ大学図書館/);
  assert.match(item.rights, /CC BY 2\.0/);
  assert.match(item.rights, /Public Domain Mark 1\.0/);
  assert.match(item.rights, /CC0 1\.0/);
  assert.match(item.description, /装飾図は省略/);
});

test("Codex Perez keeps the approved PMM 9 scope, title, and rights boundary", () => {
  const item = publications.find(
    (publication) => publication.slug === "codex-perez-pmm9-1877",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.title, "コデックス・ペレス");
  assert.equal(item.subtitle, "マニのチラム・バラムの書とユカテコ・マヤ史料");
  assert.equal(item.pageCount, 231);
  assert.equal(item.figureCount, 19);
  assert.equal(item.plateCount, 0);
  assert.match(item.sourceEdition, /Princeton Mesoamerican Manuscripts no\. 9/);
  assert.match(item.sourceProvider, /IIIF全142画像/);
  assert.match(item.rights, /Copyright Not Evaluated/);
  assert.match(item.rights, /Copyright and Permissions Policies/);
  assert.match(item.description, /マニ本系/);
});

test("Historia Tolteca-Chichimeca keeps the approved manuscript and supplement scope", () => {
  const item = publications.find(
    (publication) => publication.slug === "historia-tolteca-chichimeca",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.title, "トルテカ・チチメカ史");
  assert.equal(item.originalTitle, "Historia Tolteca-Chichimeca");
  assert.equal(item.author, "編者不詳");
  assert.equal(item.pageCount, 190);
  assert.equal(item.figureCount, 100);
  assert.equal(item.plateCount, 0);
  assert.match(item.subtitle, /全四百四十二段落/);
  assert.match(item.subtitle, /付属別資料一点/);
  assert.match(item.description, /本文図版に数えず/);
  assert.match(item.description, /付属別資料/);
  assert.match(item.sourceEdition, /Mexicain 46–58/);
  assert.match(item.sourceProvider, /ガリカ公開.*本文と絵文書の底本/);
  assert.match(item.sourceProvider, /アモシュカリ公開.*付属別資料/);
  assert.match(item.sourceProvider, /補助資料は内部検証に限定/);
  assert.doesNotMatch(item.sourceProvider, /1976|復元葉順|原冊順|校訂版/);
  assert.match(
    item.rights,
    /Source gallica\.bnf\.fr \/ Bibliothèque nationale de France/,
  );
  assert.doesNotMatch(`${item.title}\n${item.subtitle}\n${item.author}`, /日本語全訳|匿名/);
});

test("corrected Sapper author form stays fixed for Alta Verapaz", () => {
  const item = publications.find(
    (publication) => publication.slug === "sapper-alta-verapaz-1901",
  );
  assert.ok(item);
  assert.equal(item.author, "カール・ザッパー");
  assert.match(item.description, /カール・ザッパー/);
  assert.doesNotMatch(`${item.author}\n${item.description}`, /カール・サッパー/);
});

test("revised Galindo Palenque record includes the Baezo appendix", () => {
  const item = publications.find(
    (publication) => publication.slug === "galindo-palenque-1832",
  );
  assert.ok(item);
  assert.equal(item.pageCount, 25);
  assert.match(item.subtitle, /198–217頁/);
  assert.match(item.description, /ペルフェクト・バエソ/);
  assert.deepEqual(item.languages, ["フランス語", "スペイン語", "マヤ語"]);
  assert.equal(item.updatedDate, "2026-08-01");
});

test("Ximenez Ayer MS 1515 volume 2 combines Popol Vuh and Escolios", () => {
  const item = publications.find(
    (publication) => publication.slug === "ximenez-ayer-ms-1515-volume-2",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 270);
  assert.equal(item.plateCount, 134);
  assert.match(item.subtitle, /第2巻/);
  assert.match(item.subtitle, /ポポル・ヴフ56葉/);
  assert.match(item.subtitle, /歴史起源注解6葉/);
  assert.match(item.description, /キチェ語の挨拶文5篇/);
  assert.match(item.description, /1734年のエチャーベ署名文/);
  assert.deepEqual(item.languages, ["スペイン語", "キチェ語", "ラテン語"]);
});

test("Ximenez Ayer MS 1515 volume 1 is catalogued as the complete combined volume", () => {
  const item = publications.find(
    (publication) => publication.slug === "ximenez-ayer-ms-1515-volume-1",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 619);
  assert.equal(item.plateCount, 240);
  assert.match(item.subtitle, /第1巻・全240葉面/);
  assert.match(item.description, /比較文法/);
  assert.match(item.description, /司牧手引/);
  assert.deepEqual(item.languages, [
    "スペイン語",
    "カクチケル語",
    "キチェ語",
    "ツトゥヒル語",
    "ラテン語",
  ]);
});


test("approved Berendt papers batch 02 remains individually catalogued", () => {
  const expected = new Map([
    ["berendt-baumwollenbau-yucatan-1863", 2],
    ["berendt-analytical-alphabet-1869", 8],
    ["berendt-escritos-garcia-icazbalceta-1870", 8],
    ["berendt-trabajos-linguisticos-juan-pio-perez-1871", 5],
    ["berendt-el-ramie-1871", 17],
  ]);
  const rights = [];
  for (const [slug, pageCount] of expected) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, "short-work", slug);
    assert.equal(item.authorKey, "carl-hermann-berendt", slug);
    assert.equal(item.pageCount, pageCount, slug);
    assert.equal(item.publishedDate, "2026-08-14", slug);
    assert.doesNotMatch(item.rights, /日本語翻訳版には再利用ライセンス|日本語版ライセンス/, slug);
    rights.push(item.rights, item.sourceProvider);
  }
  const combined = rights.join(" ");
  for (const phrase of [
    "New York Public Library",
    "NOT_IN_COPYRIGHT",
    "Library of Congress",
    "Free to Use and Reuse",
    "UNAM",
    "NoC-US 1.0",
    "Princeton University",
    "HathiTrust",
    "権利コードpd",
    "個別のCreative Commonsライセンス指定",
  ]) {
    assert.match(combined, new RegExp(phrase), phrase);
  }
});

test("approved Berendt papers batch 03 remains individually catalogued", () => {
  const expected = new Map([
    ["berendt-mexico-1872", 46],
    ["berendt-indianer-tehuantepec-1873", 10],
    ["berendt-carib-karif-language-1873", 3],
    ["berendt-darien-language-1874", 10],
    ["berendt-ethnologie-nicaragua-1874", 6],
  ]);
  const notices = [];
  for (const [slug, pageCount] of expected) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, "short-work", slug);
    assert.equal(item.authorKey, "carl-hermann-berendt", slug);
    assert.equal(item.pageCount, pageCount, slug);
    assert.equal(item.publishedDate, "2026-08-14", slug);
    assert.doesNotMatch(item.rights, /日本語翻訳版には再利用ライセンス|日本語版ライセンス/, slug);
    notices.push(item.rights, item.sourceProvider);
  }
  const combined = notices.join(" ");
  for (const phrase of [
    "University of Michigan",
    "Public Domain Mark 1.0",
    "Getty Research Institute",
    "NOT_IN_COPYRIGHT",
    "Smithsonian Institution",
    "IA1630708-07",
    "Oxford University",
    "個別のCreative Commonsライセンス",
  ]) {
    assert.match(combined, new RegExp(phrase), phrase);
  }
});

test("approved Berendt papers batch 04 remains individually catalogued", () => {
  const expected = new Map([
    ["berendt-ethnologie-nicaragua-1875", 4],
    ["berendt-ancient-central-american-civilization-1876", 12],
    ["berendt-historical-documents-guatemala-1877", 4],
  ]);
  const notices = [];
  for (const [slug, pageCount] of expected) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, "short-work", slug);
    assert.equal(item.authorKey, "carl-hermann-berendt", slug);
    assert.equal(item.pageCount, pageCount, slug);
    assert.equal(item.publishedDate, "2026-08-15", slug);
    assert.doesNotMatch(item.rights, /日本語翻訳版には再利用ライセンス|日本語版ライセンス/, slug);
    notices.push(item.rights, item.sourceProvider);
  }
  const combined = notices.join(" ");
  for (const phrase of [
    "Oxford University",
    "NOT_IN_COPYRIGHT",
    "JSTOR",
    "Early Journal Content",
    "Smithsonian Institution",
    "Internet Archive",
    "個別のCreative Commonsライセンス",
  ]) {
    assert.match(combined, new RegExp(phrase), phrase);
  }
});

test("Penn Berendt batch 05 uses Japanese titles and collection subtitles", () => {
  const expected = new Map([
    [
      "berendt-veracruz-correspondence-1861-1862",
      [
        "ベラクルス通信・論説集――三国干渉の初期、一八六一―一八六二年",
        "Berendt-Brinton Linguistic Collection, Ms. Coll. 700, Item 245",
        45,
        "carl-hermann-berendt",
      ],
    ],
    [
      "berendt-drei-tage-cuba-1860",
      [
        "キューバ島の三日間",
        "Berendt-Brinton Linguistic Collection, Ms. Coll. 700, Item 230",
        32,
        "carl-hermann-berendt",
      ],
    ],
    [
      "berendt-acasaguastlan-jilotepec-1878",
      [
        "アカサグアストランおよびヒロテペケへの遠征――アラギラク／チョルティ語調査・関連書簡・サン・アグスティン古文書（一八七八年）",
        "Berendt-Brinton Linguistic Collection, Ms. Coll. 700, Items 90, 244, 149",
        33,
        "berendt-bromowicz-cordon",
      ],
    ],
  ]);
  for (const [slug, [title, subtitle, pages, authorKey]] of expected) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, "short-work", slug);
    assert.equal(item.authorKey, authorKey, slug);
    assert.equal(item.title, title, slug);
    assert.equal(item.subtitle, subtitle, slug);
    assert.equal(item.pageCount, pages, slug);
    assert.match(item.sourceUrl, /^https:\/\/colenda\.library\.upenn\.edu\/catalog\//, slug);
    assert.doesNotMatch(item.subtitle, /日本語全訳/, slug);
    assert.match(item.rights, /No Copyright - United States/, slug);
    assert.match(item.rights, /再利用ライセンスを設定していません/, slug);
  }
});

test("Berendt batch 06 uses Japanese titles and collection subtitles", () => {
  const expected = new Map([
    [
      "berendt-indigenas-america-central-1877",
      [
        "中央アメリカ先住民とその諸言語",
        "William Gates papers, MSS 279, Series 10, Box 109, Folder 3",
        14,
        /contentdm\.lib\.byu\.edu/,
        /Public domain/,
      ],
    ],
    [
      "berendt-palabras-modismos-nicaragua-1874",
      [
        "ニカラグアで話されるカスティーリャ語の語彙と慣用表現",
        "Berendt-Brinton Linguistic Collection, Ms. Coll. 700, Item 178",
        112,
        /colenda\.library\.upenn\.edu/,
        /No Copyright – United States/,
      ],
    ],
    [
      "berendt-mangue-subtiaba-dossier-1874",
      [
        "チョロテガ／マングエ語とスブティアバ語――比較語彙・文法覚書・採集資料",
        "Berendt-Brinton Linguistic Collection, Ms. Coll. 700, Items 144, 242, 247",
        60,
        /colenda\.library\.upenn\.edu/,
        /No Copyright – United States/,
      ],
    ],
  ]);
  for (const [slug, [title, subtitle, pages, sourcePattern, rightsPattern]] of expected) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, "short-work", slug);
    assert.equal(item.authorKey, "carl-hermann-berendt", slug);
    assert.equal(item.title, title, slug);
    assert.equal(item.subtitle, subtitle, slug);
    assert.equal(item.pageCount, pages, slug);
    assert.match(item.sourceUrl, sourcePattern, slug);
    assert.match(item.rights, rightsPattern, slug);
    assert.match(item.rights, /パブリックドメイン/, slug);
    assert.doesNotMatch(item.rights, /本訳|再利用ライセンス/, slug);
  }
});

test("México en 1554 retains its bilingual 1875 edition scope", () => {
  const item = publications.find(
    (publication) => publication.slug === "cervantes-salazar-mexico-en-1554-1875",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.title, "1554年のメキシコ");
  assert.equal(item.originalTitle, "México en 1554");
  assert.equal(item.pageCount, 402);
  assert.deepEqual(item.languages, ["ラテン語", "スペイン語"]);
  assert.match(item.subtitle, /ラテン語原文/);
  assert.match(item.subtitle, /イカスバルセタ西訳の日本語訳/);
  assert.match(item.sourceProvider, /Brown University Library/);
  assert.match(item.sourceProvider, /Internet Archive/);
  assert.match(item.sourceProvider, /Real Academia Española/);
  assert.match(item.rights, /NOT_IN_COPYRIGHT/);
  assert.match(item.rights, /再利用ライセンスを設定していません/);
  assert.doesNotMatch(item.subtitle, /日本語全訳/);
});

test("approved Galindo short-paper batch remains individually catalogued", () => {
  const expectedPages = new Map([
    ["galindo-caribs-central-america-1833", 3],
    ["galindo-antiquities-peten-1834", 5],
    ["galindo-copan-literary-gazette-1835", 7],
    ["galindo-ruins-copan-aas-1836", 9],
  ]);
  for (const [slug, pageCount] of expectedPages) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, "short-work", slug);
    assert.equal(item.authorKey, "juan-galindo", slug);
    assert.equal(item.pageCount, pageCount, slug);
    assert.equal(item.publishedDate, "2026-08-01", slug);
  }
  const peten = publications.find(
    (publication) => publication.slug === "galindo-antiquities-peten-1834",
  );
  assert.match(peten.description, /ヤショー湖（原刊 Yashaw）/);
  assert.doesNotMatch(peten.description, /ヤシャ湖|Yaxh/u);
});

test("second approved Galindo batch remains individually catalogued", () => {
  const expected = new Map([
    ["galindo-ruins-palenque-literary-gazette-1831", [13, 2, 2]],
    ["galindo-noticias-peten-1831", [9, 1, 0]],
    ["galindo-copan-full-report-1834", [44, 0, 13]],
    ["galindo-eruption-cosiguina-1835", [8, 1, 0]],
    ["galindo-on-central-america-1836", [25, 1, 2]],
  ]);
  for (const [slug, [pageCount, figureCount, plateCount]] of expected) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, "short-work", slug);
    assert.equal(item.authorKey, "juan-galindo", slug);
    assert.equal(item.pageCount, pageCount, slug);
    assert.equal(item.figureCount, figureCount, slug);
    assert.equal(item.plateCount, plateCount, slug);
    assert.equal(item.publishedDate, "2026-08-01", slug);
  }
});

test("six non-Flint Acahualinca papers retain journal and rights metadata", () => {
  const expected = [
    ["putnam-antiquity-man-america-1884", "frederick-w-putnam", "Proceedings of the American Antiquarian Society"],
    ["mca-pre-adamite-track-1885", "a-mc-a", "The American Antiquarian and Oriental Journal"],
    ["unsigned-nicaragua-footprints-again-1886", "anonymous-american-antiquarian", "The American Antiquarian and Oriental Journal"],
    ["brinton-ancient-human-footprint-nicaragua-1887", "daniel-g-brinton", "Proceedings of the American Philosophical Society"],
    ["editorial-age-nicaragua-footprints-1889", "american-antiquarian-editorial", "The American Antiquarian and Oriental Journal"],
    ["crawford-neolithic-man-nicaragua-1891", "john-crawford", "The American Geologist"],
  ];
  for (const [slug, authorKey, journal] of expected) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, "short-work", slug);
    assert.equal(item.authorKey, authorKey, slug);
    assert.match(item.originalPublication, new RegExp(journal), slug);
    assert.match(item.sourceEdition, new RegExp(journal), slug);
    assert.match(item.sourceProvider, /(Internet Archive|Biodiversity Heritage Library|American Antiquarian Society)/, slug);
    assert.match(item.rights, /パブリックドメイン/, slug);
    assert.ok(item.sourceUrl.startsWith("https://"), slug);
  }
});

test("Earl Flint papers remain individually catalogued under one author", () => {
  const expected = [
    "flint-antiquities-nicaragua-palenque-builders-1882",
    "flint-human-foot-prints-nicaragua-1884",
    "flint-human-foot-prints-nicaragua-1885",
    "flint-pre-adamite-foot-prints-1886",
    "flint-human-footprints-eocene-1888",
    "flint-paleolithics-nicaragua-1888",
    "flint-nicaragua-foot-prints-1889",
    "flint-what-dr-flint-says-nicaragua-footprints-1890",
    "flint-prehistoric-horse-america-1891",
    "flint-rainfall-rivas-nicaragua-1898",
    "flint-rainfall-central-western-nicaragua-1899",
  ];
  const group = shortPublicationAuthors.find((author) => author.key === "earl-flint");
  assert.ok(group);
  assert.equal(group.name, "アール・フリント");
  assert.deepEqual(
    new Set(group.publications.map((item) => item.slug)),
    new Set(expected),
  );
  const combinedRights = [];
  for (const slug of expected) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, "short-work", slug);
    assert.equal(item.authorKey, "earl-flint", slug);
    assert.ok(item.sourceUrl, slug);
    assert.doesNotMatch(
      item.rights,
      /日本語翻訳版には再利用ライセンス|日本語版ライセンス/,
      slug,
    );
    combinedRights.push(item.rights, item.sourceProvider);
  }
  const rights = combinedRights.join(" ");
  for (const required of [
    "Internet Archive",
    "HathiTrust",
    "Bayerische Staatsbibliothek",
    "No Copyright - Non-Commercial Use Only 1.0",
    "JSTOR",
    "Project Gutenberg",
    "NWS",
    "American Meteorological Society",
  ]) {
    assert.match(rights, new RegExp(required), required);
  }
});

test("Morelet natural-history publications retain their approved scope and provider terms", () => {
  const expected = new Map([
    ["morelet-exploration-guatemala-1850", [5, "short-work"]],
    ["morelet-testacea-novissima-pars-i-1849", [23, "short-work"]],
    ["morelet-testacea-novissima-pars-ii-1851", [21, "short-work"]],
  ]);
  for (const [slug, [pageCount, recordClass]] of expected) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.pageCount, pageCount, slug);
    assert.equal(item.recordClass, recordClass, slug);
    assert.match(item.rights, /NOT_IN_COPYRIGHT/);
    assert.match(item.rights, /License: Not Applicable/);
    assert.match(item.rights, /Reuse: Yes/);
    assert.doesNotMatch(item.rights, /日本語翻訳版には再利用ライセンス/);
    assert.equal(item.publishedDate, "2026-08-10");
  }
  const parsII = publications.find(
    (publication) =>
      publication.slug === "morelet-testacea-novissima-pars-ii-1851",
  );
  assert.match(parsII.subtitle, /第86–150番/);
  assert.match(parsII.subtitle, /訂正表・総索引/);
  assert.match(parsII.extent, /全150種索引/);
});

test("Tezozomoc measurement review metadata stays fixed", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "tezozomoc-cronica-mexicana-kraus-117",
  );
  assert.ok(item);
  assert.equal(item.pageCount, 513);
  assert.match(item.extent, /PDF 513頁/);
  assert.match(item.description, /braça 32例を「ブラサ」に統一/);
  assert.match(item.description, /写本見出し111件.*すべてページ冒頭/);
  assert.equal(item.updatedDate, "2026-08-13");
  assert.doesNotMatch(item.extent, /PDF 509頁/);
});

test("Wafer 1699 publication metadata stays fixed", () => {
  const item = publications.find(
    (publication) => publication.slug === "wafer-new-voyage-isthmus-america-1699",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 134);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 4);
  assert.match(item.extent, /本文1–224頁/);
  assert.match(item.sourceEdition, /1699年初版/);
  assert.match(item.sourceProvider, /Early English Books 1641–1700/);
  assert.match(item.rights, /Public Domain Mark 1\.0/);
  assert.equal(item.publishedDate, "2026-08-13");
});

test("Pineda 1888 sublevaciones publication metadata stays fixed", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "pineda-sublevaciones-indigenas-chiapas-1888",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 107);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /原刊標題紙文字転記/);
  assert.match(item.extent, /原刊本文3–132頁/);
  assert.match(item.sourceEdition, /1888年初版/);
  assert.match(item.sourceEdition, /本文3–132頁/);
  assert.match(item.sourceProvider, /La Trobe University OPAL/);
  assert.match(item.sourceProvider, /1080013829/);
  assert.match(item.sourceProvider, /転載・切り抜きせず/);
  assert.match(item.rights, /CC BY-NC-ND 2\.5 MX/);
  assert.match(item.rights, /再利用ライセンスを設定していません/);
  assert.equal(item.publishedDate, "2026-08-14");
  assert.equal(item.updatedDate, "2026-08-14");
});

test("Chimalpahin volume 3 credits its compiler and names major sources", () => {
  const item = publications.find(
    (publication) => publication.slug === "codice-chimalpahin-volumen-3",
  );
  assert.ok(item);
  assert.equal(
    item.author,
    "ドミンゴ・デ・サン・アントン・ムニョン・チマルパイン（編）",
  );
  for (const source of [
    "メキシコ史／年代記",
    "メシカヨトル年代記",
    "ガブリエル・デ・アヤラ『メシカ年代記』",
    "暦を伴うメキシコ史／年代記",
    "メシカの来住の記録",
    "コルワカンの王侯・領主・住民の系譜と世代",
  ]) {
    assert.ok(item.majorSources.some((entry) => entry.includes(source)), source);
  }
  assert.doesNotMatch(item.author, /編者不詳/);
});

test("Pomar Relación de Tezcuco preserves its Benson manuscript scope", () => {
  const item = publications.find(
    (publication) => publication.slug === "pomar-relacion-tezcuco-1582",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.originalAuthor, "Juan Bautista de Pomar");
  assert.equal(
    item.originalTitle,
    "Relaçion q se enbio a su magestad (Relación de Tezcuco)",
  );
  assert.equal(item.pageCount, 87);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /Ms\. G57 f\. 1r–92r/);
  assert.match(item.extent, /Ms\. G58 f\. 92r–102v/);
  assert.match(item.sourceProvider, /utblac:e98983f6-9321-45cf-9976-40373dbd61a6/);
  assert.match(item.rights, /Public Domain Mark 1\.0/);
  assert.equal(item.publishedDate, "2026-08-20");
});

test("Chimalpahin Diario preserves its composite source and bilingual catalogue credit", async () => {
  const item = publications.find(
    (publication) => publication.slug === "chimalpahin-diario-1577-1615",
  );
  assert.ok(item);
  assert.equal(item.originalTitle, "Diario");
  assert.equal(item.title, "チマルパイン『日記』");
  assert.equal(
    item.originalAuthor,
    "Domingo Francisco de San Antón Muñón Chimalpahin Cuauhtlehuanitzin",
  );
  assert.match(item.author, /チマルパイン・クアウテレワニツィン/);
  assert.equal(item.pageCount, 266);
  assert.equal(item.figureCount, 0);
  assert.match(item.sourceEdition, /Mexicain 220, pp\.1–282/);
  assert.match(item.sourceEdition, /MS 256B, ff\.17r–18v/);
  assert.match(item.sourceProvider, /Tena.*校合補助/);
  assert.match(item.rights, /原稿画像は日本語版へ転載していません|画像.*転載していません/);

  const page = await readFile(
    path.join(dist, "publications", item.slug, "index.html"),
    "utf8",
  );
  const heroStart = page.indexOf('<section class="publication-hero">');
  const heroEnd = page.indexOf("</section>", heroStart);
  const hero = page.slice(heroStart, heroEnd);
  const originalTitleAt = hero.indexOf(escapeHtml(item.originalTitle));
  const japaneseTitleAt = hero.indexOf(`<h1>${escapeHtml(item.title)}</h1>`);
  const originalAuthorAt = hero.indexOf(
    `<span class="catalogue-author__original">${escapeHtml(item.originalAuthor)}</span>`,
  );
  const japaneseAuthorAt = hero.indexOf(
    `<span class="catalogue-author__japanese">${escapeHtml(item.author)}</span>`,
  );
  assert.match(hero, /<span>原題<\/span>/);
  assert.doesNotMatch(hero, /<span>日本語題<\/span>/);
  assert.ok(originalTitleAt >= 0 && japaneseTitleAt > originalTitleAt);
  assert.ok(originalAuthorAt >= 0 && japaneseAuthorAt > originalAuthorAt);
});

test("Boturini bibliography uses the Japanese translation cover", async () => {
  const item = publications.find(
    (publication) => publication.slug === "boturini-idea-catalogo-1746",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 264);
  assert.equal(item.originalAuthor, "Lorenzo Boturini Benaduci");
  assert.match(item.originalTitle, /^Idea de una nueva historia general/);
  assert.equal(
    item.cover,
    "publications/boturini-idea-catalogo-1746/japanese-cover.jpg",
  );
  assert.doesNotMatch(item.description, /書誌185件|原題・原著者名を先に/);
  assert.match(item.sourceProvider, /ideadeunanuevahi00botu_0/);

  const page = await readFile(
    path.join(dist, "publications", item.slug, "index.html"),
    "utf8",
  );
  const heroStart = page.indexOf('<section class="publication-hero">');
  const heroEnd = page.indexOf("</section>", heroStart);
  const hero = page.slice(heroStart, heroEnd);
  const originalTitleAt = hero.indexOf(escapeHtml(item.originalTitle));
  const japaneseTitleAt = hero.indexOf(`<h1>${escapeHtml(item.title)}</h1>`);
  const originalAuthorAt = hero.indexOf(
    `<span class="catalogue-author__original">${escapeHtml(item.originalAuthor)}</span>`,
  );
  const japaneseAuthorAt = hero.indexOf(
    `<span class="catalogue-author__japanese">${escapeHtml(item.author)}</span>`,
  );
  assert.match(hero, /<span>原題<\/span>/);
  assert.doesNotMatch(hero, /<span>日本語題<\/span>/);
  assert.ok(originalTitleAt >= 0 && japaneseTitleAt > originalTitleAt);
  assert.ok(originalAuthorAt >= 0 && japaneseAuthorAt > originalAuthorAt);
});

test("bilingual catalogue keeps original-script names supplementary and Japanese names primary", async () => {
  const css = await readFile(path.join(root, "src", "styles.css"), "utf8");
  const originalRule = css.match(/\.catalogue-author__original\s*\{([^}]*)\}/)?.[1] ?? "";
  const japaneseRule = css.match(/\.catalogue-author__japanese\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.match(originalRule, /color:\s*var\(--muted\)/);
  assert.match(originalRule, /font-size:\s*0\.92em/);
  assert.match(originalRule, /font-weight:\s*500/);
  assert.match(japaneseRule, /color:\s*inherit/);
  assert.match(japaneseRule, /font-size:\s*1em/);
  assert.match(japaneseRule, /font-weight:\s*750/);
});

test("Lundell bibliography uses the Japanese translation cover", () => {
  const item = publications.find(
    (publication) => publication.slug === "lundell-vegetation-peten-1937",
  );
  assert.ok(item);
  assert.equal(
    item.cover,
    "publications/lundell-vegetation-peten-1937/japanese-cover.jpg",
  );
});

test("Figueroa color notebooks identify Japanese annotations and rights", () => {
  const item = publications.find(
    (publication) => publication.slug === "figueroa-color-notebooks",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 1142);
  assert.equal(item.plateCount, 466);
  assert.match(item.subtitle, /日本語訳注/);
  assert.match(item.rights, /CC BY-SA 4\.0/);
  assert.equal(item.publishedDate, "2026-08-03");
});

test("Figueroa Album is catalogued under its approved title and lightweight edition", () => {
  const item = publications.find(
    (publication) => publication.slug === "figueroa-album",
  );
  assert.ok(item);
  assert.equal(item.title, "フィゲロア・アルバム");
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 1034);
  assert.equal(item.plateCount, 345);
  assert.match(item.extent, /公開用軽量PDF/);
  assert.match(item.subtitle, /日本語訳注/);
  assert.match(item.rights, /CC BY-SA 4\.0/);
  assert.equal(item.publishedDate, "2026-08-09");
});

test("home page contains scalable archive controls", async () => {
  const html = await readFile(path.join(dist, "index.html"), "utf8");
  for (const id of [
    "archive-search",
    "filter-type",
    "filter-region",
    "filter-language",
    "filter-era",
    "archive-sort",
    "archive-per-page",
    "archive-reset",
    "archive-pagination",
    "fulltext-form",
    "fulltext-query",
    "fulltext-dialog",
    "fulltext-dialog-close",
    "fulltext-result-list",
  ]) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(html, /window\.ARCHIVE_PUBLICATIONS=/);
  const embeddedStart = html.indexOf("window.ARCHIVE_PUBLICATIONS=") +
    "window.ARCHIVE_PUBLICATIONS=".length;
  const embeddedEnd = html.indexOf(";</script>", embeddedStart);
  const embeddedPublications = JSON.parse(
    html.slice(embeddedStart, embeddedEnd),
  );
  assert.equal(embeddedPublications.length, publications.length);
  assert.equal(
    embeddedPublications.filter((item) => item.recordClass === "major-work").length,
    majorPublications.length,
  );
  assert.equal(
    embeddedPublications.filter((item) => item.recordClass === "short-work").length,
    shortPublications.length,
  );
  assert.match(html, /\/archive\.css\?v=20260820-century-sort-v1/);
  assert.match(html, /\/archive\.js\?v=20260820-century-sort-v1/);
  assert.match(html, /\/fulltext-search\.css\?v=20260820-century-sort-v1/);
  assert.match(html, /\/fulltext-search\.js\?v=20260820-century-sort-v1/);
  assert.match(html, /documentMapPath:"\/search\/document-map\.json"/);
  assert.match(html, /書名・著者・地名・キーワード/);
  assert.match(html, /本文全文検索/);
  assert.match(html, /同じPDF頁の一致は1件にまとめ/);
  assert.match(html, /大冊は最初の一致頁を先に表示/);
  assert.doesNotMatch(html, /Googleサイト内検索|google-site-search|www\.google\.com\/search/);
  assert.match(html, />一覧内検索</);
  assert.match(html, /class="collection-tabs" role="tablist"/);
  assert.match(html, /id="collection-match-summary" aria-live="polite"/);
  assert.match(html, /id="book-match-count">128<\/strong>件/);
  assert.match(html, /id="paper-match-count">138<\/strong>件/);
  assert.match(html, /data-short-archive/);
  const catalogueSearchPosition = html.indexOf('id="archive-search"');
  const fulltextSearchPosition = html.indexOf('id="fulltext-form"');
  const matchSummaryPosition = html.indexOf('id="collection-match-summary"');
  const collectionTabsPosition = html.indexOf('class="collection-tabs"');
  const booksPanelPosition = html.indexOf('id="publications" role="tabpanel"');
  assert.ok(
    catalogueSearchPosition < matchSummaryPosition &&
      fulltextSearchPosition < matchSummaryPosition &&
      matchSummaryPosition < collectionTabsPosition &&
      collectionTabsPosition < booksPanelPosition,
    "all search controls and category match counts must precede the tabs",
  );
  assert.match(
    html,
    /id="tab-publications"[\s\S]*?aria-selected="true"[\s\S]*?collection-tab__label">書籍<\/span>/,
  );
  assert.match(
    html,
    /id="tab-short-works"[\s\S]*?aria-selected="false"[\s\S]*?collection-tab__label">論文<\/span>/,
  );
  assert.match(html, /id="publications" role="tabpanel"/);
  assert.match(html, /id="short-works" role="tabpanel"[\s\S]*? hidden>/);
  assert.doesNotMatch(html, /刊本・大部論文|短篇論文・報告/);
  assert.match(html, /<option value="12" selected>12件<\/option>/);
  assert.match(html, /<option value="all">すべて<\/option>/);
  assert.match(html, /元資料を読もう/);
  assert.match(html, /中部アメリカとその周辺に関する年代記/);
  assert.match(html, /公開版総ページ数/);
  assert.match(html, /海外の記録を、/);
  assert.match(html, /PDFとリフロー型EPUB/);
  assert.match(html, /href="\/about\/">翻訳・編集・レビュー・再利用方針を読む/);
  assert.doesNotMatch(html, /生成AIの余剰リソース/);
  assert.match(html, /底本位置標識（原刊頁・写本葉丁・画像番号など）と日本語版PDFの物理頁を併記/);
  assert.equal(
    (html.match(/class="record-card"/g) || []).length,
    majorPublications.length,
  );
  assert.equal(
    (html.match(/class="short-work-card"/g) || []).length,
    shortPublications.length,
  );
  assert.equal(
    (html.match(/class="short-author"/g) || []).length,
    shortPublicationAuthors.length,
  );
  assert.equal(
    (html.match(/<details class="short-author"/g) || []).length,
    shortPublicationAuthors.length,
  );
  assert.doesNotMatch(html, /<details class="short-author"[^>]*\sopen(?:\s|>)/);
  assert.match(html, /id="author-juan-galindo"/);
  assert.match(html, /フアン・ガリンド/);
  assert.match(html, />11篇</);
  assert.match(html, /id="author-arthur-morelet"/);
  assert.match(html, /ピエール＝マリー＝アルテュール・モルレ/);
  assert.match(html, />2篇</);
  const shortPanel = html.slice(
    html.indexOf('id="short-works" role="tabpanel"'),
    html.indexOf('<section class="about" id="about">'),
  );
  assert.doesNotMatch(shortPanel, /short-work-card__series/);
  assert.doesNotMatch(shortPanel, />PDF（|>EPUB（/);
  assert.match(shortPanel, />書誌・本文<\/a>/);
});

test("about page explains the editorial workflow and its limits", async () => {
  const html = await readFile(path.join(dist, "about", "index.html"), "utf8");
  assert.match(html, /翻訳・編集・/);
  assert.match(html, /底本と翻訳/);
  assert.match(html, /独立レビュー/);
  assert.match(html, /組版と公開前確認/);
  assert.match(html, /再利用とライセンス/);
  assert.match(html, /パブリックドメインの原著に基づく通常の翻訳/);
  assert.match(html, /BY、SA、NCなどの条件は省略せず/);
  assert.match(html, /利用上の注意/);
  assert.match(html, /原文から日本語へ翻訳します/);
  assert.match(html, /専門研究者による外部査読を意味しません/);
  assert.match(html, /全文を逐語的に人手校閲したことを意味しません/);
  assert.match(html, /最終PDFの確認と承認を受けるまでは/);
  assert.doesNotMatch(html, /現在翻訳中|WORK IN PROGRESS/);
  assert.match(html, /<link rel="canonical" href="https:\/\/takochanchan\.github\.io\/about\/">/);
  assert.match(html, /\/archive\.css\?v=20260820-century-sort-v1/);
});

test("catalogue search stays within publication metadata", async () => {
  const script = await readFile(path.join(dist, "archive.js"), "utf8");
  assert.doesNotMatch(script, /search-index\.json|__fullText|PDF本文/u);
  assert.match(script, /item\.__search\.includes\(query\)/);
  assert.match(script, /const matching = publications\.filter/);
  assert.match(script, /if \(fulltextQuery\) next\.set\("fulltext", fulltextQuery\)/);
  assert.match(script, /item\.recordClass === "major-work"/);
  assert.match(script, /item\.recordClass === "short-work"/);
  assert.match(script, /shortCatalogue\(filteredShort\)/);
  assert.match(script, /<details class="short-author"/);
  assert.match(script, /target\?\.matches\("details\.short-author"\)/);
  assert.doesNotMatch(script, /short-work-card__series/);
  assert.match(script, /controls\.bookMatch\.textContent = String\(filtered\.length\)/);
  assert.match(script, /controls\.paperMatch\.textContent = String\(filteredShort\.length\)/);
  assert.doesNotMatch(script, /google-site-search|www\.google\.com\/search|site:\$\{location\.hostname\}/);
  assert.match(script, /frame\.src = button\.dataset\.pdfSrc/);
  assert.match(script, /const defaultPageSize = "12"/);
  assert.match(script, /const paginationItems = \(pages\) =>/);
  assert.match(script, /localStorage\.setItem\(pageSizeStorageKey, state\.perPage\)/);
  assert.match(script, /`\$\{target\}\$\{location\.hash\}`/);
  assert.match(script, /\[data-collection-tab\]/);
  assert.match(script, /window\.addEventListener\("hashchange"/);
  assert.match(script, /history\.pushState\(null, "", nextUrl\)/);
  assert.match(script, /const target = document\.getElementById\(initialAnchor\)/);
  assert.match(script, /target\?\.scrollIntoView\(\)/);
  assert.doesNotMatch(script, /const perPage = 6/);
});

test("sitemaps expose canonical URLs, update dates, and cover images", async () => {
  const index = await readFile(path.join(dist, "sitemap.xml"), "utf8");
  const books = await readFile(path.join(dist, "sitemap-books.xml"), "utf8");
  const papers = await readFile(path.join(dist, "sitemap-papers.xml"), "utf8");
  assert.match(index, /<sitemapindex/);
  assert.match(index, /https:\/\/takochanchan\.github\.io\/sitemap-books\.xml/);
  assert.match(index, /https:\/\/takochanchan\.github\.io\/sitemap-papers\.xml/);
  assert.match(index, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  assert.doesNotMatch(index, /sitemap-authors|#author-/);
  assert.match(books, /https:\/\/takochanchan\.github\.io\/about\//);

  for (const [item, sitemap] of [
    ...majorPublications.map((item) => [item, books]),
    ...shortPublications.map((item) => [item, papers]),
  ]) {
    const loc = `https://takochanchan.github.io/publications/${item.slug}/`;
    const marker = `<loc>${loc}</loc>`;
    const entryAt = sitemap.indexOf(marker);
    assert.ok(entryAt >= 0, `${item.slug}: sitemap URL`);
    const entryEnd = sitemap.indexOf("</url>", entryAt);
    assert.ok(entryEnd > entryAt, `${item.slug}: sitemap entry`);
    const entry = sitemap.slice(entryAt, entryEnd);
    assert.match(
      entry,
      new RegExp(`<lastmod>${item.updatedDate}<\\/lastmod>`),
      `${item.slug}: lastmod`,
    );
    assert.match(
      entry,
      new RegExp(
        `<image:image><image:loc>https://takochanchan\\.github\\.io/${item.cover.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        )}<\\/image:loc><\\/image:image>`,
      ),
      `${item.slug}: cover image`,
    );
    assert.doesNotMatch(entry, /github\.com/);
    assert.doesNotMatch(entry, new RegExp(escapeHtml(item.pdfUrl)));
  }

  await assert.rejects(access(path.join(dist, "sitemap-authors.xml")));
});

test("publication pages expose Google-readable metadata and schema.org records", async () => {
  for (const item of [majorPublications[0], shortPublications[0]]) {
    const html = await readFile(
      path.join(dist, "publications", item.slug, "index.html"),
      "utf8",
    );
    assert.match(
      html,
      /<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">/,
    );
    assert.match(
      html,
      new RegExp(
        `<meta property="og:image" content="https://takochanchan\\.github\\.io/${item.cover.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        )}">`,
      ),
    );
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    assert.ok(match, `${item.slug}: JSON-LD`);
    const records = JSON.parse(match[1]);
    const canonical = `https://takochanchan.github.io/publications/${item.slug}/`;
    const work = records.find((record) => record["@id"] === `${canonical}#work`);
    assert.ok(work, `${item.slug}: work record`);
    assert.equal(work["@type"], item.recordClass === "short-work" ? "ScholarlyArticle" : "Book");
    assert.equal(work.name, item.title);
    assert.equal(work.alternateName, item.originalTitle);
    assert.equal(work.url, canonical);
    assert.equal(work.datePublished, item.publishedDate);
    assert.equal(work.dateModified, item.updatedDate);
    assert.equal(work.translationOfWork.name, item.originalTitle);
    assert.deepEqual(
      work.encoding.map((encoding) => encoding.encodingFormat),
      ["application/pdf", "application/epub+zip"],
    );
  }
});

test("every publication has a detail page, local cover, and release links", async () => {
  for (const item of publications) {
    const detail = path.join(dist, "publications", item.slug, "index.html");
    assert.ok(await exists(detail));
    const html = await readFile(detail, "utf8");
    assert.match(html, new RegExp(item.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(
      html,
      new RegExp(
        escapeHtml(item.originalTitle).replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        ),
      ),
    );
    assert.ok(html.includes(escapeHtml(item.pdfUrl)), `${item.slug}: PDF URL`);
    assert.ok(html.includes(escapeHtml(item.epubUrl)), `${item.slug}: EPUB URL`);
    assert.match(html, /底本・公開情報/);
    assert.match(html, /\/archive\.css\?v=20260820-century-sort-v1/);
    assert.match(html, /\/archive\.js\?v=20260820-century-sort-v1/);
    if (item.recordClass === "short-work") {
      assert.match(
        html,
        /href="\/\?v=20260820-century-sort-v1#short-works">← 論文へ戻る<\/a>/,
      );
    } else {
      assert.match(
        html,
        /href="\/\?v=20260820-century-sort-v1#publications">← 書籍へ戻る<\/a>/,
      );
    }
    for (const label of [
      "底本",
      "公開元",
      "権利・利用条件",
      "公開日",
      "更新日",
      "訂正窓口",
    ]) {
      assert.match(html, new RegExp(`>${label}<`), `${item.slug}: ${label}`);
    }
    assert.ok(html.includes(escapeHtml(item.sourceEdition)), item.slug);
    assert.ok(html.includes(escapeHtml(item.sourceProvider)), item.slug);
    assert.match(html, /PDFを読み込む（\d+(?:\.\d+)? (?:KB|MB)）/);
    assert.match(html, /PDFを保存（\d+(?:\.\d+)? (?:KB|MB)）/);
    assert.match(html, /EPUBを保存（\d+(?:\.\d+)? (?:KB|MB)）/);
    assert.doesNotMatch(html, /PDFを開く|別画面で開く/);
    const iframeTags = html.match(/<iframe\b[^>]*>/g) || [];
    assert.equal(iframeTags.length, 1, `${item.slug}: iframe count`);
    assert.doesNotMatch(iframeTags[0], /\ssrc=/, `${item.slug}: eager PDF`);
    assert.match(iframeTags[0], /\sdata-pdf-frame(?:\s|>)/);
    assert.ok(await exists(path.join(dist, item.cover)));
    await assert.rejects(access(path.join(dist, item.pdf)));
    await assert.rejects(access(path.join(dist, item.epub)));
    assert.match(
      html,
      /https:\/\/docs\.google\.com\/viewerng\/viewer\?embedded=true&amp;url=/,
    );
  }
});

test("auxiliary text no longer uses 7–10px font sizes", async () => {
  const css = await readFile(path.join(dist, "archive.css"), "utf8");
  assert.doesNotMatch(css, /font-size:\s*(?:7|8|9|10)px/);
});

test("detail PDF and EPUB controls stay in a two-column row", async () => {
  const css = await readFile(path.join(dist, "archive.css"), "utf8");
  assert.match(
    css,
    /\.publication-actions\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*1fr 1fr;[^}]*gap:\s*8px;[^}]*\}/s,
  );
  assert.doesNotMatch(
    css,
    /\.publication-actions \.button\s*\{[^}]*min-width:\s*170px;/s,
  );
});

test("local covers and release assets match the recorded manifest", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(root, "assets-manifest.json"), "utf8"),
  );
  assert.equal(manifest.assets.length, publications.length * 3);
  assert.deepEqual(
    new Set(manifest.assets.map((asset) => asset.path)),
    new Set(
      publications.flatMap((item) => [item.cover, item.pdf, item.epub]),
    ),
  );
  const publicationByPath = new Map(
    publications.flatMap((item) => [
      [item.pdf, item.pdfUrl],
      [item.epub, item.epubUrl],
    ]),
  );
  for (const asset of manifest.assets.filter((item) =>
    /cover\.(?:jpg|svg)$/.test(item.path)
  )) {
    const file = path.join(dist, asset.path);
    const info = await stat(file);
    const bytes = await readFile(file);
    assert.equal(info.size, asset.size, asset.path);
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      asset.sha256,
      asset.path,
    );
  }
  for (const asset of manifest.assets.filter((item) =>
    !/cover\.(?:jpg|svg)$/.test(item.path)
  )) {
    assert.equal(asset.url, publicationByPath.get(asset.path), asset.path);
    assert.match(
      asset.url,
      /^https:\/\/github\.com\/takochanchan\/takochanchan\.github\.io\/releases\/download\/publications-current\//,
    );
    await assert.rejects(access(path.join(dist, asset.path)));
  }
});

test("repository source contains covers but no PDF, EPUB, or split parts", async () => {
  const staticRoot = path.join(root, "static", "publications");
  const files = await readdir(staticRoot, { recursive: true });
  assert.equal(files.filter((file) => /cover\.(?:jpg|svg)$/.test(file)).length, publications.length);
  assert.equal(
    files.filter((file) => /\.(?:pdf|epub)(?:\.part-\d+)?$/i.test(file)).length,
    0,
  );
});

test("rendered public site does not expose the previous identifying host", async () => {
  const textFiles = [
    "index.html",
    "about/index.html",
    "404.html",
    "archive.css",
    "archive.js",
    "robots.txt",
    "sitemap.xml",
    "sitemap-books.xml",
    "sitemap-papers.xml",
    ...publications.map((item) => `publications/${item.slug}/index.html`),
  ];
  for (const relative of textFiles) {
    const content = await readFile(path.join(dist, relative), "utf8");
    assert.doesNotMatch(content, /masaki1979|chatgpt\.site/i, relative);
  }
});

test("current repository source does not reference the previous identifying host", async () => {
  for (const relative of [
    "assets-manifest.json",
    "README.md",
    "scripts/build.mjs",
    "scripts/fetch-assets.mjs",
    "scripts/make-manifest.mjs",
    "src/archive.js",
    "src/publications.mjs",
    "src/styles.css",
  ]) {
    const content = await readFile(path.join(root, relative), "utf8");
    assert.doesNotMatch(content, /masaki1979|chatgpt\.site/i, relative);
  }
});
