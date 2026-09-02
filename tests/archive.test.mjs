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
import {
  readSearchShardConfig,
  validateSearchShardAssignments,
} from "../scripts/search/shard-config.mjs";

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
  assert.equal(publications.length, 335);
  assert.equal(new Set(publications.map((item) => item.slug)).size, publications.length);
  for (const item of publications) {
    for (const key of [
      "title",
      "originalTitle",
      "author",
      "originalAuthor",
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
    assert.ok(item.sourceUrl || item.sourceAccessNote, `${item.slug}: source access`);
    assert.doesNotMatch(
      item.rights,
      /(?:日本語|本版|本訳).*(?:再利用|転載).*(?:設定してい(?:ません|ない)|付与し(?:ていません|ない)|許諾するものではありません)/u,
      `${item.slug}: obsolete Japanese-edition rights boilerplate`,
    );
  }
  assert.ok(taxonomy.types.length >= 8);
  assert.ok(taxonomy.regions.includes("ウスマシンタ川流域"));
  assert.ok(taxonomy.languages.includes("フランス語"));
});

test("full-text search assignments stay inside stable Pages shards", async () => {
  const config = await readSearchShardConfig(root);
  const counts = validateSearchShardAssignments(publications, config);
  assert.equal(config.defaultShard, "001");
  assert.equal(config.maxWorksPerShard, 300);
  assert.equal(config.maxBytesPerShard, 500 * 1024 * 1024);
  assert.equal(counts.get("001"), 277);
  assert.equal(counts.get("002"), 58);
  assert.equal(
    publications.filter((publication) => publication.searchShard === "001").length,
    277,
  );
  assert.deepEqual(
    publications
      .filter((publication) => publication.searchShard === "002")
      .map((publication) => publication.slug),
    [
      "bury-bishop-amongst-bananas-1911",
      "squier-visit-guajiquero-indians-1859",
      "squier-volcanoes-central-america-1859",
      "squier-hunting-pass-tropical-adventure-1860",
      "squier-lake-yojoa-taulebe-1860",
      "squier-unexplored-regions-central-america-1868",
      "larde-cronologia-arqueologica-el-salvador-1926",
      "larde-indice-provisional-arqueologico-el-salvador-1926",
      "lothrop-museum-central-american-expedition-1927",
      "lothrop-pottery-types-el-salvador-1927",
      "larde-arqueologia-cuzcatleca-1924",
      "larde-region-arqueologica-chalchuapa-1926",
      "larde-volcan-izalco-1923",
      "larde-poblacion-el-salvador-1921",
      "larde-geologia-general-centro-america-el-salvador-1924",
      "larde-terremoto-septiembre-1915-1916",
      "larde-origenes-san-salvador-cuzcatlan-1925",
      "larde-boqueron-grietas-volcanicas-el-pinar-1917",
      "larde-ruinas-cihuatan-1927",
      "larde-volcan-izalco-1922-1925",
      "squier-observations-zestermann-1851",
      "squier-crampton-webster-project-1852",
      "squier-ancient-peru-1853",
      "squier-great-south-american-earthquakes-1869",
      "squier-chalchihuitls-mexico-central-america-1870",
      "seitz-parkman-squier-letters-1911",
      "valle-george-ephraim-squier-1922",
      "carranza-un-pueblo-los-altos-1897",
      "baily-central-america-1850",
      "childs-nicaragua-canal-survey-1852",
      "us-navy-nicaragua-ship-canal-survey-1874",
      "selfridge-darien-ship-canal-1874",
      "bonaparte-nicaragua-canal-1846",
      "belly-percement-isthme-panama-canal-nicaragua-1858",
      "belly-a-travers-amerique-centrale-1867",
      "keasbey-nicaragua-canal-monroe-doctrine-1896",
      "conzemius-miskito-sumu-1932",
      "young-mosquito-shore-1847",
      "garella-panama-canal-1845",
      "reclus-panama-darien-1881",
      "rodrigues-panama-canal-1885",
      "wyse-canal-panama-isthme-americain-1886",
      "congres-international-canal-interoceanique-1879",
      "siguenza-obras-1928",
      "thompson-official-visit-guatemala-1829",
      "squier-waikna-mosquito-shore-1855",
      "arce-memoria-presidency-1830",
      "meza-centro-america-campana-nacional-1885-1911",
      "doubleday-filibuster-war-nicaragua-1886",
      "proceso-contra-william-walker-1860",
      "pim-seemann-dottings-roadside-1869",
      "peralta-costa-rica-costa-mosquitos-1898",
      "rabasa-estado-chiapas-1895",
      "montufar-walker-centro-america-1887",
      "barberena-historia-el-salvador-1914-1917",
      "stone-northern-highland-tribes-lenca-1948",
      "perez-memorias-nicaragua-guerra-nacional-1854-1857",
      "wells-walkers-expedition-nicaragua-1856",
    ],
  );
  assert.equal(
    config.shards[0].baseUrl,
    "https://takochanchan.github.io/takochan-search-index-001/",
  );
  assert.equal(config.shards[0].sealedWorks, 277);
  assert.equal(
    config.shards[1].baseUrl,
    "https://takochanchan.github.io/takochan-search-index-002/",
  );
  assert.throws(
    () =>
      validateSearchShardAssignments(
        [
          ...publications,
          {
            ...publications.find((publication) => publication.searchShard === "001"),
            slug: "future-work",
          },
        ],
        config,
      ),
    /Search shard 001 is sealed at 277 works; found 278/,
  );
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

test("Spanish American Republics keeps unsigned authorship and the true 337–344 scope", async () => {
  const item = publications.find(
    (publication) => publication.slug === "squier-spanish-american-republics-1850",
  );
  assert.ok(item);
  assert.equal(item.author, "無署名");
  assert.equal(item.originalAuthor, "Anonymous");
  assert.equal(item.attributedTo, "Ephraim George Squier");
  assert.equal(item.attributionStatus, "tentative");
  assert.match(item.attributionNote, /原刊は無署名/);
  assert.match(item.attributionNote, /後世の暫定帰属/);
  assert.equal(item.authorKey, "anonymous-american-whig-review");
  assert.match(item.originalPublication, /337–344頁/);
  assert.doesNotMatch(item.originalPublication, /337–352頁/);
  assert.match(item.sourceEdition, /pp\. 337–344/);
  assert.match(item.sourceEdition, /p\. 345から別稿 “Our Foreign Relations”/);

  const html = await readFile(
    path.join(dist, "publications", item.slug, "index.html"),
    "utf8",
  );
  assert.ok(html.includes(escapeHtml(item.attributionNote)));
  assert.match(html, /後世の暫定帰属：Ephraim George Squier/);
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  );
  assert.ok(match);
  const records = JSON.parse(match[1]);
  const work = records.find((record) => record["@id"]?.endsWith("#work"));
  assert.equal(work.author.name, "Anonymous");
  assert.equal(work.translationOfWork.author.name, "Anonymous");
  assert.equal(work.translationOfWork.creditText, item.attributionNote);
  assert.equal(
    work.translationOfWork.additionalProperty.value,
    "tentative",
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
  assert.match(item.rights, /パブリックドメイン/);
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
  assert.match(item.rights, /NOT_IN_COPYRIGHT/);
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

test("Sigüenza Parayso occidental retains its approved complete scope", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "siguenza-parayso-occidental-1684",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.author, "カルロス・デ・シグエンサ・イ・ゴンゴラ");
  assert.equal(item.originalAuthor, "Carlos de Sigüenza y Góngora");
  assert.equal(item.pageCount, 350);
  assert.equal(item.figureCount, 1);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /全3巻66章/);
  assert.match(item.extent, /fol\. 1r–206v/);
  assert.match(item.description, /王立ヘスス・マリア女子修道院/);
  assert.match(item.sourceProvider, /Google Books/);
  assert.match(item.sourceProvider, /m0s_AAAAcAAJ/);
  assert.match(item.sourceUrl, /books\.google\.com\/books\?id=m0s_AAAAcAAJ/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.equal(item.publishedDate, "2026-08-25");
  assert.equal(item.updatedDate, "2026-08-25");
});

test("Baz and Gallo Mexican Railroad history retains its approved complete scope and institutional rights display", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "baz-gallo-historia-ferrocarril-mexicano-1874",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.author, "グスタボ・バス／エドゥアルド・L・ガリョ");
  assert.equal(item.originalAuthor, "Gustavo Baz / Eduardo L. Gallo");
  assert.equal(item.pageCount, 462);
  assert.equal(item.figureCount, 38);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /表143点/);
  assert.match(item.extent, /注87件/);
  assert.match(item.description, /ベラクルス―メキシコ鉄道/);
  assert.match(item.sourceProvider, /University of Michigan Library/);
  assert.match(item.sourceProvider, /2lYzAQAAMAAJ/);
  assert.match(item.sourceProvider, /mdp\.39015046460427/);
  assert.match(item.sourceProvider, /x6CEcgMw1IAC/);
  assert.match(item.sourceUrl, /books\.google\.com\/books\?id=2lYzAQAAMAAJ/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /Public Domain〔pd〕／Full view/);
  assert.match(item.rights, /Public domain／Full view/);
  assert.match(item.rights, /別個のライセンス付与は確認していません/);
  assert.equal(item.publishedDate, "2026-08-26");
  assert.equal(item.updatedDate, "2026-08-26");
});

