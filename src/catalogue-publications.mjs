import { publications as publicationUnits } from "./publications.mjs";

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

const unitsBySlug = new Map(
  publicationUnits.map((publication) => [publication.slug, publication]),
);
const memberToGroup = new Map();

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
