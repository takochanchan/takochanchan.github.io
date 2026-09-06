import {
  publicationReleaseUrl,
  publications as publicationUnits,
} from "./publications.mjs";

const unique = (values) => [...new Set(values)];

export const publicationGroupDefinitions = [
  {
    slug: "tribes-and-temples-1926-1927",
    memberSlugs: [
      "tribes-and-temples-vol-1",
      "tribes-and-temples-vol-2",
    ],
    volumeLabels: ["第I巻", "第II巻"],
    title: "部族と神殿",
    originalTitle:
      "Tribes and Temples: A Record of the Expedition to Middle America Conducted by Tulane University in 1925",
    subtitle: "全2巻・1926–1927年刊 日本語全訳",
    series: "TRIBES AND TEMPLES · 1926–1927",
    originalPublication:
      "ニューオーリンズ、Tulane University of Louisiana、1926–1927年",
    year: 1926,
    extent: "全2巻・日本語版PDF計993頁・挿図374点・地図5点・図版7点",
    description:
      "フランス・ブロムとオリヴァー・ラ・ファージが、チュレーン大学による1925年の中央アメリカ調査をまとめた全2巻の記録です。メキシコとグアテマラの遺跡、地理、民族、生活を扱い、各巻の日本語全訳を巻別PDF・EPUBで収録しています。",
    sourceEdition:
      "Frans Blom and Oliver La Farge, Tribes and Temples: A Record of the Expedition to Middle America Conducted by Tulane University in 1925, vols. I–II, Tulane University of Louisiana, 1926–1927.",
    sourceProvider:
      "Tulane University公開の公式PDFを主底本とし、Internet ArchiveおよびLibrary of Congress公開資料で原刊構成と欠落地図を補完・照合しました。",
    sourceUrl:
      "https://liberalarts.tulane.edu/mari/publications/downloadable-publications",
    rights:
      "1926・1927年刊の原著は米国でパブリックドメインです。Tulane Universityは公式PDFを無償公開していますが、公開ページにデジタル画像の個別ライセンス表示はありません。補完・照合に用いたInternet ArchiveおよびLibrary of Congressの資料は各項目の利用条件に従います。",
    publishedDate: "2026-07-24",
    updatedDate: "2026-09-06",
  },
  {
    slug: "herrera-historia-general-1601-1615",
    memberSlugs: [
      "herrera-historia-general-decadas-1-2-1601",
      "herrera-historia-general-decadas-3-4-1601",
      "herrera-historia-general-decadas-5-6-1615",
      "herrera-historia-general-decadas-7-8-1615",
    ],
    volumeLabels: [
      "第1・第2デカーダ",
      "第3・第4デカーダ",
      "第5・第6デカーダ",
      "第7・第8デカーダ",
    ],
    title: "大洋の島嶼および大陸におけるカスティーリャ人の事績総史",
    originalTitle:
      "Historia general de los hechos de los castellanos en las islas i tierra firme del mar océano",
    subtitle: "全8デカーダ・日本語版4分冊",
    series: "HISTORIA GENERAL · 1601–1615",
    originalPublication:
      "マドリード、王立印刷所／フアン・デ・ラ・クエスタ、1601・1615年",
    year: 1601,
    extent: "全8デカーダ・日本語版4分冊・PDF計4,910頁",
    description:
      "アントニオ・デ・エレーラが、カスティーリャ人による新大陸の探検、征服、統治と先住民諸社会との交渉を年代順に叙述した全8デカーダの通史です。1601年・1615年マドリード初版に基づく日本語全訳を、4分冊のPDF・EPUBで収録しています。",
    sourceEdition:
      "Antonio de Herrera y Tordesillas, Historia general de los hechos de los castellanos en las islas i tierra firme del mar océano, Décadas 1–8, Madrid, 1601–1615.",
    sourceProvider:
      "リヨン市立図書館およびマドリード・コンプルテンセ大学所蔵本をGoogle Booksがデジタル化し、ウィキメディア・コモンズが公開する1601年・1615年初版を底本としました。",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Antonio_de_Herrera_D%C3%A9cadas_1_y_2.pdf",
    rights:
      "原著および1601年・1615年原刊はパブリックドメインです。各巻の底本画像はウィキメディア・コモンズにおいてPublic Domain Mark 1.0（既知の著作権制限なし）として公開されています。",
    publishedDate: "2026-09-06",
    updatedDate: "2026-09-06",
  },
];