test("Prieto and Piatkowski Guatemala interoceanic railroad retains its approved scope and rights display", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "prieto-piatkowski-ferrocarril-interoceanico-guatemala-1880",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.author, "アレハンドロ・プリエト／R・ピアトコフスキ");
  assert.equal(item.originalAuthor, "Alejandro Prieto / R. Piatkowski");
  assert.equal(item.pageCount, 37);
  assert.equal(item.figureCount, 2);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /原刊本文5–60頁/);
  assert.match(item.extent, /表14点/);
  assert.match(item.description, /グアテマラを大西洋岸と太平洋岸で結ぶ/);
  assert.match(item.sourceProvider, /Universidad Francisco Marroquín/);
  assert.match(item.sourceProvider, /ideasgeneralesso00alejguat/);
  assert.match(item.sourceUrl, /archive\.org\/details\/ideasgeneralesso00alejguat/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /NOT IN COPYRIGHT/);
  assert.match(item.rights, /標題紙および裏表紙画像/);
  assert.doesNotMatch(item.rights, /日本語翻訳版|再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-26");
  assert.equal(item.updatedDate, "2026-08-28");
});

test("Otis Panama Railroad history retains its approved complete scope and institutional rights display", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "otis-isthmus-panama-railroad-1867",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.author, "F・N・オーティス");
  assert.equal(item.originalAuthor, "F. N. Otis");
  assert.equal(item.pageCount, 334);
  assert.equal(item.figureCount, 38);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /表207点/);
  assert.match(item.description, /パナマ鉄道の計画・建設・運営と財務/);
  assert.match(item.sourceProvider, /University of California Libraries/);
  assert.match(item.sourceProvider, /isthmusofpanamah00otisrich/);
  assert.match(item.sourceUrl, /archive\.org\/details\/isthmusofpanamah00otisrich/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /Possible copyright status: NOT_IN_COPYRIGHT/);
  assert.equal(item.publishedDate, "2026-08-25");
  assert.equal(item.updatedDate, "2026-08-25");
});

test("Bury Bishop amongst Bananas retains its approved complete scope and public-domain display", () => {
  const item = publications.find(
    (publication) => publication.slug === "bury-bishop-amongst-bananas-1911",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.author, "ハーバート・ベリー");
  assert.equal(item.originalAuthor, "Herbert Bury");
  assert.equal(item.pageCount, 186);
  assert.equal(item.figureCount, 4);
  assert.equal(item.plateCount, 15);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /原刊本文236頁/);
  assert.match(item.description, /バナナ農園と鉄道/);
  assert.match(item.sourceProvider, /University of California Libraries/);
  assert.match(item.sourceProvider, /bishopamongstban00buryrich/);
  assert.match(item.sourceProvider, /Wikimedia Commons/);
  assert.match(item.rights, /Public Domain（PD-US-expired）/);
  assert.doesNotMatch(item.rights, /日本語翻訳版|再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-27");
  assert.equal(item.updatedDate, "2026-08-27");
});

