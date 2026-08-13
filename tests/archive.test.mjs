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
  assert.equal(publications.length, 195);
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

test("short works use explicit author groups instead of page-count rules", () => {
  assert.equal(majorPublications.length, 101);
  assert.equal(shortPublications.length, 94);
  assert.equal(shortPublicationAuthors.length, 24);
  assert.deepEqual(
    new Set(shortPublications.map((item) => item.slug)),
    new Set([
      "esquinca-usumacinta",
      "sapper-eastern-lacandons-1891",
      "berendt-central-america-explorations-1867",
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
  assert.equal(item.pageCount, 470);
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
  assert.equal(item.pageCount, 470);
  assert.match(item.extent, /PDF 470頁/);
  assert.match(item.description, /braça 32例を「ブラサ」に統一/);
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
  assert.match(html, /\/archive\.css\?v=20260812-fulltext-search-v7/);
  assert.match(html, /\/archive\.js\?v=20260812-fulltext-search-v7/);
  assert.match(html, /\/fulltext-search\.css\?v=20260812-fulltext-search-v7/);
  assert.match(html, /\/fulltext-search\.js\?v=20260812-fulltext-search-v7/);
  assert.match(html, /documentMapPath:"\/search\/document-map\.json"/);
  assert.match(html, /書名・著者・地名・キーワード/);
  assert.match(html, /本文全文検索/);
  assert.match(html, /同じPDF頁の一致は1件にまとめ/);
  assert.match(html, /大冊は最初の一致頁を先に表示/);
  assert.doesNotMatch(html, /Googleサイト内検索|google-site-search|www\.google\.com\/search/);
  assert.match(html, />一覧内検索</);
  assert.match(html, /class="collection-tabs" role="tablist"/);
  assert.match(html, /id="collection-match-summary" aria-live="polite"/);
  assert.match(html, /id="book-match-count">101<\/strong>件/);
  assert.match(html, /id="paper-match-count">94<\/strong>件/);
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
  assert.match(html, /\/archive\.css\?v=20260812-fulltext-search-v7/);
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

test("sitemap index separates books, papers, and author anchors", async () => {
  const index = await readFile(path.join(dist, "sitemap.xml"), "utf8");
  const books = await readFile(path.join(dist, "sitemap-books.xml"), "utf8");
  const papers = await readFile(path.join(dist, "sitemap-papers.xml"), "utf8");
  const authors = await readFile(path.join(dist, "sitemap-authors.xml"), "utf8");
  assert.match(index, /<sitemapindex/);
  assert.match(index, /https:\/\/takochanchan\.github\.io\/sitemap-books\.xml/);
  assert.match(index, /https:\/\/takochanchan\.github\.io\/sitemap-papers\.xml/);
  assert.match(index, /https:\/\/takochanchan\.github\.io\/sitemap-authors\.xml/);
  assert.match(books, /https:\/\/takochanchan\.github\.io\/about\//);
  for (const item of majorPublications) {
    assert.match(
      books,
      new RegExp(
        `https://takochanchan\\.github\\.io/publications/${item.slug}/`,
      ),
    );
  }
  for (const item of shortPublications) {
    assert.match(
      papers,
      new RegExp(
        `https://takochanchan\\.github\\.io/publications/${item.slug}/`,
      ),
    );
  }
  for (const author of shortPublicationAuthors) {
    assert.match(authors, new RegExp(`#author-${author.key}`));
  }
  for (const sitemap of [books, papers, authors]) {
    for (const item of publications) {
      assert.doesNotMatch(sitemap, new RegExp(escapeHtml(item.pdfUrl)));
    }
    assert.doesNotMatch(sitemap, /github\.com/);
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
    assert.match(html, /\/archive\.css\?v=20260812-fulltext-search-v7/);
    assert.match(html, /\/archive\.js\?v=20260812-fulltext-search-v7/);
    if (item.recordClass === "short-work") {
      assert.match(
        html,
        /href="\/\?v=20260812-fulltext-search-v7#short-works">← 論文へ戻る<\/a>/,
      );
    } else {
      assert.match(
        html,
        /href="\/\?v=20260812-fulltext-search-v7#publications">← 書籍へ戻る<\/a>/,
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
    "sitemap-authors.xml",
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