const releaseAsset = (filename) =>
  `${publicationReleaseUrl}/${encodeURIComponent(filename)}`;

const fileSplitVolume = (publicationSlug, {
  id,
  volumeLabel,
  title,
  originalTitle,
  subtitle,
  stem,
  pageCount,
  searchSegments,
}) => ({
  slug: `${publicationSlug}-${id}`,
  volumeLabel,
  title,
  originalTitle,
  subtitle,
  extent: `${subtitle}・PDF ${pageCount.toLocaleString("ja-JP")}頁`,
  pdf: `publications/${publicationSlug}/${stem}.pdf`,
  epub: `publications/${publicationSlug}/${stem}.epub`,
  pageCount,
  searchSlug: publicationSlug,
  ...(searchSegments.length === 1
    ? {
        searchPdfPageStart: searchSegments[0][0],
        searchPdfPageEnd: searchSegments[0][1],
        searchPdfPageOffset: searchSegments[0][2],
      }
    : {
        searchPdfPageSegments: searchSegments.map(([start, end, offset]) => ({
          start,
          end,
          offset,
        })),
      }),
});

export const publicationFileSplitDefinitions = [
  {
    slug: "bancroft-history-central-america-1886-1887",
    subtitle: "全3巻・1501–1887年 日本語全訳",
    extent:
      "全3巻・巻別PDF計2,589頁・全98章・原刊頁標識2,334件・原注4,325件・図版75点・第I巻引用典拠一覧・第III巻索引",
    description:
      "ヒューバート・ハウ・バンクロフトが、スペイン勢力の到来と初期征服から植民地統治、独立、中央アメリカ連邦の解体、各共和国の1887年までを三巻で叙述した通史です。原刊前付、全98章、原注4,325件、図表、第I巻引用典拠一覧、第III巻索引を備えた日本語全訳を、原著と同じ三巻のPDF・EPUBで収録しています。",
    pageCount: 2589,
    updatedDate: "2026-09-06",
    volumes: [
      {
        slug: "bancroft-history-central-america-1886-1887-volume-i",
        volumeLabel: "第I巻",
        title: "中央アメリカ史　第一巻",
        originalTitle: "History of Central America, Volume I",
        subtitle: "1501–1530年 日本語全訳",
        originalPublication:
          "サンフランシスコ、The History Company、1886年",
        extent: "前付・引用典拠一覧・全27章・原注・図表・PDF 924頁",
        sourceEdition:
          "Hubert Howe Bancroft, The Works of Hubert Howe Bancroft, vol. VI, History of Central America, vol. I (San Francisco: The History Company, 1886).",
        sourceProvider:
          "Universidad Francisco MarroquínのBiblioteca Ludwig von Mises所蔵本（Luis Luján Muñoz寄贈）をInternet Archiveが識別子 histofcenthoweguat として公開する画像を主底本としました。",
        sourceUrl: "https://archive.org/details/histofcenthoweguat",
        pdf:
          "publications/bancroft-history-central-america-1886-1887/Hubert_Howe_Bancroft_History_of_Central_America_Volume_I_1886_Japanese_Complete_Translation.pdf",
        epub:
          "publications/bancroft-history-central-america-1886-1887/Hubert_Howe_Bancroft_History_of_Central_America_Volume_I_1886_Japanese_Complete_Translation.epub",
        pageCount: 924,
        searchSlug: "bancroft-history-central-america-1886-1887",
        searchPdfPageStart: 3,
        searchPdfPageEnd: 924,
        searchPdfPageOffset: 0,
      },
      {
        slug: "bancroft-history-central-america-1886-1887-volume-ii",
        volumeLabel: "第II巻",
        title: "中央アメリカ史　第二巻",
        originalTitle: "History of Central America, Volume II",
        subtitle: "1530–1800年 日本語全訳",
        originalPublication:
          "サンフランシスコ、The History Company、1886年",
        extent: "前付・全37章・原注・図表・PDF 766頁",
        sourceEdition:
          "Hubert Howe Bancroft, The Works of Hubert Howe Bancroft, vol. VII, History of Central America, vol. II (San Francisco: The History Company, 1886).",
        sourceProvider:
          "Universidad Francisco MarroquínのBiblioteca Ludwig von Mises所蔵本（Luis Luján Muñoz寄贈）をInternet Archiveが識別子 histoofcen07howeguatguat として公開する画像を主底本としました。",
        sourceUrl: "https://archive.org/details/histoofcen07howeguatguat",
        pdf:
          "publications/bancroft-history-central-america-1886-1887/Hubert_Howe_Bancroft_History_of_Central_America_Volume_II_1886_Japanese_Complete_Translation.pdf",
        epub:
          "publications/bancroft-history-central-america-1886-1887/Hubert_Howe_Bancroft_History_of_Central_America_Volume_II_1886_Japanese_Complete_Translation.epub",
        pageCount: 766,
        searchSlug: "bancroft-history-central-america-1886-1887",
        searchPdfPageStart: 925,
        searchPdfPageEnd: 1688,
        searchPdfPageOffset: -922,
      },
      {
        slug: "bancroft-history-central-america-1886-1887-volume-iii",
        volumeLabel: "第III巻",
        title: "中央アメリカ史　第三巻",
        originalTitle: "History of Central America, Volume III",
        subtitle: "1801–1887年 日本語全訳",
        originalPublication:
          "サンフランシスコ、The History Company、1887年",
        extent: "前付・全34章・原注・図表・索引・PDF 899頁",
        sourceEdition:
          "Hubert Howe Bancroft, The Works of Hubert Howe Bancroft, vol. VIII, History of Central America, vol. III (San Francisco: The History Company, 1887).",
        sourceProvider:
          "Universidad Francisco MarroquínのBiblioteca Ludwig von Mises所蔵本（Luis Luján Muñoz寄贈）をInternet Archiveが識別子 historyofcenthoweguat として公開する画像を主底本としました。",
        sourceUrl: "https://archive.org/details/historyofcenthoweguat",
        pdf:
          "publications/bancroft-history-central-america-1886-1887/Hubert_Howe_Bancroft_History_of_Central_America_Volume_III_1887_Japanese_Complete_Translation.pdf",
        epub:
          "publications/bancroft-history-central-america-1886-1887/Hubert_Howe_Bancroft_History_of_Central_America_Volume_III_1887_Japanese_Complete_Translation.epub",
        pageCount: 899,
        searchSlug: "bancroft-history-central-america-1886-1887",
        searchPdfPageStart: 1689,
        searchPdfPageEnd: 2585,
        searchPdfPageOffset: -1686,
      },
    ],
  },
  {
    slug: "torquemada-monarquia-indiana-1615",
    subtitle: "1615年セビーリャ初版・全三巻二十一書 日本語全訳",
    extent: "全3巻・巻別PDF計3,706頁・全21書",
    pageCount: 3706,
    updatedDate: "2026-09-06",
    volumes: [
      ["i", "第I巻", "インディア王国誌　第一巻", "Monarquía indiana, Parte I", "第一部・第一書から第五書", "Juan_de_Torquemada_Monarquia_indiana_1615_Volume_I_Japanese_Complete_Translation", 1262, [[3, 1262, 0]]],
      ["ii", "第II巻", "インディア王国誌　第二巻", "Monarquía indiana, Parte II", "第二部・第六書から第十二書", "Juan_de_Torquemada_Monarquia_indiana_1615_Volume_II_Japanese_Complete_Translation", 1189, [[1263, 2448, -1260]]],
      ["iii", "第III巻", "インディア王国誌　第三巻", "Monarquía indiana, Parte III", "第三部・第十三書から第二十一書・索引", "Juan_de_Torquemada_Monarquia_indiana_1615_Volume_III_Japanese_Complete_Translation", 1255, [[2449, 3701, -2446]]],
    ].map(([id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments]) =>
      fileSplitVolume("torquemada-monarquia-indiana-1615", { id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments })),
  },
  {
    slug: "valle-anexion-centro-america-mexico-1924-1949",
    subtitle: "全6巻（1924–1949年刊）・1821–1828年文書集 日本語全訳",
    extent: "全6巻・巻別PDF計2,267頁・収録文書1,045件・巻別文書索引・全巻総合固有名索引49頁",
    pageCount: 2267,
    updatedDate: "2026-09-06",
    volumes: [
      ["i", "第I巻", "中央アメリカのメキシコ併合　第一巻", "La anexión de Centro América a México, tomo I", "1821年の文書と論説・1924年刊", "Rafael_Heliodoro_Valle_La_anexion_de_Centro_America_a_Mexico_Volume_I_1924_Japanese_Complete_Translation", 259, [[3, 259, 0]]],
      ["ii", "第II巻", "中央アメリカのメキシコ併合　第二巻", "La anexión de Centro América a México, tomo II", "1821–1822年の文書と論説・1927年刊", "Rafael_Heliodoro_Valle_La_anexion_de_Centro_America_a_Mexico_Volume_II_1927_Japanese_Complete_Translation", 467, [[260, 724, -257]]],
      ["iii", "第III巻", "中央アメリカのメキシコ併合　第三巻", "La anexión de Centro América a México, tomo III", "1821–1822年の文書と論説・1936年刊", "Rafael_Heliodoro_Valle_La_anexion_de_Centro_America_a_Mexico_Volume_III_1936_Japanese_Complete_Translation", 581, [[725, 1303, -722]]],
      ["iv", "第IV巻", "中央アメリカのメキシコ併合　第四巻", "La anexión de Centro América a México, tomo IV", "1823年1–6月の文書と論説・1945年刊", "Rafael_Heliodoro_Valle_La_anexion_de_Centro_America_a_Mexico_Volume_IV_1945_Japanese_Complete_Translation", 378, [[1304, 1679, -1301]]],
      ["v", "第V巻", "中央アメリカのメキシコ併合　第五巻", "La anexión de Centro América a México, tomo V", "1823年7–12月の文書と論説・1946年刊", "Rafael_Heliodoro_Valle_La_anexion_de_Centro_America_a_Mexico_Volume_V_1946_Japanese_Complete_Translation", 272, [[1680, 1949, -1677]]],
      ["vi", "第VI巻", "中央アメリカのメキシコ併合　第六巻", "La anexión de Centro América a México, tomo VI", "1823–1828年の文書と論説・1949年刊", "Rafael_Heliodoro_Valle_La_anexion_de_Centro_America_a_Mexico_Volume_VI_1949_Japanese_Complete_Translation", 310, [[1950, 2257, -1947]]],
    ].map(([id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments]) =>
      fileSplitVolume("valle-anexion-centro-america-mexico-1924-1949", { id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments })),
  },
  {
    slug: "southey-chronological-history-west-indies-1827",
    extent: "全3巻・巻別PDF計2,042頁・原刊本文計1,508頁・原注249件・表63点・原刊図像6点",
    pageCount: 2042,
    updatedDate: "2026-09-06",
    volumes: [
      ["i", "第I巻", "西インド諸島年代史　第一巻", "Chronological History of the West Indies, Volume I", "1492–1654年・原刊本文336頁", "Thomas_Southey_Chronological_History_West_Indies_Volume_I_1827_Japanese_Complete_Translation", 471, [[4, 472, -1]]],
      ["ii", "第II巻", "西インド諸島年代史　第二巻", "Chronological History of the West Indies, Volume II", "1655–1783年・原刊本文552頁", "Thomas_Southey_Chronological_History_West_Indies_Volume_II_1827_Japanese_Complete_Translation", 704, [[473, 1174, -470]]],
      ["iii", "第III巻", "西インド諸島年代史　第三巻", "Chronological History of the West Indies, Volume III", "1784–1816年・付録・原刊本文620頁", "Thomas_Southey_Chronological_History_West_Indies_Volume_III_1827_Japanese_Complete_Translation", 867, [[1175, 2039, -1172]]],
    ].map(([id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments]) =>
      fileSplitVolume("southey-chronological-history-west-indies-1827", { id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments })),
  },
  {
    slug: "milla-gomez-carrillo-historia-america-central-1879-1905",
    extent: "全5巻・巻別PDF計1,735頁・原刊標題紙5点",
    pageCount: 1735,
    updatedDate: "2026-09-06",
    volumes: [
      ["i", "第I巻", "中央アメリカ史　第一巻", "Historia de la América Central, tomo I", "1502–1541年・1879年刊", "Jose_Milla_y_Vidaurre_Agustin_Gomez_Carrillo_Historia_de_la_America_Central_Volume_I_1879_Japanese_Complete_Translation", 398, [[3, 398, 0]]],
      ["ii", "第II巻", "中央アメリカ史　第二巻", "Historia de la América Central, tomo II", "1542–1686年・1882年刊", "Jose_Milla_y_Vidaurre_Agustin_Gomez_Carrillo_Historia_de_la_America_Central_Volume_II_1882_Japanese_Complete_Translation", 371, [[399, 767, -396]]],
      ["iii", "第III巻", "中央アメリカ史　第三巻", "Historia de la América Central, tomo III", "1687–1737年・1895年刊", "Jose_Milla_y_Vidaurre_Agustin_Gomez_Carrillo_Historia_de_la_America_Central_Volume_III_1895_Japanese_Complete_Translation", 286, [[768, 1051, -765]]],
      ["iv", "第IV巻", "中央アメリカ史　第四巻", "Historia de la América Central, tomo IV", "1738–1759年・1897年刊", "Jose_Milla_y_Vidaurre_Agustin_Gomez_Carrillo_Historia_de_la_America_Central_Volume_IV_1897_Japanese_Complete_Translation", 315, [[1052, 1364, -1049]]],
      ["v", "第V巻", "中央アメリカ史　第五巻", "Historia de la América Central, tomo V", "1760–1786年・1905年刊", "Jose_Milla_y_Vidaurre_Agustin_Gomez_Carrillo_Historia_de_la_America_Central_Volume_V_1905_Japanese_Complete_Translation", 365, [[1365, 1727, -1362]]],
    ].map(([id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments]) =>
      fileSplitVolume("milla-gomez-carrillo-historia-america-central-1879-1905", { id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments })),
  },
  {
    slug: "baqueiro-ensayo-revoluciones-yucatan-1878-1887",
    extent: "改訂全3巻・巻別PDF計1,255頁・原注75件・肖像図版1点",
    pageCount: 1255,
    updatedDate: "2026-09-06",
    volumes: [
      ["i", "第I巻", "ユカタン革命史試論　第一巻", "Ensayo histórico sobre las revoluciones de Yucatán, tomo I", "1840–1848年・1878年刊", "Serapio_Baqueiro_Ensayo_historico_Yucatan_Volume_I_1878_Japanese_Complete_Translation", 504, [[3, 504, 0]]],
      ["ii", "第II巻", "ユカタン革命史試論　第二巻", "Ensayo histórico sobre las revoluciones de Yucatán, tomo II", "1848–1855年・1879年刊", "Serapio_Baqueiro_Ensayo_historico_Yucatan_Volume_II_1879_Japanese_Complete_Translation", 456, [[505, 958, -502]]],
      ["iii", "第III巻", "ユカタン革命史試論　第三巻", "Ensayo histórico sobre las revoluciones de Yucatán, tomo III", "1855–1864年・1887年刊", "Serapio_Baqueiro_Ensayo_historico_Yucatan_Volume_III_1887_Japanese_Complete_Translation", 295, [[959, 1251, -956]]],
    ].map(([id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments]) =>
      fileSplitVolume("baqueiro-ensayo-revoluciones-yucatan-1878-1887", { id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments })),
  },
  {
    slug: "dupaix-antiquites-mexicaines-1834",
    subtitle: "1834–1836年刊・本文全2巻およびアトラス 日本語全訳",
    extent: "本文全2巻・アトラス・巻別PDF計1,185頁・原刊アトラス174紙葉・口絵1点",
    pageCount: 1185,
    updatedDate: "2026-09-06",
    volumes: [
      ["text-i", "本文第I巻", "メキシコ古代遺物　本文第一巻", "Antiquités mexicaines, tome I", "デュペ大尉の三回の遠征記・諸文書", "Dupaix_Antiquites_Mexicaines_1834_Text_Volume_I_Japanese_Complete_Translation", 361, [[3, 66, 0], [101, 167, -34], [239, 285, -105], [332, 512, -151]]],
      ["text-ii", "本文第II巻", "メキシコ古代遺物　本文第二巻", "Antiquités mexicaines, tome II", "ルノワール・ウォーデンの比較研究", "Dupaix_Antiquites_Mexicaines_1834_Text_Volume_II_Japanese_Complete_Translation", 648, [[524, 1150, -521], [1163, 1181, -533]]],
      ["atlas", "アトラス", "メキシコ古代遺物　アトラス", "Antiquités mexicaines, atlas", "原刊アトラス174紙葉", "Dupaix_Antiquites_Mexicaines_1834_Atlas_Japanese_Complete_Translation", 176, [[67, 100, -64], [168, 238, -131], [286, 331, -178], [513, 523, -359], [1151, 1162, -986]]],
    ].map(([id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments]) =>
      fileSplitVolume("dupaix-antiquites-mexicaines-1834", { id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments })),
  },
  {
    slug: "garcia-pelaez-memorias-guatemala-1851-1852",
    extent: "初版全3巻・巻別PDF計1,147頁・表21点",
    pageCount: 1147,
    updatedDate: "2026-09-06",
    volumes: [
      ["i", "第I巻", "グアテマラ旧王国史のための覚書　第一巻", "Memorias para la historia del antiguo reyno de Guatemala, tomo I", "1851年刊・第一章から第四十三章", "Francisco_de_Paula_Garcia_Pelaez_Memorias_Volume_I_1851_Japanese_Complete_Translation", 368, [[3, 368, 0]]],
      ["ii", "第II巻", "グアテマラ旧王国史のための覚書　第二巻", "Memorias para la historia del antiguo reyno de Guatemala, tomo II", "1852年刊・第四十四章から第九十二章", "Francisco_de_Paula_Garcia_Pelaez_Memorias_Volume_II_1852_Japanese_Complete_Translation", 363, [[369, 729, -366]]],
      ["iii", "第III巻", "グアテマラ旧王国史のための覚書　第三巻", "Memorias para la historia del antiguo reyno de Guatemala, tomo III", "1852年刊・第九十三章以降・総索引・正誤表・購読者名簿", "Francisco_de_Paula_Garcia_Pelaez_Memorias_Volume_III_1852_Japanese_Complete_Translation", 416, [[730, 1143, -727]]],
    ].map(([id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments]) =>
      fileSplitVolume("garcia-pelaez-memorias-guatemala-1851-1852", { id, volumeLabel, title, originalTitle, subtitle, stem, pageCount, searchSegments })),
  },
];