test("Seitz Parkman-to-Squier letters retain the approved booklet scope and public-domain display", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "seitz-parkman-squier-letters-1911",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.author, "ドン・C・サイツ");
  assert.equal(item.originalAuthor, "Don C. Seitz");
  assert.equal(item.pageCount, 48);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 0);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /書簡24通/);
  assert.match(item.extent, /著作目録95項目/);
  assert.match(item.description, /1849年から1870年/);
  assert.match(item.sourceProvider, /University of California Libraries/);
  assert.match(item.sourceProvider, /parkmantoegsqui00franrich/);
  assert.match(item.sourceProvider, /Wikimedia Commons/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.doesNotMatch(item.rights, /再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-27");
  assert.equal(item.updatedDate, "2026-08-27");
});

test("Valle George Ephraim Squier retains all 53 bibliography entries and public-source terms", () => {
  const item = publications.find(
    (publication) => publication.slug === "valle-george-ephraim-squier-1922",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "short-work");
  assert.equal(item.author, "ラファエル・エリオドロ・バリェ");
  assert.equal(item.originalAuthor, "Rafael Heliodoro Valle");
  assert.equal(
    item.originalTitle,
    "George Ephraim Squier (Notas bio-bibliográficas)",
  );
  assert.equal(item.pageCount, 13);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 0);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /原刊777–784頁/);
  assert.match(item.extent, /著作目録53項目/);
  assert.match(item.sourceProvider, /Open JSTOR Collection/);
  assert.match(item.sourceProvider, /jstor-2506078/);
  assert.match(item.sourceUrl, /jstor\.org\/stable\/2506078/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /JSTOR Early Journal Content/);
  assert.doesNotMatch(item.rights, /再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-27");
  assert.equal(item.updatedDate, "2026-08-27");
});

test("Carranza Totonicapan history retains the approved complete scope and public-domain display", () => {
  const item = publications.find(
    (publication) => publication.slug === "carranza-un-pueblo-los-altos-1897",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.author, "ヘスス・E・カランサ");
  assert.equal(item.originalAuthor, "Jesús E. Carranza");
  assert.equal(
    item.originalTitle,
    "Un pueblo de Los Altos: apuntamientos para su historia",
  );
  assert.equal(item.pageCount, 397);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 1);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /本文1–329頁/);
  assert.match(item.extent, /文書35点/);
  assert.match(item.extent, /主要正誤表/);
  assert.match(item.description, /トトニカパンの地方史/);
  assert.match(item.description, /ロス・アルトス州/);
  assert.match(item.sourceProvider, /Universidad Francisco Marroquín/);
  assert.match(item.sourceProvider, /totonicapanunpue00guat/);
  assert.match(item.sourceUrl, /archive\.org\/details\/totonicapanunpue00guat/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /NOT IN COPYRIGHT/);
  assert.doesNotMatch(item.rights, /再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-27");
  assert.equal(item.updatedDate, "2026-08-27");
});

test("Baily Central America retains the approved complete scope and source-marker edition", () => {
  const item = publications.find(
    (publication) => publication.slug === "baily-central-america-1850",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.title, "中央アメリカ");
  assert.equal(item.author, "ジョン・ベイリー");
  assert.equal(item.originalAuthor, "John Baily");
  assert.match(item.originalTitle, /^Central America; Describing Each of the States/);
  assert.equal(item.pageCount, 134);
  assert.equal(item.figureCount, 2);
  assert.equal(item.plateCount, 4);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /原刊前付xii頁/);
  assert.match(item.extent, /本文164頁/);
  assert.match(item.extent, /表9点/);
  assert.match(item.description, /中央アメリカ五国/);
  assert.match(item.description, /ニカラグア運河計画/);
  assert.match(item.sourceProvider, /Smithsonian Libraries/);
  assert.match(item.sourceProvider, /centralamericade00bail/);
  assert.match(item.sourceProvider, /g4800\.ma001000/);
  assert.match(item.sourceUrl, /library\.si\.edu\/digital-library\/book\/centralamericade00bail/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /CC0/);
  assert.doesNotMatch(item.title, /中米/);
  assert.doesNotMatch(item.description, /中米/);
  assert.equal(item.publishedDate, "2026-08-27");
  assert.equal(item.updatedDate, "2026-08-27");
});

test("Thompson Official Visit retains the approved complete scope and source roles", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "thompson-official-visit-guatemala-1829",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.title, "メキシコからグアテマラへの公式訪問記");
  assert.equal(item.author, "ジョージ・アレグザンダー・トンプソン");
  assert.equal(item.originalAuthor, "George Alexander Thompson");
  assert.equal(
    item.originalTitle,
    "Narrative of an Official Visit to Guatemala from Mexico",
  );
  assert.equal(item.pageCount, 267);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 1);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /原刊前付xii頁/);
  assert.match(item.extent, /序論vi頁/);
  assert.match(item.extent, /本文528頁/);
  assert.match(item.description, /1825年/);
  assert.match(item.description, /中央アメリカ連邦/);
  assert.match(item.sourceProvider, /Universidad Francisco Marroquín/);
  assert.match(item.sourceProvider, /序論iv–v/);
  assert.match(item.sourceProvider, /GE D-2366/);
  assert.doesNotMatch(item.sourceProvider, /校合用|咬合/);
  assert.match(item.sourceUrl, /archive\.org\/details\/narratiofof00thomguat/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /Public Domain Mark 1\.0/);
  assert.doesNotMatch(item.rights, /再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-27");
  assert.equal(item.updatedDate, "2026-08-27");
});

