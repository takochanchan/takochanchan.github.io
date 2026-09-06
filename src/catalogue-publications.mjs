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