const unitsBySlug = new Map(
  publicationUnits.map((publication) => [publication.slug, publication]),
);
const memberToGroup = new Map();
const fileSplitsBySlug = new Map();

for (const definition of publicationFileSplitDefinitions) {
  const base = unitsBySlug.get(definition.slug);
  if (!base) {
    throw new Error(`File-split publication is missing: ${definition.slug}`);
  }
  if (definition.volumes.length < 2) {
    throw new Error(`File-split publication needs at least two volumes: ${definition.slug}`);
  }
  const { volumes: volumeDefinitions, ...overrides } = definition;
  const volumeSlugs = new Set();
  const volumes = volumeDefinitions.map((volume) => {
    if (volumeSlugs.has(volume.slug)) {
      throw new Error(`Duplicate file-split volume slug: ${volume.slug}`);
    }
    volumeSlugs.add(volume.slug);
    return {
      ...base,
      ...volume,
      bibliographicSlug: base.slug,
      sourceAccessStatus: "online",
      sourceAccessNote: null,
      pdfUrl: releaseAsset(volume.pdf.slice(volume.pdf.lastIndexOf("/") + 1)),
      epubUrl: releaseAsset(volume.epub.slice(volume.epub.lastIndexOf("/") + 1)),
    };
  });
  if (volumes.reduce((sum, volume) => sum + volume.pageCount, 0) !== overrides.pageCount) {
    throw new Error(`File-split page count differs: ${definition.slug}`);
  }
  fileSplitsBySlug.set(definition.slug, {
    ...base,
    ...overrides,
    memberSlugs: [base.slug],
    volumes,
  });
}