test("Childs Nicaragua canal survey retains the approved complete scope and source limits", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "childs-nicaragua-canal-survey-1852",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.title, "ニカラグア両洋間船舶運河");
  assert.equal(item.author, "オーヴィル・W・チャイルズ");
  assert.equal(item.originalAuthor, "Orville W. Childs");
  assert.match(item.originalTitle, /^Report of the Survey and Estimates/);
  assert.equal(item.pageCount, 151);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 0);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /原刊前付ii頁/);
  assert.match(item.extent, /本文3–153頁/);
  assert.match(item.extent, /表118点/);
  assert.match(item.extent, /原刊折込5葉/);
  assert.match(item.description, /1850–51年/);
  assert.match(item.description, /総工費/);
  assert.match(item.sourceProvider, /Harvard University/);
  assert.match(item.sourceProvider, /reportsurveyand00compgoog/);
  assert.match(item.sourceProvider, /他資料の図版による補完は行っていません/);
  assert.match(item.sourceUrl, /archive\.org\/details\/reportsurveyand00compgoog/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /NOT_IN_COPYRIGHT/);
  assert.doesNotMatch(item.sourceProvider, /1866|Rumsey|第IV図/);
  assert.doesNotMatch(item.rights, /再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-28");
  assert.equal(item.updatedDate, "2026-08-28");
});

test("U.S. Navy Nicaragua canal survey retains the approved complete scope and official-source rights", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "us-navy-nicaragua-ship-canal-survey-1874",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(
    item.title,
    "ニカラグアを通る大西洋・太平洋間船舶運河位置選定のための探検・測量報告書",
  );
  assert.equal(item.author, "アメリカ合衆国海軍省");
  assert.equal(item.originalAuthor, "United States Navy Department");
  assert.match(item.originalTitle, /^Reports of Explorations and Surveys/);
  assert.equal(item.pageCount, 309);
  assert.equal(item.figureCount, 5);
  assert.equal(item.plateCount, 20);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /本文7–143頁/);
  assert.match(item.extent, /折込図版20葉/);
  assert.match(item.extent, /表71点/);
  assert.match(item.description, /1872–73年/);
  assert.match(item.description, /メノカル/);
  assert.match(item.description, /歴史的覚書/);
  assert.match(item.sourceProvider, /U\.S\. Government Publishing Office/);
  assert.match(item.sourceProvider, /SERIALSET-01582_00_00-001-0057-0000/);
  assert.doesNotMatch(item.sourceProvider, /Smithsonian|Internet Archive|照合/);
  assert.match(item.sourceUrl, /govinfo\.gov\/app\/details\/SERIALSET-01582/);
  assert.match(item.rights, /17 U\.S\.C\. § 105/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.doesNotMatch(item.rights, /再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-28");
  assert.equal(item.updatedDate, "2026-08-28");
});

test("Selfridge Darien canal survey retains the approved complete scope and official-source rights", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "selfridge-darien-ship-canal-1874",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.title, "ダリエン地峡船舶運河");
  assert.equal(item.author, "トマス・オリヴァー・セルフリッジ");
  assert.equal(item.originalAuthor, "Thomas O. Selfridge");
  assert.match(item.originalTitle, /^Reports of Explorations and Surveys/);
  assert.equal(item.pageCount, 652);
  assert.equal(item.figureCount, 14);
  assert.equal(item.plateCount, 17);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /原刊本文1–268頁/);
  assert.match(item.extent, /本文図版14葉/);
  assert.match(item.extent, /巻末折込図版17葉/);
  assert.match(item.extent, /表70点/);
  assert.match(item.description, /1870–71年/);
  assert.match(item.description, /サン・ブラス/);
  assert.match(item.description, /トルアンド川/);
  assert.match(item.sourceProvider, /U\.S\. Government Publishing Office/);
  assert.match(item.sourceProvider, /SERIALSET-01575_00_00-001-0113-0000/);
  assert.doesNotMatch(item.sourceProvider, /Internet Archive|校合|照合/);
  assert.match(item.sourceUrl, /govinfo\.gov\/app\/details\/SERIALSET-01575/);
  assert.match(item.rights, /17 U\.S\.C\. § 105/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.doesNotMatch(item.rights, /再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-28");
  assert.equal(item.updatedDate, "2026-08-28");
});

test("Bonaparte Nicaragua canal plan retains the approved complete scope and source-scan rights", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "bonaparte-nicaragua-canal-1846",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(
    item.title,
    "ニカラグア運河――運河によって大西洋と太平洋を結ぶ計画",
  );
  assert.equal(item.author, "N・L・B（ルイ＝ナポレオン・ボナパルト）");
  assert.equal(
    item.originalAuthor,
    "N. L. B. (Louis-Napoléon Bonaparte)",
  );
  assert.match(item.originalTitle, /^Canal of Nicaragua:/);
  assert.equal(item.pageCount, 78);
  assert.equal(item.figureCount, 1);
  assert.equal(item.plateCount, 3);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /原刊前付i–viii頁/);
  assert.match(item.extent, /本文1–70頁/);
  assert.match(item.extent, /折込地図3点/);
  assert.match(item.extent, /表66点/);
  assert.match(item.description, /サン・フアン川/);
  assert.match(item.description, /ニカラグア湖/);
  assert.match(item.description, /会社組織/);
  assert.match(item.sourceProvider, /Cecil H\. Green Library/);
  assert.match(item.sourceProvider, /canalnicaraguao00napogoog/);
  assert.match(item.sourceProvider, /展開面は収録されていません/);
  assert.match(
    item.sourceUrl,
    /archive\.org\/details\/canalnicaraguao00napogoog/,
  );
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /NOT_IN_COPYRIGHT/);
  assert.doesNotMatch(item.rights, /再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-28");
  assert.equal(item.updatedDate, "2026-08-28");
});