const groupedPublications = publicationGroupDefinitions.map((definition) => {
  if (unitsBySlug.has(definition.slug)) {
    throw new Error(`Publication group slug collides with a unit: ${definition.slug}`);
  }
  if (definition.memberSlugs.length < 2) {
    throw new Error(`Publication group must contain at least two units: ${definition.slug}`);
  }
  if (definition.memberSlugs.length !== definition.volumeLabels.length) {
    throw new Error(`Publication group labels differ: ${definition.slug}`);
  }
  const members = definition.memberSlugs.map((slug, index) => {
    const member = unitsBySlug.get(slug);
    if (!member) throw new Error(`Publication group member is missing: ${slug}`);
    if (memberToGroup.has(slug)) {
      throw new Error(`Publication unit belongs to two groups: ${slug}`);
    }
    memberToGroup.set(slug, definition.slug);
    return {
      ...member,
      volumeLabel: definition.volumeLabels[index],
      bibliographicSlug: definition.slug,
    };
  });
  const first = members[0];
  for (const member of members.slice(1)) {
    for (const field of ["recordClass", "author", "originalAuthor"]) {
      if (member[field] !== first[field]) {
        throw new Error(`${definition.slug}: inconsistent ${field}`);
      }
    }
  }
  return {
    ...first,
    ...definition,
    recordClass: first.recordClass,
    author: first.author,
    originalAuthor: first.originalAuthor,
    cover: first.cover,
    visualLabel: first.visualLabel,
    sourceAccessStatus: "online",
    sourceAccessNote: null,
    pageCount: members.reduce((sum, member) => sum + member.pageCount, 0),
    figureCount: members.reduce((sum, member) => sum + member.figureCount, 0),
    plateCount: members.reduce((sum, member) => sum + member.plateCount, 0),
    types: unique(members.flatMap((member) => member.types)),
    regions: unique(members.flatMap((member) => member.regions)),
    languages: unique(members.flatMap((member) => member.languages)),
    tags: unique(members.flatMap((member) => member.tags)),
    memberSlugs: [...definition.memberSlugs],
    volumes: members,
  };
});

const groupsBySlug = new Map(
  groupedPublications.map((publication) => [publication.slug, publication]),
);

export const cataloguePublications = [];
const emittedGroups = new Set();
for (const publication of publicationUnits) {
  const groupSlug = memberToGroup.get(publication.slug);
  if (!groupSlug) {
    const fileSplit = fileSplitsBySlug.get(publication.slug);
    if (fileSplit) {
      cataloguePublications.push(fileSplit);
      continue;
    }
    cataloguePublications.push({
      ...publication,
      memberSlugs: [publication.slug],
      volumes: [{
        ...publication,
        volumeLabel: null,
        bibliographicSlug: publication.slug,
      }],
    });
    continue;
  }
  if (!emittedGroups.has(groupSlug)) {
    cataloguePublications.push(groupsBySlug.get(groupSlug));
    emittedGroups.add(groupSlug);
  }
}

if (emittedGroups.size !== publicationGroupDefinitions.length) {
  throw new Error("Not every publication group was added to the catalogue");
}

export const cataloguePublicationByMemberSlug = new Map();
for (const publication of cataloguePublications) {
  for (const memberSlug of publication.memberSlugs) {
    cataloguePublicationByMemberSlug.set(memberSlug, publication);
  }
}

if (cataloguePublicationByMemberSlug.size !== publicationUnits.length) {
  throw new Error("Catalogue publication grouping does not cover every unit");
}

export const bibliographicAliases = Object.fromEntries(
  [...cataloguePublicationByMemberSlug.entries()]
    .filter(([memberSlug, publication]) => memberSlug !== publication.slug)
    .map(([memberSlug, publication]) => [memberSlug, publication.slug]),
);

export const majorCataloguePublications = cataloguePublications.filter(
  (publication) => publication.recordClass === "major-work",
);

export const shortCataloguePublications = cataloguePublications.filter(
  (publication) => publication.recordClass === "short-work",
);