test("Garella Panama canal plan retains the approved complete scope and source record", () => {
  const item = publications.find(
    (publication) => publication.slug === "garella-panama-canal-1845",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(
    item.title,
    "パナマ地峡を横断する太平洋・大西洋連絡運河計画",
  );
  assert.equal(item.author, "ナポレオン・ガレラ");
  assert.equal(item.originalAuthor, "Napoléon Garella");
  assert.match(item.originalTitle, /^Projet d’un canal de jonction/);
  assert.equal(item.pageCount, 166);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 2);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /原刊前付VIII頁/);
  assert.match(item.extent, /本文1–233頁/);
  assert.match(item.extent, /巻末折込図2葉/);
  assert.match(item.extent, /表89点/);
  assert.match(item.description, /1843–44年/);
  assert.match(item.description, /閘門式運河/);
  assert.match(item.description, /テワンテペク案・ニカラグア案/);
  assert.match(item.sourceProvider, /BnF/);
  assert.match(item.sourceProvider, /projetduncanald00garegoog/);
  assert.match(item.sourceProvider, /UF00100942\/00001/);
  assert.match(item.sourceUrl, /gallica\.bnf\.fr\/ark:\/12148\/bpt6k5328134w/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /NOT_IN_COPYRIGHT/);
  assert.doesNotMatch(item.rights, /再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-28");
  assert.equal(item.updatedDate, "2026-08-28");
});

test("Reclus Panama and Darien retains the approved complete scope and same-edition supplements", () => {
  const item = publications.find(
    (publication) => publication.slug === "reclus-panama-darien-1881",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.title, "パナマとダリエン");
  assert.equal(item.author, "アルマン・ルクリュ");
  assert.equal(item.originalAuthor, "Armand Reclus");
  assert.match(item.originalTitle, /^Panama et Darien/);
  assert.equal(item.pageCount, 300);
  assert.equal(item.figureCount, 60);
  assert.equal(item.plateCount, 3);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /原刊本文1–422頁/);
  assert.match(item.extent, /挿絵60点/);
  assert.match(item.extent, /固有地図図版3面/);
  assert.match(item.description, /1876–78年/);
  assert.match(item.description, /サン・ブラス/);
  assert.match(item.description, /ダリエン南部/);
  assert.match(item.sourceProvider, /panamaetdarienv00reclgoog/);
  assert.match(item.sourceProvider, /1qXUAAAAMAAJ/);
  assert.match(item.sourceProvider, /bpt6k775176/);
  assert.match(item.sourceProvider, /同一版/);
  assert.match(
    item.sourceUrl,
    /archive\.org\/details\/panamaetdarienv00reclgoog/,
  );
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /NOT_IN_COPYRIGHT/);
  assert.match(item.rights, /Gallica/);
  assert.doesNotMatch(item.rights, /再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-28");
  assert.equal(item.updatedDate, "2026-08-28");
});

test("Rodrigues Panama Canal retains the approved complete scope and rights record", () => {
  const item = publications.find(
    (publication) => publication.slug === "rodrigues-panama-canal-1885",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(
    item.title,
    "パナマ運河――その歴史、政治的側面および財政上の困難",
  );
  assert.equal(item.author, "ジョゼ・カルロス・ロドリゲス");
  assert.equal(item.originalAuthor, "José Carlos Rodrigues");
  assert.match(item.originalTitle, /^The Panama Canal:/);
  assert.equal(item.pageCount, 220);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 0);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /原刊序文iii–vi頁/);
  assert.match(item.extent, /目次vii–viii頁/);
  assert.match(item.extent, /本文1–248頁/);
  assert.match(item.extent, /表32点/);
  assert.match(item.description, /パナマ運河会社/);
  assert.match(item.description, /モンロー主義/);
  assert.match(item.description, /クレイトン＝ブルワー条約/);
  assert.match(item.sourceProvider, /University of California Libraries/);
  assert.match(item.sourceProvider, /panamacanalitshi00rodriala/);
  assert.match(
    item.sourceUrl,
    /archive\.org\/details\/panamacanalitshi00rodriala/,
  );
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /NOT_IN_COPYRIGHT/);
  assert.match(item.rights, /PD-US \/ PD-1923/);
  assert.match(item.rights, /Terms of Use/);
  assert.match(item.rights, /個別のCreative Commons等のライセンス表示はありません/);
  assert.doesNotMatch(item.rights, /再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-28");
  assert.equal(item.updatedDate, "2026-08-28");
});

test("Wyse Panama Canal retains the approved scope, source, and access conditions", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "wyse-canal-panama-isthme-americain-1886",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.title, "パナマ運河―アメリカ地峡");
  assert.equal(item.author, "リュシアン・N・B・ワイズ");
  assert.equal(item.originalAuthor, "Lucien N. B. Wyse");
  assert.equal(item.pageCount, 325);
  assert.equal(item.figureCount, 86);
  assert.equal(item.plateCount, 3);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /原刊本文1–399頁/);
  assert.match(item.extent, /木口木版86点/);
  assert.match(item.extent, /折込3点/);
  assert.match(item.description, /探検・測量結果/);
  assert.match(item.sourceProvider, /Bibliothèque municipale de Lyon/);
  assert.match(item.sourceProvider, /1G 538\/66/);
  assert.match(item.sourceProvider, /Z2b4DYQpPvoC/);
  assert.match(item.sourceUrl, /books\.google\.com\/books\?id=Z2b4DYQpPvoC/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /オープンライセンスではありません/);
  assert.match(item.rights, /cliché Bibliothèque municipale de Lyon/);
  assert.equal(item.publishedDate, "2026-08-29");
  assert.equal(item.updatedDate, "2026-08-29");
});

test("Waikna retains its approved complete scope, initialed attribution, and Library of Congress rights display", () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "squier-waikna-mosquito-shore-1855",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.author, "サミュエル・A・バード（E・G・スクワイアの筆名）");
  assert.equal(
    item.originalAuthor,
    "Samuel A. Bard [pseudonym of E. G. Squier]",
  );
  assert.equal(item.pageCount, 285);
  assert.equal(item.figureCount, 57);
  assert.equal(item.plateCount, 0);
  assert.equal(item.searchShard, "002");
  assert.match(item.extent, /付録3篇/);
  assert.match(item.extent, /図版等57点/);
  assert.match(item.description, /モスキート海岸の旅行・民族誌/);
  assert.match(item.sourceProvider, /Library of Congress/);
  assert.match(item.sourceProvider, /LCCN 03019150/);
  assert.match(item.sourceUrl, /loc\.gov\/item\/03019150/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /著作権その他の制限を認識していない/);
  assert.doesNotMatch(item.rights, /再利用許諾|再利用ライセンス/);
  assert.equal(item.publishedDate, "2026-08-27");
  assert.equal(item.updatedDate, "2026-08-27");
});

test("Squier Nicaragua retains its approved complete scope and supplementary-source rights display", () => {
  const item = publications.find(
    (publication) => publication.slug === "squier-nicaragua-1852",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.author, "E・G・スクワイア");
  assert.equal(item.originalAuthor, "E. G. Squier");
  assert.equal(item.pageCount, 782);
  assert.equal(item.figureCount, 94);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /全2巻合冊/);
  assert.match(item.extent, /表49点/);
  assert.match(item.description, /大洋間運河の候補路線/);
  assert.match(item.sourceProvider, /Getty Research Institute/);
  assert.match(item.sourceProvider, /Public Library of India/);
  assert.match(item.sourceProvider, /University of Toronto/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(
    item.rights,
    /項目固有のrights、licenseurl、usage等のライセンス表示がありません/,
  );
  assert.equal(item.publishedDate, "2026-08-26");
  assert.equal(item.updatedDate, "2026-08-26");
});

test("Squier and Davis Ancient Monuments retains its approved complete scope and institutional rights display", () => {
  const item = publications.find(
    (publication) =>
      publication.slug ===
      "squier-davis-ancient-monuments-mississippi-valley-1848",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.author, "E・G・スクワイア／E・H・デイヴィス");
  assert.equal(
    item.originalAuthor,
    "E. G. Squier / E. H. Davis",
  );
  assert.equal(item.pageCount, 468);
  assert.equal(item.figureCount, 207);
  assert.equal(item.plateCount, 48);
  assert.match(item.extent, /原刊本文306頁/);
  assert.match(item.extent, /表14点/);
  assert.match(item.description, /スミソニアン知識叢書第1巻/);
  assert.match(item.sourceProvider, /米国議会図書館/);
  assert.match(item.sourceProvider, /スミソニアン図書館・アーカイブ/);
  assert.match(item.sourceProvider, /Project Gutenberg ebook 49668/);
  assert.match(item.sourceUrl, /loc\.gov\/item\/16012309/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.match(item.rights, /自由に利用・再利用/);
  assert.equal(item.publishedDate, "2026-08-26");
  assert.equal(item.updatedDate, "2026-08-26");
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
  assert.equal(item.publishedDate, "2026-08-25");
  assert.equal(item.updatedDate, "2026-08-25");
});

test("Sigüenza Obras retains the approved license inheritance and blank-page policy", () => {
  const item = publications.find(
    (publication) => publication.slug === "siguenza-obras-1928",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 381);
  assert.equal(item.figureCount, 13);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /単独白紙葉は省略/);
  assert.match(item.sourceProvider, /990003958150204201/);
  assert.match(item.sourceUrl, /simurg\.csic\.es/);
  assert.match(item.rights, /継承条件/);
  assert.match(item.rights, /CC BY-NC-SA 4\.0/);
  assert.equal(item.publishedDate, "2026-08-29");
  assert.equal(item.updatedDate, "2026-08-29");
});

test("Sigüenza Obras bibliography uses the Japanese translation cover", async () => {
  const manifest = JSON.parse(
    await readFile(path.join(root, "assets-manifest.json"), "utf8"),
  );
  const cover = manifest.assets.find(
    (asset) => asset.path === "publications/siguenza-obras-1928/cover.jpg",
  );
  assert.ok(cover);
  assert.equal(
    cover.sha256,
    "a61ebddc412ce1d28df65d00a361af5b25fdf64e77b376d3d5e1ed687548ac2f",
  );
});

test("International interoceanic canal congress retains the approved source and rights record", () => {
  const item = publications.find(
    (publication) => publication.slug === "congres-international-canal-interoceanique-1879",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 920);
  assert.equal(item.plateCount, 4);
  assert.match(item.sourceProvider, /t0YxAQAAMAAJ/);
  assert.match(item.sourceProvider, /bpt6k1092509q/);
  assert.match(item.rights, /No Copyright - Other Known Legal Restrictions/);
  assert.match(item.rights, /NoC-OKLR 1\.0/);
  assert.match(item.rights, /Source gallica\.bnf\.fr \/ Bibliothèque nationale de France/);
  assert.doesNotMatch(item.rights, /商用利用.*(?:許諾|利用料)/);
});

test("Belly À travers l’Amérique centrale retains its approved two-volume publication record", async () => {
  const item = publications.find(
    (publication) => publication.slug === "belly-a-travers-amerique-centrale-1867",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 795);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 2);
  assert.match(item.extent, /全2巻合冊/);
  assert.match(item.extent, /表75点/);
  assert.match(item.description, /ニカラグア湖とサン・フアン川/);
  assert.match(item.sourceProvider, /VU8uAAAAYAAJ/);
  assert.match(item.sourceProvider, /caE9AAAAcAAJ/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.equal(item.searchShard, "002");
  assert.equal(item.publishedDate, "2026-08-29");
  assert.equal(item.updatedDate, "2026-08-29");

  const manifest = JSON.parse(
    await readFile(path.join(root, "assets-manifest.json"), "utf8"),
  );
  const assets = new Map(
    manifest.assets
      .filter((asset) => asset.path.includes(item.slug))
      .map((asset) => [path.extname(asset.path), asset]),
  );
  assert.equal(
    assets.get(".pdf").sha256,
    "4dece61d44847acd06ddefb9d1ee49ad5a025c6e5452110517deaea984b4b9a3",
  );
  assert.equal(
    assets.get(".epub").sha256,
    "31ff766a7675b23a737fdac45901af33a48a2c31bc1a6cf4f0335aa86a443ff4",
  );
  assert.equal(
    assets.get(".jpg").sha256,
    "8c6933b5b5c8eee5d36a118474be16a3af13a189388e03c3fe056bb8885ca863",
  );
});

test("Keasbey Nicaragua Canal retains its approved publication record", async () => {
  const item = publications.find(
    (publication) =>
      publication.slug === "keasbey-nicaragua-canal-monroe-doctrine-1896",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 507);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 4);
  assert.match(item.extent, /本文1–622頁/);
  assert.match(item.extent, /付録3点/);
  assert.match(item.description, /モンロー主義/);
  assert.match(item.sourceProvider, /cu31924022883544/);
  assert.match(item.sourceProvider, /2027\/mdp\.39015003743708/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.equal(item.searchShard, "002");
  assert.equal(item.publishedDate, "2026-08-29");
  assert.equal(item.updatedDate, "2026-08-29");

  const manifest = JSON.parse(
    await readFile(path.join(root, "assets-manifest.json"), "utf8"),
  );
  const assets = new Map(
    manifest.assets
      .filter((asset) => asset.path.includes(item.slug))
      .map((asset) => [path.extname(asset.path), asset]),
  );
  assert.equal(
    assets.get(".pdf").sha256,
    "157661e030723fcf61ecbcf49c7f59ed49e438e9c35c1a21c9b78cd165925f87",
  );
  assert.equal(
    assets.get(".epub").sha256,
    "17990aa57d844942611b5b41b1179886e0e7d38d518d812a6d24399aa7ea1497",
  );
  assert.equal(
    assets.get(".jpg").sha256,
    "932421497e66d6eb7d7046274dfd2e92b9d2f4e878d4bf1671ca14490a18bc23",
  );
});

test("Conzemius Miskito and Sumu survey retains the approved publication record", async () => {
  const item = publications.find(
    (publication) => publication.slug === "conzemius-miskito-sumu-1932",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 307);
  assert.equal(item.figureCount, 1);
  assert.equal(item.plateCount, 10);
  assert.match(item.sourceProvider, /bulletin1061932smit/);
  assert.match(item.rights, /No Copyright - United States/);
  assert.match(item.rights, /NoC-US 1\.0/);
  assert.match(item.rights, /オープンライセンスではなく/);
  assert.equal(item.searchShard, "002");
  assert.equal(item.publishedDate, "2026-08-30");
  assert.equal(item.updatedDate, "2026-08-30");

  const manifest = JSON.parse(
    await readFile(path.join(root, "assets-manifest.json"), "utf8"),
  );
  const assets = new Map(
    manifest.assets
      .filter((asset) => asset.path.includes(item.slug))
      .map((asset) => [path.extname(asset.path), asset]),
  );
  assert.equal(
    assets.get(".pdf").sha256,
    "f68433314d1c09f71119875be7b99620b2bb0fc5b72d6eed35362b1c705066f5",
  );
  assert.equal(
    assets.get(".epub").sha256,
    "95508d4004c2ed92634cfcf87b84930ce36eb355bffef4fbe066ce2eb58f1182",
  );
  assert.equal(
    assets.get(".jpg").sha256,
    "d10a2a0d4dd193fda06bd8dc6638fba46be365f172da91e3ba84ab8b79eff174",
  );
});

test("Arce presidential memoir retains the approved Fancourt-template publication record", async () => {
  const item = publications.find(
    (publication) => publication.slug === "arce-memoria-presidency-1830",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 311);
  assert.equal(item.figureCount, 0);
  assert.equal(item.plateCount, 0);
  assert.match(item.extent, /原刊前付11葉/);
  assert.match(item.extent, /本文1–140頁/);
  assert.match(item.extent, /文書編1–65頁/);
  assert.match(item.extent, /表7点/);
  assert.match(item.extent, /原注63件/);
  assert.match(item.sourceProvider, /GzrKpa1aOTIC/);
  assert.match(item.rights, /パブリックドメイン/);
  assert.equal(item.searchShard, "002");
  assert.equal(item.publishedDate, "2026-08-30");
  assert.equal(item.updatedDate, "2026-08-30");

  const manifest = JSON.parse(
    await readFile(path.join(root, "assets-manifest.json"), "utf8"),
  );
  const assets = new Map(
    manifest.assets
      .filter((asset) => asset.path.includes(item.slug))
      .map((asset) => [path.extname(asset.path), asset]),
  );
  assert.equal(
    assets.get(".pdf").sha256,
    "edb13a097d37f78d42406fe68d498cc1eb002bb24dcef1f26a3cc936df6875fe",
  );
  assert.equal(
    assets.get(".epub").sha256,
    "1c388ba64e43f0d854f6ff678b76db1b3560ec1958ba16c58dc04f4c2a84710d",
  );
  assert.equal(
    assets.get(".jpg").sha256,
    "6634bacd04b9de79a3982ec89063d7f2e0835a5da2f3089b74c18e8b5bbe91e8",
  );
});

test("Pim and Seemann Dottings retains the approved publication record", async () => {
  const item = publications.find(
    (publication) => publication.slug === "pim-seemann-dottings-roadside-1869",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "major-work");
  assert.equal(item.pageCount, 371);
  assert.equal(item.figureCount, 4);
  assert.equal(item.plateCount, 8);
  assert.match(item.extent, /原刊前付xviii頁/);
  assert.match(item.extent, /口絵1点/);
  assert.match(item.extent, /図版5点/);
  assert.match(item.extent, /地図2点/);
  assert.match(item.sourceProvider, /dottingsonroads00pimb/);
  assert.match(item.rights, /Public Domain/);
  assert.equal(item.searchShard, "002");
  assert.equal(item.publishedDate, "2026-08-30");
  assert.equal(item.updatedDate, "2026-08-30");

  const manifest = JSON.parse(
    await readFile(path.join(root, "assets-manifest.json"), "utf8"),
  );
  const assets = new Map(
    manifest.assets
      .filter((asset) => asset.path.includes(item.slug))
      .map((asset) => [path.extname(asset.path), asset]),
  );
  assert.equal(
    assets.get(".pdf").sha256,
    "f85a4a4abd3914013da922c064cad3fbbf5e34e74c27389b5be5940349bccd69",
  );
  assert.equal(
    assets.get(".epub").sha256,
    "24558650a7b426b082666047e19116692820cbe93b8df99536cf6ee5edc361e9",
  );
  assert.equal(
    assets.get(".jpg").sha256,
    "cd331aee204d05f659f40cf097f539370040682f43c51c83c75e231badfa93d7",
  );
});

test("Lothrop pottery chronology uses the approved paper classification", () => {
  const item = publications.find(
    (publication) => publication.slug === "lothrop-pottery-types-el-salvador-1927",
  );
  assert.ok(item);
  assert.equal(item.recordClass, "short-work");
  assert.ok(item.types.includes("論文"));
  assert.ok(!item.types.includes("モノグラフ"));
  assert.equal(item.pageCount, 29);
  assert.equal(item.authorKey, "samuel-kirkland-lothrop");
});

test("Lardé batch keeps three papers and two books in their approved classes", () => {
  const expected = new Map([
    ["larde-arqueologia-cuzcatleca-1924", "short-work"],
    ["larde-region-arqueologica-chalchuapa-1926", "short-work"],
    ["larde-volcan-izalco-1923", "major-work"],
    ["larde-poblacion-el-salvador-1921", "short-work"],
    ["larde-geologia-general-centro-america-el-salvador-1924", "major-work"],
  ]);
  for (const [slug, recordClass] of expected) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, recordClass, slug);
    assert.ok(item.subtitle, `${slug}: subtitle`);
    assert.match(item.rights, /公開|Public Domain Mark|パブリックドメイン/u);
  }
});

test("Lardé second batch keeps three papers and two books in their approved classes", () => {
  const expected = new Map([
    ["larde-terremoto-septiembre-1915-1916", "major-work"],
    ["larde-origenes-san-salvador-cuzcatlan-1925", "major-work"],
    ["larde-boqueron-grietas-volcanicas-el-pinar-1917", "short-work"],
    ["larde-ruinas-cihuatan-1927", "short-work"],
    ["larde-volcan-izalco-1922-1925", "short-work"],
  ]);
  for (const [slug, recordClass] of expected) {
    const item = publications.find((publication) => publication.slug === slug);
    assert.ok(item, slug);
    assert.equal(item.recordClass, recordClass, slug);
    assert.equal(item.searchShard, "002", slug);
    assert.ok(item.subtitle, `${slug}: subtitle`);
    assert.match(item.rights, /Public Domain Mark|パブリックドメイン/u);
  }
});

test("short works use explicit author groups instead of page-count rules", () => {
  assert.equal(majorPublications.length, 170);
  assert.equal(shortPublications.length, 165);
  assert.equal(shortPublicationAuthors.length, 40);
  assert.deepEqual(
    new Set(shortPublications.map((item) => item.slug)),
    new Set([
      "squier-great-calendar-stone-1849",
      "squier-british-encroachments-mosquito-question-1850",
      "squier-spanish-american-republics-1850",
      "squier-great-ship-canal-question-1850",
      "squier-judgment-by-default-1851",
      "squier-visit-guajiquero-indians-1859",
      "squier-volcanoes-central-america-1859",
      "squier-hunting-pass-tropical-adventure-1860",
      "squier-lake-yojoa-taulebe-1860",
      "squier-unexplored-regions-central-america-1868",
      "squier-observations-zestermann-1851",
      "squier-crampton-webster-project-1852",
      "squier-ancient-peru-1853",
      "squier-great-south-american-earthquakes-1869",
      "squier-chalchihuitls-mexico-central-america-1870",
      "larde-cronologia-arqueologica-el-salvador-1926",
      "larde-indice-provisional-arqueologico-el-salvador-1926",
      "lothrop-museum-central-american-expedition-1927",
      "lothrop-pottery-types-el-salvador-1927",
      "larde-arqueologia-cuzcatleca-1924",
      "larde-region-arqueologica-chalchuapa-1926",
      "larde-poblacion-el-salvador-1921",
      "larde-boqueron-grietas-volcanicas-el-pinar-1917",
      "larde-ruinas-cihuatan-1927",
      "larde-volcan-izalco-1922-1925",
      "valle-george-ephraim-squier-1922",
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
      "stone-northern-highland-tribes-lenca-1948",
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
  assert.match(html, /\/archive\.css\?v=20260830-arce-memoria/);
  assert.match(html, /\/archive\.js\?v=20260830-arce-memoria/);
  assert.match(html, /\/fulltext-search\.css\?v=20260830-arce-memoria/);
  assert.match(html, /\/fulltext-search\.js\?v=20260830-arce-memoria/);
  assert.match(html, /window\.FULLTEXT_SEARCH_CONFIG=\{/);
  assert.match(html, /takochan-search-index-001\/pagefind\/pagefind\.js/);
  assert.match(html, /takochan-search-index-001\/document-map\.json/);
  assert.doesNotMatch(html, /"\/search\/pagefind\//);
  assert.match(html, /書名・著者・地名・キーワード/);
  assert.match(html, /本文全文検索/);
  assert.match(html, /同じPDF頁の一致は1件にまとめ/);
  assert.match(html, /大冊は最初の一致頁を先に表示/);
  assert.doesNotMatch(html, /Googleサイト内検索|google-site-search|www\.google\.com\/search/);
  assert.match(html, />一覧内検索</);
  assert.match(html, /class="collection-tabs" role="tablist"/);
  assert.match(html, /id="collection-match-summary" aria-live="polite"/);
  assert.match(html, /id="book-match-count">170<\/strong>件/);
  assert.match(html, /id="paper-match-count">165<\/strong>件/);
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
  assert.match(html, /\/archive\.css\?v=20260830-arce-memoria/);
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
    assert.match(html, /\/archive\.css\?v=20260830-arce-memoria/);
    assert.match(html, /\/archive\.js\?v=20260830-arce-memoria/);
    if (item.recordClass === "short-work") {
      assert.match(
        html,
        /href="\/\?v=20260830-arce-memoria#short-works">← 論文へ戻る<\/a>/,
      );
    } else {
      assert.match(
        html,
        /href="\/\?v=20260830-arce-memoria#publications">← 書籍へ戻る<\/a>/,
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
    /cover\.(?:jpg|png|svg)$/.test(item.path)
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
    !/cover\.(?:jpg|png|svg)$/.test(item.path)
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
  assert.equal(
    files.filter((file) => /cover\.(?:jpg|png|svg)$/.test(file)).length,
    publications.length,
  );
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
