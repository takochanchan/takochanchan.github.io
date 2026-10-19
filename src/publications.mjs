Warning: truncated output (original token count: 187595)
Total output lines: 12298

import { cambrePublicationRecords, cambrePublicationMetadata } from "./cambre-publication.mjs";
import { montufarPrisionPublicationRecords, montufarPrisionPublicationMetadata } from "./montufar-prision-publication.mjs";
import { cermoisePublicationRecords, cermoisePublicationMetadata } from "./cermoise-publication.mjs";
import { arevaloPublicationRecords, arevaloPublicationMetadata } from "./arevalo-publication.mjs";
import { isagogePublicationRecords, isagogePublicationMetadata } from "./isagoge-publication.mjs";
import { perignyCinqPublicationRecords, perignyCinqPublicationMetadata } from "./perigny-cinq-publication.mjs";
import { mencosPublicationRecords, mencosPublicationMetadata } from "./mencos-publication.mjs";
import { diezPublicationRecords, diezPublicationMetadata } from "./diez-publication.mjs";
import { medinaPublicationRecords, medinaPublicationMetadata } from "./medina-publication.mjs";
import { normalizePublicationAttributes } from "./attribute-spelling.mjs";
import { cuevasPublicationRecords, cuevasPublicationMetadata } from "./cuevas-publications.mjs";
import { garciaDocumentosPublicationRecords, garciaDocumentosPublicationMetadata } from "./garcia-documentos-publication.mjs";
import { castroPublicationRecords, castroPublicationMetadata } from "./castro-publications.mjs";
import { guijoPublicationRecords, guijoPublicationMetadata } from "./guijo-publication.mjs";
import { roblesDiarioPublicationRecords, roblesDiarioPublicationMetadata } from "./robles-diario-publication.mjs";
import { palmaPublicationRecords, palmaPublicationMetadata } from "./palma-publications.mjs";
import { millaCuadrosPublicationRecords, millaCuadrosPublicationMetadata } from "./milla-cuadros-publication.mjs";
import { paraveyFouSangPublicationRecords, paraveyFouSangPublicationMetadata, paraveyFouSangShortWorkAuthors } from "./paravey-fou-sang-publications.mjs";
import { deGuignesPublicationRecords, deGuignesPublicationMetadata } from "./de-guignes-publication.mjs";
import { batresPublicationRecords, batresPublicationMetadata } from "./batres-publication.mjs";
import { salazarPublicationRecords, salazarPublicationMetadata } from "./salazar-publication.mjs";
import { academiaGuatemaltecaPublicationRecords, academiaGuatemaltecaPublicationMetadata } from "./academia-guatemalteca-publication.mjs";
import { cehmBetlemitasPublicationRecords, cehmBetlemitasPublicationMetadata } from "./cehm-betlemitas-publication.mjs";
import { mexicoViejoPublicationRecords, mexicoViejoPublicationMetadata } from "./mexico-viejo-publication.mjs";
import { espinosaPublicationRecords, espinosaPublicationMetadata } from "./espinosa-publication.mjs";
import { siriaPublicationRecords, siriaPublicationMetadata } from "./siria-publication.mjs";
import { proceresPublicationRecords, proceresPublicationMetadata, proceresShortWorkAuthors } from "./proceres-publications.mjs";
import { oviedoPublicationRecords, oviedoPublicationMetadata } from "./oviedo-publications.mjs";
import { fellechnerPublicationRecords, fellechnerPublicationMetadata } from "./fellechner-publication.mjs";
import { bethlehemiticaPublicationRecords, bethlehemiticaPublicationMetadata } from "./bethlehemitica-publication.mjs";
import { vlePanamaPublicationRecords, vlePanamaPublicationMetadata } from "./vle-panama-publications.mjs";
import { vazquezPublicationRecords, vazquezPublicationMetadata } from "./vazquez-publication.mjs";
import { montalvoPublicationRecords, montalvoPublicationMetadata } from "./montalvo-publication.mjs";
import { frusPublicationRecords, frusPublicationMetadata } from "./frus-publication.mjs";
import { haefkensPublicationRecords, haefkensPublicationMetadata } from "./haefkens-publications.mjs";
import { loboPublicationRecords, loboPublicationMetadata } from "./lobo-publication.mjs";
import { howEadsPublicationRecords, howEadsPublicationMetadata } from "./how-eads-publication.mjs";
import { serranoPublicationRecords, serranoPublicationMetadata } from "./serrano-publication.mjs";
import { mendietaPublicationRecords, mendietaPublicationMetadata } from "./mendieta-publication.mjs";
import { robertsonPublicationRecords, robertsonPublicationMetadata } from "./robertson-publication.mjs";
import { galvaoPublicationRecords, galvaoPublicationMetadata } from "./galvao-publication.mjs";
import { sahagunPublicationRecords, sahagunPublicationMetadata } from "./sahagun-publication.mjs";
import { mosquitoTerritoryPublicationRecords, mosquitoTerritoryPublicationMetadata } from "./mosquito-territory-publication.mjs";
import { rodriguezRelacionPublicationRecords, rodriguezRelacionPublicationMetadata } from "./rodriguez-relacion-publication.mjs";
import { benzoniPublicationRecords, benzoniPublicationMetadata } from "./benzoni-publication.mjs";
import { gueguencePublicationRecords, gueguencePublicationMetadata } from "./gueguence-publication.mjs";
import { palacioPublicationRecords, palacioPublicationMetadata } from "./palacio-publication.mjs";
import { bancroftNativeRacesPublicationMetadata, bancroftNativeRacesPublicationRecords } from "./bancroft-native-races-publication.mjs";
import { herreraPublicationRecords, herreraPublicationMetadata } from "./herrera-publication.mjs";
import { createRequire } from "node:module";
import {
  nuixPublicationMetadata,
  nuixPublicationRecords,
} from "./nuix-publication.mjs";
import {
  bailyPublicationMetadata,
  bailyPublicationRecords,
} from "./baily-publication.mjs";
import {
  childsPublicationMetadata,
  childsPublicationRecords,
} from "./childs-publication.mjs";
import {
  usNavyNicaraguaCanalPublicationMetadata,
  usNavyNicaraguaCanalPublicationRecords,
} from "./us-navy-nicaragua-canal-publication.mjs";
import {
  selfridgeDarienPublicationMetadata,
  selfridgeDarienPublicationRecords,
} from "./selfridge-darien-publication.mjs";
import {
  bonaparteNicaraguaCanalPublicationMetadata,
  bonaparteNicaraguaCanalPublicationRecords,
} from "./bonaparte-nicaragua-canal-publication.mjs";
import {
  bellyPercementPublicationMetadata,
  bellyPercementPublicationRecords,
} from "./belly-percement-publication.mjs";
import {
  bellyATraversAmeriqueCentralePublicationMetadata,
  bellyATraversAmeriqueCentralePublicationRecords,
} from "./belly-a-travers-amerique-centrale-publication.mjs";
import {
  keasbeyNicaraguaCanalPublicationMetadata,
  keasbeyNicaraguaCanalPublicationRecords,
} from "./keasbey-nicaragua-canal-publication.mjs";
import {
  conzemiusMiskitoSumuPublicationMetadata,
  conzemiusMiskitoSumuPublicationRecords,
} from "./conzemius-miskito-sumu-publication.mjs";
import {
  youngMosquitoShorePublicationMetadata,
  youngMosquitoShorePublicationRecords,
} from "./young-mosquito-shore-publication.mjs";
import {
  arceMemoriaPublicationMetadata,
  arceMemoriaPublicationRecords,
} from "./arce-memoria-publication.mjs";
import {
  mezaPublicationMetadata,
  mezaPublicationRecords,
} from "./meza-publication.mjs";
import {
  doubledayPublicationMetadata,
  doubledayPublicationRecords,
} from "./doubleday-filibuster-war-publication.mjs";
import {
  henningsenOfficialReportPublicationMetadata,
  henningsenOfficialReportPublicationRecords,
} from "./henningsen-official-report-publication.mjs";
import {
  procesoWilliamWalkerPublicationMetadata,
  procesoWilliamWalkerPublicationRecords,
} from "./proceso-contra-william-walker-publication.mjs";
import {
  pimSeemannDottingsPublicationMetadata,
  pimSeemannDottingsPublicationRecords,
} from "./pim-seemann-dottings-publication.mjs";
import {
  peraltaCostaRicaMosquitosPublicationMetadata,
  peraltaCostaRicaMosquitosPublicationRecords,
} from "./peralta-costa-rica-costa-mosquitos-publication.mjs";
import {
  rabasaEstadoChiapasPublicationMetadata,
  rabasaEstadoChiapasPublicationRecords,
} from "./rabasa-estado-chiapas-publication.mjs";
import {
  montufarWalkerCentroAmericaPublicationMetadata,
  montufarWalkerCentroAmericaPublicationRecords,
} from "./montufar-walker-centro-america-publication.mjs";
import {
  barberenaHistoriaElSalvadorPublicationMetadata,
  barberenaHistoriaElSalvadorPublicationRecords,
} from "./barberena-historia-el-salvador-publication.mjs";
import {
  stoneLencaPublicationMetadata,
  stoneLencaPublicationRecords,
} from "./stone-lenca-publication.mjs";
import {
  perezMemoriasPublicationMetadata,
  perezMemoriasPublicationRecords,
} from "./perez-memorias-publication.mjs";
import {
  wellsWalkersExpeditionPublicationMetadata,
  wellsWalkersExpeditionPublicationRecords,
} from "./wells-walkers-expedition-publication.mjs";
import {
  walkerWarNicaraguaPublicationMetadata,
  walkerWarNicaraguaPublicationRecords,
} from "./walker-war-nicaragua-publication.mjs";
import {
  brintonEssaysAmericanistPublicationMetadata,
  brintonEssaysAmericanistPublicationRecords,
} from "./brinton-essays-americanist-publication.mjs";
import {
  brintonFivePapersPublicationMetadata,
  brintonFivePapersPublicationRecords,
  brintonFivePapersShortWorkAuthors,
} from "./brinton-five-papers-publications.mjs";
import {
  brintonSecondFivePapersPublicationMetadata,
  brintonSecondFivePapersPublicationRecords,
  brintonSecondFivePapersShortWorkAuthors,
} from "./brinton-second-five-papers-publications.mjs";
import {
  brintonThirdFivePapersPublicationMetadata,
  brintonThirdFivePapersPublicationRecords,
  brintonThirdFivePapersShortWorkAuthors,
} from "./brinton-third-five-papers-publications.mjs";
import {
  brintonFourthFivePapersPublicationMetadata,
  brintonFourthFivePapersPublicationRecords,
  brintonFourthFivePapersShortWorkAuthors,
} from "./brinton-fourth-five-papers-publications.mjs";
import {
  brintonExtraTwoPapersPublicationMetadata,
  brintonExtraTwoPapersPublicationRecords,
  brintonExtraTwoPapersShortWorkAuthors,
} from "./brinton-extra-two-papers-publications.mjs";
import {
  millaGomezCarrilloPublicationMetadata,
  millaGomezCarrilloPublicationRecords,
} from "./milla-gomez-carrillo-publication.mjs";
import {
  garellaPanamaCanalPublicationMetadata,
  garellaPanamaCanalPublicationRecords,
} from "./garella-panama-canal-publication.mjs";
import {
  reclusPanamaDarienPublicationMetadata,
  reclusPanamaDarienPublicationRecords,
} from "./reclus-panama-darien-publication.mjs";
import {
  rodriguesPanamaCanalPublicationMetadata,
  rodriguesPanamaCanalPublicationRecords,
} from "./rodrigues-panama-canal-publication.mjs";
import {
  wyseCanalPanamaPublicationMetadata,
  wyseCanalPanamaPublicationRecords,
} from "./wyse-canal-panama-publication.mjs";
import {
  congresInternationalCanalInteroceaniquePublicationMetadata,
  congresInternationalCanalInteroceaniquePublicationRecords,
} from "./congres-international-canal-interoceanique-publication.mjs";
import {
  siguenzaObrasPublicationMetadata,
  siguenzaObrasPublicationRecords,
} from "./siguenza-obras-publication.mjs";
import {
  thompsonOfficialVisitPublicationMetadata,
  thompsonOfficialVisitPublicationRecords,
} from "./thompson-official-visit-publication.mjs";
import {
  carranzaPublicationMetadata,
  carranzaPublicationRecords,
} from "./carranza-publication.mjs";
import {
  perignyRemainingPublicationMetadata,
  perignyRemainingPublicationRecords,
  perignyRemainingShortWorkAuthors,
} from "./perigny-remaining-publications.mjs";
import {
  squierBatch03PublicationMetadata,
  squierBatch03PublicationRecords,
  squierBatch03ShortWorkAuthors,
} from "./squier-batch03-publications.mjs";
import {
  salvadorArchaeologyBatch02PublicationMetadata,
  salvadorArchaeologyBatch02PublicationRecords,
  salvadorArchaeologyBatch02ShortWorkAuthors,
} from "./salvador-archaeology-batch02-publications.mjs";
import {
  lardeBatch01PublicationMetadata,
  lardeBatch01PublicationRecords,
  lardeBatch01ShortWorkAuthors,
} from "./larde-batch01-publications.mjs";
import {
  lardeBatch02PublicationMetadata,
  lardeBatch02PublicationRecords,
  lardeBatch02ShortWorkAuthors,
} from "./larde-batch02-publications.mjs";
import {
  squierRetainedPublicationMetadata,
  squierRetainedPublicationRecords,
  squierRetainedShortWorkAuthors,
} from "./squier-retained-publications.mjs";
import {
  seitzPublicationMetadata,
  seitzPublicationRecords,
} from "./seitz-publication.mjs";
import {
  vallePublicationMetadata,
  vallePublicationRecords,
  valleShortWorkAuthors,
} from "./valle-publication.mjs";
import {
  waiknaPublicationMetadata,
  waiknaPublicationRecords,
} from "./waikna-publication.mjs";

const require = createRequire(import.meta.url);
const bibliographicManifest = require("../bibliographic-manifest.json");
if (
  bibliographicManifest.schemaVersion !== 2 ||
  !Array.isArray(bibliographicManifest.records)
) {
  throw new Error("Unsupported canonical bibliographic manifest");
}
const canonicalBibliography = new Map(
  bibliographicManifest.records.map((record) => [record.slug, record]),
);
if (canonicalBibliography.size !== bibliographicManifest.records.length) {
  throw new Error("Duplicate canonical bibliographic record slug");
}

const publicationRecords = [
  ...cambrePublicationRecords,
  ...cermoisePublicationRecords,
  ...arevaloPublicationRecords,
  ...isagogePublicationRecords,
  ...perignyCinqPublicationRecords,
  ...mencosPublicationRecords,
  ...cuevasPublicationRecords,
  ...garciaDocumentosPublicationRecords,
  ...castroPublicationRecords,
  ...guijoPublicationRecords,
  ...roblesDiarioPublicationRecords,
  ...palmaPublicationRecords,
  ...millaCuadrosPublicationRecords,
  ...paraveyFouSangPublicationRecords,
  ...deGuignesPublicationRecords,
  ...batresPublicationRecords,
  ...montufarPrisionPublicationRecords,
  ...diezPublicationRecords,
  ...medinaPublicationRecords,
  ...salazarPublicationRecords,
  ...academiaGuatemaltecaPublicationRecords,
  ...cehmBetlemitasPublicationRecords,
  ...mexicoViejoPublicationRecords,
  ...proceresPublicationRecords,
  ...oviedoPublicationRecords,
  ...fellechnerPublicationRecords,
  ...bethlehemiticaPublicationRecords,
  ...espinosaPublicationRecords,
  ...vlePanamaPublicationRecords,
  ...vazquezPublicationRecords,
  ...siriaPublicationRecords,
  ...montalvoPublicationRecords,
  ...frusPublicationRecords,
  ...haefkensPublicationRecords,
  ...loboPublicationRecords,
  ...howEadsPublicationRecords,
  ...serranoPublicationRecords,
  ...mendietaPublicationRecords,
  ...mosquitoTerritoryPublicationRecords,
  ...rodriguezRelacionPublicationRecords,
  {
    "slug": "bury-bishop-amongst-bananas-1911",
    "title": "バナナの中の主教",
    "originalTitle": "A Bishop amongst Bananas",
    "subtitle": "「仰ぎ見る」・1911年刊 日本語全訳",
    "author": "ハーバート・ベリー",
    "originalAuthor": "Herbert Bury",
    "series": "A BISHOP AMONGST BANANAS · 1911",
    "originalPublication": "ロンドン、Wells Gardner, Darton & Co., Ltd.、[1911年]",
    "year": 1911,
    "extent": "1巻・PDF 186頁・原刊本文236頁・原刊図版15葉・巻頭画像4点",
    "description": "英国国教会主教ハーバート・ベリーが、英領ホンジュラスからグアテマラ、ニカラグア、コスタリカ、パナマ、ジャマイカへ赴いた巡察旅行を記した1911年刊の旅行記です。バナナ農園と鉄道、洪水・地震・火山、パナマ運河工事、各地の教会と社会を全16章で描きます。",
    "cover": "publications/bury-bishop-amongst-bananas-1911/cover.jpg",
    "pdf": "publications/bury-bishop-amongst-bananas-1911/Herbert_Bury_A_Bishop_amongst_Bananas_1911_Japanese_Complete_Translation.pdf",
    "epub": "publications/bury-bishop-amongst-bananas-1911/Herbert_Bury_A_Bishop_amongst_Bananas_1911_Japanese_Complete_Translation.epub",
    "pageCount": 186,
    "figureCount": 4,
    "plateCount": 15,
    "types": [
      "旅行記",
      "宗教史",
      "社会史",
      "植民地史",
      "一次史料"
    ],
    "regions": [
      "中央アメリカ",
      "英領ホンジュラス",
      "ベリーズ",
      "グアテマラ",
      "ニカラグア",
      "コスタリカ",
      "パナマ",
      "ジャマイカ"
    ],
    "languages": [
      "英語"
    ],
    "tags": [
      "ハーバート・ベリー",
      "英国国教会",
      "バナナ産業",
      "ユナイテッド・フルーツ・カンパニー",
      "パナマ運河",
      "鉄道",
      "20世紀初頭"
    ],
    "searchShard": "002"
  },
  {
    "slug": "prieto-piatkowski-ferrocarril-interoceanico-guatemala-1880",
    "title": "グアテマラ大洋間鉄道に関する概説",
    "originalTitle": "Ideas generales sobre el Ferrocarril Interoceánico de Guatemala",
    "subtitle": "1880年刊 日本語全訳",
    "author": "アレハンドロ・プリエト／R・ピアトコフスキ",
    "originalAuthor": "Alejandro Prieto / R. Piatkowski",
    "series": "FERROCARRIL INTEROCEÁNICO · 1880",
    "originalPublication": "グアテマラ、タラセナ父子印刷所、1880年",
    "year": 1880,
    "extent": "PDF 37頁・原刊本文5–60頁・表14点・原刊画像2点・注4件",
    "visualLabel": "原刊画像",
    "description": "グアテマラを大西洋岸と太平洋岸で結ぶ大洋間鉄道について、路線、軌間、建設費、資金調達、輸送需要、政府契約を検討し、サン・ホセ―エスクイントラ線の収支見積りと各国の運河計画を付録に収めた1880年刊の鉄道計画書です。",
    "cover": "publications/prieto-piatkowski-ferrocarril-interoceanico-guatemala-1880/cover.jpg",
    "pdf": "publications/prieto-piatkowski-ferrocarril-interoceanico-guatemala-1880/Alejandro_Prieto_R_Piatkowski_Ideas_generales_sobre_el_Ferrocarril_Interoceanico_de_Guatemala_1880_Japanese_Complete_Translation.pdf",
    "epub": "publications/prieto-piatkowski-ferrocarril-interoceanico-guatemala-1880/Alejandro_Prieto_R_Piatkowski_Ideas_generales_sobre_el_Ferrocarril_Interoceanico_de_Guatemala_1880_Japanese_Complete_Translation.epub",
    "pageCount": 37,
    "figureCount": 2,
    "plateCount": 0,
    "types": [
      "鉄道史",
      "交通史",
      "経済史",
      "一次史料"
    ],
    "regions": [
      "グアテマラ",
      "サン・ホセ",
      "エスクイントラ"
    ],
    "languages": [
      "スペイン語"
    ],
    "tags": [
      "グアテマラ大洋間鉄道",
      "鉄道建設",
      "鉄道軌間",
      "輸送",
      "資金調達",
      "運河計画",
      "19世紀"
    ]
  },
  {
    "slug": "baz-gallo-historia-ferrocarril-mexicano-1874",
    "title": "メキシコ鉄道史",
    "originalTitle": "Historia del Ferrocarril Mexicano",
    "subtitle": "湾岸地帯から中央高原にいたるメキシコの富・1874年刊 日本語全訳",
    "author": "グスタボ・バス／エドゥアルド・L・ガリョ",
    "originalAuthor": "Gustavo Baz / Eduardo L. Gallo",
    "series": "HISTORIA DEL FERROCARRIL MEXICANO · 1874",
    "originalPublication": "メキシコ、Gallo y Compañía、1874年",
    "year": 1874,
    "extent": "PDF 462頁・原刊前付3葉・本文5–296頁・図版等38点・表143点・注87件",
    "description": "バスとガリョがベラクルス―メキシコ鉄道の成立、建設、路線、橋梁・トンネル・駅を記録し、湾岸地帯から中央高原に至る各地の地質、農業、工業、商業、都市と人口を統計表・図版とともに論じた1874年刊の鉄道史・地誌です。",
    "cover": "publications/baz-gallo-historia-ferrocarril-mexicano-1874/cover.jpg",
    "pdf": "publications/baz-gallo-historia-ferrocarril-mexicano-1874/Gustavo_Baz_Eduardo_L_Gallo_Historia_del_Ferrocarril_Mexicano_1874_Japanese_Complete_Translation.pdf",
    "epub": "publications/baz-gallo-historia-ferrocarril-mexicano-1874/Gustavo_Baz_Eduardo_L_Gallo_Historia_del_Ferrocarril_Mexicano_1874_Japanese_Complete_Translation.epub",
    "pageCount": 462,
    "figureCount": 38,
    "plateCount": 0,
    "types": [
      "鉄道史",
      "交通史",
      "地誌",
      "経済史",
      "産業史",
      "一次史料"
    ],
    "regions": [
      "メキシコ",
      "ベラクルス",
      "プエブラ",
      "メキシコ市"
    ],
    "languages": [
      "スペイン語"
    ],
    "tags": [
      "メキシコ鉄道",
      "ベラクルス",
      "メキシコ市",
      "鉄道建設",
      "橋梁",
      "トンネル",
      "産業統計",
      "19世紀"
    ]
  },
  {
    "slug": "squier-davis-ancient-monuments-mississippi-valley-1848",
    "title": "ミシシッピ川流域の古代遺構",
    "originalTitle": "Ancient Monuments of the Mississippi Valley",
    "subtitle": "広範な独自測量および踏査の成果を収録・1848年刊 日本語全訳",
    "author": "E・G・スクワイア／E・H・デイヴィス",
    "originalAuthor": "Ephraim George Squier / Edwin Hamilton Davis",
    "series": "ANCIENT MONUMENTS · 1848",
    "originalPublication": "ワシントン、Smithsonian Institution、1848年",
    "year": 1848,
    "extent": "1巻・原刊本文306頁・図版48枚・木口木版図207点・表14点",
    "description": "スクワイアとデイヴィスが、オハイオおよびミシシッピ川流域の土塁、囲郭、マウンド、遺物を測量・発掘記録と図版によって体系化した、スミソニアン知識叢書第1巻（1848年）です。遺構の分類と分布、埋葬習俗、石・骨・金属・貝製品、彫刻、頭蓋計測、岩刻画を全19章に収めます。",
    "cover": "publications/squier-davis-ancient-monuments-mississippi-valley-1848/cover.jpg",
    "pdf": "publications/squier-davis-ancient-monuments-mississippi-valley-1848/Squier_Davis_Ancient_Monuments_of_the_Mississippi_Valley_1848_Japanese_Complete_Translation.pdf",
    "epub": "publications/squier-davis-ancient-monuments-mississippi-valley-1848/Squier_Davis_Ancient_Monuments_of_the_Mississippi_Valley_1848_Japanese_Complete_Translation.epub",
    "pageCount": 468,
    "figureCount": 207,
    "plateCount": 48,
    "types": [
      "考古学",
      "遺跡調査",
      "考古学史",
      "一次史料"
    ],
    "regions": [
      "アメリカ合衆国",
      "ミシシッピ川流域",
      "オハイオ川流域",
      "オハイオ州"
    ],
    "languages": [
      "英語"
    ],
    "tags": [
      "E・G・スクワイア",
      "E・H・デイヴィス",
      "マウンド・ビルダー",
      "土塁遺構",
      "マウンド",
      "スミソニアン協会",
      "北米考古学",
      "19世紀"
    ]
  },
  {
    "slug": "squier-nicaragua-1852",
    "title": "ニカラグア",
    "originalTitle": "Nicaragua: Its People, Scenery, Monuments, and the Proposed Interoceanic Canal",
    "subtitle": "その人民、景観、記念物、および計画中の大洋間運河・1852年刊 全二巻日本語全訳",
    "author": "E・G・スクワイア",
    "originalAuthor": "Ephraim George Squier",
    "series": "NICARAGUA · 1852",
    "originalPublication": "ロンドン、Longman, Brown, Green, and Longmans、1852年",
    "year": 1852,
    "extent": "全2巻合冊・PDF 782頁・原刊第1巻424頁／第2巻452頁・図版等94点・表49点",
    "description": "米国外交官・探検家スクワイアが、ニカラグアの地理・社会・政治・宗教・先住民文化・古代遺物を旅行記と調査報告として記し、大洋間運河の候補路線、条約、商業・移民統計、先住民諸語、独立後政治史を収めた1852年刊の全二巻です。",
    "cover": "publications/squier-nicaragua-1852/cover.jpg",
    "pdf": "publications/squier-nicaragua-1852/E_G_Squier_Nicaragua_1852_Japanese_Complete_Translation.pdf",
    "epub": "publications/squier-nicaragua-1852/E_G_Squier_Nicaragua_1852_Japanese_Complete_Translation.epub",
    "pageCount": 782,
    "figureCount": 94,
    "plateCount": 0,
    "types": [
      "紀行",
      "地誌",
      "民族誌",
      "考古学",
      "運河史",
      "一次史料"
    ],
    "regions": [
      "ニカラグア",
      "中央アメリカ",
      "モスキート海岸",
      "ホンジュラス"
    ],
    "languages": [
      "英語"
    ],
    "tags": [
      "E・G・スクワイア",
      "ニカラグア運河",
      "大洋間運河",
      "サン・フアン川",
      "レオン",
      "グラナダ",
      "先住民諸語",
      "古代遺物",
      "19世紀"
    ]
  },
  {
    "slug": "squier-great-calendar-stone-1849",
    "title": "古代メキシコ人の大暦石に記された日付に関する若干の新発見",
    "originalTitle": "Some New Discoveries respecting the Dates on the Great Calendar Stone of the Ancient Mexicans, with Observations on the Mexican Cycle of Fifty-two Years",
    "subtitle": "メキシコの五十二年周期に関する考察・1849年刊 日本語全訳",
    "author": "E・G・スクワイア",
    "originalAuthor": "Ephraim George Squier",
    "series": "AMERICAN JOURNAL OF SCIENCE AND ARTS · 1849",
    "originalPublication": "New Haven、『The American Journal of Science and Arts』Second Series、第7巻第20号、1849年3月、153–157頁",
    "year": 1849,
    "extent": "PDF 5頁・原刊153–157頁・図2点",
    "description": "スクワイアがメキシコのアステカ大暦石を検討し、ガマとネベルの図を比較して冬至の日付を示す記号を論じ、アステカ暦の五十二年周期と祭式との関係を考察した1849年刊論文です。",
    "cover": "publications/squier-great-calendar-stone-1849/cover.jpg",
    "pdf": "publications/squier-great-calendar-stone-1849/E_G_Squier_Great_Calendar_Stone_1849_Japanese_Complete_Translation.pdf",
    "epub": "publications/squier-great-calendar-stone-1849/E_G_Squier_Great_Calendar_Stone_1849_Japanese_Complete_Translation.epub",
    "pageCount": 5,
    "figureCount": 2,
    "plateCount": 0,
    "types": ["考古学", "暦学", "天文学史", "論文", "一次史料"],
    "regions": ["メキシコ", "メキシコ市"],
    "languages": ["英語"],
    "tags": ["E・G・スクワイア", "アステカ暦", "太陽の石", "暦石", "五十二年周期", "19世紀"]
  },
  {
    "slug": "squier-british-encroachments-mosquito-question-1850",
    "title": "中央アメリカにおけるイギリスの蚕食と侵略——モスキート問題",
    "originalTitle": "British Encroachments and Aggressions in Central America: The Mosquito Question",
    "subtitle": "『The American Whig Review』1850年二分載 日本語全訳",
    "author": "E・G・スクワイア",
    "originalAuthor": "Ephraim George Squier",
    "series": "THE AMERICAN WHIG REVIEW · 1850",
    "originalPublication": "ニューヨーク、『The American Whig Review』New Series、第5巻第2–3号、1850年、188–203頁・235–268頁",
    "year": 1850,
    "extent": "PDF 75頁・原刊188–203頁／235–268頁・地図1点",
    "description": "中央アメリカにおけるイギリスの進出、モスキート保護国をめぐる主張、サン・フアン・デ・ニカラグア、フォンセカ湾とティグレ島、大洋間運河をめぐる外交問題を論じた1850年の二分載論文です。",
    "cover": "publications/squier-british-encroachments-mosquito-question-1850/cover.jpg",
    "pdf": "publications/squier-british-encroachments-mosquito-question-1850/E_G_Squier_British_Encroachments_Mosquito_Question_1850_Japanese_Complete_Translation.pdf",
    "epub": "publications/squier-british-encroachments-mosquito-question-1850/E_G_Squier_British_Encroachments_Mosquito_Question_1850_Japanese_Complete_Translation.epub",
    "pageCount": 75,
    "figureCount": 1,
    "plateCount": 0,
    "types": ["外交史", "政治論", "運河史", "論文", "一次史料"],
    "regions": ["中央アメリカ", "ニカラグア", "ホンジュラス", "モスキート海岸", "フォンセカ湾"],
    "languages": ["英語"],
    "tags": ["E・G・スクワイア", "モスキート問題", "イギリス", "サン・フアン川", "大洋間運河", "19世紀"]
  },
  {
    "slug": "squier-spanish-american-republics-1850",
    "title": "スペイン系アメリカ諸共和国とその失敗の原因――中央アメリカ",
    "originalTitle": "The Spanish American Republics, and the Causes of Their Failure. Central America",
    "subtitle": "『The American Whig Review』1850年10月号 日本語全訳",
    "author": "無署名",
    "originalAuthor": "Anonymous",
    "attributedTo": "Ephraim George Squier",
    "attributionStatus": "tentative",
    "attributionNote": "原刊は無署名です。Don C. Seitz (1911), p. 52およびCharles Lee Stansifer (1968), p. 64は本稿をEphraim George Squierに帰属させますが、本サイトでは後世の暫定帰属として扱い、主著者表示には採用しません。",
    "series": "THE AMERICAN WHIG REVIEW · 1850",
    "originalPublication": "『The American Whig Review』第12巻第34号、1850年10月、337–344頁",
    "year": 1850,
    "extent": "PDF 13頁・原刊337–344頁",
    "description": "スペイン系アメリカ諸共和国の独立後の政治的混乱を、植民地統治の遺産、自由派と保守派の対立、中央アメリカのメキシコ帝国編入と1824年憲法の経過から論じた1850年刊の無署名論文です。",
    "cover": "publications/squier-spanish-american-republics-1850/cover.jpg",
    "pdf": "publications/squier-spanish-american-republics-1850/E_G_Squier_Spanish_American_Republics_1850_Japanese_Complete_Translation.pdf",
    "epub": "publications/squier-spanish-american-republics-1850/E_G_Squier_Spanish_American_Republics_1850_Japanese_Complete_Translation.epub",
    "pageCount": 13,
    "figureCount": 0,
    "plateCount": 0,
    "types": ["政治史", "政治論", "論文", "一次史料"],
    "regions": ["中央アメリカ", "メキシコ", "グアテマラ", "エル・サルバドル"],
    "languages": ["英語"],
    "tags": ["無署名", "E・G・スクワイア暫定帰属", "スペイン系アメリカ", "中央アメリカ連邦", "イトゥルビデ", "自由派", "19世紀"]
  },
  {
    "slug": "squier-great-ship-canal-question-1850",
    "title": "大船舶運河問題——イギリスおよびコスタリカ対アメリカ合衆国およびニカラグア",
    "originalTitle": "The Great Ship Canal Question: England and Costa Rica versus the United States and Nicaragua",
    "subtitle": "『The American Whig Review』1850年11月号 日本語全訳",
    "author": "E・G・スクワイア",
    "originalAuthor": "Ephraim George Squier",
    "series": "THE AMERICAN WHIG REVIEW · 1850",
    "originalPublication": "ニューヨーク、『The American Whig Review』New Series、第6巻第5号、1850年11月、441–455頁",
    "year": 1850,
    "extent": "PDF 23頁・原刊441–455頁・地図1点",
    "description": "ニカラグア地峡の大船舶運河計画をめぐり、イギリスのモスキート主張、コスタリカの領土要求、アメリカ合衆国とニカラグアの立場、クレイトン＝ブルワー条約を論じた1850年刊論文です。",
    "cover": "publications/squier-great-ship-canal-question-1850/cover.jpg",
    "pdf": "publications/squier-great-ship-canal-question-1850/E_G_Squier_Great_Ship_Canal_Question_1850_Japanese_Complete_Translation.pdf",
    "epub": "publications/squier-great-ship-canal-question-1850/E_G_Squier_Great_Ship_Canal_Question_1850_Japanese_Complete_Translation.epub",
    "pageCount": 23,
    "figureCount": 1,
    "plateCount": 0,
    "types": ["外交史", "運河史", "政治論", "論文", "一次史料"],
    "regions": ["ニカラグア", "コスタリカ", "中央アメリカ", "モスキート海岸"],
    "languages": ["英語"],
    "tags": ["E・G・スクワイア", "ニカラグア運河", "クレイトン＝ブルワー条約", "モスキート問題", "コスタリカ", "19世紀"]
  },
  {
    "slug": "squier-judgment-by-default-1851",
    "title": "欠席判決——中央アメリカと政権",
    "originalTitle": "Judgment by Default: Central America and the Administration",
    "subtitle": "『The American Whig Review』1851年3月号 日本語全訳",
    "author": "E・G・スクワイア",
    "originalAuthor": "Ephraim George Squier",
    "series": "THE AMERICAN WHIG REVIEW · 1851",
    "originalPublication": "ニューヨーク、『The American Whig Review』New Series、第7巻第3号、1851年3月、276–288頁",
    "year": 1851,
    "extent": "PDF 25頁・原刊276–288頁",
    "description": "中央アメリカ政策をめぐるアメリカ政権の対応を批判し、モスキート海岸とサン・フアン、チャットフィールドとブルワー、クレイトン＝ブルワー条約、上院での審議を論じた1851年刊論文です。",
    "cover": "publications/squier-judgment-by-default-1851/cover.jpg",
    "pdf": "publications/squier-judgment-by-default-1851/E_G_Squier_Judgment_by_Default_1851_Japanese_Complete_Translation.pdf",
    "epub": "publications/squier-judgment-by-default-1851/E_G_Squier_Judgment_by_Default_1851_Japanese_Complete_Translation.epub",
    "pageCount": 25,
    "figureCount": 0,
    "plateCount": 0,
    "types": ["外交史", "政治論", "運河史", "論文", "一次史料"],
    "regions": ["中央アメリカ", "ニカラグア", "モスキート海岸", "アメリカ合衆国", "イギリス"],
    "languages": ["英語"],
    "tags": ["E・G・スクワイア", "モスキート問題", "クレイトン＝ブルワー条約", "チャットフィールド", "アメリカ外交", "19世紀"]
  },
  {
    "slug": "otis-isthmus-panama-railroad-1867",
    "title": "パナマ地峡　パナマ鉄道史",
    "originalTitle": "Isthmus of Panama: History of the Panama Railroad; and of the Pacific Mail Steamship Company",
    "subtitle": "太平洋郵船会社史ならびに旅行者・実業家便覧・1867年刊 日本語全訳",
    "author": "F・N・オーティス",
    "originalAuthor": "Fessenden Nott Otis",
    "series": "ISTHMUS OF PANAMA · 1867",
    "originalPublication": "ニューヨーク、Harper & Brothers、1867年",
    "year": 1867,
    "extent": "PDF 334頁・原刊ix, 317頁・図版38点・表207点",
    "description": "パナマ鉄道の計画・建設・運営と財務、地峡横断旅行案内、パナマに接続する汽船会社・航路・運賃・貨物規則、中央・南アメリカ各国およびメキシコの地誌と商業情報を収めた、1867年刊の鉄道史兼旅行・実務便覧です。",
    "cover": "publications/otis-isthmus-panama-railroad-1867/cover.jpg",
    "pdf": "publications/otis-isthmus-panama-railroad-1867/F_N_Otis_Isthmus_of_Panama_1867_Japanese_Complete_Translation.pdf",
    "epub": "publications/otis-isthmus-panama-railroad-1867/F_N_Otis_Isthmus_of_Panama_1867_Japanese_Complete_Translation.epub",
    "pageCount": 334,
    "figureCount": 38,
    "plateCount": 0,
    "types": [
      "鉄道史",
      "交通史",
      "旅行案内",
      "商業便覧",
      "一次史料"
    ],
    "regions": [
      "パナマ",
      "中央アメリカ",
      "南アメリカ",
      "メキシコ",
      "カリブ海"
    ],
    "languages": [
      "英語"
    ],
    "tags": [
      "パナマ鉄道",
      "パナマ地峡",
      "太平洋郵船会社",
      "汽船航路",
      "大西洋横断交通",
      "運賃",
      "貨物",
      "19世紀"
    ]
  },
  {
    "slug": "siguenza-parayso-occidental-1684",
    "title": "西方の楽園",
    "originalTitle": "Parayso occidental",
    "subtitle": "メキシコ王立ヘスス・マリア修道院の創設と発展・1684年メキシコ刊 日本語全訳",
    "author": "カルロス・デ・シグエンサ・イ・ゴンゴラ",
    "originalAuthor": "Carlos de Sigüenza y Góngora",
    "series": "PARAYSO OCCIDENTAL · 1684",
    "originalPublication": "メキシコ、フアン・デ・リベラ、1684年",
    "year": 1684,
    "extent": "PDF 350頁・全3巻66章・原刊前付11葉・本文fol. 1r–206v・正誤表",
    "description": "メキシコ王立ヘスス・マリア女子修道院の創設と発展をたどり、尊者マリナ・デ・ラ・クルス、イネス・デ・ラ・クルスをはじめとする修道女たちの生涯、徳行、幻視、奇蹟を記した1684年刊の修道院史・伝記集です。",
    "cover": "publications/siguenza-parayso-occidental-1684/cover.jpg",
    "pdf": "publications/siguenza-parayso-occidental-1684/Carlos_de_Siguenza_y_Gongora_Parayso_Occidental_1684_Japanese_Complete_Translation.pdf",
    "epub": "publications/siguenza-parayso-occidental-1684/Carlos_de_Siguenza_y_Gongora_Parayso_Occidental_1684_Japanese_Complete_Translation.epub",
    "pageCount": 350,
    "figureCount": 1,
    "plateCount": 0,
    "types": [
      "修道院史",
      "女性宗教史",
      "伝記集",
      "一次史料"
    ],
    "regions": [
      "メキシコ",
      "メキシコ市",
      "ヌエバ・エスパーニャ"
    ],
    "languages": [
      "スペイン語"
    ],
    "tags": [
      "シグエンサ・イ・ゴンゴラ",
      "ヘスス・マリア修道院",
      "女性修道者",
      "マリナ・デ・ラ・クルス",
      "イネス・デ・ラ・クルス",
      "植民地期メキシコ",
      "カトリック",
      "17世紀"
    ]
  },
  {
    "slug": "gonzalez-compendio-geografia-centro-america-1881",
    "title": "中央アメリカ地理要綱",
    "originalTitle": "Compendio de geografía de Centro-América",
    "subtitle": "中等学校・初等学校用 訂正増補第二版・1881年刊 日本語全訳",
    "author": "ダリオ・ゴンサレス",
    "originalAuthor": "Darío González",
    "series": "COMPENDIO DE GEOGRAFÍA DE CENTRO-AMÉRICA · 1881",
    "originalPublication": "グアテマラ、エミリオ・グボー書店・文房具店、1881年",
    "year": 1881,
    "extent": "PDF 123頁・原刊本文1–131頁・索引133–135頁・図版32点・表20点",
    "description": "中央アメリカ五共和国の境界、地勢、気候、河川・湖沼、産物、人口、行政、都市、交通、産業を問答形式で概説した地理教科書。グアテマラを最も詳しく扱い、エル・サルバドル、ホンジュラス、ニカラグア、コスタ・リカおよびベリーズの地誌を収録しています。",
    "cover": "publications/gonzalez-compendio-geografia-centro-america-1881/cover.jpg",
    "pdf": "publications/gonzalez-compendio-geografia-centro-america-1881/Dario_Gonzalez_Compendio_de_geografia_de_Centro_America_1881_Japanese_Translation.pdf",
    "epub": "publications/gonzalez-compendio-geografia-centro-america-1881/Dario_Gonzalez_Compendio_de_geografia_de_Centro_America_1881_Japanese_Translation.epub",
    "pageCount": 123,
    "figureCount": 32,
    "plateCount": 0,
    "types": [
      "地誌",
      "地理教科書",
      "統計資料",
      "一次史料"
    ],
    "regions": [
      "中央アメリカ",
      "グアテマラ",
      "エル・サルバドル",
      "ホンジュラス",
      "ニカラグア",
      "コスタ・リカ",
      "ベリーズ"
    ],
    "languages": [
      "スペイン語"
    ],
    "tags": [
      "中央アメリカ地理",
      "地理教育",
      "自然地理",
      "人口統計",
      "産業",
      "交通",
      "都市",
      "19世紀"
    ]
  },
  {
    "slug": "leonard-don-carlos-de-siguenza-y-gongora-1929",
    "title": "ドン・カルロス・デ・シグエンサ・イ・ゴンゴラ",
    "originalTitle": "Don Carlos de Sigüenza y Góngora: A Mexican Savant of the Seventeenth Century",
    "subtitle": "17世紀メキシコの碩学・1929年初版 日本語全訳",
    "author": "アーヴィング・A・レナード",
    "originalAuthor": "Irving A. Leonard",
    "series": "DON CARLOS DE SIGÜENZA Y GÓNGORA · 1929",
    "originalPublication": "バークレー、University of California Press、1929年",
    "year": 1929,
    "extent": "PDF 318頁・原刊前付・本文1–287頁・脚注422件・付録A/B・索引・挿図1葉",
    "description": "17世紀ヌエバ・エスパーニャの学者カルロス・デ・シグエンサ・イ・ゴンゴラの生涯と著作をたどる研究書。詩作、天文学、地図作成、古代史研究、1692年メキシコ市暴動、探検事業を論じ、前付、全10章、参考文献、著作目録、付録A・B、索引を収録しています。原刊の無内容の白紙葉は収録していません。",
    "cover": "publications/leonard-don-carlos-de-siguenza-y-gongora-1929/cover.jpg",
    "pdf": "publications/leonard-don-carlos-de-siguenza-y-gongora-1929/Irving_A_Leonard_Don_Carlos_de_Siguenza_y_Gongora_1929_Japanese_Complete_Translation.pdf",
    "epub": "publications/leonard-don-carlos-de-siguenza-y-gongora-1929/Irving_A_Leonard_Don_Carlos_de_Siguenza_y_Gongora_1929_Japanese_Complete_Translation.epub",
    "pageCount": 318,
    "figureCount": 0,
    "plateCount": 1,
    "types": [
      "伝記",
      "学術史",
      "メキシコ史",
      "植民地史"
    ],
    "regions": [
      "メキシコ",
      "ヌエバ・エスパーニャ",
      "メキシコ市"
    ],
    "languages": [
      "英語"
    ],
    "tags": [
      "シグエンサ・イ・ゴンゴラ",
      "ソル・フアナ",
      "天文学",
      "地図史",
      "1692年メキシコ市暴動",
      "スペイン植民地期",
      "17世紀"
    ]
  },
  {
    "type": "paper",
    "slug": "gonzalez-ruinas-tehuacan-1892",
    "title": "テワカン遺跡――先コロンブス期の遺物",
    "originalTitle": "Ruinas de Tehuacán. Objetos precolombinos",
    "subtitle": "1892年刊・原刊203–206頁 日本語全訳",
    "author": "ダリオ・ゴンサレス",
    "originalAuthor": "Darío González",
    "series": "RUINAS DE TEHUACÁN · LA UNIVERSIDAD · 1892",
    "originalPublication": "サン・サルバドル、『La Universidad』第III系列第6号、1892年6月、203–206頁",
    "year": 1892,
    "extent": "PDF 9頁・原刊203–206頁・原注4件",
    "description": "ダリオ・ゴンサレスがエルサルバドルのテワカン遺跡を記述した1892年の考古学報告。造成台地、石壁、ピラミッド、石彫・土器などの出土品を紹介し、当時のトルテカ系・ピピル系移住説と地名語源を論じます。",
    "cover": "publications/gonzalez-ruinas-tehuacan-1892/cover.jpg",
    "pdf": "publications/gonzalez-ruinas-tehuacan-1892/Gonzalez_Ruinas_de_Tehuacan_1892_Japanese_Complete_Translation.pdf",
    "epub": "publications/gonzalez-ruinas-tehuacan-1892/Gonzalez_Ruinas_de_Tehuacan_1892_Japanese_Complete_Translation.epub",
    "pageCount": 9,
    "figureCount": 0,
    "plateCount": 0,
    "types": [
      "考古学報告",
      "遺跡報告",
      "学術誌論文"
    ],
    "regions": [
      "テワカン",
      "サン・ビセンテ",
      "エルサルバドル"
    ],
    "languages": [
      "スペイン語"
    ],
    "tags": [
      "テワカン遺跡",
      "エルサルバドル考古学",
      "ピピル",
      "トルテカ",
      "先コロンブス期",
      "一次史料"
    ]
  },
  {
    "slug": "barberena-fonseca-monografias-departamentales-1909-1914",
    "title": "県別モノグラフ（七冊合冊）",
    "originalTitle": "Monografías departamentales",
    "subtitle": "エルサルバドル七県の地理・統計資料 日本語訳",
    "author": "サンティアゴ・I・バルベレナ／ペドロ・S・フォンセカ",
    "originalAuthor": "Santiago I. Barberena / Pedro S. Fonseca",
    "series": "MONOGRAFÍAS DEPARTAMENTALES · 1909–1914",
    "originalPublication": "サン・サルバドル、国立印刷所、1909–1914年",
    "year": 1909,
    "extent": "PDF 318頁・第2・4・5・6・8・10・11冊・原刊表紙5点・県境概略図1点",
    "description": "エルサルバドル統計総局が1909–1914年に刊行した全14冊の県別地誌のうち、モラサン、チャラテナンゴ、カバニャス、サンタ・アナ、サン・ミゲル、ラ・ウニオン、アワチャパンの7県を収録しています。地形、河川、集落、人口、農業、鉱業、交通、教育、行政を市町村単位で記述した、20世紀初頭エルサルバドルの地域資料です。",
    "cover": "publications/barberena-fonseca-monografias-departamentales-1909-1914/cover.jpg",
    "pdf": "publications/barberena-fonseca-monografias-departamentales-1909-1914/Barberena_Monografias_Departamentales_7vols_Japanese_Translation.pdf",
    "epub": "publications/barberena-fonseca-monografias-departamentales-1909-1914/Barberena_Monografias_Departamentales_7vols_Japanese_Translation.epub",
    "pageCount": 318,
    "figureCount": 6,
    "plateCount": 0,
    "types": [
      "地誌",
      "統計資料",
      "地域史",
      "一次史料"
    ],
    "regions": [
      "エルサルバドル",
      "モラサン県",
      "チャラテナンゴ県",
      "カバニャス県",
      "サンタ・アナ県",
      "サン・ミゲル県",
      "ラ・ウニオン県",
      "アワチャパン県"
    ],
    "languages": [
      "スペイン語"
    ],
    "tags": [
      "サンティアゴ・I・バルベレナ",
      "ペドロ・S・フォンセカ",
      "県別モノグラフ",
      "人口統計",
      "地理",
      "農業",
      "鉱業",
      "教育",
      "20世紀初頭"
    ]
  },
  {
    "slug": "siguenza-infortunios-alonso-ramirez-1690",
    "title": "アロンソ・ラミレスの不運",
    "originalTitle": "Infortunios de Alonso Ramírez",
    "subtitle": "1690年メキシコ刊・世界周航と海賊捕囚の記録 日本語全訳",
    "author": "カルロス・デ・シグエンサ・イ・ゴンゴラ",
    "originalAuthor": "Carlos de Sigüenza y Góngora",
    "series": "INFORTUNIOS DE ALONSO RAMÍREZ · 1690",
    "originalPublication": "メキシコ、ベルナルド・カルデロン未亡人相続人印刷所、1690年",
    "year": 1690,
    "extent": "日本語版PDF 64頁・全7節",
    "description": "プエルトリコ生まれのアロンソ・ラミレスが、フィリピンでイングランド人海賊に捕らえられ、太平洋・インド洋・大西洋を経てユカタン海岸に座礁するまでの遍歴を、シグエンサ・イ・ゴンゴラが1690年にまとめた物語的報告の日本語全訳です。",
    "cover": "publications/siguenza-infortunios-alonso-ramirez-1690/cover.jpg",
    "pdf": "publications/siguenza-infortunios-alonso-ramirez-1690/Carlos_de_Siguenza_y_Gongora_Infortunios_de_Alonso_Ramirez_1690_Japanese_Complete_Translation.pdf",
    "epub": "publications/siguenza-infortunios-alonso-ramirez-1690/Carlos_de_Siguenza_y_Gongora_Infortunios_de_Alonso_Ramirez_1690_Japanese_Complete_Translation.epub",
    "pageCount": 64,
    "figureCount": 1,
    "plateCount": 0,
    "types": [
      "旅行記",
      "海事史",
      "捕囚記",
      "一次史料"
    ],
    "regions": [
      "プエルトリコ",
      "フィリピン",
      "メキシコ",
      "ユカタン",
      "カリブ海"
    ],
    "languages": [
      "スペイン語"
    ],
    "tags": [
      "アロンソ・ラミレス",
      "シグエンサ・イ・ゴンゴラ",
      "海賊",
      "世界周航",
      "海難",
      "スペイン領フィリピン",
      "17世紀"
    ]
  },
  {
    "slug": "torquemada-monarquia-indiana-1615",
    "title": "インディア王国誌",
    "originalTitle": "Los veinte y un libros rituales y Monarquía indiana",
    "subtitle": "1615年セビーリャ初版・全三巻二十一書 日本語全訳",
    "author": "フアン・デ・トルケマダ",
    "originalAuthor": "Juan de Torquemada",
    "series": "MONARQUÍA INDIANA · 1615",
    "originalPublication": "セビーリャ、マティアス・クラビホ、1615年",
    "year": 1615,
    "extent": "日本語版PDF 3701頁・全3巻・全21書",
    "description": "フアン・デ・トルケマダが1615年に刊行した全三巻二十一書のヌエバ・エスパニャ史・民族誌・宣教史の日本語全訳です。John Carter Brown Library所蔵初版本をInternet Archive公開画像から底本として用いました。",
    "cover": "publications/torquemada-monarquia-indiana-1615/cover.jpg",
    "pdf": "publications/torquemada-monarquia-indiana-1615/Juan_de_Torquemada_Monarquia_indiana_1615_Japanese_Complete_Translation.pdf",
    "epub": "publications/torquemada-monarquia-indiana-1615/Juan_de_Torquemada_Monarquia_indiana_1615_Japanese_Complete_Translation.epub",
    "pageCount": 3701,
    "figureCount": 0,
    "plateCount": 0,
    "types": [
      "歴史書",
      "民族誌",
      "宣教史",
      "植民地史",
      "一次史料"
    ],
    "regions": [
      "メキシコ",
      "ヌエバ・エスパニャ",
      "メソアメリカ",
      "中央アメリカ",
      "西インド諸島"
    ],
    "languages": [
      "スペイン語"
    ],
    "tags": [
      "メキシコ史",
      "先住民史",
      "ナワ族",
      "アステカ",
      "フランシスコ会",
      "キリスト教宣教",
      "スペイン征服",
      "16世紀",
      "17世紀"
    ]
  },
  {
    "slug": "guzman-apuntamientos-topografia-salvador-1883",
    "title": "サルバドル共和国自然地理覚書",
    "originalTitle": "Apuntamientos sobre la topografía física de la República del Salvador, comprendiendo su historia natural, sus producciones, industria, comercio e inmigración, climas, estadística, etc.",
    "subtitle": "博物誌、生産物、産業、商業、移民、気候、統計ほか",
    "author": "ダビッド・ホアキン・グスマン",
    "originalAuthor": "David Joaquín Guzmán",
    "series": "APUNTAMIENTOS SOBRE EL SALVADOR · 1883",
    "originalPublication": "サンサルバドル、「エル・コメタ」印刷所、1883年",
    "year": 1883,
    "extent": "日本語版PDF 569頁・原刊標題紙・前付iii–xxii頁・本文23–525頁・底本位置標識523件・表81点・注14件",
    "description": "1883年に刊行されたエルサルバドルの総合地誌の日本語全訳です。自然地理、水理地理、地質、鉱物、植物、動物、農業、工業、商業、移民、気候、統計、先住民史・諸語を扱い、標題紙、前付、詳細目次、献辞、委員会報告、新聞評、政府決定、本文、注、表、語彙集、付録を収録しました。",
    "cover": "publications/guzman-apuntamientos-topografia-salvador-1883/cover.jpg",
    "pdf": "publications/guzman-apuntamientos-topografia-salvador-1883/David_J_Guzman_Apuntamientos_Topografia_Salvador_1883_Japanese_Complete_Translation.pdf",
    "epub": "publications/guzman-apuntamientos-topografia-salvador-1883/David_J_Guzman_Apuntamientos_Topografia_Salvador_1883_Japanese_Complete_Translation.epub",
    "pageCount": 569,
    "figureCount": 0,
    "plateCount": 0,
    "types": [
      "地誌",
      "自然史",
      "統計資料",
      "経済史料"
    ],
    "regions": [
      "エルサルバドル",
      "中央アメリカ",
      "サン・サルバドル",
      "レンパ川",
      "フォンセカ湾"
    ],
    "languages": [
      "スペイン語"
    ],
    "tags": [
      "エルサルバドル史",
      "自然地理",
      "博物誌",
      "農業",
      "鉱業",
      "商業",
      "移民",
      "気候",
      "統計",
      "ピピル語",
      "19世紀"
    ]
  },
  {
    "slug": "fernandez-historia-costa-rica-1889",
    "title": "スペイン統治下のコスタリカ史",
    "originalTitle": "Historia de Costa Rica durante la dominación española, 1502–1821",
    "subtitle": "1502–1821年・1889年マドリード初版 日本語全訳",
    "author": "レオン・フェルナンデス",
    "originalAuthor": "León Fernández",
    "series": "HISTORIA DE COSTA RICA · 1889",
    "originalPublication": "マドリード、マヌエル・ヒネス・エルナンデス印刷所、1889年",
    "year": 1889,
    "extent": "PDF 613頁・原刊前付V–VII頁・本文1–640頁・注243件・表44点・自筆署名見本24葉・名簿・索引・正誤表",
    "description": "レオン・フェルナンデスが、コロンによる1502年のコスタリカ沿岸到達から1821年の独立までを、征服、植民地行政、総督、先住民社会、宣教、海防、モスキート海岸との関係、経済と人口の推移に沿って年代順にまとめたコスタリカ植民地史の古典です。リカルド・フェルナンデス・グアルディアが公刊した1889年初版の前付、本文1–640頁、注、自筆署名見本24葉と名簿、索引、正誤表を収録し、原刊の段落、引用、表、注、頁順を保持しています。",
    "cover": "publications/fernandez-historia-costa-rica-1889/cover.jpg",
    "pdf": "publications/fernandez-historia-costa-rica-1889/Leon_Fernandez_Historia_de_Costa_Rica_1889_Japanese_Complete_Translation.pdf",
    "epub": "publications/fernandez-historia-costa-rica-1889/Leon_Fernandez_Historia_de_Costa_Rica_1889_Japanese_Complete_Translation.epub",
    "pageCount": 613,
    "figureCount": 0,
    "plateCount": 24,
    "types": [
      "歴史書",
      "通史",
      "植民地史"
    ],
    "regions": [
      "コスタリカ",
      "中央アメリカ",
      "カリブ海沿岸",
      "ニカラグア",
      "パナマ"
    ],
    "languages": [
      "スペイン語"
    ],
    "tags": [
      "コスタリカ史",
      "スペイン統治",
      "植民地行政",
      "先住民史",
      "モスキート海岸",
      "タラマンカ",
      "独立",
      "16世紀",
      "17世紀",
      "18世紀",
      "19世紀"
    ]
  },
  {
    "slug": "strangeways-mosquito-shore-1822",
    "title": "モスキート海岸概説――ポヤイス領を含む",
    "originalTitle": "Sketch of the Mosquito Shore, Including the Territory of Poyais",
    "subtitle": "1822年初版・日本語全訳",
    "author": "トマス・ストレンジウェイズ",
    "originalAuthor": "Thomas Strangeways",
    "series": "SKETCH OF THE MOSQUITO SHORE · 1822",
    "originalPublication": "エディンバラ、William Blackwood／ロンドン、T. Caddell、1822年",
    "year": 1822,
    "extent": "原刊前付viii頁・本文355頁・日本語版PDF 239頁・原刊位置標識374件・脚注648件・表31点・図版3点",
    "description": "1822年に刊行されたモスキート海岸とポヤイス領の地誌・入植案内の全訳です。自然環境、住民、農業、交易、港湾、行政および入植の実務を扱い、原刊の前付、本文末尾355頁、脚注、表、口絵、折込地図、ブラック・リヴァー港景を収録しました。原刊位置標識374件を保持し、Fancourt固定母版で組版した239頁版です。",
    "cover": "publications/strangeways-mosquito-shore-1822/cover.jpg",
    "pdf": "publications/strangeways-mosquito-shore-1822/Thomas_Strangeways_Sketch_of_the_Mosquito_Shore_1822_Japanese_Complete_Translation.pdf",
    "epub": "publications/strangeways-mosquito-shore-1822/Thomas_Strangeways_Sketch_of_the_Mosquito_Shore_1822_Japanese_Complete_Translation.epub",
    "pageCount": 239,
    "figureCount": 3,
    "plateCount": 0,
    "types": [
      "地誌",
      "植民地資料",
      "移民案内",
      "交易史料",
      "一次史料"
    ],
    "regions": [
      "中央アメリカ",
      "モスキート海岸",
      "ポヤイス",
      "ホンジュラス",
      "ニカラグア",
      "カリブ海岸"
    ],
    "languages": [
      "英語"
    ],
    "tags": [
      "グレゴール・マクレガー",
      "ポヤイス",
      "モスキート海岸",
      "植民",
      "農業",
      "交易",
      "19世紀"
    ]
  },
  {
    "slug": "barraza-anastasio-aquino-2001",
    "title": "アナスタシオ・アキノの壮挙：歴史的一考察",
    "originalTitle": "La gesta de Anastasio Aquino: una aproximación histórica",
    "subtitle": "2001年エルサルバドル工科大学版・日本語全訳",
    "author": "ホルヘ・バラサ・イバラ",
    "originalAuthor": "Jorge Barraza Ibarra",
    "series": "LA GESTA DE ANASTASIO AQUINO · 2001",
    "originalPublication": "サン・サルバドル、エルサルバドル工科大学、2001年6月",
    "year": 2001,
    "extent": "PDF 210頁・前付9頁・原刊15頁および17–148頁・付録6頁・裏表紙・底本位置標識149件・原注131件・表9点・原刊画像19点",
    "description": "1833年にエルサルバドルのノヌアルコ地方で起きたアナスタシオ・アキノの反乱を、植民地秩序、中央アメリカ独立と連邦共和国、1832年の州政治、先住民社会と土地・労働制度の長期的背景から検討した歴史研究の全訳です。全4部、序文、用語集、参考文献、付録を収録し、原刊の章立て、段落、原注、表、図版、頁順を保持しました。",
    "cover": "publications/barraza-anastasio-aquino-2001/cover.jpg",
    "pdf": "publications/barraza-anastasio-aquino-2001/Jorge_Barraza_Ibarra_La_gesta_de_Anastasio_Aquino_2001_Japanese_Complete_Translation.pdf",
    "epub": "publications/barraza-anastasio-aquino-2001/Jorge_Barraza_Ibarra_La_gesta_de_Anastasio_Aquino_2001_Japanese_Complete_Translation.epub",
    "pageCount": 210,
    "figureCount": 19,
    "plateCount": 0,
    "types": [
      "歴史研究",
      "先住民史",
      "反乱史",
      "社会史"
    ],
    "regions": [
      "エルサルバドル",
      "中央アメリカ",
      "ノヌアルコ地方",
      "サン・ビセンテ",
      "サン・サルバドル"
    ],
    "languages": [
      "スペイン語"
    ],
    "tags": [
      "アナスタシオ・アキノ",
      "ノヌアルコ族",
      "1833年反乱",
      "植民地秩序",
      "中央アメリカ連邦共和国",
      "先住民抵抗",
      "エルサルバドル史",
      "19世紀"
    ]
  },
  {
    "slug": "roberts-voyages-central-america-1827",
    "title": "中央アメリカ東岸および内陸部航海旅行記",
    "originalTitle": "Narrative of Voyages and Excursions on the East Coast and in the Interior of Central America",
    "subtitle": "サン・フアン川・ニカラグア湖・レオンへの旅",
    "author": "オーランド・W・ロバーツ",
    "originalAuthor": "Orlando W. Roberts",
    "series": "ORLANDO W. ROBERTS · 1827",
    "originalPublication": "エディンバラ、コンスタブル社刊。ロンドン、ハースト・チャンス社取次、1827年",
    "year": 1827,
    "extent": "PDF 202頁・前付・序文xiii–xxiii頁・本文25–294頁・付録295–302頁・原刊頁標識289件・原刊画像2点・折込地図1点",
    "description": "中央アメリカ東岸を航海し、サン・フアン川を遡ってニカラグア湖を横断し、レオンへ至った交易者オーランド・W・ロバーツの旅行記の全訳です。前付、エドワード・アーヴィングの序文、本文全14章、折込地図、付録注IからVIII、奥付を収録し、モスキート海岸、パナマ、コスタリカ、ニカラグア、ホンジュラスの地域・交易・先住民社会を記録します。",
    "cover": "publications/roberts-voyages-central-america-1827/cover.jpg",
    "pdf": "publications/roberts-voyages-central-america-1827/Orlando_W_Roberts_Narrative_of_Voyages_and_Excursions_1827_Japanese_Complete_Translation.pdf",
    "epub": "publications/roberts-voyages-central-america-1827/Orlando_W_Roberts_Narrative_of_Voyages_and_Excursions_1827_Japanese_Complete_Translation.epub",
    "pageCount": 202,
    "figureCount": 3,
    "plateCount": 0,
    "types": [
      "旅行記",
      "地誌",
      "交易史料",
      "一次史料"
    ],
    "regions": [
      "中央アメリカ",
      "パナマ",
      "コスタリカ",
      "ニカラグア",
      "ホンジュラス",
      "カリブ海岸"
    ],
    "languages": [
      "英語"
    ],
    "tags": [
      "モスキート海岸",
      "サン・フアン川",
      "ニカラグア湖",
      "レオン",
      "先住民交易",
      "航海",
      "19世紀"
    ]
  },
  {
    "slug": "villavicencio-luz-metodo-idolatras-1692",
    "title": "偶像崇拝者を告解させ、偶像崇拝を根絶するための光と方法",
    "originalTitle": "Luz y método de confesar idólatras y destierro de idolatrías",
    "subtitle": "1692年プエブラ初版・前付・第一部22章・ナワトル語告解76問・説教4篇・末尾索引",
    "author": "ディエゴ・ハイメス・リカルド・ビリャビセンシオ",
    "originalAuthor": "Diego Jaimes Ricardo Villavicencio",
    "series": "LUZ Y MÉTODO · PUEBLA 1692",
    "originalPublication": "プエブラ・デ・ロス・アンヘレス、ディエゴ・フェルナンデス・デ・レオン印刷所、1692年",
    "year": 1692,
    "extent": "PDF 218頁・前付23頁・第一部1–136頁（37–39頁・132頁欠番）・第二部1–51頁・末尾索引・底本位置標識213件・原刊画像2点",
    "description": "偶像崇拝者の告解と偶像崇拝の根絶を目的として、司牧者・聴罪司祭向けに編まれた1692年刊宗教書の全訳です。前付、第一部22章、ナワトル語による告解質問76問、説教4篇、供犠・迷信一覧35項、警告、末尾索引を原刊順に収録しました。後刷りの一部にのみ加えられたフランシスコ・ヌニェス・デ・ラ・ベガ書簡は、補入であることを明示して収録しています。",
    "cover": "publications/villavicencio-luz-metodo-idolatras-1692/cover.jpg",
    "pdf": "publications/villavicencio-luz-metodo-idolatras-1692/Diego_Jaimes_Ricardo_Villavicencio_Luz_y_metodo_1692_Japanese_Complete_Translation.pdf",
    "epub": "publications/villavicencio-luz-metodo-idolatras-1692/Diego_Jaimes_Ricardo_Villavicencio_Luz_y_metodo_1692_Japanese_Complete_Translation.epub",
    "pageCount": 218,
    "figureCount": 2,
    "plateCount": 0,
    "types": [
      "宗教書",
      "告解問答",
      "宣教資料",
      "言語資料",
      "一次史料"
    ],
    "regions": [
      "メキシコ",
      "ヌエバ・エスパーニャ",
      "プエブラ"
    ],
    "languages": [
      "スペイン語",
      "ナワトル語",
      "ラテン語"
    ],
    "tags": [
      "偶像崇拝",
      "告解",
      "ナワトル語",
      "迷信",
      "先住民宗教",
      "宣教",
      "17世紀"
    ]
  },
  {
    "slug": "alva-confessionario-mayor-menor-1634",
    "title": "ナワトル語大・小告解問答",
    "originalTitle": "Confessionario mayor, y menor en lengua mexicana. Y pláticas contra las supersticiones de idolatría, que el día de hoy han quedado a los naturales desta Nueva España, e instrucción de los santos sacramentos…",
    "subtitle": "1634年メキシコ初版・前付・大告解問答・小告解問答・秘跡講話・四つの祈り 日本語全訳",
    "author": "バルトロメ・デ・アルバ",
    "originalAuthor": "Bartolomé de Alva",
    "series": "CONFESSIONARIO MAYOR Y MENOR · 1634",
    "originalPublication": "メキシコ、フランシスコ・サルバゴ、1634年",
    "year": 1634,
    "extent": "PDF 66頁・原刊第1–51葉・無葉番号最終葉・底本位置標識57件・原刊画像12点",
    "description": "バルトロメ・デ・アルバがナワトル語とスペイン語の対向二欄で編んだ告解・秘跡指南書の日本語全訳です。原標題紙、印刷特許・許可・認可、献辞、大告解問答、小告解問答、七つの秘跡に関する講話、言語上の注記、四つの祈り、奥付を原刊順に収録し、欄外講話と欄外注も対応位置へ移して明示しました。",
    "cover": "publications/alva-confessionario-mayor-menor-1634/cover.jpg",
    "pdf": "publications/alva-confessionario-mayor-menor-1634/Bartolome_de_Alva_Confessionario_1634_Japanese_Complete_Translation.pdf",
    "epub": "publications/alva-confessionario-mayor-menor-1634/Bartolome_de_Alva_Confessionario_1634_Japanese_Complete_Translation.epub",
    "pageCount": 66,
    "figureCount": 12,
    "plateCount": 0,
    "types": [
      "宗教書",
      "告解問答",
      "言語資料",
      "宣教資料",
      "一次史料"
    ],
    "regions": [
      "メキシコ",
      "ヌエバ・エスパーニャ",
      "中央メキシコ"
    ],
    "languages": [
      "ナワトル語",
      "スペイン語",
      "ラテン語"
    ],
    "tags": [
      "ナワトル語",
      "告解",
      "偶像崇拝",
      "迷信",
      "秘跡",
      "宣教",
      "17世紀"
    ]
  },
  {
    "slug": "duran-historia-indias-nueva-espana-1581",
    "title": "ヌエバ・エスパーニャ諸インディア史",
    "originalTitle": "Historia de las Indias de Nueva España e islas de la tierra firme",
    "subtitle": "BNE Vitr/26/11 自筆稿・全三部・図版117点 日本語全訳",
    "author": "ディエゴ・デュラン",
    "originalAuthor": "Diego Durán",
    "series": "HISTORIA DE LAS INDIAS · BNE VITR/26/11",
    "originalPublication": "ヌエバ・エスパーニャ、1570–1581年成立、BNE Vitr/26/11 自筆稿",
    "year": 1581,
    "extent": "PDF 913頁・自筆稿 f.1v–f.345v・全三部・自筆稿位置標識661件・彩色図版117点",
    "description": "ディエゴ・デュランがメシカの起源、移住、諸都市との戦争と支配、神々、祭祀、暦法を記した自筆稿の日本語全訳です。BNE Vitr/26/11の葉順、章配置、段落、図像位置に従い、『ヌエバ・エスパーニャ諸インディア史』『儀礼と祭式の書』『古暦』の全三部を収録しています。全117図は人物・器物・文字・名標・彩色枠を欠かさない矩形の全図として収録しました。",
    "cover": "publications/duran-historia-indias-nueva-espana-1581/cover.jpg",
    "pdf": "publications/duran-historia-indias-nueva-espana-1581/Diego_Duran_Historia_de_las_Indias_Japanese_Complete_Translation.pdf",
    "epub": "publications/duran-historia-indias-nueva-espana-1581/Diego_Duran_Historia_de_las_Indias_Japanese_Complete_Translation.epub",
    "pageCount": 913,
    "figureCount": 117,
    "plateCount": 0,
    "types": ["歴史書", "年代記", "写本", "宗教史", "一次史料"],
    "regions": ["メキシコ", "ヌエバ・エスパーニャ", "中央メキシコ"],
    "languages": ["スペイン語", "ナワトル語"],
    "tags": [
      "メシカ",
      "アステカ",
      "テノチティトラン",
      "神々",
      "祭祀",
      "暦",
      "BNE Vitr/26/11",
      "16世紀"
    ]
  },
  {
    "slug": "romero-cultivo-cafe-chiapas-1893",
    "title": "チアパス南部沿岸におけるコーヒー栽培",
    "originalTitle": "Cultivo del café en la Costa Meridional de Chiapas",
    "subtitle": "1893年第四版・前付・本文5–163頁・付録・索引 日本語全訳",
    "author": "マティアス・ロメロ",
    "originalAuthor": "Matías Romero",
    "series": "CULTIVO DEL CAFÉ · 1893",
    "originalPublication": "メキシコ、勧業省印刷局、1893年第四版",
    "year": 1893,
    "extent": "PDF 158頁・原刊標題紙・第三版序・本文5–163頁・付録・索引・原刊頁標識167件・表31点・原刊画像1点",
    "description": "マティアス・ロメロが、チアパス南部沿岸、とりわけソコヌスコにおけるコーヒー栽培の自然条件、土地取得、労働、造成、収穫、加工、輸送、費用と収益を論じた実用書です。1893年第四版の原刊標題紙、第三版序、本文5–163頁、付録、索引末尾までを省略なく収録しています。",
    "cover": "publications/romero-cultivo-cafe-chiapas-1893/cover.jpg",
    "pdf": "publications/romero-cultivo-cafe-chiapas-1893/Matias_Romero_Cafe_Chiapas_Japanese_Complete_Translation.pdf",
    "epub": "publications/romero-cultivo-cafe-chiapas-1893/Matias_Romero_Cafe_Chiapas_Japanese_Complete_Translation.epub",
    "pageCount": 158,
    "figureCount": 1,
    "plateCount": 0,
    "types": [
      "農業書",
      "経済史",
      "一次史料"
    ],
    "regions": [
      "メキシコ",
      "チアパス",
      "ソコヌスコ"
    ],
    "languages": [
      "スペイン語"
    ],
    "tags": [
      "コーヒー",
      "コーヒー栽培",
      "農業",
      "ソコヌスコ",
      "チアパス",
      "労働",
      "19世紀"
    ]
  },
  {
    "slug": "g59-romances-senores-nueva-espana",
    "title": "ヌエバ・エスパーニャ諸侯の歌謡",
    "originalTitle": "Romances de los señores de la Nueva España",
    "subtitle": "Benson Latin American Collection Ms. G59 f. 1r–42v（f. 33欠）日本語全訳",
    "author": "作者未詳",
    "originalAuthor": "Anónimo",
    "series": "ROMANCES DE LOS SEÑORES  ·  MS. G59",
    "originalPublication": "1582年頃編纂。現存本は17世紀写本。",
    "year": 1582,
    "extent": "PDF 37頁・Benson Latin American Collection, Ms. G59 · f. 1r–42v（f. 33欠）・写本位置標識99件・図版なし",
    "description": "ヌエバ・エスパーニャのナワトル語歌謡を収めるMs. G59の日本語全訳です。慣例上の全36歌を写本順に収録し、第XXIX歌後の独立単位をXXIX-Aとして示しています。現存しない第33葉によって失われた第XXVIII歌後半は、並行本文『Cantares Mexicanos』第XL歌から補い、主底本と補完底本の範囲を明示しました。",
    "cover": "publications/g59-romances-senores-nueva-espana/cover.jpg",
    "pdf": "publications/g59-romances-senores-nueva-espana/G59_Romances_de_los_senores_Japanese_Complete_Translation.pdf",
    "epub": "publications/g59-romances-senores-nueva-espana/G59_Romances_de_los_senores_Japanese_Complete_Translation.epub",
    "pageCount": 37,
    "figureCount": 0,
    "plateCount": 0,
    "types": [
      "歌謡集",
      "写本",
      "一次史料"
    ],
    "regions": [
      "メキシコ",
      "ヌエバ・エスパーニャ",
      "中央メキシコ"
    ],
    "languages": [
      "ナワトル語",
      "スペイン語"
    ],
    "tags": [
      "ナワトル語",
      "歌謡",
      "ネサワルコヨトル",
      "メシカ",
      "16世紀",
      "Ms. G59"
    ]
  },
  {
    "slug": "cantares-mexicanos-ms-1628-bis",
    "title": "メシコの歌謡",
    "originalTitle": "Cantares Mexicanos",
    "subtitle": "Biblioteca Nacional de México Ms. 1628 bis f. 1r–85r・全92歌日本語全訳",
    "author": "作者複数・編者未詳",
    "originalAuthor": "Autores múltiples; compilador anónimo",
    "series": "CANTARES MEXICANOS  ·  MS. 1628 BIS",
    "originalPublication": "16世紀後半成立。写本の転写年記は1597年と解される。",
    "year": 1597,
    "extent": "PDF 309頁・Biblioteca Nacional de México, Ms. 1628 bis · f. 1r–85r · 全92歌・写本位置標識169件・図版なし",
    "description": "複合写本『Cantares Mexicanos』の歌謡集部分、f. 1r–85rの全92歌・第1節から第1719節までを収める日本語全訳です。歌題、部立て、演奏指示、反復、歌唱音節、ラテン語句、固有名、節番号を保持し、全169葉面の位置標識を付しました。写本のf. 85v以降に続く非歌謡諸篇は本書の範囲外です。",
    "cover": "publications/cantares-mexicanos-ms-1628-bis/cover.jpg",
    "pdf": "publications/cantares-mexicanos-ms-1628-bis/Cantares_Mexicanos_Japanese_Complete_Translation.pdf",
    "epub": "publications/cantares-mexicanos-ms-1628-bis/Cantares_Mexicanos_Japanese_Complete_Translation.epub",
    "pageCount": 309,
    "figureCount": 0,
    "plateCount": 0,
    "types": [
      "歌謡集",
      "写本",
      "一次史料"
    ],
    "regions": [
      "メキシコ",
      "ヌエバ・エスパーニャ",
      "中央メキシコ"
    ],
    "languages": [
      "ナワトル語",
      "スペイン語",
      "ラテン語"
    ],
    "tags": [
      "ナワトル語",
      "歌謡",
      "メシカ",
      "テノチティトラン",
      "16世紀",
      "Ms. 1628 bis"
    ]
  },
  {
    slug: "bancroft-history-central-america-1886-1887",
    title: "中央アメリカ史",
    originalTitle: "History of Central America",
    subtitle: "全三巻合本版・1501–1887年 日本語全訳",
    author: "ヒューバート・ハウ・バンクロフト",
    originalAuthor: "Hubert Howe Bancroft",
    series: "HISTORY OF CENTRAL AMERICA · 1886–1887",
    originalPublication:
      "サンフランシスコ、The History Company、1886–1887年",
    year: 1886,
    extent:
      "PDF 2,585頁・全3巻98章・原刊頁標識2,334件・原注4,325件・図版75点・第I巻引用典拠一覧・第III巻索引",
    description:
      "ヒューバート・ハウ・バンクロフトが、スペイン勢力の到来と初期征服から植民地統治、独立、中央アメリカ連邦の解体、各共和国の1887年までを三巻で叙述した通史。原刊前付、全98章、原注4,325件、図表、第I巻引用典拠一覧、第III巻索引を一冊にまとめ、原刊頁標識2,334件を保持した日本語全訳・全三巻合本版です。",
    cover:
      "publications/bancroft-history-central-america-1886-1887/cover.jpg",
    pdf:
      "publications/bancroft-history-central-america-1886-1887/Hubert_Howe_Bancroft_History_of_Central_America_1886_1887_Japanese_Complete_Translation.pdf",
    epub:
      "publications/bancroft-history-central-america-1886-1887/Hubert_Howe_Bancroft_History_of_Central_America_1886_1887_Japanese_Complete_Translation.epub",
    pageCount: 2585,
    figureCount: 72,
    plateCount: 3,
    types: ["歴史書", "通史", "一次史料"],
    regions: [
      "中央アメリカ",
      "グアテマラ",
      "ホンジュラス",
      "エルサルバドル",
      "ニカラグア",
      "コスタリカ",
      "パナマ",
    ],
    languages: ["英語", "スペイン語"],
    tags: [
      "バンクロフト",
      "中央アメリカ史",
      "植民地史",
      "独立史",
      "グアテマラ",
      "ホンジュラス",
      "ニカラグア",
      "コスタリカ",
      "パナマ",
      "19世紀",
    ],
  },
  {
    slug: "remesal-historia-general-1619",
    title: "西インド総史",
    originalTitle:
      "Historia general de las Indias Occidentales y particular de la gobernación de Chiapa y Guatemala",
    subtitle:
      "1619年初版・前付、全11巻、巻末審査、章題表 日本語全訳",
    author: "アントニオ・デ・レメサル",
    series: "HISTORIA GENERAL · 1619",
    originalPublication: "マドリード、フランシスコ・デ・アングロ、1619年",
    year: 1619,
    extent:
      "PDF 2,130頁・原刊本文752頁・全11巻242章・前付・正誤表・巻末審査・章題表32頁・原刊標題紙1点",
    description:
      "ドミニコ会聖ビセンテ・デ・チアパおよびグアテマラ管区の成立と活動、チアパ・グアテマラ統治領の政治・社会・征服・宣教を叙述した1619年刊の大著。許可、特許、定価証明、正誤表、献辞、著者序、全11巻242章、欄外注、勅書・書簡などの引用文書、巻末審査、章題表を収録し、1619年初版の印刷頁標識と原刊固有の欠番・重複・逆行を保持しています。",
    cover: "publications/remesal-historia-general-1619/cover.jpg",
    pdf:
      "publications/remesal-historia-general-1619/Antonio_de_Remesal_Historia_General_1619_Japanese_Complete_Translation.pdf",
    epub:
      "publications/remesal-historia-general-1619/Antonio_de_Remesal_Historia_General_1619_Japanese_Complete_Translation.epub",
    pageCount: 2130,
    figureCount: 1,
    plateCount: 0,
    types: ["歴史書", "年代記", "教会史", "一次史料"],
    regions: [
      "グアテマラ",
      "チアパス",
      "ベラパス",
      "中部アメリカ",
      "メキシコ",
    ],
    languages: ["スペイン語", "ラテン語"],
    tags: [
      "ドミニコ会",
      "ラス・カサス",
      "チアパ",
      "グアテマラ",
      "ベラパス",
      "植民地史",
      "宣教史",
      "17世紀",
    ],
  },
  {
    slug: "san-buenaventura-arte-lengua-maya-1684",
    title: "マヤ語文法",
    originalTitle: "Arte de la lengua Maya",
    subtitle:
      "1684年メキシコ初版・標題紙・献呈・認可・検閲・本文p. 1–76 日本語全訳",
    author: "ガブリエル・デ・サン・ブエナベントゥラ",
    series: "ARTE DE LA LENGUA MAYA · 1684",
    originalPublication:
      "メキシコ、ベルナルド・カルデロン未亡人印刷所、1684年",
    year: 1684,
    extent:
      "PDF 131頁・無頁数前付18面・本文1–76頁・原刊標題紙1点・文法表・祈祷定型",
    description:
      "植民地期ユカテコ・マヤ語の刊本文法書。標題紙、献呈、認可・検閲、四活用、動詞の変異、代名詞・小辞、sum相当動詞、派生規則、聖体拝領・告解・洗礼・婚姻・終油の定型文まで、1684年初版の原刊順に収録し、マヤ語形・例文の原綴と原刊頁標識を保持しています。",
    cover:
      "publications/san-buenaventura-arte-lengua-maya-1684/cover.jpg",
    pdf:
      "publications/san-buenaventura-arte-lengua-maya-1684/Gabriel_de_San_Buenaventura_Arte_de_la_lengua_Maya_1684_Japanese_Complete_Translation.pdf",
    epub:
      "publications/san-buenaventura-arte-lengua-maya-1684/Gabriel_de_San_Buenaventura_Arte_de_la_lengua_Maya_1684_Japanese_Complete_Translation.epub",
    pageCount: 131,
    figureCount: 1,
    plateCount: 0,
    types: ["文法書", "言語資料", "宣教資料", "一次史料"],
    regions: ["ユカタン", "カンペチェ", "メキシコ", "マヤ地域"],
    languages: ["スペイン語", "マヤ語", "ラテン語"],
    tags: [
      "ユカテコ・マヤ語",
      "植民地期マヤ語",
      "フランシスコ会",
      "宣教言語学",
      "活用",
      "小辞",
      "祈祷文",
      "17世紀",
    ],
  },
  {
    slug: "atkins-voyage-guinea-1735",
    title: "ギニア、ブラジル、西インド諸島への航海",
    originalTitle:
      "A Voyage to Guinea, Brasil, and the West-Indies; in His Majesty's Ships, the Swallow and Weymouth",
    subtitle:
      "1735年初版・序文、本文、原注、正誤表、巻末広告 日本語全訳",
    author: "ジョン・アトキンズ",
    series: "A VOYAGE TO GUINEA · 1735",
    originalPublication: "ロンドン、1735年",
    year: 1735,
    extent:
      "PDF 207頁・原刊冒頭広告1頁・序文i–xxv頁・本文1–2頁、19–265頁・原注39件・表17点・正誤表・巻末広告6頁・原刊図像2点",
    description:
      "王立海軍外科医ジョン・アトキンズが、軍艦スワロー号・ウェイマス号による1721–1723年の航海を記した1735年刊行書。マデイラ、カナリア諸島、カーボベルデ、ギニア海岸、ブラジル、西インド諸島をめぐる航海、各地の社会・交易・自然・疾病に関する観察を収めます。冒頭広告、標題紙、序文、本文、原注、表、正誤表、巻末広告を省略なく訳し、原刊の標題紙と船図を収録しています。",
    cover: "publications/atkins-voyage-guinea-1735/cover.jpg",
    pdf:
      "publications/atkins-voyage-guinea-1735/John_Atkins_A_Voyage_to_Guinea_Brasil_and_the_West_Indies_1735_Japanese_Complete_Translation.pdf",
    epub:
      "publications/atkins-voyage-guinea-1735/John_Atkins_A_Voyage_to_Guinea_Brasil_and_the_West_Indies_1735_Japanese_Complete_Translation.epub",
    pageCount: 207,
    figureCount: 2,
    plateCount: 0,
    types: ["航海記", "旅行記", "植民地史", "民族誌"],
    regions: [
      "西アフリカ",
      "ギニア湾",
      "ブラジル",
      "カリブ海",
      "西インド諸島",
      "バルバドス",
      "ジャマイカ",
    ],
    languages: ["英語"],
    tags: [
      "大西洋世界",
      "奴隷貿易",
      "王立海軍",
      "航海史",
      "ギニア海岸",
      "ブラジル",
      "西インド諸島",
      "18世紀",
    ],
  },
  {
    slug: "wafer-new-voyage-isthmus-america-1699",
    title: "アメリカ地峡新航海記・地誌",
    originalTitle: "A New Voyage and Description of the Isthmus of America",
    subtitle:
      "ダリエン滞在、先住民社会、自然誌、南海航海・1699年初版 日本語全訳",
    author: "ライオネル・ウェイファー",
    series: "A NEW VOYAGE AND DESCRIPTION OF THE ISTHMUS OF AMERICA · 1699",
    originalPublication: "ロンドン、1699年",
    year: 1699,
    extent:
      "PDF 134頁・前付・本文1–224頁・索引7葉・正誤表・原刊銅版図4点・付載広告",
    description:
      "私掠船航海の途上でダリエン地峡に取り残されたライオネル・ウェイファーが、現地での滞在、先住民社会の風俗・言語・医療、地形、動植物、南海航海を記した1699年初版の日本語全訳。原刊標題紙、献辞、読者序、正誤表、本文、索引、巻末書籍広告、折込地図と銅版図を収録しています。",
    cover: "publications/wafer-new-voyage-isthmus-america-1699/cover.jpg",
    pdf:
      "publications/wafer-new-voyage-isthmus-america-1699/Lionel_Wafer_A_New_Voyage_1699_Japanese_Complete_Translation.pdf",
    epub:
      "publications/wafer-new-voyage-isthmus-america-1699/Lionel_Wafer_A_New_Voyage_1699_Japanese_Complete_Translation.epub",
    pageCount: 134,
    figureCount: 0,
    plateCount: 4,
    types: ["航海記", "地誌", "一次史料"],
    regions: ["ダリエン", "パナマ", "カリブ海", "太平洋"],
    languages: ["英語"],
    tags: ["クナ族", "ダリエン地峡", "私掠船", "自然誌", "折込地図", "銅版図"],
  },
  {
    slug: "marimon-lacandones-1695",
    title: "アントニオ・マルヒル修道士のラカンドン人報告（1695年）",
    originalTitle: "Fray Antonio Margil über die Lacandones, 1695",
    subtitle:
      "1882年刊・原刊130–132頁・導入・書簡抄訳・原注 日本語全訳",
    author: "セバスティアン・マリモン・イ・トゥドー",
    series: "ZEITSCHRIFT FÜR ETHNOLOGIE · 1882",
    originalPublication:
      "ベルリン、『Zeitschrift für Ethnologie』第14巻、1882年、130–132頁",
    year: 1882,
    extent: "PDF 3頁・原刊130–132頁・原注2件・図版なし",
    description:
      "セビーリャのインディアス総文書館で確認された1695年7月9日付書簡を紹介する短報。ラカンドン人の宗教儀礼、新火、供献、カシケの役割を記す導入・ドイツ語抄訳・原注を省略なく訳しています。",
    cover: "publications/marimon-lacandones-1695/cover.jpg",
    pdf:
      "publications/marimon-lacandones-1695/Marimon_Fr_Antonio_Margil_Lacandones_1695_Japanese_Complete_Translation.pdf",
    epub:
      "publications/marimon-lacandones-1695/Marimon_Fr_Antonio_Margil_Lacandones_1695_Japanese_Complete_Translation.epub",
    pageCount: 3,
    figureCount: 0,
    plateCount: 0,
    types: ["民族誌", "史料紹介", "短報"],
    regions: ["ラカンドン地方", "チアパス", "ペテン", "グアテマラ"],
    languages: ["ドイツ語", "スペイン語"],
    tags: [
      "ラカンドン人",
      "チョル人",
      "アントニオ・マルヒル",
      "宗教儀礼",
      "新火",
      "一次史料",
    ],
  },
  {
    slug: "figueroa-color-notebooks",
    title: "フィゲロア手稿ノート",
    originalTitle:
      "Colección Cuadernos de Colores de José María Figueroa Oreamuno",
    subtitle:
      "赤・緑・青・茶ノート・原資料画像466点 日本語訳・日本語訳注・影印版",
    author: "ホセ・マリア・フィゲロア・オレアムーノ",
    series: "CUADERNOS DE COLORES · 1870–1890",
    originalPublication:
      "サン・ホセ、コスタリカ国立公文書館運営委員会、2023年デジタル版（原手稿、19世紀後半）",
    year: 1870,
    extent: "公開用PDF 1,142頁・原資料画像466点・公式PDF4冊490頁",
    description:
      "コスタリカの風刺画家・系譜研究者・探検家ホセ・マリア・フィゲロアが残した彩色手稿ノートのうち、国立公文書館が2023年に公開した赤・緑・青・茶ノート全466画像を収録する日本語訳・影印版。公式前付、原資料画像、判読不能箇所を明示した日本語訳、日本語版側の編集注である日本語訳注を収めています。",
    cover: "publications/figueroa-color-notebooks/cover.jpg",
    pdf:
      "publications/figueroa-color-notebooks/Jose_Maria_Figueroa_Color_Notebooks_Japanese_Complete_Translation.pdf",
    epub:
      "publications/figueroa-color-notebooks/Jose_Maria_Figueroa_Color_Notebooks_Japanese_Complete_Translation.epub",
    pageCount: 1142,
    figureCount: 0,
    plateCount: 466,
    types: ["手稿", "風刺画集", "歴史資料", "一次史料"],
    regions: ["コスタリカ", "中央アメリカ"],
    languages: ["スペイン語"],
    tags: [
      "ホセ・マリア・フィゲロア",
      "彩色ノート",
      "政治風刺",
      "風刺画",
      "詩歌",
      "系譜",
      "原資料画像",
      "19世紀",
    ],
  },
  {
    slug: "figueroa-album",
    title: "フィゲロア・アルバム",
    originalTitle:
      "El polifacético Figueroa. Biografía y catálogo completo del Álbum",
    subtitle: "原資料307件・影印345画像頁 日本語全訳・日本語訳注",
    author: "ホセ・マリア・フィゲロア・オレアムーノ",
    series: "ÁLBUM DE FIGUEROA · 19世紀後半",
    originalPublication:
      "サン・ホセ、コスタリカ国立公文書館運営委員会、2021年デジタル版（原手稿、19世紀後半）",
    year: 1870,
    extent: "公開用軽量PDF 1,034頁・原資料307件・影印345画像頁",
    description:
      "コスタリカの探検家・系譜研究者・風刺画家ホセ・マリア・フィゲロアが編んだ《アルバム》の日本語全訳・影印版。地図、旅行記、歴史覚書、新聞切抜き、肖像、系譜図など、公式公開の原資料307件と、PDFを展開した影印345画像頁を収録。判読不能箇所を明示した日本語訳と、日本語版側の編集注である日本語訳注を収めています。",
    cover: "publications/figueroa-album/cover.jpg",
    pdf:
      "publications/figueroa-album/Jose_Maria_Figueroa_Album_Japanese_Complete_Translation.pdf",
    epub:
      "publications/figueroa-album/Jose_Maria_Figueroa_Album_Japanese_Complete_Translation.epub",
    pageCount: 1034,
    figureCount: 0,
    plateCount: 345,
    types: ["手稿", "地図集", "系譜資料", "歴史資料", "一次史料"],
    regions: ["コスタリカ", "中央アメリカ"],
    languages: ["スペイン語"],
    tags: [
      "ホセ・マリア・フィゲロア",
      "フィゲロア・アルバム",
      "地図",
      "旅行記",
      "系譜",
      "風刺画",
      "原資料画像",
      "19世紀",
    ],
  },
  {
    slug: "us-senate-central-america-correspondence-1853",
    title: "第32議会第2会期上院行政文書第27号",
    originalTitle:
      "Message from the President of the United States, Communicating, in Compliance with a Resolution of the Senate, Certain Correspondence in Relation to Central America",
    subtitle: "中央アメリカに関する往復書簡",
    author: "アメリカ合衆国国務省（編）",
    series: "SENATE EXECUTIVE DOCUMENT NO. 27 · 1853",
    originalPublication:
      "ワシントン、第32議会第2会期、上院行政文書第27号、1853年",
    year: 1853,
    extent:
      "PDF 118頁・原刊全106頁・大統領教書・国務長官報告・付属文書41件・比較表2点",
    description:
      "1853年、フィルモア大統領が上院決議に応じて提出した中央アメリカ関係外交文書集。1834年から1851年までの付属文書41件を収め、フアン・ガリンドの外交資格と任務、ベリーズ境界問題、モスキート海岸、ニカラグア運河と大洋間交通、クレイトン＝ブルワー条約をめぐる英米交渉を記録しています。大統領教書、国務長官報告、付属文書一覧、原刊本文を省略なく訳しました。",
    cover:
      "publications/us-senate-central-america-correspondence-1853/cover.jpg",
    pdf:
      "publications/us-senate-central-america-correspondence-1853/US_Senate_Executive_Document_27_Central_America_Correspondence_1853_Japanese_Complete_Translation.pdf",
    epub:
      "publications/us-senate-central-america-correspondence-1853/US_Senate_Executive_Document_27_Central_America_Correspondence_1853_Japanese_Complete_Translation.epub",
    pageCount: 118,
    figureCount: 0,
    plateCount: 0,
    types: ["文書集", "外交史", "政治史", "一次史料"],
    regions: [
      "中央アメリカ",
      "ベリーズ",
      "ホンジュラス",
      "ニカラグア",
      "グアテマラ",
      "エルサルバドル",
      "コスタリカ",
      "ユカタン",
    ],
    languages: ["英語"],
    tags: [
      "フアン・ガリンド",
      "ベリーズ境界問題",
      "モスキート海岸",
      "ニカラグア運河",
      "大洋間交通",
      "クレイトン＝ブルワー条約",
      "英米関係",
      "米国議会文書",
      "19世紀",
    ],
  },
  {
    slug: "williams-anglo-american-isthmian-diplomacy-1916",
    title: "中米地峡をめぐる英米外交",
    originalTitle: "Anglo-American Isthmian Diplomacy, 1815–1915",
    subtitle: "1916年刊・全11章、参考文献、索引 日本語全訳",
    author: "メアリー・ウィルヘルミン・ウィリアムズ",
    series: "ANGLO-AMERICAN ISTHMIAN DIPLOMACY · 1916",
    originalPublication:
      "ワシントン、American Historical Association／ロンドン、Oxford University Press、1916年",
    year: 1916,
    extent:
      "PDF 318頁・原刊前付vii–xiii頁・本文1–330頁・参考文献331–345頁・索引347–356頁・折込地図1点",
    description:
      "英国と米国が中央アメリカの地峡交通、ベリーズ、ベイ諸島、モスキート海岸、ニカラグア運河、パナマ運河をめぐって展開した1815年から1915年までの外交史。前付、全11章、原注、参考文献、索引を省略なく訳し、原刊198頁直後の色刷折込地図を収録しています。",
    cover:
      "publications/williams-anglo-american-isthmian-diplomacy-1916/cover.jpg",
    pdf:
      "publications/williams-anglo-american-isthmian-diplomacy-1916/Mary_Wilhelmine_Williams_Anglo_American_Isthmian_Diplomacy_1916_Japanese_Complete_Translation.pdf",
    epub:
      "publications/williams-anglo-american-isthmian-diplomacy-1916/Mary_Wilhelmine_Williams_Anglo_American_Isthmian_Diplomacy_1916_Japanese_Complete_Translation.epub",
    pageCount: 318,
    figureCount: 1,
    plateCount: 0,
    types: ["外交史", "国際関係史", "運河史", "歴史研究"],
    regions: ["中央アメリカ", "ベリーズ", "ニカラグア", "パナマ"],
    languages: ["英語"],
    tags: [
      "クレイトン＝ブルワー条約",
      "モスキート海岸",
      "英領ホンジュラス",
      "ニカラグア運河",
      "パナマ運河",
      "モンロー主義",
      "ガリンド",
      "19世紀",
    ],
  },
  {
    slug: "molina-costa-rica-new-granada-1853",
    title: "コスタリカとヌエバ・グラナダ",
    originalTitle:
      "Costa Rica and New Granada: An Inquiry into the Question of Boundaries",
    subtitle: "1853年初版・全5章、文書2点、付録 日本語全訳",
    author: "フェリペ・モリーナ",
    series: "COSTA RICA · 1853",
    originalPublication: "ワシントン、1853年",
    year: 1853,
    extent:
      "PDF 59頁・前付・本文7–54頁・全5章・文書2点・付録・原刊標題紙・折込地図1点",
    description:
      "コスタリカ外交官フェリペ・モリーナが、ヌエバ・グラナダとのボカ・トロ・チリキ境界問題と、ニカラグアとの国境・運河問題を論じた1853年の外交小冊子。前付、正誤表、索引、全5章、王室文書2点、付録、原注を省略なく訳し、原刊標題紙と折込地図を収録しています。",
    cover: "publications/molina-costa-rica-new-granada-1853/cover.svg",
    pdf:
      "publications/molina-costa-rica-new-granada-1853/Felipe_Molina_Costa_Rica_and_New_Granada_1853_Japanese_Complete_Translation.pdf",
    epub:
      "publications/molina-costa-rica-new-granada-1853/Felipe_Molina_Costa_Rica_and_New_Granada_1853_Japanese_Complete_Translation.epub",
    pageCount: 59,
    figureCount: 0,
    plateCount: 1,
    types: ["外交史", "国境史", "政治論", "一次史料"],
    regions: ["コスタリカ", "パナマ", "ニカラグア", "中央アメリカ"],
    languages: ["英語"],
    tags: [
      "国境問題",
      "ボカ・トロ",
      "チリキ",
      "モスキート海岸",
      "大洋間交通",
      "コロンビア＝中央アメリカ条約",
      "19世紀",
    ],
  },
  {
    slug: "squier-notes-central-america-1855",
    title: "中央アメリカ覚書",
    originalTitle:
      "Notes on Central America; Particularly the States of Honduras and San Salvador",
    subtitle: "1855年初版・全16章、雑録A–E、文献目録、索引 日本語全訳",
    author: "E・G・スクワイア",
    series: "NOTES ON CENTRAL AMERICA · 1855",
    originalPublication: "ニューヨーク、1855年",
    year: 1855,
    extent: "PDF 338頁・全16章・雑録A–E・文献目録・索引・図版／地図18点・表44点",
    description:
      "ホンジュラスとサンサルバドルを中心に、中部アメリカの地理・地形・気候・人口・資源・産業・先住民社会・古代遺跡をまとめ、計画中のホンジュラス大洋間鉄道を詳述した1855年刊行書。前付、全16章、雑録A–E、文献目録、索引、原注、全44表を省略なく訳し、本文図版、折込図、地図を収録しています。",
    cover: "publications/squier-notes-central-america-1855/cover.svg",
    pdf:
      "publications/squier-notes-central-america-1855/Squier_Notes_on_Central_America_1855_Japanese_Complete_Translation.pdf",
    epub:
      "publications/squier-notes-central-america-1855/Squier_Notes_on_Central_America_1855_Japanese_Complete_Translation.epub",
    pageCount: 338,
    figureCount: 18,
    plateCount: 0,
    types: ["地誌", "地理書", "交通史", "民族誌"],
    regions: ["中央アメリカ", "ホンジュラス", "エルサルバドル", "ニカラグア"],
    languages: ["英語"],
    tags: [
      "ホンジュラス大洋間鉄道",
      "フォンセカ湾",
      "サンサルバドル",
      "テグシガルパ",
      "人口統計",
      "先住民",
      "古代遺跡",
      "19世紀",
    ],
  },
  {
    slug: "valenzuela-lacandon-chol-1695",
    title: "ラカンドン征服およびチョル征服",
    originalTitle: "Conquista del Lacandón y Conquista del Chol",
    subtitle: "1695年ベルリン写本・全38章 日本語全訳",
    author: "ニコラス・デ・バレンスエラ",
    series: "RELACIÓN HISTÓRICA VERDADERA · 1695",
    originalPublication: "グアテマラ、1695年（写本）",
    year: 1695,
    extent: "PDF 500頁・全3冊38章・写本folio表示795件",
    description:
      "1695年、グアテマラ王国総裁ハシント・デ・バリオス・レアルによるラカンドン、チョルほかの帰順遠征を、随行したニコラス・デ・バレンスエラが記録した報告。ベルリン所蔵写本 Y 796 [4°] の標題、献辞、全3冊38章、章目次を日本語化し、写本のfolio表示、削除・挿入・欄外注に関する転写注を保持しています。現代編者による注、解説、付録、索引は収録していません。",
    cover: "publications/valenzuela-lacandon-chol-1695/cover.jpg",
    pdf: "publications/valenzuela-lacandon-chol-1695/valenzuela_lacandon_chol_ja.pdf",
    epub: "publications/valenzuela-lacandon-chol-1695/valenzuela_lacandon_chol_ja.epub",
    pageCount: 500,
    figureCount: 0,
    plateCount: 0,
    types: ["歴史書", "一次史料", "征服史"],
    regions: ["ラカンドン", "チアパス", "グアテマラ", "ペテン"],
    languages: ["スペイン語"],
    tags: [
      "ラカンドン人",
      "チョル人",
      "植民地期",
      "17世紀",
      "ベルリン写本",
    ],
  },
  {
    slug: "charnay-cites-et-ruines-americaines-1863",
    title: "アメリカの都市と廃墟",
    originalTitle: "Cités et ruines américaines",
    subtitle: "1863年刊・本文、注、図版解説 日本語全訳",
    author:
      "デジレ・シャルネ／ウジェーヌ・エマニュエル・ヴィオレ＝ル＝デュク",
    series: "CITÉS ET RUINES AMÉRICAINES · 1863",
    originalPublication: "パリ、1863年",
    year: 1863,
    extent:
      "PDF 391頁・原刊前付i–x頁・本文1–543頁・本文挿図13点・原刊図版49点",
    description:
      "フランス人写真家デジレ・シャルネが1858年から1861年のメキシコ旅行と遺跡調査をまとめ、ヴィオレ＝ル＝デュクの建築論を付した1863年刊行書。序文、建築論、全17章の旅行記、原注、図版解説、目次を全訳し、本文挿図13点と原刊図版49点を収録しています。図版は番号、尺度、文字、署名、余白を残して無裁断で収録し、図版V–VIとXLV–XLVIの連結パノラマは分割していません。",
    cover: "publications/charnay-cites-et-ruines-americaines-1863/cover.jpg",
    pdf: "publications/charnay-cites-et-ruines-americaines-1863/Charnay_Cites_et_Ruines_Americaines_1863_Japanese_Complete_Translation.pdf",
    epub: "publications/charnay-cites-et-ruines-americaines-1863/Charnay_Cites_et_Ruines_Americaines_1863_Japanese_Complete_Translation.epub",
    pageCount: 391,
    figureCount: 13,
    plateCount: 49,
    types: ["旅行記", "探検記", "考古学研究", "図版集"],
    regions: ["メキシコ", "オアハカ", "パレンケ", "ユカタン"],
    languages: ["フランス語"],
    tags: [
      "メキシコ考古学",
      "写真史",
      "ミトラ",
      "チチェン・イツァ",
      "ウシュマル",
      "連結パノラマ",
      "原刊図版",
    ],
  },
  {
    slug: "dupaix-antiquites-mexicaines-1834",
    title: "メキシコ古代遺物",
    originalTitle:
      "Antiquités mexicaines : relation des trois expéditions du capitaine Dupaix",
    subtitle: "1834–1836年刊・全2巻およびアトラス 日本語全訳",
    author:
      "ギヨーム・デュペ／アレクサンドル・ルノワール／デイヴィッド・ベイリー・ウォーデンほか",
    series: "ANTIQUITÉS MEXICAINES · 1834–1836",
    originalPublication: "パリ、1834–1836年",
    year: 1834,
    extent: "PDF 1181頁・本文全2巻・原刊アトラス174紙葉・口絵1点",
    description:
      "スペイン王の命により1805年から1807年に実施されたデュペ大尉の三回のメキシコ古代遺物調査と、ルノワール、ウォーデンほかの論考を収める大著。本文、注、諸文書、目次を全訳し、口絵と原刊アトラス174紙葉を番号・原語キャプション・縮尺・余白ごと無裁断で収録しています。",
    cover: "publications/dupaix-antiquites-mexicaines-1834/cover.jpg",
    pdf: "publications/dupaix-antiquites-mexicaines-1834/Dupaix_Antiquites_Mexicaines_1834_Japanese_Complete_Translation.pdf",
    epub: "publications/dupaix-antiquites-mexicaines-1834/Dupaix_Antiquites_Mexicaines_1834_Japanese_Complete_Translation.epub",
    pageCount: 1181,
    figureCount: 1,
    plateCount: 174,
    types: ["考古学研究", "探検記", "図版集"],
    regions: ["メキシコ", "パレンケ", "オアハカ"],
    languages: ["フランス語", "スペイン語"],
    tags: [
      "メキシコ考古学",
      "パレンケ遺跡",
      "ミトラ",
      "原刊アトラス",
      "一次史料",
    ],
  },
  {
    slug: "cogolludo-yucatan-1688",
    title: "ユカタン史",
    originalTitle: "Historia de Yucathan",
    subtitle: "1688年初版・本文、前付、巻章索引、主要事項索引 日本語訳",
    author: "ディエゴ・ロペス・デ・コゴリュード",
    series: "HISTORIA DE YUCATHAN · 1688",
    originalPublication: "マドリード、1688年",
    year: 1688,
    extent: "PDF 1310頁・全12巻223章・主要事項索引479項目・原刊図版2点",
    description:
      "1688年マドリード初版を基準に、前付、全12巻223章の本文、巻章索引、主要事項索引479項目を日本語化。原刊本文1–760頁の改頁位置と別刻扉・木版図を収録し、リフロー型EPUBも併載しています。",
    cover: "publications/cogolludo-yucatan-1688/cover.jpg",
    pdf: "publications/cogolludo-yucatan-1688/Cogolludo_Historia_de_Yucathan_1688_Japanese_Translation.pdf",
    epub: "publications/cogolludo-yucatan-1688/Cogolludo_Historia_de_Yucathan_1688_Japanese_Translation.epub",
    pageCount: 1310,
    figureCount: 2,
    plateCount: 0,
    types: ["歴史書", "年代記", "一次史料"],
    regions: ["ユカタン", "カンペチェ", "メキシコ"],
    languages: ["スペイン語"],
    tags: ["マヤ史", "植民地期", "フランシスコ会", "17世紀", "巻末索引"],
  },
  {
    slug: "villagutierre-itza-1701",
    title: "イツァ地方征服史",
    originalTitle:
      "Historia de la conquista de la provincia de el Itza, reducción y progressos de la de el Lacandón",
    subtitle: "1701年マドリード初版・第一部",
    author: "フアン・デ・ビジャグティエレ・ソト＝マヨール",
    series: "HISTORIA DE LA CONQUISTA · 1701",
    originalPublication: "1701年",
    year: 1701,
    extent: "861頁・本文10巻128章・原刊本文660頁・原注191件・索引937項・口絵1点",
    description:
      "グアテマラ王国とユカタン諸州との中間地域におけるイツァ、ラカンドンなどの征服・帰順を記した1701年刊の歴史書。扉、献辞、出版審査・許可、全巻章目録、祝辞・詩、本文10巻128章、原注、巻末の主要事項索引と奥付を収録しています。",
    cover: "publications/villagutierre-itza-1701/cover.jpg",
    pdf: "publications/villagutierre-itza-1701/villagutierre_itza_1701_ja.pdf",
    epub: "publications/villagutierre-itza-1701/villagutierre_itza_1701_ja.epub",
    pageCount: 861,
    figureCount: 0,
    plateCount: 1,
    types: ["歴史書", "一次史料", "征服史"],
    regions: ["ペテン", "ラカンドン", "ユカタン", "グアテマラ"],
    languages: ["スペイン語"],
    tags: [
      "イツァ族",
      "ラカンドン人",
      "カネク",
      "ドン・マルティン・デ・ウルスア",
      "17世紀",
    ],
  },
  {
    slug: "maler-usumacinta",
    title: "ウスマシンタ川流域中部の調査",
    originalTitle:
      "Researches in the Central Portion of the Usumatsintla Valley: Report of Explorations for the Museum, 1898–1900",
    subtitle: "博物館のために実施した1898〜1900年の踏査報告",
    author: "テオベルト・マーラー",
    series: "PEABODY MUSEUM MEMOIRS · VOL. II",
    originalPublication: "1901・1903年",
    year: 1901,
    extent: "全2分冊・384頁・挿図68点・図版80点",
    description:
      "ピエドラス・ネグラス、ヤシュチランをはじめとするウスマシンタ川流域の遺跡踏査記録。公開英語刊本からの日本語重訳で、原刊の本文挿図と写真図版を収録しています。",
    cover: "publications/maler-usumacinta/cover.jpg",
    pdf: "publications/maler-usumacinta/Maler_Usumacinta_Japanese_Translation.pdf",
    epub: "publications/maler-usumacinta/Maler_Usumacinta_Japanese_Translation.epub",
    pageCount: 384,
    figureCount: 68,
    plateCount: 80,
    types: ["調査報告", "遺跡踏査"],
    regions: ["ウスマシンタ川流域", "メキシコ", "グアテマラ"],
    languages: ["英語"],
    tags: ["マヤ考古学", "ピエドラス・ネグラス", "ヤシュチラン", "写真図版"],
  },
  {
    slug: "maler-upper-usumacinta",
    title: "ウスマシンタ上流部および隣接地域の探検",
    originalTitle:
      "Explorations of the Upper Usumatsintla and Adjacent Region: Altar de Sacrificios; Seibal; Itsimté-Sácluk; Cankuen",
    subtitle:
      "アルタル・デ・サクリフィシオス／セイバル／イツィムテ＝サクルク／カンクエン",
    author: "テオベルト・マーラー",
    series: "PEABODY MUSEUM MEMOIRS · VOL. IV · NO. 1",
    originalPublication: "1908年",
    year: 1908,
    extent: "83頁・本文図8点・概略図1点・図版13葉",
    description:
      "ウスマシンタ川上流部と隣接地域における1904〜1905年の踏査報告。4遺跡の本文全訳に加え、原刊の本文図、概略図、写真図版I〜XIIIを完全収録しています。",
    cover: "publications/maler-upper-usumacinta/cover.jpg",
    pdf: "publications/maler-upper-usumacinta/Maler_Upper_Usumacinta_1908_Complete_Japanese_Translation.pdf",
    epub: "publications/maler-upper-usumacinta/Maler_Upper_Usumacinta_1908_Complete_Japanese_Translation.epub",
    pageCount: 83,
    figureCount: 9,
    plateCount: 13,
    types: ["調査報告", "遺跡踏査"],
    regions: ["ウスマシンタ川流域", "ペテン", "グアテマラ"],
    languages: ["英語"],
    tags: ["マヤ考古学", "セイバル", "カンクエン", "写真図版"],
  },
  {
    slug: "morelet-1857",
    title: "中央アメリカ、キューバ島およびユカタン紀行",
    originalTitle:
      "Voyage dans l’Amérique centrale, l’Île de Cuba et le Yucatan",
    subtitle: "1857年刊・全2巻 日本語全訳",
    author: "ピエール＝マリー＝アルテュール・モルレ",
    series: "VOYAGE DANS L’AMÉRIQUE CENTRALE · 1857",
    originalPublication: "1857年",
    year: 1857,
    extent: "全2巻・538頁・章頭図版22点・楽譜2頁・折込地図1点",
    description:
      "キューバからベリーズ、ペテン、グアテマラ、ユカタンへ至る旅行記。原刊2巻の本文、原注、巻末注、付録、原刊目次を全訳し、章頭図版、民族旋律譜、折込地図を完全収録しています。",
    cover: "publications/morelet-1857/cover.jpg",
    pdf: "publications/morelet-1857/Morelet_1857_Japanese_Complete_Translation.pdf",
    epub: "publications/morelet-1857/Morelet_1857_Japanese_Complete_Translation.epub",
    pageCount: 538,
    figureCount: 22,
    plateCount: 3,
    types: ["旅行記", "探検記", "博物誌"],
    regions: ["中央アメリカ", "キューバ", "ユカタン", "ペテン"],
    languages: ["フランス語"],
    tags: ["民族誌", "自然誌", "折込地図", "楽譜"],
  },
  {
    slug: "morelet-exploration-guatemala-1850",
    title: "グアテマラ探検",
    originalTitle: "Voyage scientifique. Exploration du Guatemala",
    subtitle:
      "1850年刊・アカデミー委員会報告・原刊430–433頁 日本語全訳",
    author:
      "ピエール＝マリー＝アルテュール・モルレ／アシル・ヴァランシエンヌ",
    series: "EXPLORATION DU GUATEMALA · ACADÉMIE DES SCIENCES · 1850",
    originalPublication:
      "パリ、『Comptes rendus hebdomadaires des séances de l’Académie des sciences』第30巻、1850年、430–433頁（ディジョン刊独立抜刷6頁）",
    year: 1850,
    extent: "PDF 5頁・原刊430–433頁・委員会報告・図版なし",
    description:
      "モルレの中央アメリカ旅行で採集された地質・動物・植物標本と図画を、フランス科学アカデミー委員会が審査した報告。ヴァランシエンヌが報告者を務めた1850年2月25日会合の本文、委員名、数値、分類群名を省略なく訳しています。",
    cover: "publications/morelet-exploration-guatemala-1850/cover.jpg",
    pdf:
      "publications/morelet-exploration-guatemala-1850/Morelet_Exploration_du_Guatemala_1850_Japanese_Complete_Translation.pdf",
    epub:
      "publications/morelet-exploration-guatemala-1850/Morelet_Exploration_du_Guatemala_1850_Japanese_Complete_Translation.epub",
    pageCount: 5,
    figureCount: 0,
    plateCount: 0,
    types: ["自然史報告", "探検報告", "学会報告"],
    regions: ["中央アメリカ", "グアテマラ", "ペテン", "キューバ", "ユカタン"],
    languages: ["フランス語"],
    tags: [
      "アルテュール・モルレ",
      "アシル・ヴァランシエンヌ",
      "フランス科学アカデミー",
      "自然史",
      "標本",
      "一次史料",
    ],
  },
  {
    slug: "morelet-testacea-novissima-pars-i-1849",
    title: "キューバ島および中央アメリカの新貝類（第I部）",
    originalTitle:
      "Testacea novissima insulae Cubanae et Americae Centralis. Pars I",
    subtitle: "1849年刊・標題・序文・第1–85番 日本語全訳",
    author: "ピエール＝マリー＝アルテュール・モルレ",
    series: "TESTACEA NOVISSIMA · PARS I · 1849",
    originalPublication:
      "パリ、J.-B. Baillière／ロンドン、H. Baillière、1849年（ディジョン、Imprimerie Loireau-Feuchot）",
    year: 1849,
    extent: "PDF 23頁・原刊5–31頁・貝類85種・図版なし",
    description:
      "モルレがキューバ島、ユカタン、グアテマラなどで採集した陸産・淡水産貝類85種を記載した第I部。標題、序文、属見出し、全85種の形態記載、寸法、産地、比較注、終記を省略なく訳しています。",
    cover:
      "publications/morelet-testacea-novissima-pars-i-1849/cover.jpg",
    pdf:
      "publications/morelet-testacea-novissima-pars-i-1849/Morelet_Testacea_Novissima_Pars_I_1849_Japanese_Complete_Translation.pdf",
    epub:
      "publications/morelet-testacea-novissima-pars-i-1849/Morelet_Testacea_Novissima_Pars_I_1849_Japanese_Complete_Translation.epub",
    pageCount: 23,
    figureCount: 0,
    plateCount: 0,
    types: ["貝類学", "自然史", "分類学", "学術刊行物"],
    regions: [
      "中央アメリカ",
      "グアテマラ",
      "ベラパス",
      "ペテン",
      "キューバ",
      "ユカタン",
    ],
    languages: ["フランス語", "ラテン語"],
    tags: [
      "軟体動物",
      "陸産貝類",
      "淡水産貝類",
      "新種記載",
      "自然史標本",
      "一次史料",
    ],
  },
  {
    slug: "morelet-testacea-novissima-pars-ii-1851",
    title: "キューバ島および中央アメリカの新貝類（第II部）",
    originalTitle:
      "Testacea novissima insulae Cubanae et Americae Centralis. Pars II",
    subtitle:
      "1851年刊・序文・第86–150番・訂正表・総索引 日本語全訳",
    author: "ピエール＝マリー＝アルテュール・モルレ",
    series: "TESTACEA NOVISSIMA · PARS II · 1851",
    originalPublication:
      "パリ、J.-B. Baillière／ロンドン、H. Baillière、1851年（ディジョン、Imprimerie Loireau-Feuchot）",
    year: 1851,
    extent:
      "PDF 21頁・原刊5–30頁・貝類65種・第I部訂正表・全150種索引・図版なし",
    description:
      "モルレの新貝類記載を完結する第II部。序文、属見出し、第86–150番の65種の形態記載、寸法、産地、比較注、第I部訂正表、全150種索引を省略なく訳しています。",
    cover:
      "publications/morelet-testacea-novissima-pars-ii-1851/cover.jpg",
    pdf:
      "publications/morelet-testacea-novissima-pars-ii-1851/Morelet_Testacea_Novissima_Pars_II_1851_Japanese_Complete_Translation.pdf",
    epub:
      "publications/morelet-testacea-novissima-pars-ii-1851/Morelet_Testacea_Novissima_Pars_II_1851_Japanese_Complete_Translation.epub",
    pageCount: 21,
    figureCount: 0,
    plateCount: 0,
    types: ["貝類学", "自然史", "分類学", "学術刊行物"],
    regions: [
      "中央アメリカ",
      "グアテマラ",
      "ベラパス",
      "ペテン",
      "キューバ",
      "ユカタン",
    ],
    languages: ["フランス語", "ラテン語"],
    tags: [
      "軟体動物",
      "陸産貝類",
      "淡水産貝類",
      "新種記載",
      "訂正表",
      "総索引",
      "一次史料",
    ],
  },
  {
    slug: "rockstroh-ukes",
    title: "ウケ一族の地への旅",
    originalTitle: "Viaje al país de los ukes",
    subtitle: "1881年発表・現存部分全訳",
    author: "エドウィン・ロックストロー",
    series: "VIAJE AL PAÍS DE LOS UKES · 1881",
    originalPublication: "1881年",
    year: 1881,
    extent: "71頁・底本 pp. 90–129（転載第8回まで）",
    description:
      "ペテン県ラ・リベルタードを発ち、ラカンドン地方へ向かった学術探検の旅行記。現在確認できる新聞転載第8回までを省略なく訳し、失われた後半は復元せず、史料の残存範囲を明示しています。",
    cover: "publications/rockstroh-ukes/cover.jpg",
    pdf: "publications/rockstroh-ukes/Rockstroh_Ukes_1881_Extant_Japanese_Translation.pdf",
    epub: "publications/rockstroh-ukes/Rockstroh_Ukes_1881_Extant_Japanese_Translation.epub",
    pageCount: 71,
    figureCount: 0,
    plateCount: 0,
    types: ["探検記", "旅行記"],
    regions: ["ペテン", "ラカンドン", "グアテマラ"],
    languages: ["スペイン語"],
    tags: ["新聞連載", "現存部分", "民族誌"],
  },
  {
    slug: "chambon-mexique",
    title: "メキシコのガスコーニュ人",
    originalTitle: "Un Gascon au Mexique",
    subtitle: "1892年刊・原刊全341頁 日本語全訳",
    author: "ルドヴィク・シャンボン",
    series: "UN GASCON AU MEXIQUE · 1892",
    originalPublication: "1892年",
    year: 1892,
    extent: "259頁・原刊扉1頁・譜例2頁・広告体裁1頁",
    description:
      "フランスを発ち、キューバ、ユカタン、タバスコ、チアパス、ベラクルスからメキシコ各地へ進む旅行記。原刊341頁の本文、原注、引用、歌詞、原刊目次を全訳し、扉と譜例・広告の原頁画像を無裁断で収録しています。",
    cover: "publications/chambon-mexique/cover.jpg",
    pdf: "publications/chambon-mexique/Chambon_Un_Gascon_au_Mexique_1892_Complete_Japanese_Translation.pdf",
    epub: "publications/chambon-mexique/Chambon_Un_Gascon_au_Mexique_1892_Complete_Japanese_Translation.epub",
    pageCount: 259,
    figureCount: 4,
    plateCount: 0,
    types: ["旅行記"],
    regions: ["メキシコ", "ユカタン", "タバスコ", "チアパス"],
    languages: ["フランス語"],
    tags: ["紀行文学", "譜例", "19世紀メキシコ"],
  },
  {
    slug: "arthes-peten-1893",
    title: "ペテン県概説",
    originalTitle: "Breve descripción del departamento del Petén",
    subtitle: "1893年原載・本文および付録",
    author: "フェデリコ・ギジェルモ・アルテス",
    series: "GEOGRAPHICAL DESCRIPTION · 1893",
    originalPublication: "1893年",
    year: 1893,
    extent: "29頁・原刊97-103頁・本文55段落・付録203項目",
    description:
      "ペテン県の地勢、河川・湖沼、地質、森林資源、考古遺跡、住民と産業を概説した1893年の地理報告。本文55段落に加え、シカゴ万国博覧会へ送付された物品・天然産物の出品目録203項目を省略なく収録しています。",
    cover: "publications/arthes-peten-1893/cover.jpg",
    pdf: "publications/arthes-peten-1893/arthes_peten_1893_ja.pdf",
    epub: "publications/arthes-peten-1893/arthes_peten_1893_ja.epub",
    pageCount: 29,
    figureCount: 0,
    plateCount: 0,
    types: ["地理報告", "博物誌", "一次史料"],
    regions: ["ペテン", "グアテマラ", "ウスマシンタ川流域"],
    languages: ["スペイン語"],
    tags: [
      "ペテン県",
      "自然誌",
      "森林資源",
      "考古学",
      "シカゴ万国博覧会",
      "出品目録",
    ],
  },
  {
    slug: "del-rio-palenque",
    title: "パレンケ近郊で発見された古代都市遺跡の記述",
    originalTitle:
      "Description of the Ruins of an Ancient City, Discovered near Palenque, in the Kingdom of Guatemala",
    subtitle: "1822年英語初版・全巻日本語訳",
    author: "アントニオ・デル・リオ／パブロ・フェリクス・カブレラ",
    series: "ARCHAEOLOGICAL REPORT & HISTORICAL ESSAY · 1822",
    originalPublication: "1822年",
    year: 1822,
    extent: "149頁・原刊本文 xiii＋128頁・図版17点",
    description:
      "1787年に実施されたデル・リオのパレンケ遺跡調査報告と、カブレラの歴史論考を併録した1822年ロンドン刊英語版の全巻日本語訳。前付、本文、付録、メキシコ年の表、補遺、全注記に加え、原刊図版17点を紙葉の周縁ごと無裁断で収録しています。",
    cover: "publications/del-rio-palenque/cover.jpg",
    pdf: "publications/del-rio-palenque/Del_Rio_Palenque_Ruins_1822_Complete_Japanese_Translation.pdf",
    epub: "publications/del-rio-palenque/Del_Rio_Palenque_Ruins_1822_Complete_Japanese_Translation.epub",
    pageCount: 149,
    figureCount: 0,
    plateCount: 17,
    types: ["調査報告", "歴史論考"],
    regions: ["パレンケ", "チアパス", "メキシコ"],
    languages: ["英語"],
    tags: ["マヤ考古学", "18世紀調査", "石版図版", "一次史料"],
  },
  {
    slug: "bourbourg-palenque-1866",
    title:
      "メキシコ古代遺跡――パレンケおよびメキシコ古代文明のその他の遺跡",
    originalTitle:
      "Monuments anciens du Mexique : Palenqué et autres ruines de l’ancienne civilisation du Mexique — Recherches sur les ruines de Palenqué et sur les origines de la civilisation du Mexique",
    subtitle: "1866年刊・本文、目次、図版解説 日本語全訳",
    author:
      "シャルル＝エティエンヌ・ブラッスール・ド・ブールブール／ジャン＝フレデリック・ド・ヴァルデック",
    series: "MONUMENTS ANCIENS DU MEXIQUE · 1866",
    originalPublication: "1866年",
    year: 1866,
    extent:
      "286頁・原図版56葉・本文挿図1点・二葉続き全体図5点・付属印刷物2葉",
    description:
      "ブラッスール・ド・ブールブールがパレンケ遺跡とメキシコ文明の起源を論じ、ヴァルデックの図版を伴って刊行した大著。序文、本文、目次、図版解説、注を省略なく訳し、原図版56葉、本文挿図、付属印刷物を無裁断で収録しています。",
    cover: "publications/bourbourg-palenque-1866/cover.jpg",
    pdf: "publications/bourbourg-palenque-1866/Bourbourg_Palenque_Complete_Japanese_Translation.pdf",
    epub: "publications/bourbourg-palenque-1866/Bourbourg_Palenque_Complete_Japanese_Translation.epub",
    pageCount: 286,
    figureCount: 3,
    plateCount: 61,
    types: ["考古学研究", "遺跡報告", "図版集"],
    regions: ["パレンケ", "チアパス", "メキシコ"],
    languages: ["フランス語"],
    tags: [
      "マヤ考古学",
      "パレンケ遺跡",
      "ヴァルデック",
      "原刊図版",
      "石版図版",
      "一次史料",
    ],
  },
  {
    slug: "esquinca-usumacinta",
    title: "ウスマシンタ川遠征日誌",
    originalTitle:
      "Diario seguido en la expedición del río Usumacinta, desde el pueblo del Palenque hasta su regreso",
    subtitle: "パレンケ村出発から帰還まで・1826年",
    author: "ホセ・マリア・エスキンカ",
    series: "DIARIO DE LA EXPEDICIÓN DEL RÍO USUMACINTA · 1826",
    originalPublication: "1826年記録／1988・2003年転写刊行",
    year: 1826,
    extent: "10頁・2003年版 pp. 54–57所収・図版なし",
    description:
      "1826年の遠征日誌から、ヤン・デ・フォスが公刊したパレンケ―ウスマシンタ区間を省略なく翻訳。1988年版と2003年版を照合して日付の誤植と末尾署名を校訂し、原遠征日誌全体ではなく刊本収録部分の全訳であることを明示しています。",
    cover: "publications/esquinca-usumacinta/cover.jpg",
    pdf: "publications/esquinca-usumacinta/Esquinca_Usumacinta_Expedition_1826_Published_Transcription_Complete_Japanese_Translation.pdf",
    epub: "publications/esquinca-usumacinta/Esquinca_Usumacinta_Expedition_1826_Published_Transcription_Complete_Japanese_Translation.epub",
    pageCount: 10,
    figureCount: 0,
    plateCount: 0,
    types: ["遠征日誌", "一次史料"],
    regions: ["ウスマシンタ川流域", "パレンケ", "チアパス"],
    languages: ["スペイン語"],
    tags: ["日誌", "史料校訂", "公刊部分"],
  },
  {
    slug: "galindo-ruins-palenque-literary-gazette-1831",
    title: "パレンケ遺跡",
    originalTitle: "Ruins of Palenque",
    subtitle:
      "1831年刊・原刊665–666頁＋翌号683頁・本文・二図・編集部追補 日本語全訳",
    author: "フアン・ガリンド",
    series: "RUINS OF PALENQUE · THE LITERARY GAZETTE · 1831",
    originalPublication:
      "ロンドン、『The Literary Gazette』第769号・第770号、1831年10月15日・22日",
    year: 1831,
    extent:
      "PDF 13頁・原刊665–666頁＋翌号683頁・原刊誌面2頁・本文内図2点",
    description:
      "ガリンドが1831年4月26日付で送ったパレンケ遺跡書簡。第769号665–666頁の本文、原刊誌面、本文内二図、編集部注を省略なく訳し、第770号683頁の訂正・補足記事とその注も別項として収録しています。1832年のフランス語版とは構成と内容の異なる独立した英語紙版です。",
    cover:
      "publications/galindo-ruins-palenque-literary-gazette-1831/cover.jpg",
    pdf:
      "publications/galindo-ruins-palenque-literary-gazette-1831/Galindo_Ruins_of_Palenque_Literary_Gazette_1831_Japanese_Complete_Translation.pdf",
    epub:
      "publications/galindo-ruins-palenque-literary-gazette-1831/Galindo_Ruins_of_Palenque_Literary_Gazette_1831_Japanese_Complete_Translation.epub",
    pageCount: 13,
    figureCount: 2,
    plateCount: 2,
    types: ["遺跡報告", "書簡", "新聞記事"],
    regions: ["パレンケ", "チアパス", "ペテン"],
    languages: ["英語"],
    tags: [
      "マヤ考古学",
      "パレンケ遺跡",
      "リテラリー・ガゼット",
      "原刊誌面",
      "一次史料",
    ],
  },
  {
    slug: "galindo-noticias-peten-1831",
    title: "ペテンに関する報告",
    originalTitle:
      "Noticias del Petén recogidas por su comandante, el C. J. Galindo",
    subtitle:
      "1831年刊・原刊257–260頁・本文・旅程表・人口表 日本語全訳",
    author: "フアン・ガリンド",
    series: "NOTICIAS DEL PETÉN · GACETA FEDERAL · 1831",
    originalPublication:
      "グアテマラ、『Gaceta Federal』第35号、1831年9月29日、257–260頁",
    year: 1831,
    extent: "PDF 9頁・原刊257–260頁・原刊冒頭画像1点・表2点",
    description:
      "ガリンドがペテンの地理、境界、河川・湖沼、交通路、人口、交易、征服史をまとめた四頁の報告。原刊本文、グアテマラ―ベリーズ間の旅程表、人口表を省略なく訳し、フランス国立図書館所蔵の原刊切抜き257頁画像を収録しています。",
    cover: "publications/galindo-noticias-peten-1831/cover.jpg",
    pdf:
      "publications/galindo-noticias-peten-1831/Galindo_Noticias_del_Peten_1831_Japanese_Complete_Translation.pdf",
    epub:
      "publications/galindo-noticias-peten-1831/Galindo_Noticias_del_Peten_1831_Japanese_Complete_Translation.epub",
    pageCount: 9,
    figureCount: 1,
    plateCount: 0,
    types: ["地理報告", "統計資料", "新聞記事"],
    regions: ["ペテン", "グアテマラ", "ベリーズ", "ウスマシンタ川流域"],
    languages: ["スペイン語"],
    tags: ["ペテン史", "交通路", "人口表", "ガセタ・フェデラル", "一次史料"],
  },
  {
    slug: "galindo-palenque-1832",
    title: "パレンケ遺跡に関する覚書",
    originalTitle:
      "Mémoire de M. Galindo, officier supérieur de la république de l’Amérique centrale, adressé à M. le secrétaire de la Société de géographie de Paris",
    subtitle: "1832年刊・原刊198–217頁＋別葉図版 日本語全訳",
    author: "フアン・ガリンド",
    series: "MÉMOIRE SUR LES RUINES DE PALENQUE · 1832",
    originalPublication: "1832年",
    year: 1832,
    extent:
      "PDF 25頁・ガリンド本文198–214頁・バエソ付録215–217頁・本文内模式図1点・別葉図版1葉（図1–12）",
    description:
      "ガリンドがパリ地理学協会へ送ったパレンケ遺跡報告。原刊198–214頁の本文・編集部脚注・祈祷文・語彙・数詞を省略なく訳し、本文内模式図と図1–12を含む別葉図版を外枠ごと無裁断で収録しています。原刊215–217頁のペルフェクト・バエソによるカスティーリャ語・マヤ語語彙表も、別著者の刊本付録として併載しています。",
    cover: "publications/galindo-palenque-1832/cover.jpg",
    pdf: "publications/galindo-palenque-1832/Galindo_Palenque_Memoir_1832_Complete_Japanese_Translation.pdf",
    epub: "publications/galindo-palenque-1832/Galindo_Palenque_Memoir_1832_Complete_Japanese_Translation.epub",
    pageCount: 25,
    figureCount: 1,
    plateCount: 1,
    types: ["遺跡報告", "覚書"],
    regions: ["パレンケ", "チアパス", "メキシコ"],
    languages: ["フランス語", "スペイン語", "マヤ語"],
    tags: ["マヤ考古学", "地理学協会", "別葉図版", "一次史料"],
  },
  {
    slug: "galindo-usumacinta-1833",
    title: "グアテマラのウスマシンタ川の記述",
    originalTitle: "A Description of the River Usumasinta, in Guatemala",
    subtitle: "1833年刊・原刊59–64頁＋全面地図 日本語全訳",
    author: "フアン・ガリンド",
    series: "A DESCRIPTION OF THE RIVER USUMASINTA · 1833",
    originalPublication: "1833年",
    year: 1833,
    extent: "15頁・全面地図1点・本文内線画3点",
    description:
      "ウスマシンタ川の流路・支流・沿岸地域を記した王立地理学協会誌掲載論文。本文12段落とパレンケ遺跡を扱う長大脚注11段落を全訳し、地図ラベル87件、全面地図、本文内線画3点を完全収録しています。",
    cover: "publications/galindo-usumacinta-1833/cover.jpg",
    pdf: "publications/galindo-usumacinta-1833/Galindo_River_Usumasinta_1833_Complete_Japanese_Translation.pdf",
    epub: "publications/galindo-usumacinta-1833/Galindo_River_Usumasinta_1833_Complete_Japanese_Translation.epub",
    pageCount: 15,
    figureCount: 3,
    plateCount: 1,
    types: ["地理報告", "河川記述"],
    regions: ["ウスマシンタ川流域", "グアテマラ", "パレンケ"],
    languages: ["英語"],
    tags: ["地理学協会", "河川地理", "全面地図", "一次史料"],
  },
  {
    slug: "galindo-caribs-central-america-1833",
    title: "中央アメリカのカリブ人についての報告",
    originalTitle: "Notice of the Caribs in Central America",
    subtitle: "1833年刊・原刊290–291頁・本文・語彙／数詞表 日本語全訳",
    author: "フアン・ガリンド",
    series: "NOTICE OF THE CARIBS IN CENTRAL AMERICA · 1833",
    originalPublication:
      "ロンドン、『王立地理学協会誌』第3巻、1833年、290–291頁",
    year: 1833,
    extent: "PDF 3頁・原刊290–291頁・カリブ語彙18項目・数詞I–X",
    description:
      "トルヒージョを中心とする中央アメリカのカリブ人について、移住、居住地、言語を記した短報。原刊290–291頁の本文を省略なく訳し、末尾のカリブ語彙18項目と数詞I–Xを表形式で収録しています。",
    cover: "publications/galindo-caribs-central-america-1833/cover.jpg",
    pdf:
      "publications/galindo-caribs-central-america-1833/Galindo_Notice_of_the_Caribs_Central_America_1833_Japanese_Complete_Translation.pdf",
    epub:
      "publications/galindo-caribs-central-america-1833/Galindo_Notice_of_the_Caribs_Central_America_1833_Japanese_Complete_Translation.epub",
    pageCount: 3,
    figureCount: 0,
    plateCount: 0,
    types: ["民族誌", "言語資料", "報告"],
    regions: ["中央アメリカ", "ホンジュラス", "ベリーズ", "カリブ海"],
    languages: ["英語", "カリブ語"],
    tags: ["ガリフナ", "カリブ人", "語彙", "数詞", "一次史料"],
  },
  {
    slug: "galindo-antiquities-peten-1834",
    title: "中央アメリカ、ペテン地方で発見された若干の古物についての短報",
    originalTitle:
      "A short Account of some Antiquities discovered in the District of Peten, in Central America",
    subtitle:
      "1834年刊・1831年書簡・原刊570–571頁＋図版LIX–LX 日本語全訳",
    author: "フアン・ガリンド",
    series: "ANTIQUITIES DISCOVERED IN PETEN · 1834",
    originalPublication:
      "ロンドン、『Archaeologia』第25巻、1834年、570–571頁",
    year: 1834,
    extent: "PDF 5頁・原刊570–571頁・図版2葉（LIX–LX）",
    description:
      "1831年10月28日付でガリンドがロンドン古物協会へ送った書簡。ペテン地方で収集したパレンケの漆喰浮彫と、ヤショー湖（原刊 Yashaw）の島の遺構・遺物を記述します。本文、宛先・署名、図版LIX・LXの標題と注記を省略なく訳し、図版二葉を収録しています。",
    cover: "publications/galindo-antiquities-peten-1834/cover.jpg",
    pdf:
      "publications/galindo-antiquities-peten-1834/Galindo_Antiquities_Peten_1834_Japanese_Complete_Translation.pdf",
    epub:
      "publications/galindo-antiquities-peten-1834/Galindo_Antiquities_Peten_1834_Japanese_Complete_Translation.epub",
    pageCount: 5,
    figureCount: 0,
    plateCount: 2,
    types: ["考古学報告", "書簡", "図版資料"],
    regions: ["ペテン", "パレンケ", "ヤショー湖"],
    languages: ["英語"],
    tags: [
      "マヤ考古学",
      "イツァ",
      "パレンケ",
      "ヤショー湖",
      "原刊図版",
      "一次史料",
    ],
  },
  {
    slug: "galindo-copan-full-report-1834",
    title: "コパン古代遺跡調査報告（1834年）",
    originalTitle:
      "Informe de la comisión científica formada para el reconocimiento de las antigüedades de Copán / Rapport sur les ruines de Copan et le pays voisin",
    subtitle:
      "スペイン語刊本＋BnFフランス語稿＋図版13面・異同表 日本語全訳",
    author: "フアン・ガリンド",
    series: "INFORME SOBRE LAS ANTIGÜEDADES DE COPÁN · 1834",
    originalPublication:
      "コパン、1834年6月19日／スペイン語本文1945年刊・フランス語稿1834年",
    year: 1834,
    extent:
      "PDF 44頁・スペイン語刊本217–228頁・BnF稿f101–f136・図版13面・異同表",
    description:
      "1834年1月のグアテマラ州政府命令に基づきガリンドが実施したコパン遺跡調査の完全報告。1945年刊スペイン語本文と、BnF所蔵のフランス語稿を相互に統合せず別本文として全訳し、地図、平面図、水彩全景、図1–26を含む図版13面と、両系統の主要異同表を収録しています。モーリー1920年英訳は異同照合にのみ用いています。",
    cover: "publications/galindo-copan-full-report-1834/cover.jpg",
    pdf:
      "publications/galindo-copan-full-report-1834/Galindo_Copan_Full_Report_1834_Japanese_Complete_Translation.pdf",
    epub:
      "publications/galindo-copan-full-report-1834/Galindo_Copan_Full_Report_1834_Japanese_Complete_Translation.epub",
    pageCount: 44,
    figureCount: 0,
    plateCount: 13,
    types: ["遺跡報告", "政府報告", "写本資料", "図版資料"],
    regions: ["コパン", "ホンジュラス", "グアテマラ", "中央アメリカ"],
    languages: ["スペイン語", "フランス語", "チョルティ語"],
    tags: [
      "マヤ考古学",
      "コパン遺跡",
      "フランス国立図書館",
      "原稿図版",
      "異同表",
      "一次史料",
    ],
  },
  {
    slug: "galindo-copan-literary-gazette-1835",
    title: "中央アメリカ――コパン遺跡通信",
    originalTitle: "Central America",
    subtitle: "1835年刊・原刊456–457頁・編集部注・本文・署名 日本語全訳",
    author: "フアン・ガリンド",
    series: "CENTRAL AMERICA · THE LITERARY GAZETTE · 1835",
    originalPublication:
      "ロンドン、『The Literary Gazette』第965号、1835年7月18日、456–457頁",
    year: 1835,
    extent: "PDF 7頁・原刊456–457頁・図版なし",
    description:
      "コパン遺跡から1834年6月19日付で送られ、『リテラリー・ガゼット』の「原通信」欄に掲載された書簡。遺跡の位置、建築、発掘、石碑、ガリンド自身の文明史観を記した本文と、末尾の編集部注を省略なく訳しています。",
    cover: "publications/galindo-copan-literary-gazette-1835/cover.jpg",
    pdf:
      "publications/galindo-copan-literary-gazette-1835/Galindo_Copan_Literary_Gazette_1835_Japanese_Complete_Translation.pdf",
    epub:
      "publications/galindo-copan-literary-gazette-1835/Galindo_Copan_Literary_Gazette_1835_Japanese_Complete_Translation.epub",
    pageCount: 7,
    figureCount: 0,
    plateCount: 0,
    types: ["遺跡報告", "書簡", "新聞記事"],
    regions: ["コパン", "ホンジュラス", "中央アメリカ"],
    languages: ["英語"],
    tags: ["マヤ考古学", "コパン遺跡", "リテラリー・ガゼット", "一次史料"],
  },
  {
    slug: "galindo-eruption-cosiguina-1835",
    title: "ニカラグア、コシグイナ火山の噴火について――1835年1月17日",
    originalTitle:
      "On the Eruption of the Volcano of Cosigüina, in Nicaragua, 17th January, 1835",
    subtitle: "1835年刊・原刊387–392頁・本文・原注 日本語全訳",
    author: "フアン・ガリンド",
    series: "ERUPTION OF THE VOLCANO OF COSIGÜINA · 1835",
    originalPublication:
      "ロンドン、『王立地理学協会誌』第5巻、1835年、387–392頁",
    year: 1835,
    extent: "PDF 8頁・原刊387–392頁・原刊冒頭画像1点",
    description:
      "1835年1月のコシグイナ火山大噴火について、ガリンド自身の観測書簡、レオンの公式報告、ラ・ウニオン司令官の報告、各地の降灰・暗闇・地震の記録をまとめた論文。原刊387–392頁と原注を省略なく訳し、論文冒頭の原刊画像を収録しています。",
    cover: "publications/galindo-eruption-cosiguina-1835/cover.jpg",
    pdf:
      "publications/galindo-eruption-cosiguina-1835/Galindo_Eruption_Cosiguina_1835_Japanese_Complete_Translation.pdf",
    epub:
      "publications/galindo-eruption-cosiguina-1835/Galindo_Eruption_Cosiguina_1835_Japanese_Complete_Translation.epub",
    pageCount: 8,
    figureCount: 1,
    plateCount: 0,
    types: ["火山報告", "自然災害記録", "地理学協会誌"],
    regions: ["コシグイナ火山", "ニカラグア", "中央アメリカ"],
    languages: ["英語"],
    tags: ["火山噴火", "降灰", "地震", "王立地理学協会", "一次史料"],
  },
  {
    slug: "galindo-ruins-copan-aas-1836",
    title: "中央アメリカのコパン遺跡",
    originalTitle: "The Ruins of Copan, in Central America",
    subtitle:
      "1836年刊・原刊543–550頁・刊行委員会注・書簡本文 日本語全訳",
    author: "フアン・ガリンド",
    series: "THE RUINS OF COPAN · ARCHAEOLOGIA AMERICANA · 1836",
    originalPublication:
      "ケンブリッジ（マサチューセッツ）、『Archaeologia Americana』第2巻、1836年、543–550頁",
    year: 1836,
    extent: "PDF 9頁・原刊543–550頁・原刊冒頭画像1点",
    description:
      "アメリカ古物協会紀要に掲載されたコパン遺跡報告。1835年6月19日付書簡の本文、刊行委員会注、宛先、署名・肩書を省略なく訳し、原刊543頁の論文標題画像を収録しています。1834年に政府へ提出されたスペイン語・フランス語の完全報告とは別個の英語短報です。",
    cover: "publications/galindo-ruins-copan-aas-1836/cover.jpg",
    pdf:
      "publications/galindo-ruins-copan-aas-1836/Galindo_Ruins_of_Copan_AAS_1836_Japanese_Complete_Translation.pdf",
    epub:
      "publications/galindo-ruins-copan-aas-1836/Galindo_Ruins_of_Copan_AAS_1836_Japanese_Complete_Translation.epub",
    pageCount: 9,
    figureCount: 1,
    plateCount: 0,
    types: ["遺跡報告", "書簡", "学会紀要"],
    regions: ["コパン", "ホンジュラス", "中央アメリカ"],
    languages: ["英語"],
    tags: ["マヤ考古学", "コパン遺跡", "アメリカ古物協会", "一次史料"],
  },
  {
    slug: "galindo-on-central-america-1836",
    title: "中央アメリカについて",
    originalTitle: "On Central America",
    subtitle:
      "1836年刊・原刊119–135頁・統計表・行政区画表・地図二葉 日本語全訳",
    author: "フアン・ガリンド",
    series: "ON CENTRAL AMERICA · 1836",
    originalPublication:
      "ロンドン、『王立地理学協会誌』第6巻、1836年、119–135頁",
    year: 1836,
    extent: "PDF 25頁・原刊119–135頁・原刊冒頭画像1点・地図2葉・表4点",
    description:
      "王立地理学協会誌に掲載された中央アメリカの地理・政治・人口・交通・産業の総説とコスタリカ各論。編集部前書き・注、ガリンド本文、統計表・行政区画表を省略なく訳し、原刊付図『中央アメリカのコスタリカ国略図』二葉を収録しています。",
    cover: "publications/galindo-on-central-america-1836/cover.jpg",
    pdf:
      "publications/galindo-on-central-america-1836/Galindo_On_Central_America_1836_Japanese_Complete_Translation.pdf",
    epub:
      "publications/galindo-on-central-america-1836/Galindo_On_Central_America_1836_Japanese_Complete_Translation.epub",
    pageCount: 25,
    figureCount: 1,
    plateCount: 2,
    types: ["地理報告", "統計資料", "地図資料"],
    regions: ["中央アメリカ", "コスタリカ", "ニカラグア", "グアテマラ"],
    languages: ["英語"],
    tags: [
      "中央アメリカ地理",
      "コスタリカ",
      "統計表",
      "原刊地図",
      "王立地理学協会",
    ],
  },
  {
    slug: "societe-geographie-central-america-report-1836",
    title: "中央アメリカの地理および古物に関する懸賞についての報告",
    originalTitle:
      "Rapport sur le concours relatif à la géographie et aux antiquités de l’Amérique centrale",
    subtitle:
      "1836年4月・原刊253–291頁・本文・脚注・結論五項 日本語全訳",
    author: "フランス地理学会委員会",
    series: "RAPPORT SUR LE CONCOURS · 1836",
    originalPublication:
      "パリ、『フランス地理学会紀要』第2シリーズ第5巻、1836年4月、253–291頁",
    year: 1836,
    extent: "PDF 31頁・原刊253–291頁・原刊頁表示39件・結論5項・図版なし",
    description:
      "フランス地理学会が1825年に設定した中央アメリカの地理・古物懸賞について、既往の探検・刊行物と応募資料を検討した1836年の委員会報告。フンボルト、デル・リオ、ウォルデック、デュペ、ガリンドらの調査、地図・図面を比較し、懸賞の判断と今後の調査方針を結論五項にまとめています。フアン・ガリンド本人の著作ではなく、委員会による独立した同時代資料です。",
    cover:
      "publications/societe-geographie-central-america-report-1836/cover.jpg",
    pdf:
      "publications/societe-geographie-central-america-report-1836/Societe_de_Geographie_Committee_Report_Central_America_1836_Japanese_Complete_Translation.pdf",
    epub:
      "publications/societe-geographie-central-america-report-1836/Societe_de_Geographie_Committee_Report_Central_America_1836_Japanese_Complete_Translation.epub",
    pageCount: 31,
    figureCount: 0,
    plateCount: 0,
    types: ["委員会報告", "考古学史", "地理学史"],
    regions: [
      "中央アメリカ",
      "グアテマラ",
      "チアパス",
      "ユカタン",
      "ペテン",
      "ホンジュラス",
      "メキシコ",
    ],
    languages: ["フランス語"],
    tags: [
      "地理学会",
      "懸賞",
      "パレンケ",
      "コパン",
      "フアン・ガリンド",
      "フレデリック・ウォルデック",
      "ギヨーム・デュペ",
      "19世紀",
    ],
  },
  {
    slug: "tribes-and-temples-vol-1",
    title: "部族と神殿　第I巻",
    originalTitle:
      "Tribes and Temples: A Record of the Expedition to Middle America Conducted by Tulane University in 1925, Volume I",
    subtitle: "1926年刊・原刊本文1–238頁 日本語全訳",
    author: "フランス・ブロム／オリヴァー・ラ・ファージ",
    series: "TRIBES AND TEMPLES · VOLUME I · 1926",
    originalPublication: "1926年",
    year: 1926,
    extent: "439頁・原刊本文1–238頁・番号付挿図194点・地図4点・図版6点",
    description:
      "チュレーン大学が1925年に実施した中央アメリカ調査の記録、第I巻。原刊本文1–238頁を省略なく訳し、番号付挿図1–194、地図I–IV、図版I–VI、原刊扉および章末カットを収録しています。",
    cover: "publications/tribes-and-temples-vol-1/cover.jpg",
    pdf: "publications/tribes-and-temples-vol-1/Tribes_and_Temples_Vol_I_Japanese_Complete_Translation.pdf",
    epub: "publications/tribes-and-temples-vol-1/Tribes_and_Temples_Vol_I_Japanese_Complete_Translation.epub",
    pageCount: 439,
    figureCount: 194,
    plateCount: 10,
    types: ["調査報告", "探検記", "民族誌"],
    regions: ["中央アメリカ", "メキシコ", "グアテマラ"],
    languages: ["英語"],
    tags: [
      "マヤ考古学",
      "1925年調査",
      "チュレーン大学",
      "原刊図版",
      "地図",
      "フランス・ブロム",
      "オリヴァー・ラ・ファージ",
    ],
  },
  {
    slug: "tribes-and-temples-vol-2",
    title: "部族と神殿　第II巻",
    originalTitle:
      "Tribes and Temples: A Record of the Expedition to Middle America Conducted by Tulane University in 1925, Volume II",
    subtitle: "1927年刊・原刊本文239–552頁 日本語全訳",
    author: "フランス・ブロム／オリヴァー・ラ・ファージ",
    series: "TRIBES AND TEMPLES · VOLUME II · 1927",
    originalPublication: "1927年",
    year: 1927,
    extent: "554頁・原刊本文239–552頁・番号付挿図180点・地図1点・図版1点",
    description:
      "チュレーン大学が1925年に実施した中央アメリカ調査の記録、第II巻。原刊本文239–552頁を省略なく訳し、番号付挿図195–374、地図V、図版VII、原刊扉および章末カットを収録しています。",
    cover: "publications/tribes-and-temples-vol-2/cover.jpg",
    pdf: "publications/tribes-and-temples-vol-2/Tribes_and_Temples_Vol_II_Japanese_Complete_Translation.pdf",
    epub: "publications/tribes-and-temples-vol-2/Tribes_and_Temples_Vol_II_Japanese_Complete_Translation.epub",
    pageCount: 554,
    figureCount: 180,
    plateCount: 2,
    types: ["調査報告", "探検記", "民族誌"],
    regions: ["中央アメリカ", "メキシコ", "グアテマラ"],
    languages: ["英語"],
    tags: [
      "マヤ考古学",
      "1925年調査",
      "チュレーン大学",
      "原刊図版",
      "地図",
      "フランス・ブロム",
      "オリヴァー・ラ・ファージ",
    ],
  },
  {
    slug: "egan-wyer-1930",
    title:
      "テノシケ・ピエドラス・ネグラス間の地形図と付属文書",
    originalTitle:
      "Topographical Map of Land Between Tenosique & Piedras Negras, Showing Trails & Projected Cart Roads",
    subtitle: "1930–1931年・全107画像頁 日本語全訳",
    author: "T・イーガン＝ワイアー",
    series: "PENN MUSEUM ARCHIVES · PU-MU.1105 · BOX 1 · FOLDER 6",
    originalPublication: "1930–1931年作成（未刊アーカイブ資料）",
    year: 1930,
    extent:
      "201頁・訳文93頁・原資料ファクシミリ107頁・図版10紙葉",
    description:
      "ペン博物館アーカイブに残る手描き地形図と付属文書群。雇用契約、書簡、電報、道路予備踏査報告、費用見積、構造略図、土器図など、フォルダー全107画像頁を順序どおり翻訳し、図版10紙葉と原資料ファクシミリを無裁断で収録しています。",
    cover: "publications/egan-wyer-1930/cover.jpg",
    pdf: "publications/egan-wyer-1930/Egan_Wyer_Topographical_Map_and_Accompanying_Documents_Japanese_Translation.pdf",
    epub: "publications/egan-wyer-1930/Egan_Wyer_Topographical_Map_and_Accompanying_Documents_Japanese_Translation.epub",
    pageCount: 201,
    searchOcrPageLimit: 93,
    figureCount: 10,
    plateCount: 0,
    types: ["地形図", "調査報告", "一次史料", "書簡"],
    regions: [
      "ウスマシンタ川流域",
      "テノシケ",
      "ピエドラス・ネグラス",
      "タバスコ",
      "グアテマラ",
    ],
    languages: ["英語", "スペイン語"],
    tags: [
      "道路調査",
      "計画荷車道",
      "ペン博物館",
      "アーカイブ資料",
      "原資料ファクシミリ",
      "無裁断図版",
    ],
  },
  {
    slug: "sapper-eastern-lacandons-1891",
    title: "東部ラカンドン人を訪ねて",
    originalTitle: "Ein Besuch bei den östlichen Lacandonen",
    subtitle: "1891年発表・『Das Ausland』掲載論文 日本語全訳",
    author: "カール・ザッパー",
    series: "DAS AUSLAND · NR. 45 · 1891",
    originalPublication: "1891年",
    year: 1891,
    extent: "10頁・本文11段落・原注3件・原誌ファクシミリ4頁",
    description:
      "チアパス東部とペテン西部のラカンドン人について、ザッパーがイサン集落とマンチェ・テナミト訪問を交えて報告した民族誌的記録。本文11段落、原注3件、末尾日付を省略なく訳し、原誌892–895頁の全4頁を紙面全体のまま無裁断で収録しています。",
    cover: "publications/sapper-eastern-lacandons-1891/cover.jpg",
    pdf: "publications/sapper-eastern-lacandons-1891/Sapper_Eastern_Lacandons_1891_Complete_Japanese_Translation.pdf",
    epub: "publications/sapper-eastern-lacandons-1891/Sapper_Eastern_Lacandons_1891_Complete_Japanese_Translation.epub",
    pageCount: 10,
    figureCount: 0,
    plateCount: 0,
    types: ["探検記", "民族誌", "一次史料"],
    regions: ["ラカンドン", "チアパス", "ペテン", "ウスマシンタ川流域"],
    languages: ["ドイツ語"],
    tags: [
      "ラカンドン人",
      "イサン",
      "マンチェ・テナミト",
      "リオ・デ・ラ・パシオン",
      "19世紀民族誌",
      "原誌ファクシミリ",
    ],
  },
  {
    slug: "friedrichsthal-yucatan-1841",
    title: "ユカタンの記念物",
    originalTitle: "Les Monuments de l’Yucatan",
    subtitle: "1841年初出誌・本文および原注 日本語全訳",
    author: "エマヌエル・フォン・フリードリヒスタール",
    series: "ARCHAEOLOGICAL REPORT · 1841",
    originalPublication: "パリ、1841年",
    year: 1841,
    extent: "PDF 19頁・原刊291-314頁・原注4件",
    description:
      "オーストリアの外交官フリードリヒスタールが、中央アメリカの地理と火山、ユカタン半島の自然環境、チチェン・イツァおよびウシュマルの建築、初期ダゲレオタイプ撮影の事情を報告した1841年の考古学・地理報告。初出誌291-314頁の本文、署名、原注4件を省略なく収録しています。",
    cover: "publications/friedrichsthal-yucatan-1841/cover.jpg",
    pdf: "publications/friedrichsthal-yucatan-1841/Friedrichsthal_Les_Monuments_de_l_Yucatan_1841_Japanese_Complete_Translation.pdf",
    epub: "publications/friedrichsthal-yucatan-1841/Friedrichsthal_Les_Monuments_de_l_Yucatan_1841_Japanese_Complete_Translation.epub",
    pageCount: 19,
    figureCount: 0,
    plateCount: 0,
    types: ["調査報告", "考古学研究", "一次史料"],
    regions: ["ユカタン", "チチェン・イツァ", "ウシュマル", "メキシコ"],
    languages: ["フランス語"],
    tags: [
      "マヤ考古学",
      "チチェン・イツァ",
      "ウシュマル",
      "ダゲレオタイプ",
      "19世紀",
      "原誌初出",
    ],
  },
  {
    slug: "means-yucatan-itzas-1917",
    title: "スペインによるユカタンおよびイツァ征服史",
    originalTitle: "History of the Spanish Conquest of Yucatan and of the Itzas",
    subtitle: "マヤ諸国の形成からタヤサル陥落まで・1917年初版 日本語全訳",
    author: "フィリップ・エインズワース・ミーンズ",
    series: "HISTORY · 1917",
    originalPublication: "マサチューセッツ州ケンブリッジ、1917年",
    year: 1917,
    extent: "PDF 267頁・原刊前付・本文1-206頁・原注50点・図版7点",
    description:
      "マヤ・イツァ諸国の形成、モンテホ父子によるユカタン征服、フランシスコ会士の布教遠征、アベンダーニョの旅行記、1697年のタヤサル陥落を扱うミーンズの歴史研究。初版の前付、本文1-206頁、付録、文献一覧、原注50点、図版7点を省略なく収録しています。",
    cover: "publications/means-yucatan-itzas-1917/cover.jpg",
    pdf: "publications/means-yucatan-itzas-1917/Philip_Ainsworth_Means_History_of_the_Spanish_Conquest_of_Yucatan_and_of_the_Itzas_1917_Japanese_Complete_Translation.pdf",
    epub: "publications/means-yucatan-itzas-1917/Philip_Ainsworth_Means_History_of_the_Spanish_Conquest_of_Yucatan_and_of_the_Itzas_1917_Japanese_Complete_Translation.epub",
    pageCount: 267,
    figureCount: 0,
    plateCount: 7,
    types: ["歴史書", "征服史", "歴史論考"],
    regions: ["ユカタン", "ペテン", "グアテマラ", "メキシコ", "カンペチェ", "ラカンドン"],
    languages: ["英語"],
    tags: [
      "イツァ",
      "タヤサル",
      "アベンダーニョ",
      "モンテホ",
      "マヤ史",
      "フランシスコ会",
      "スペイン征服",
    ],
  },
  {
    slug: "dunlop-central-america-1847",
    title: "中央アメリカ旅行記",
    originalTitle: "Travels in Central America",
    subtitle: "約3年間の滞在日誌、共和国史、および気候・産物・通商",
    author: "ロバート・グラスゴー・ダンロップ",
    series: "HISTORICAL TRAVEL NARRATIVE · 1847",
    originalPublication: "ロンドン、1847年",
    year: 1847,
    extent: "PDF 339頁・原刊前付・本文1-358頁・折込地図1点",
    description:
      "1844年から1846年までの中央アメリカ旅行・滞在日誌と、中央アメリカ共和国の独立から連邦解体後までの歴史、気候・産物・動物・地質・鉱物・火山・地震、食生活・住居・通商・財政・交通、人口・教育・宗教・司法についての記録。1847年初版の前付、本文1-358頁、折込地図1点を省略なく収録しています。",
    cover: "publications/dunlop-central-america-1847/cover.jpg",
    pdf: "publications/dunlop-central-america-1847/Robert_Glasgow_Dunlop_Travels_in_Central_America_1847_Japanese_Complete_Translation.pdf",
    epub: "publications/dunlop-central-america-1847/Robert_Glasgow_Dunlop_Travels_in_Central_America_1847_Japanese_Complete_Translation.epub",
    pageCount: 339,
    figureCount: 0,
    plateCount: 1,
    types: ["旅行記", "歴史書", "博物誌"],
    regions: [
      "中央アメリカ",
      "グアテマラ",
      "エルサルバドル",
      "ホンジュラス",
      "ニカラグア",
      "コスタ・リカ",
    ],
    languages: ["英語"],
    tags: [
      "中央アメリカ共和国",
      "19世紀",
      "旅行日誌",
      "共和国史",
      "自然誌",
      "折込地図",
    ],
  },
  {
    slug: "bandelier-yucatan-central-america-1881",
    title: "ユカタンおよび中央アメリカ文献解題",
    originalTitle: "Notes on the Bibliography of Yucatan and Central America",
    subtitle: "1881年別刷・原刊本文3–39頁 日本語全訳",
    author: "アドルフ・F・バンデリア",
    series: "BIBLIOGRAPHICAL STUDY · 1881",
    originalPublication: "マサチューセッツ州ウスター、1881年",
    year: 1881,
    extent: "PDF 63頁・原刊本文3–39頁・原注1件・原刊画像2点",
    description:
      "ユカタン、チアパス、グアテマラ、オアハカを対象に、16世紀から19世紀後半までの旅行記、年代記、報告書、地図、考古学・言語学文献を年代別に論評した文献解題。1881年別刷の外装表紙、標題紙、本文3–39頁、原注1件を省略なく収録しています。",
    cover: "publications/bandelier-yucatan-central-america-1881/cover.jpg",
    pdf: "publications/bandelier-yucatan-central-america-1881/Adolph_F_Bandelier_Notes_on_the_Bibliography_of_Yucatan_and_Central_America_1881_Japanese_Complete_Translation.pdf",
    epub: "publications/bandelier-yucatan-central-america-1881/Adolph_F_Bandelier_Notes_on_the_Bibliography_of_Yucatan_and_Central_America_1881_Japanese_Complete_Translation.epub",
    pageCount: 63,
    figureCount: 0,
    plateCount: 2,
    types: ["書誌", "研究史"],
    regions: ["ユカタン", "チアパス", "グアテマラ", "オアハカ", "中央アメリカ"],
    languages: ["英語"],
    tags: ["文献目録", "パレンケ", "コパン", "ミトラ", "19世紀"],
  },
  {
    slug: "rau-palenque-tablet-1879",
    title: "合衆国国立博物館所蔵パレンケ石板",
    originalTitle:
      "The Palenque Tablet in the United States National Museum",
    subtitle: "1879年初版・原刊本文1–81頁 日本語全訳",
    author: "チャールズ・ラウ",
    series: "SMITHSONIAN CONTRIBUTIONS TO KNOWLEDGE · NO. 331",
    originalPublication: "ワシントンD.C.、1879年",
    year: 1879,
    extent: "PDF 130頁・原刊本文1–81頁・原注151件・原刊画像22点",
    description:
      "合衆国国立博物館に収蔵されたパレンケ石板の来歴と図像を中心に、パレンケ探査史、十字架の神殿、メキシコ・ユカタン・中央アメリカの先住民文字を論じた研究。1879年初版の前付、本文1–81頁、原注151件、索引、原刊画像22点を省略なく収録しています。",
    cover: "publications/rau-palenque-tablet-1879/cover.jpg",
    pdf: "publications/rau-palenque-tablet-1879/Charles_Rau_The_Palenque_Tablet_in_the_United_States_National_Museum_1879_Japanese_Complete_Translation.pdf",
    epub: "publications/rau-palenque-tablet-1879/Charles_Rau_The_Palenque_Tablet_in_the_United_States_National_Museum_1879_Japanese_Complete_Translation.epub",
    pageCount: 130,
    figureCount: 20,
    plateCount: 2,
    types: ["考古学研究", "調査報告", "図版集"],
    regions: ["パレンケ", "チアパス", "メキシコ", "ユカタン", "中央アメリカ"],
    languages: ["英語"],
    tags: ["パレンケ石板", "十字架の神殿", "マヤ文字", "スミソニアン", "19世紀"],
  },
  {
    slug: "charencey-votan-1871",
    title: "ヴォタン神話",
    originalTitle:
      "Le mythe de Votan : étude sur les origines asiatiques de la civilisation américaine",
    subtitle: "1871年刊・本文、目次、追補、正誤表 日本語全訳",
    author: "イアサント・ド・シャランセ",
    series: "COMPARATIVE MYTHOLOGY · 1871",
    originalPublication: "アランソン、1871年",
    year: 1871,
    extent: "PDF 145頁・原刊本文7–144頁・原注242件・原刊画像4点",
    description:
      "ヴォタン伝承を中心に、メソアメリカ、東南アジア、インド、ギリシアの神話と習俗を比較し、アメリカ文明のアジア起源を論じた19世紀の比較神話研究。前付、本文、原注242件、目次、追補、正誤表を省略なく収録しています。",
    cover: "publications/charencey-votan-1871/cover.jpg",
    pdf: "publications/charencey-votan-1871/Hyacinthe_de_Charencey_Le_mythe_de_Votan_1871_Japanese_Complete_Translation.pdf",
    epub: "publications/charencey-votan-1871/Hyacinthe_de_Charencey_Le_mythe_de_Votan_1871_Japanese_Complete_Translation.epub",
    pageCount: 145,
    figureCount: 0,
    plateCount: 4,
    types: ["比較神話", "歴史論考"],
    regions: ["チアパス", "パレンケ", "中央アメリカ", "アジア"],
    languages: ["フランス語"],
    tags: ["ヴォタン", "比較神話", "文明起源論", "19世紀"],
  },
  {
    slug: "ordonez-creation-1907",
    title: "アメリカ異教体系による天地創造史",
    originalTitle:
      "Historia de la creación del cielo y de la tierra conforme al sistema de la gentilidad americana",
    subtitle: "1907年刊現存未完本・前付および本文1–120頁 日本語全訳",
    author: "ラモン・デ・オルドニェス・イ・アギアル",
    series: "HISTORIA DE LA CREACIÓN · 1907",
    originalPublication: "メキシコ、1907年",
    year: 1907,
    extent:
      "PDF 141頁・前付III–VIII頁・本文1–120頁・原注169件・原刊画像2点",
    description:
      "著者が「蛇族」の伝承と称する文書、ポポル・ヴー系の物語、植民地期年代記、聖書・古典文献を結びつけ、天地創造、洪水、諸民族の離散、先住民の起源、パレンケを論じた歴史的著作。ニコラス・レオン刊行の1907年版について、前付、本文1–120頁、原注169件を省略なく収録し、第9章途中で途切れる原刊末尾を補作せず明示しています。",
    cover: "publications/ordonez-creation-1907/cover.jpg",
    pdf: "publications/ordonez-creation-1907/Ramon_de_Ordonez_y_Aguiar_Historia_de_la_creacion_del_cielo_y_de_la_tierra_1907_Japanese_Complete_Translation.pdf",
    epub: "publications/ordonez-creation-1907/Ramon_de_Ordonez_y_Aguiar_Historia_de_la_creacion_del_cielo_y_de_la_tierra_1907_Japanese_Complete_Translation.epub",
    pageCount: 141,
    figureCount: 0,
    plateCount: 2,
    types: ["歴史書", "神話研究", "一次史料"],
    regions: ["チアパス", "パレンケ", "メキシコ", "グアテマラ"],
    languages: ["スペイン語"],
    tags: [
      "天地創造神話",
      "ポポル・ヴー",
      "ヴォタン",
      "先住民起源論",
      "現存未完本",
    ],
  },
  {
    slug: "le-plongeon-yucatan-1889",
    title: "ユカタンのあちこち",
    originalTitle: "Here and There in Yucatan: Miscellanies",
    subtitle: "雑録・1889年版本文1–146頁 日本語全訳",
    author: "アリス・D・ル・プロンジョン",
    series: "HERE AND THERE IN YUCATAN · 1889",
    originalPublication: "ニューヨーク、1889年",
    year: 1889,
    extent:
      "PDF 116頁・原刊本文1–146頁・原注9件・訳注2件・原刊画像18点",
    description:
      "ユカタン沿岸、ムヘーレス島、コスメル、カリブ人、井戸・洞窟、マヤの宗教・文献・共同体生活などを扱う紀行・雑録集。1889年J. W. Lovell版の序文、目次、本文1–146頁、原注、所蔵本外装、原刊表紙・前付、口絵と本文図版、巻末商品広告を省略なく収録しています。",
    cover: "publications/le-plongeon-yucatan-1889/cover.jpg",
    pdf: "publications/le-plongeon-yucatan-1889/Alice_D_Le_Plongeon_Here_and_There_in_Yucatan_Miscellanies_1889_Japanese_Complete_Translation.pdf",
    epub: "publications/le-plongeon-yucatan-1889/Alice_D_Le_Plongeon_Here_and_There_in_Yucatan_Miscellanies_1889_Japanese_Complete_Translation.epub",
    pageCount: 116,
    figureCount: 11,
    plateCount: 7,
    types: ["旅行記", "民族誌", "雑録"],
    regions: ["ユカタン", "ムヘーレス島", "コスメル", "ベリーズ"],
    languages: ["英語"],
    tags: [
      "マヤ文化",
      "カリブ人",
      "洞窟",
      "トロアノ絵文書",
      "原刊図版",
      "19世紀",
    ],
  },
  {
    slug: "fancourt-history-yucatan-1854",
    title: "ユカタン史",
    originalTitle:
      "The History of Yucatan, from Its Discovery to the Close of the Seventeenth Century",
    subtitle: "発見から十七世紀末まで・1854年初版 日本語全訳",
    author: "チャールズ・セント・ジョン・ファンコート",
    series: "THE HISTORY OF YUCATAN · 1854",
    originalPublication: "ロンドン、1854年",
    year: 1854,
    extent:
      "PDF 359頁・前付xvi頁・本文・付録1–340頁・原注215件・折込地図1点・付載広告32頁",
    description:
      "ユカタンの発見・征服から、植民地統治、宣教、ラカンドン・チョル地方への遠征、1697年のタヤサル征服までを記した歴史書。1854年ロンドン初版の前付、全21章、付録A–E、原注215件、折込地図に加え、所蔵本に合綴されたジョン・マレー社の書目広告32頁も省略なく収録しています。",
    cover: "publications/fancourt-history-yucatan-1854/cover.jpg",
    pdf: "publications/fancourt-history-yucatan-1854/Charles_St_John_Fancourt_The_History_of_Yucatan_1854_Japanese_Complete_Translation.pdf",
    epub: "publications/fancourt-history-yucatan-1854/Charles_St_John_Fancourt_The_History_of_Yucatan_1854_Japanese_Complete_Translation.epub",
    pageCount: 359,
    figureCount: 0,
    plateCount: 4,
    types: ["歴史書", "征服史", "一次史料"],
    regions: ["ユカタン", "ベリーズ", "ペテン", "グアテマラ", "ホンジュラス"],
    languages: ["英語", "スペイン語", "フランス語"],
    tags: [
      "ユカタン征服",
      "タヤサル",
      "イツァ族",
      "アベンダーニョ",
      "英領ホンジュラス",
      "折込地図",
    ],
  },
  {
    slug: "humboldt-vues-cordilleres-1810-1813",
    title: "コルディレラ山系の景観とアメリカ先住諸民族の記念物",
    originalTitle:
      "Vues des Cordillères, et monumens des peuples indigènes de l’Amérique",
    subtitle: "1810／1813年刊・序文、本文、図版、索引・正誤表 日本語全訳",
    author: "アレクサンダー・フォン・フンボルト",
    series: "VUES DES CORDILLÈRES · 1810／1813",
    originalPublication: "パリ、1810／1813年",
    year: 1810,
    extent:
      "PDF 477頁・序文I–XVI頁・本文1–350頁・図版I–LXIX（68葉）・本文挿図1点・索引・正誤表",
    description:
      "アレクサンダー・フォン・フンボルトが、メキシコ、アンデスほかの景観と、アステカ、インカ、ムイスカなどアメリカ先住諸民族の建築・彫刻・絵文書・暦を比較考察した図版大著。1810／1813年原刊の序文I–XVI頁、本文1–350頁、原注、索引、正誤表を全訳し、図版I–LXIXの68葉（VIII・IXは同一葉）と本文挿図1点を原刊順に収録しています。",
    cover:
      "publications/humboldt-vues-cordilleres-1810-1813/cover.jpg",
    pdf:
      "publications/humboldt-vues-cordilleres-1810-1813/Humboldt_Vues_des_Cordilleres_1810_1813_ja.pdf",
    epub:
      "publications/humboldt-vues-cordilleres-1810-1813/Humboldt_Vues_des_Cordilleres_1810_1813_ja.epub",
    pageCount: 477,
    figureCount: 1,
    plateCount: 68,
    types: ["考古学研究", "図版集", "旅行記", "民族誌"],
    regions: ["メキシコ", "中央アメリカ", "アンデス", "南アメリカ"],
    languages: ["フランス語"],
    tags: [
      "アステカ文明",
      "インカ文明",
      "ムイスカ",
      "コルディレラ",
      "絵文書",
      "比較考古学",
      "原刊図版",
    ],
  },
  {
    slug: "tozzer-mayas-lacandones-1907",
    title: "マヤ人とラカンドン人の比較研究",
    originalTitle: "A Comparative Study of the Mayas and the Lacandones",
    subtitle: "1907年初版・原刊前付、本文、原注、図版、参考文献 日本語全訳",
    author: "アルフレッド・M・トッザー",
    series: "A COMPARATIVE STUDY · 1907",
    originalPublication: "ニューヨーク、1907年",
    year: 1907,
    extent:
      "PDF 301頁・原刊前付v–xx頁・本文1–195頁・本文挿図49点・別丁図版29点",
    description:
      "アルフレッド・M・トッザーが、20世紀初頭のユカタン・マヤ人とチアパスのラカンドン人を、歴史、居住環境、社会、技術、芸術、宗教の諸面から比較した民族誌。1907年初版の原刊前付、本文1–195頁、原注、表、参考文献を全訳し、本文挿図1–49と別丁図版I–XXIXを収録しています。",
    cover: "publications/tozzer-mayas-lacandones-1907/cover.jpg",
    pdf:
      "publications/tozzer-mayas-lacandones-1907/Tozzer_A_Comparative_Study_of_the_Mayas_and_the_Lacandones_1907_Japanese_Complete_Translation.pdf",
    epub:
      "publications/tozzer-mayas-lacandones-1907/Tozzer_A_Comparative_Study_of_the_Mayas_and_the_Lacandones_1907_Japanese_Complete_Translation.epub",
    pageCount: 301,
    figureCount: 49,
    plateCount: 29,
    types: ["民族誌", "考古学研究", "比較研究"],
    regions: ["ユカタン", "チアパス", "ラカンドン"],
    languages: ["英語"],
    tags: [
      "マヤ人",
      "ラカンドン人",
      "民族学",
      "宗教",
      "物質文化",
      "原刊図版",
      "20世紀初頭",
    ],
  },
  {
    slug: "frias-mexico-guatemala-boundary-1883",
    title: "メキシコとグアテマラの国境問題",
    originalTitle: "Cuestión de límites entre México y Guatemala",
    subtitle: "1883年特別版・原刊本文、1882年条約、折込地図、肖像2点 日本語全訳",
    author: "イラリオン・フリアス・イ・ソト",
    series: "BOUNDARY QUESTION · 1883",
    originalPublication: "メキシコ、1883年",
    year: 1883,
    extent: "PDF 32頁・原刊本文3–40頁・折込地図1点・肖像2点",
    description:
      "イラリオン・フリアス・イ・ソトが、メキシコとグアテマラの国境問題、その交渉経過と1882年9月27日条約を論じ、後半にメキシコ外務長官イグナシオ・マリスカルの略伝を収めた著作。1883年特別版の本文、条約全文、署名を全訳し、折込地図と肖像2点を原刊位置に収録しています。",
    cover: "publications/frias-mexico-guatemala-boundary-1883/cover.jpg",
    pdf:
      "publications/frias-mexico-guatemala-boundary-1883/Frias_Cuestion_Limites_Mexico_Guatemala_1883_Japanese_Complete_Translation.pdf",
    epub:
      "publications/frias-mexico-guatemala-boundary-1883/Frias_Cuestion_Limites_Mexico_Guatemala_1883_Japanese_Complete_Translation.epub",
    pageCount: 32,
    figureCount: 1,
    plateCount: 2,
    types: ["国境史料", "条約史料", "外交史"],
    regions: ["メキシコ", "グアテマラ", "チアパス"],
    languages: ["スペイン語"],
    tags: [
      "国境問題",
      "1882年条約",
      "イグナシオ・マリスカル",
      "フスト・ルフィノ・バリオス",
      "折込地図",
      "肖像",
      "19世紀",
    ],
  },
  {
    slug: "pastrana-mexico-guatemala-boundary-1897",
    title: "グアテマラとの国境画定メキシコ委員会委員長報告書",
    originalTitle:
      "Informe que el jefe de la Comisión mexicana de límites con Guatemala…",
    subtitle: "1897年初版・原刊表紙、標題紙、本文、書簡、表、付録3–103頁 日本語全訳",
    author: "マヌエル・E・パストラーナ",
    series: "MEXICAN BOUNDARY COMMISSION · 1897",
    originalPublication: "メキシコ、1897年",
    year: 1897,
    extent: "PDF 88頁・原刊表紙・標題紙・本文3–103頁・表および付録",
    description:
      "グアテマラとの国境画定メキシコ委員会委員長マヌエル・E・パストラーナが、技師アルベルト・アマドールの科学作業に関する批判へ回答した開発省提出報告書。1897年初版の標題紙、本文、書簡、原注、数式、表、付録を全訳しています。",
    cover:
      "publications/pastrana-mexico-guatemala-boundary-1897/cover.jpg",
    pdf:
      "publications/pastrana-mexico-guatemala-boundary-1897/Pastrana_Informe_Comision_Mexicana_Limites_Guatemala_1897_Japanese_Complete_Translation.pdf",
    epub:
      "publications/pastrana-mexico-guatemala-boundary-1897/Pastrana_Informe_Comision_Mexicana_Limites_Guatemala_1897_Japanese_Complete_Translation.epub",
    pageCount: 88,
    figureCount: 0,
    plateCount: 0,
    types: ["国境史料", "委員会報告", "測量史料"],
    regions: ["メキシコ", "グアテマラ", "チアパス"],
    languages: ["スペイン語"],
    tags: [
      "国境画定",
      "メキシコ国境委員会",
      "アルベルト・アマドール",
      "測量",
      "天文観測",
      "計算表",
      "19世紀末",
    ],
  },
  {
    slug: "urrutia-guatemala-mexico-boundary-1900",
    title: "グアテマラとメキシコの国境問題に関する報告書",
    originalTitle: "Memoria sobre la cuestión de límites entre Guatemala y México",
    subtitle: "1900年初版・原刊略標題紙、標題紙、本文・付録3–325頁 日本語全訳",
    author: "グアテマラ・メキシコ国境委員会／クラウディオ・ウルティア",
    series: "BOUNDARY COMMISSION REPORT · 1900",
    originalPublication: "グアテマラ、1900年",
    year: 1900,
    extent:
      "PDF 328頁・原刊略標題紙・標題紙・本文および付録3–325頁・表17点",
    description:
      "グアテマラ・メキシコ国境委員会委員長クラウディオ・ウルティアが、16年にわたる国境画定事業の沿革、交渉、測量成果と付録資料を外務大臣へ報告した大部の委員会史料。1900年初版の本文、書簡、条約、署名、原注、表、目録、付録を全訳しています。",
    cover:
      "publications/urrutia-guatemala-mexico-boundary-1900/cover.jpg",
    pdf:
      "publications/urrutia-guatemala-mexico-boundary-1900/Urrutia_Memoria_Limites_Guatemala_Mexico_1900_Japanese_Complete_Translation.pdf",
    epub:
      "publications/urrutia-guatemala-mexico-boundary-1900/Urrutia_Memoria_Limites_Guatemala_Mexico_1900_Japanese_Complete_Translation.epub",
    pageCount: 328,
    figureCount: 0,
    plateCount: 0,
    types: ["国境史料", "委員会報告", "外交史"],
    regions: ["グアテマラ", "メキシコ", "チアパス"],
    languages: ["スペイン語"],
    tags: [
      "国境画定",
      "グアテマラ国境委員会",
      "1882年条約",
      "測量",
      "ソコヌスコ",
      "チアパス",
      "19世紀末",
    ],
  },
  {
    slug: "seler-sachs-auf-alten-wegen-1900",
    title: "メキシコとグアテマラの古道をゆく",
    originalTitle:
      "Auf alten Wegen in Mexiko und Guatemala: Reiseerinnerungen und Eindrücke aus den Jahren 1895-1897",
    subtitle: "1895-1897年の旅の思い出と印象・1900年初版 日本語全訳",
    author: "ツェツィーリエ・ゼーラー＝ザックス",
    series: "HISTORICAL TRAVEL NARRATIVE · 1900",
    originalPublication: "ベルリン、1900年",
    year: 1900,
    extent:
      "PDF 628頁・原刊前付VII–XXIV頁・本文1–363頁・光沢版図版65点・本文挿図260点・折込地図1点",
    description:
      "ツェツィーリエ・ゼーラー＝ザックスが、1895年から1897年にかけてメキシコとグアテマラを横断した旅の経過、各地の生活・民族・景観・考古遺物を記した旅行記。1900年初版の外装、前付、本文1–363頁、原注、図題を全訳し、光沢版図版65点、本文挿図260点、折込地図を収録しています。",
    cover:
      "publications/seler-sachs-auf-alten-wegen-1900/cover.jpg",
    pdf:
      "publications/seler-sachs-auf-alten-wegen-1900/Caecilie_Seler_Sachs_Auf_alten_Wegen_in_Mexiko_und_Guatemala_1900_Japanese_Complete_Translation.pdf",
    epub:
      "publications/seler-sachs-auf-alten-wegen-1900/Caecilie_Seler_Sachs_Auf_alten_Wegen_in_Mexiko_und_Guatemala_1900_Japanese_Complete_Translation.epub",
    pageCount: 628,
    figureCount: 260,
    plateCount: 65,
    types: ["旅行記", "民族誌", "考古学研究"],
    regions: ["メキシコ", "オアハカ", "チアパス", "グアテマラ"],
    languages: ["ドイツ語"],
    tags: [
      "パツクアロ",
      "テワンテペク",
      "トニナ",
      "コミタン",
      "キリグア",
      "コパン",
      "原刊図版",
      "19世紀末",
    ],
  },
  {
    slug: "byam-chiapas-1897",
    title: "メキシコ・チアパス州概説",
    originalTitle: "A Sketch of the State of Chiapas, Mexico",
    subtitle: "1897年初版・原刊外装表紙、前付、本文、図版、地図 日本語全訳",
    author: "ウィリアム・W・バイアム",
    series: "A SKETCH OF THE STATE OF CHIAPAS · 1897",
    originalPublication: "ロサンゼルス、1897年",
    year: 1897,
    extent:
      "PDF 110頁・原刊外装表紙・前付・本文7–78頁・図版68点・地図3点",
    description:
      "ウィリアム・W・バイアムが、19世紀末のチアパス州について、歴史、地理、住民、産業、各県、パレンケの自然と遺跡、コーヒー栽培、米国からの移住・投資を概説した地誌。1897年初版の外装表紙、前付、本文7–78頁、表を全訳し、図版68点と地図3点を原刊位置に対応させて収録しています。",
    cover: "publications/byam-chiapas-1897/cover.jpg",
    pdf:
      "publications/byam-chiapas-1897/Byam_A_Sketch_of_the_State_of_Chiapas_Mexico_1897_Japanese_Complete_Translation.pdf",
    epub:
      "publications/byam-chiapas-1897/Byam_A_Sketch_of_the_State_of_Chiapas_Mexico_1897_Japanese_Complete_Translation.epub",
    pageCount: 110,
    figureCount: 68,
    plateCount: 3,
    types: ["地理報告", "旅行記", "博物誌"],
    regions: ["チアパス", "メキシコ", "パレンケ", "タバスコ"],
    languages: ["英語"],
    tags: [
      "チアパス州",
      "パレンケ",
      "コーヒー栽培",
      "植民",
      "投資案内",
      "19世紀末",
      "原刊図版",
      "地図",
    ],
  },
  {
    slug: "robles-memoria-historica-chiapa-1813",
    title: "グアテマラ諸州の一つ、チアパ州の歴史覚書",
    originalTitle:
      "Memoria histórica de la provincia de Chiapa, una de las de Guatemala",
    subtitle: "1813年初版・原刊標題紙、本文3–71頁、原注 日本語全訳",
    author: "マリアノ・ロブレス・ドミンゲス・デ・マサリエゴス",
    series: "HISTORICAL MEMOIR · 1813",
    originalPublication: "カディス、1813年",
    year: 1813,
    extent: "PDF 33頁・原刊標題紙・本文3–71頁・原注10点・表",
    description:
      "チアパ州選出コルテス代議員マリアノ・ロブレス・ドミンゲス・デ・マサリエゴスが、征服史、州都シウダ・レアルの建設、地理・住民・産物・交通・行政・教育の状況を記し、州参事会、大学、港湾、運河など8項目を議会へ提案した1813年の政治・地誌史料。1813年初版の標題紙、本文3–71頁、段落番号、原注10点、表、署名を全訳しています。",
    cover:
      "publications/robles-memoria-historica-chiapa-1813/cover.jpg",
    pdf:
      "publications/robles-memoria-historica-chiapa-1813/Robles_Memoria_historica_de_la_provincia_de_Chiapa_1813_Japanese_Complete_Translation.pdf",
    epub:
      "publications/robles-memoria-historica-chiapa-1813/Robles_Memoria_historica_de_la_provincia_de_Chiapa_1813_Japanese_Complete_Translation.epub",
    pageCount: 33,
    figureCount: 0,
    plateCount: 0,
    types: ["歴史書", "地理報告", "一次史料"],
    regions: ["チアパス", "パレンケ", "グアテマラ"],
    languages: ["スペイン語"],
    tags: [
      "シウダ・レアル",
      "ソコヌスコ",
      "コルテス",
      "州参事会",
      "パレンケ",
      "ラカンドン",
      "1812年憲法",
      "19世紀初頭",
    ],
  },
  {
    slug: "brinton-nagualism-1894",
    title: "ナグアリズム",
    originalTitle:
      "Nagualism: A Study in Native American Folk-lore and History",
    subtitle:
      "アメリカ先住民の民間伝承と歴史に関する研究・1894年初版 日本語全訳",
    author: "ダニエル・G・ブリントン",
    series: "AMERICAN FOLK-LORE AND HISTORY · 1894",
    originalPublication: "フィラデルフィア、1894年",
    year: 1894,
    extent:
      "PDF 108頁・原刊標題紙・本文全42節・原注・索引352項目",
    description:
      "ダニエル・G・ブリントンが、メキシコと中央アメリカにおけるナグアル、守護霊、変身信仰、秘密結社、先住民反乱、火・緑石・樹木・十字などの象徴、語源と旧世界との比較を論じた1894年の民俗学・宗教史研究。独立抜刷の標題紙、目次、本文全42節、引用、原注、索引352項目を全訳しています。内容のない原刊2頁は省略しています。",
    cover: "publications/brinton-nagualism-1894/cover.jpg",
    pdf:
      "publications/brinton-nagualism-1894/Daniel_G_Brinton_Nagualism_1894_Japanese_Complete_Translation.pdf",
    epub:
      "publications/brinton-nagualism-1894/Daniel_G_Brinton_Nagualism_1894_Japanese_Complete_Translation.epub",
    pageCount: 108,
    figureCount: 0,
    plateCount: 0,
    types: ["民俗学研究", "宗教史", "民族誌"],
    regions: ["メキシコ", "チアパス", "グアテマラ", "中央アメリカ"],
    languages: ["英語"],
    tags: [
      "ナグアル",
      "ナグアリズム",
      "ナワトル語",
      "先住民宗教",
      "民間伝承",
      "秘密結社",
      "呪術",
      "19世紀末",
    ],
  },
  {
    slug: "pineda-chiapas-soconusco-1845",
    title: "チアパスおよびソコヌスコ県地理誌",
    originalTitle:
      "Descripción geográfica del Departamento de Chiapas y Soconusco",
    subtitle:
      "1845年初版・原刊標題紙、序文、本文、諸表、末尾付載文書 日本語全訳",
    author: "エメテリオ・ピネダ",
    series: "GEOGRAPHICAL DESCRIPTION · 1845",
    originalPublication: "メキシコ、1845年",
    year: 1845,
    extent:
      "PDF 133頁・原刊標題紙・原刊III–IV頁、5–150頁・折込表2点・末尾付載文書",
    description:
      "チアパス高等司法裁判所判事エメテリオ・ピネダが、チアパスとソコヌスコの歴史、地理、自然、住民、行政区画、人口、教育、農業、産業、商業、財政、民族誌、司法・軍事を体系的に記述した1845年の地理・統計史料。1845年初版の標題紙、序文、本文5–150頁、人口比較表と歳入・支出表、末尾の地図批評を全訳しています。",
    cover: "publications/pineda-chiapas-soconusco-1845/cover.jpg",
    pdf:
      "publications/pineda-chiapas-soconusco-1845/Pineda_Descripcion_geografica_del_Departamento_de_Chiapas_y_Soconusco_1845_Japanese_Complete_Translation.pdf",
    epub:
      "publications/pineda-chiapas-soconusco-1845/Pineda_Descripcion_geografica_del_Departamento_de_Chiapas_y_Soconusco_1845_Japanese_Complete_Translation.epub",
    pageCount: 133,
    figureCount: 3,
    plateCount: 0,
    types: ["地理誌", "統計資料", "一次史料"],
    regions: ["チアパス", "ソコヌスコ", "メキシコ", "中央アメリカ"],
    languages: ["スペイン語"],
    tags: [
      "人口統計",
      "行政区画",
      "自然誌",
      "農業",
      "商業",
      "民族誌",
      "司法統計",
      "19世紀中葉",
    ],
  },
  {
    slug: "paniagua-catecismo-chiapas-1876",
    title: "チアパス歴史・統計初等問答",
    originalTitle: "Catecismo elemental de historia y estadística de Chiapas",
    subtitle:
      "1876年初版・原刊前付、本文全108頁、索引、正誤表 日本語全訳",
    author: "フラビオ・アントニオ・パニアグア",
    series: "HISTORY AND STATISTICS · 1876",
    originalPublication: "サン・クリストバル・ラス・カサス、1876年",
    year: 1876,
    extent:
      "PDF 157頁・原刊前付・本文1–108頁・索引・正誤表・原刊標題紙画像1点",
    description:
      "チアパスの歴史、地理、住民、言語、宗教、統治、人口、財政、司法、教育、農業、産業などを問答形式でまとめた1876年刊の初等教育用歴史・統計書。初版の標題紙、参照著者一覧、序言、献辞、本文全108頁、索引、正誤表を省略なく収録しています。",
    cover: "publications/paniagua-catecismo-chiapas-1876/cover.jpg",
    pdf:
      "publications/paniagua-catecismo-chiapas-1876/Paniagua_Catecismo_elemental_de_historia_y_estadistica_de_Chiapas_1876_Japanese_Complete_Translation.pdf",
    epub:
      "publications/paniagua-catecismo-chiapas-1876/Paniagua_Catecismo_elemental_de_historia_y_estadistica_de_Chiapas_1876_Japanese_Complete_Translation.epub",
    pageCount: 157,
    figureCount: 1,
    plateCount: 0,
    types: ["歴史書", "地理誌", "統計資料", "教育書"],
    regions: ["チアパス", "メキシコ", "中央アメリカ"],
    languages: ["スペイン語"],
    tags: [
      "チアパス史",
      "人口統計",
      "行政区画",
      "公教育",
      "農業",
      "産業",
      "問答書",
      "19世紀後半",
    ],
  },
  {
    slug: "morris-colony-british-honduras-1883",
    title: "英領ホンジュラス植民地",
    originalTitle:
      "The Colony of British Honduras: Its Resources and Prospects; with Particular Reference to Its Indigenous Plants and Economic Productions",
    subtitle:
      "1883年初版・原刊前付、本文全152頁、付録、索引 日本語全訳",
    author: "ダニエル・モリス",
    series: "THE COLONY OF BRITISH HONDURAS · 1883",
    originalPublication: "ロンドン、1883年",
    year: 1883,
    extent:
      "PDF 160頁・原刊前付xiii頁・本文1–152頁・折込彩色地図1点・図版2葉・本文挿図1点",
    description:
      "植物学者ダニエル・モリスが英領ホンジュラスの地理、歴史、行政、交通、住民、森林資源、経済植物、農業、労働、土地制度、気候を調査し、植民地の資源と将来性を論じた1883年刊行書。原刊前付、全8章、原注、表、付録、文献一覧、索引を全訳し、装丁、略標題紙、折込彩色地図、標題紙、図版2葉、本文挿図を収録しています。",
    cover: "publications/morris-colony-british-honduras-1883/cover.jpg",
    pdf:
      "publications/morris-colony-british-honduras-1883/Morris_The_Colony_of_British_Honduras_1883_Japanese_Complete_Translation.pdf",
    epub:
      "publications/morris-colony-british-honduras-1883/Morris_The_Colony_of_British_Honduras_1883_Japanese_Complete_Translation.epub",
    pageCount: 160,
    figureCount: 1,
    plateCount: 3,
    types: ["地理報告", "博物誌", "経済調査", "旅行記"],
    regions: ["英領ホンジュラス", "ベリーズ", "中央アメリカ"],
    languages: ["英語"],
    tags: [
      "植物誌",
      "経済植物",
      "マホガニー",
      "ログウッド",
      "植民地行政",
      "農業",
      "折込地図",
      "19世紀後半",
    ],
  },
  {
    slug: "henderson-british-honduras-1811",
    title: "英領ホンジュラス植民地誌",
    originalTitle:
      "An Account of the British Settlement of Honduras; Being a View of Its Commercial and Agricultural Resources, Soil, Climate, Natural History, &c. To Which Are Added, Sketches of the Manners and Customs of the Mosquito Indians, Preceded by the Journal of a Voyage to the Mosquito Shore. Illustrated by a Map",
    subtitle:
      "1811年増補第2版・原刊前付、本文全237頁、航海日誌、語彙集、気象表 日本語全訳",
    author: "ジョージ・ヘンダーソン",
    series: "BRITISH HONDURAS · 1811",
    originalPublication: "ロンドン、1811年",
    year: 1811,
    extent:
      "PDF 131頁・原刊前付v–xi頁・本文1–237頁・原刊標題紙1点・折込地図1点",
    description:
      "ジョージ・ヘンダーソン大尉が英領ホンジュラス植民地の政治史、商業、農業、住民、自然誌を概説した1811年増補第2版。モスキート海岸への航海日誌、モスキート・インディアンの風俗習慣素描、語彙集、1806年の気象表を併録し、原刊標題紙、献辞、序文、第2版広告、目次、折込地図、本文全237頁、巻末印記まで収録しています。",
    cover: "publications/henderson-british-honduras-1811/cover.jpg",
    pdf:
      "publications/henderson-british-honduras-1811/Henderson_An_Account_of_the_British_Settlement_of_Honduras_1811_Japanese_Complete_Translation.pdf",
    epub:
      "publications/henderson-british-honduras-1811/Henderson_An_Account_of_the_British_Settlement_of_Honduras_1811_Japanese_Complete_Translation.epub",
    pageCount: 131,
    figureCount: 0,
    plateCount: 2,
    types: ["地理誌", "植民地史", "旅行記", "民族誌"],
    regions: ["英領ホンジュラス", "ベリーズ", "モスキート海岸", "中央アメリカ"],
    languages: ["英語"],
    tags: [
      "植民地行政",
      "マホガニー",
      "ログウッド",
      "博物誌",
      "モスキート人",
      "航海日誌",
      "気象観測",
      "19世紀前半",
    ],
  },
  {
    slug: "gann-maya-indians-1918",
    title: "南ユカタンおよび北部英領ホンジュラスのマヤ人",
    originalTitle:
      "The Maya Indians of Southern Yucatan and Northern British Honduras",
    subtitle:
      "1918年初版・原刊前付、本文全146頁、図版28点、本文挿図84点、引用文献、索引 日本語全訳",
    author: "トーマス・W・F・ガン",
    series: "BUREAU OF AMERICAN ETHNOLOGY · BULLETIN 64 · 1918",
    originalPublication: "ワシントン、1918年",
    year: 1918,
    extent:
      "PDF 210頁・原刊1–146頁・本文挿図84点・別丁図版28点・原注62件",
    description:
      "トーマス・W・F・ガンが南ユカタンと北部英領ホンジュラスのマヤ人の身体的特徴、生業、社会生活、医療、遊戯、宗教儀礼を記録し、後半で東部マヤ地域の墳丘41基を中心とする発掘成果を報告した1918年刊行書。装丁表紙、標題紙、送付状、目次、図版目録、マヤ語発音表、本文、原注62件、表、本文挿図84点、図版28点、引用文献、索引を収録しています。",
    cover: "publications/gann-maya-indians-1918/cover.jpg",
    pdf:
      "publications/gann-maya-indians-1918/Gann_The_Maya_Indians_of_Southern_Yucatan_and_Northern_British_Honduras_1918_Japanese_Complete_Translation.pdf",
    epub:
      "publications/gann-maya-indians-1918/Gann_The_Maya_Indians_of_Southern_Yucatan_and_Northern_British_Honduras_1918_Japanese_Complete_Translation.epub",
    pageCount: 210,
    figureCount: 84,
    plateCount: 28,
    types: ["民族誌", "考古学研究", "発掘報告"],
    regions: ["ユカタン", "英領ホンジュラス", "ベリーズ", "グアテマラ"],
    languages: ["英語"],
    tags: [
      "マヤ人",
      "民族学",
      "宗教儀礼",
      "物質文化",
      "墳丘発掘",
      "サンタ・リタ",
      "原刊図版",
      "20世紀初頭",
    ],
  },
  {
    slug: "uring-voyages-travels-1928",
    title: "ナサニエル・ユーリング船長の航海と旅行",
    originalTitle:
      "The Voyages and Travels of Captain Nathaniel Uring",
    subtitle:
      "1928年「船乗り叢書」版・デュワー序説・注、本文全248頁、索引 日本語全訳",
    author: "ナサニエル・ユーリング",
    series: "THE SEAFARERS' LIBRARY · 1928",
    originalPublication: "ロンドン、1928年",
    year: 1928,
    extent:
      "PDF 350頁・原刊前付v–vii、ix–xxxiii頁・本文1–248頁・索引249–253頁・略標題紙、標題紙各1点・図版8葉",
    description:
      "ナサニエル・ユーリングが17世紀末から18世紀初頭に経験した大西洋、バルト海、西アフリカ、西インド諸島、北米、地中海への航海と旅行の記録。英領ホンジュラス、モスキート海岸、カンペチェ湾への航海と難破を含む1726年初版本文に、アルフレッド・デュワーの序説・注、索引を加えた1928年版を全訳し、同版所収の図版8葉を収録しています。",
    cover: "publications/uring-voyages-travels-1928/cover.jpg",
    pdf:
      "publications/uring-voyages-travels-1928/Nathaniel_Uring_Voyages_and_Travels_1928_Japanese_Complete_Translation.pdf",
    epub:
      "publications/uring-voyages-travels-1928/Nathaniel_Uring_Voyages_and_Travels_1928_Japanese_Complete_Translation.epub",
    pageCount: 350,
    figureCount: 0,
    plateCount: 10,
    types: ["旅行記", "航海記", "植民地史", "民族誌"],
    regions: [
      "英領ホンジュラス",
      "ベリーズ",
      "モスキート海岸",
      "中央アメリカ",
      "カリブ海",
      "西アフリカ",
    ],
    languages: ["英語"],
    tags: [
      "航海史",
      "大西洋世界",
      "西インド諸島",
      "奴隷貿易",
      "郵便船",
      "難破",
      "ホンジュラス湾",
      "18世紀前半",
    ],
  },
  {
    slug: "cook-balise-merida-1769",
    title: "ベリーズ川からメリダまでの通行に関する所見",
    originalTitle:
      "Remarks on a Passage from the River Balise, in the Bay of Honduras, to Merida: the Capital of the Province of Jucatan, in the Spanish West Indies",
    subtitle:
      "1769年初版・原刊標題紙、本文全34頁、原注 日本語全訳",
    author: "ジェームズ・クック中尉",
    series: "TRAVEL REPORT · 1769",
    originalPublication: "ロンドン、1769年",
    year: 1769,
    extent:
      "PDF 17頁・原刊標題紙1点・本文1–34頁・原注1点・原刊装飾1点",
    description:
      "ジャマイカ駐在のウィリアム・バーナビー海軍少将の命を受けたジェームズ・クック中尉が、1765年2月から3月にホンジュラス湾のベリーズ川からバカラルを経てユカタン州都メリダへ公文書を運んだ旅程記。沿道の水路、地理、軍備、住民、交易、統治を記し、原刊標題紙、本文全34頁、原注、終止表示を収録しています。",
    cover: "publications/cook-balise-merida-1769/cover.jpg",
    pdf:
      "publications/cook-balise-merida-1769/Cook_Remarks_River_Balise_to_Merida_1769_Japanese_Complete_Translation.pdf",
    epub:
      "publications/cook-balise-merida-1769/Cook_Remarks_River_Balise_to_Merida_1769_Japanese_Complete_Translation.epub",
    pageCount: 17,
    figureCount: 1,
    plateCount: 1,
    types: ["旅行記", "地理報告", "植民地史"],
    regions: ["英領ホンジュラス", "ベリーズ", "ユカタン", "バカラル", "中央アメリカ"],
    languages: ["英語"],
    tags: [
      "旅程",
      "ベリーズ川",
      "バカラル",
      "メリダ",
      "ログウッド",
      "植民地行政",
      "18世紀後半",
    ],
  },
  {
    slug: "swett-british-honduras-san-pedro-1868",
    title: "英領ホンジュラスおよびホンジュラス共和国サン・ペドロへの旅",
    originalTitle:
      "A Trip to British Honduras, and to San Pedro, Republic of Honduras",
    subtitle:
      "1868年初版・原刊印刷表紙、標題紙、序文、本文3–125頁 日本語全訳",
    author: "チャールズ・スウェット",
    series: "TRAVEL ACCOUNT · 1868",
    originalPublication: "ニューオーリンズ、1868年",
    year: 1868,
    extent:
      "PDF 110頁・原刊印刷表紙1点・標題紙1点・序文・本文3–125頁",
    description:
      "南北戦争後の1867年末から1868年春にかけて、ミシシッピ州出身のチャールズ・スウェットが移住候補地を調査するため英領ホンジュラスとホンジュラス共和国を旅した記録。ベリーズ、沿岸河川、オモア、サン・ペドロなどの土地、社会、産業、統治、移民政策を記し、原刊印刷表紙、標題紙、序文、本文3–125頁を収録しています。",
    cover:
      "publications/swett-british-honduras-san-pedro-1868/cover.jpg",
    pdf:
      "publications/swett-british-honduras-san-pedro-1868/Swett_A_Trip_to_British_Honduras_and_San_Pedro_1868_Japanese_Complete_Translation.pdf",
    epub:
      "publications/swett-british-honduras-san-pedro-1868/Swett_A_Trip_to_British_Honduras_and_San_Pedro_1868_Japanese_Complete_Translation.epub",
    pageCount: 110,
    figureCount: 0,
    plateCount: 2,
    types: ["旅行記", "地理報告", "移民論"],
    regions: [
      "英領ホンジュラス",
      "ベリーズ",
      "ホンジュラス",
      "サン・ペドロ・スーラ",
      "中央アメリカ",
    ],
    languages: ["英語"],
    tags: [
      "移住調査",
      "南北戦争",
      "ベリーズ",
      "オモア",
      "サン・ペドロ",
      "植民地行政",
      "19世紀後半",
    ],
  },
  {
    slug: "gann-discoveries-central-america-1928",
    title: "中央アメリカにおける発見と冒険",
    originalTitle: "Discoveries and Adventures in Central America",
    subtitle:
      "1928年初版・ジョイス序文、本文全18章、全図版、索引 日本語全訳",
    author: "トーマス・W・F・ガン",
    series: "DISCOVERIES AND ADVENTURES · 1928",
    originalPublication: "ロンドン、1928年",
    year: 1928,
    extent:
      "PDF 296頁・原刊前付5–17頁・本文19–256頁・索引257–261頁・原刊画像35点・表2点",
    description:
      "トーマス・W・F・ガンが英領ホンジュラスで行った旅行、洞窟調査、マヤ遺跡の踏査・発掘を、自然誌・民族誌的観察とともに記した1928年刊行書。略標題紙、口絵、標題紙、目次、図版目録、トーマス・A・ジョイスによる序文、本文全18章、原刊画像35点、表2点、索引を収録しています。",
    cover:
      "publications/gann-discoveries-central-america-1928/cover.jpg",
    pdf:
      "publications/gann-discoveries-central-america-1928/Gann_Discoveries_and_Adventures_in_Central_America_1928_Japanese_Complete_Translation.pdf",
    epub:
      "publications/gann-discoveries-central-america-1928/Gann_Discoveries_and_Adventures_in_Central_America_1928_Japanese_Complete_Translation.epub",
    pageCount: 296,
    figureCount: 0,
    plateCount: 35,
    types: ["探検記", "考古学研究", "旅行記"],
    regions: ["英領ホンジュラス", "ベリーズ", "マヤ地域", "中央アメリカ"],
    languages: ["英語"],
    tags: [
      "マヤ考古学",
      "洞窟調査",
      "チュムチャ",
      "石碑",
      "英領ホンジュラス",
      "大英博物館",
      "原刊図版",
      "20世紀前半",
    ],
  },
  {
    slug: "juarros-compendio-guatemala-1857",
    title: "グアテマラ市史要覧",
    originalTitle: "Compendio de la historia de la ciudad de Guatemala",
    subtitle:
      "1857年版・全2巻、全7論、付録、原注、目次、購読者名簿 日本語全訳",
    author: "ドミンゴ・フアロス",
    series: "HISTORICAL COMPENDIUM · 1857",
    originalPublication: "グアテマラ、1857年",
    year: 1857,
    extent:
      "PDF 697頁・原刊第1巻5–376頁、第2巻5–384頁・原刊画像4点・表53点・原注100件",
    description:
      "ドミンゴ・フアロスによるグアテマラ王国・首都の地理、教会制度、植民地史、征服史、…87595 tokens truncated…いません。",
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "rockstroh-ukes": {
    sourceEdition:
      "Jan de Vos 編『Viajes al desierto de la soledad: un retrato hablado de la Selva Lacandona』（CIESAS／Miguel Ángel Porrúa、2003年）pp. 90–129。",
    sourceProvider:
      "2003年刊転写版。編者による導入文は翻訳対象外で、確認できた本文範囲のみを収録。",
    rights:
      "1881年原文は著作権保護期間を満了しています。2003年刊の転写・編集部分には編者・出版社の権利が残る可能性があるため、本版は原文本文のみを対象としています。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-24",
    updatedDate: "2026-07-26",
  },
  "chambon-mexique": {
    sourceEdition:
      "Ludovic Chambon『Un Gascon au Mexique』（Paris、1892年）。Zentralbibliothek Zürich, BR 846 蔵本。",
    sourceProvider: "Zentralbibliothek Zürich／Google Books。",
    sourceUrl: "https://books.google.com/books?id=U63rzj7xGEYC",
    rights: publicDomainRights,
    publishedDate: "2026-07-24",
    updatedDate: "2026-07-26",
  },
  "arthes-peten-1893": {
    sourceEdition:
      "Federico Guillermo Arthés「Breve descripción del departamento del Petén」『El Guatemalteco』tomo XXIII, núm. 16（1893年5月31日）pp. 97–103。",
    sourceProvider: "『El Guatemalteco』原載紙面の公開画像。",
    rights: publicDomainRights,
    publishedDate: "2026-07-25",
    updatedDate: "2026-07-26",
  },
  "del-rio-palenque": {
    sourceEdition:
      "Antonio del Río／Pablo Félix Cabrera『Description of the Ruins of an Ancient City, Discovered near Palenque』（London、1822年）。",
    sourceProvider:
      "John Carter Brown Library・Getty Research Institute（本文）、Library of Congress Kislak Collection（図版）。",
    sourceUrl: "https://www.loc.gov/item/05008020/",
    rights: publicDomainRights,
    publishedDate: "2026-07-24",
    updatedDate: "2026-07-26",
  },
  "bourbourg-palenque-1866": {
    sourceEdition:
      "Charles-Étienne Brasseur de Bourbourg『Monuments anciens du Mexique』（Paris、1866年）。本文、目次、図版解説、原刊図版を対象。",
    sourceProvider:
      "Bibliothèque nationale de France, Gallica（主底本）、Biblioteca Virtual Miguel de Cervantes（本文照合）。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/bpt6k130466g",
    rights: publicDomainRights,
    publishedDate: "2026-07-25",
    updatedDate: "2026-07-26",
  },
  "esquinca-usumacinta": {
    sourceEdition:
      "Jan de Vos 編『Viajes al desierto de la soledad: un retrato hablado de la Selva Lacandona』改訂増補版（CIESAS／Miguel Ángel Porrúa、2003年）pp. 54–57。1988年版も照合。",
    sourceProvider:
      "2003年刊転写版。本資料は刊本で公開確認できる日誌部分のみの全訳。",
    rights:
      "1826年原史料は著作権保護期間を満了しています。1988年・2003年刊の転写・編集部分には編者・出版社の権利が残る可能性があるため、本版は公刊された原史料本文のみを対象としています。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-24",
    updatedDate: "2026-07-26",
  },
  "galindo-ruins-palenque-literary-gazette-1831": {
    sourceEdition:
      "Juan Galindo「Ruins of Palenque」『The Literary Gazette; and Journal of the Belles Lettres, Arts, Sciences, &c.』no. 769（1831年10月15日）pp. 665–666、および編集部追補「Palenque」no. 770（1831年10月22日）p. 683。1831年4月26日付。",
    sourceProvider:
      "Internet Archive公開の第769号・第770号原刊画像を底本とした。第769号の書簡本文、編集部注、本文内二図、原刊誌面二頁、および第770号の訂正・補足記事とその注を収録した。",
    sourceUrl:
      "https://archive.org/details/sim_literary-gazette_1831-10-15_769",
    rights: publicDomainRights,
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "galindo-noticias-peten-1831": {
    sourceEdition:
      "Juan Galindo「Noticias del Petén recogidas por su comandante, el C. J. Galindo」『Gaceta Federal』no. 35（Guatemala、1831年9月29日）pp. 257–260。",
    sourceProvider:
      "Bibliothèque nationale de France, Société de géographie, SG MS4-8 (1111)所蔵の原刊切抜き（Gallica f79–f82）を底本とした。原刊四頁の本文、旅程表、人口表を収録した。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/btv1b525153172/f79.item",
    rights: publicDomainRights,
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "galindo-palenque-1832": {
    sourceEdition:
      "Juan Galindo「Mémoire … sur les ruines de Palenque」『Bulletin de la Société de géographie』tome XVIII, no 114（1832年10月）pp. 198–214＋別葉図版、およびPerfecto Baezo「Vocabulario de las lenguas castellana y maia」pp. 215–217。",
    sourceProvider:
      "Internet Archive公開の原刊冊子を主底本とし、Bibliothèque nationale de France, Gallica公開のガリンド関係稿本を判読照合に用いた。ガリンド本文、編集部脚注、本文内模式図、別葉図版、および直後に掲載されたバエソの語彙表を収録した。",
    rights: publicDomainRights,
    publishedDate: "2026-07-24",
    updatedDate: "2026-08-01",
  },
  "galindo-usumacinta-1833": {
    sourceEdition:
      "Juan Galindo「A Description of the River Usumasinta, in Guatemala」『The Journal of the Royal Geographical Society of London』vol. 3（1833年）pp. 59–64＋無番号地図。",
    sourceProvider: "JSTOR（初出論文）、Internet Archive（公開画像）。",
    rights: publicDomainRights,
    publishedDate: "2026-07-24",
    updatedDate: "2026-07-26",
  },
  "galindo-caribs-central-america-1833": {
    sourceEdition:
      "Juan Galindo「Notice of the Caribs in Central America」『The Journal of the Royal Geographical Society of London』vol. 3（1833年）pp. 290–291。",
    sourceProvider:
      "王立地理学協会誌第3巻の公開原刊画像を主底本とし、JSTOR単独版で本文と頁範囲を照合した。原刊本文二頁、カリブ語彙、数詞表を収録した。",
    sourceUrl: "https://www.jstor.org/stable/1797617",
    rights: publicDomainRights,
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "galindo-antiquities-peten-1834": {
    sourceEdition:
      "Juan Galindo「A short Account of some Antiquities discovered in the District of Peten, in Central America」『Archaeologia』vol. 25（1834年）pp. 570–571、plates LIX–LX。1831年10月28日付、1832年6月7日朗読。",
    sourceProvider:
      "Internet Archive／Wikimedia Commons公開の図版入り全巻版を主底本とし、Cambridge Core単独論文版で本文を照合した。本文、宛先・署名、図版LIX・LXを収録した。",
    sourceUrl: "https://archive.org/details/s2id13276840",
    rights: publicDomainRights,
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "galindo-copan-full-report-1834": {
    sourceEdition:
      "Juan Galindo「Informe de la comisión científica formada para el reconocimiento de las antigüedades de Copán」『Anales de la Sociedad de Geografía e Historia de Guatemala』tomo XX, no. 3（1945年9月）pp. 217–228、および「Rapport sur les ruines de Copan et le pays voisin」Bibliothèque nationale de France, Société de géographie, SG MS4-8 (1111), document 4, f101–f136＋図面f137–f161。1834年6月19日付。",
    sourceProvider:
      "Internet Archive公開の1945年刊スペイン語本文と、BnF Gallica公開のフランス語稿・地図・平面図・水彩全景・図1–26を主底本とした。両本文を独立して全訳し、BnF図版13面を収録した。Sylvanus G. Morley『The Inscriptions at Copan』（1920年）付録XIは異同照合にのみ用いた。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/btv1b525153172",
    rights: publicDomainRights,
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "galindo-copan-literary-gazette-1835": {
    sourceEdition:
      "Juan Galindo「Central America」『The Literary Gazette; and Journal of the Belles Lettres, Arts, Sciences, &c.』no. 965（1835年7月18日）pp. 456–457。1834年6月19日付。",
    sourceProvider:
      "Internet Archive公開の第965号原刊画像を底本とした。編集部注、書簡本文、署名を収録した。",
    sourceUrl:
      "https://archive.org/details/sim_literary-gazette_1835-07-18_965",
    rights: publicDomainRights,
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "galindo-eruption-cosiguina-1835": {
    sourceEdition:
      "Juan Galindo「On the Eruption of the Volcano of Cosigüina, in Nicaragua, 17th January, 1835」『The Journal of the Royal Geographical Society of London』vol. 5（1835年）pp. 387–392。",
    sourceProvider:
      "王立地理学協会誌第5巻の公開原刊画像を主底本とし、JSTOR単独版で本文と頁範囲を照合した。原刊387–392頁の本文、公式報告、書簡、原注を収録した。",
    sourceUrl: "https://www.jstor.org/stable/1797892",
    rights: publicDomainRights,
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "galindo-ruins-copan-aas-1836": {
    sourceEdition:
      "Juan Galindo「The Ruins of Copan, in Central America」『Archaeologia Americana: Transactions and Collections of the American Antiquarian Society』vol. 2（Cambridge, Massachusetts、1836年）pp. 543–550。1835年6月19日付。",
    sourceProvider:
      "Internet Archive公開のアメリカ古物協会紀要第2巻を底本とした。刊行委員会注、書簡本文、宛先、署名・肩書を収録した。",
    sourceUrl: "https://archive.org/details/archaeologiaamer2183amer",
    rights: publicDomainRights,
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "galindo-on-central-america-1836": {
    sourceEdition:
      "Juan Galindo「On Central America」『The Journal of the Royal Geographical Society of London』vol. 6（1836年）pp. 119–135＋二葉地図「Sketch of the State of Costarrica in Central America」。1836年5月9日朗読。",
    sourceProvider:
      "王立地理学協会誌第6巻の公開原刊画像を主底本とし、JSTOR単独版で本文、原刊頁範囲、地図二葉を照合した。編集部前書き・注、本文、表、地図を収録した。",
    sourceUrl: "https://www.jstor.org/stable/1797561",
    rights: publicDomainRights,
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "societe-geographie-central-america-report-1836": {
    sourceEdition:
      "Baron Walckenaer、de La Renaudière、Jomard（報告者）「Rapport sur le concours relatif à la géographie et aux antiquités de l’Amérique centrale」『Bulletin de la Société de géographie』第2シリーズ第5巻（Paris: Arthus-Bertrand、1836年4月）253–291頁。",
    sourceProvider:
      "フランス国立図書館（BnF）およびInternet Archiveで公開されている原刊画像を底本とした。報告標題、本文、脚注、結論五項、委員署名を収録し、原刊253–291頁の頁境を保持した。",
    rights:
      "1836年原刊本文は米国・日本ともに著作権保護期間を満了しています。デジタル画像には公開元および所蔵館の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "tribes-and-temples-vol-1": {
    sourceEdition:
      "Frans Blom／Oliver La Farge『Tribes and Temples』Volume I（Tulane University of Louisiana、1926年）。",
    sourceProvider:
      "Tulane University（公式PDF）、Internet Archive・Library of Congress（欠落地図の補完）。",
    rights: publicDomainRights,
    publishedDate: "2026-07-24",
    updatedDate: "2026-07-26",
  },
  "tribes-and-temples-vol-2": {
    sourceEdition:
      "Frans Blom／Oliver La Farge『Tribes and Temples』Volume II（Tulane University of Louisiana、1927年）。",
    sourceProvider:
      "Tulane University（公式PDF）、Internet Archive（原刊構成の照合）。",
    rights: publicDomainRights,
    publishedDate: "2026-07-24",
    updatedDate: "2026-07-26",
  },
  "egan-wyer-1930": {
    sourceEdition:
      "T. Egan-Wyer, Topographical Map and Accompanying Documents（1930–1931年）。Penn Museum Archives, PU-Mu.1105, Box 1, Folder 6。",
    sourceProvider:
      "University of Pennsylvania Museum of Archaeology and Anthropology, Penn Museum Archives。",
    sourceUrl:
      "https://collections.penn.museum/collections/archives/findingaid/552866",
    rights:
      "Penn Museumウェブサイトの公開アーカイブ文書スキャンを、同館の利用条件に基づき、非営利の研究・教育目的で使用しています。日本語翻訳・組版・注記は本アーカイブによる変更です。本版の商用利用は禁止し、再利用はPenn Museumの利用条件の範囲に限ります。PU-Mu.1105, Box 1, Folder 6. Courtesy of the Penn Museum.",
    publishedDate: "2026-07-25",
    updatedDate: "2026-07-29",
  },
  "sapper-eastern-lacandons-1891": {
    sourceEdition:
      "Karl Sapper「Ein Besuch bei den östlichen Lacandonen」『Das Ausland』Nr. 45（1891年）S. 892–895。",
    sourceProvider: "『Das Ausland』原載4頁の公開原誌画像。",
    rights: publicDomainRights,
    publishedDate: "2026-07-25",
    updatedDate: "2026-07-26",
  },
  "friedrichsthal-yucatan-1841": {
    sourceEdition:
      "Emanuel von Friedrichsthal「Les Monuments de l’Yucatan」『Nouvelles Annales des Voyages et des Sciences Géographiques』tome quatrième, année 1841, tome 92 de la collection, quatrième série, deuxième année（Paris、décembre 1841年）pp. 291-314。",
    sourceProvider:
      "New York Public Library 所蔵本（主底本、Google Books公開画像）。Harvard University 所蔵本および2006年のスペイン語校訂研究は判読確認に使用。",
    sourceUrl: "https://books.google.com/books?id=0tgBAAAAYAAJ",
    rights: publicDomainRights,
    publishedDate: "2026-07-27",
    updatedDate: "2026-07-27",
  },
  "means-yucatan-itzas-1917": {
    sourceEdition:
      "Philip Ainsworth Means『History of the Spanish Conquest of Yucatan and of the Itzas』Papers of the Peabody Museum of American Archaeology and Ethnology, Harvard University, Vol. VII（Cambridge, Massachusetts、1917年）。",
    sourceProvider:
      "Harvard University所蔵・Googleデジタル化の全253画像版（主底本）。Internet Archive所蔵同版で図版を補完し、Project Gutenberg校正済み転記およびWikisource頁別転記を判読照合に使用。",
    sourceUrl: "https://archive.org/details/historyspanishc01canogoog",
    rights: publicDomainRights,
    publishedDate: "2026-07-27",
    updatedDate: "2026-07-27",
  },
  "dunlop-central-america-1847": {
    sourceEdition:
      "Robert Glasgow Dunlop『Travels in Central America: Being a Journal of Nearly Three Years’ Residence in the Country: Together with a Sketch of the History of the Republic, and an Account of Its Climate, Productions, Commerce, Etc.』（London: Longman, Brown, Green, and Longmans、1847年）。",
    sourceProvider:
      "米国議会図書館所蔵本を収めるInternet Archiveのデジタル複製（主底本）。判読疑義は同年刊の別複製で照合し、主底本個体で欠ける半標題紙と印刷者表示は米国議会図書館所蔵の別個体で補完。",
    sourceUrl: "https://archive.org/details/travelsincentral00dunl",
    rights: publicDomainRights,
    publishedDate: "2026-07-27",
    updatedDate: "2026-07-27",
  },
  "bandelier-yucatan-central-america-1881": {
    sourceEdition:
      "Adolph F. Bandelier『Notes on the Bibliography of Yucatan and Central America; Comprising Yucatan, Chiapas, Guatemala (the Ruins of Palenque, Ocosingo, and Copan), and Oaxaca (Ruins of Mitla)』（Worcester: Press of Charles Hamilton、1881年別刷）。",
    sourceProvider:
      "University of California Libraries所蔵本を収めるInternet Archive公開画像。",
    sourceUrl:
      "https://archive.org/details/notesonbibliogra00bandrich",
    rights: publicDomainRights,
    publishedDate: "2026-07-28",
    updatedDate: "2026-07-28",
  },
  "rau-palenque-tablet-1879": {
    sourceEdition:
      "Charles Rau『The Palenque Tablet in the United States National Museum, Washington, D. C.』Smithsonian Contributions to Knowledge, No. 331（Washington City、1879年初版）。",
    sourceProvider:
      "Getty Research Institute所蔵本を収めるInternet Archive公開画像（主底本）。Smithsonian Research Onlineの公開個体および書誌記録を照合。",
    sourceUrl: "https://archive.org/details/palenquetabletin00rauc",
    rights: publicDomainRights,
    publishedDate: "2026-07-28",
    updatedDate: "2026-07-28",
  },
  "charencey-votan-1871": {
    sourceEdition:
      "Hyacinthe de Charencey『Le mythe de Votan : étude sur les origines asiatiques de la civilisation américaine』（Alençon: Imprimerie de E. de Broise、1871年）。",
    sourceProvider:
      "Bibliothèque municipale de Lyon所蔵本を収めるGoogle Books公開画像（主底本）。",
    rights: publicDomainRights,
    publishedDate: "2026-07-28",
    updatedDate: "2026-07-28",
  },
  "ordonez-creation-1907": {
    sourceEdition:
      "Ramón de Ordóñez y Aguiar『Historia de la creación del cielo y de la tierra conforme al sistema de la gentilidad americana』Nicolás León刊（México、1907年、現存未完本）。",
    sourceProvider:
      "Brigham Young University, Harold B. Lee Library所蔵本を収めるInternet Archive公開画像。",
    sourceUrl: "https://archive.org/details/historiadelacrea00ord",
    rights: publicDomainRights,
    publishedDate: "2026-07-28",
    updatedDate: "2026-07-28",
  },
  "le-plongeon-yucatan-1889": {
    sourceEdition:
      "Alice D. Le Plongeon『Here and There in Yucatan: Miscellanies』（New York: John W. Lovell Company、1889年）。",
    sourceProvider:
      "米国議会図書館所蔵・全196画像版（主底本）。1886年J. W. Bouton初版を本文照合に使用。",
    sourceUrl:
      "https://www.loc.gov/resource/gdcmassbookdig.herethereinyucat00lepl/",
    rights: publicDomainRights,
    publishedDate: "2026-07-28",
    updatedDate: "2026-07-28",
  },
  "fancourt-history-yucatan-1854": {
    sourceEdition:
      "Charles St. John Fancourt『The History of Yucatan, from Its Discovery to the Close of the Seventeenth Century』（London: John Murray、1854年初版）。",
    sourceProvider:
      "University of Illinois Library所蔵本を収めるBrittle Books公開画像（全390画像）。",
    sourceUrl:
      "https://brittlebooks.library.illinois.edu/brittlebooks_open/Books2009-05/fancch0001hisyuc/fancch0001hisyuc.pdf",
    rights: publicDomainRights,
    publishedDate: "2026-07-28",
    updatedDate: "2026-07-28",
  },
  "humboldt-vues-cordilleres-1810-1813": {
    sourceEdition:
      "Alexander von Humboldt『Vues des Cordillères, et monumens des peuples indigènes de l’Amérique』（Paris: F. Schoell、1810／1813年）。",
    sourceProvider:
      "Getty Research Institute所蔵本を収めるInternet Archive公開画像（全524画像）。",
    sourceUrl: "https://archive.org/details/gri_33125012643553",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "tozzer-mayas-lacandones-1907": {
    sourceEdition:
      "Alfred M. Tozzer『A Comparative Study of the Mayas and the Lacandones』（New York: The Macmillan Company for the Archaeological Institute of America、1907年初版）。",
    sourceProvider:
      "University of California Libraries所蔵本を収めるInternet Archive公開画像（主底本）。Getty Research Institute、Harvard University、Claremont School of Theology各所蔵本を判読・頁構成の照合に使用。",
    sourceUrl:
      "https://archive.org/details/comparativestudy00tozzrich",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "frias-mexico-guatemala-boundary-1883": {
    sourceEdition:
      "Hilarión Frías y Soto『Cuestión de límites entre México y Guatemala: edición especial tomada del tomo VI de El Anuario Universal』（México: Tipografía Literaria de Filomeno Mata、1883年）。",
    sourceProvider:
      "メキシコ国立図書館所蔵初版本を収めるBiblioteca Nacional Digital de México（UNAM）公開複製、システム番号000279871。",
    sourceUrl: "https://repositorio.unam.mx/3687",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "pastrana-mexico-guatemala-boundary-1897": {
    sourceEdition:
      "Manuel E. Pastrana『Informe que el jefe de la Comisión mexicana de límites con Guatemala, C. Manuel E. Pastrana, rinde á la Secretaría de Fomento, sobre los puntos que tocó el ingeniero Alberto Amador en sus “Apuntes críticos acerca de algunas de las operaciones científicas de la Comisión mexicana de límites con Guatemala”』（México: Oficina Tipográfica de la Secretaría de Fomento、1897年）。",
    sourceProvider:
      "Harvard Law Library所蔵初版本を収めるGoogle Books公開複製、識別子F98KAAAAYAAJ。",
    sourceUrl: "https://books.google.com/books?id=F98KAAAAYAAJ",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "urrutia-guatemala-mexico-boundary-1900": {
    sourceEdition:
      "Claudio Urrutia『Memoria sobre la cuestión de límites entre Guatemala y México: presentada al señor Ministro de Relaciones Exteriores por el jefe de la Comisión Guatemalteca』（Guatemala: Tipografía Nacional、1900年）。",
    sourceProvider:
      "University of Texas所蔵初版本を収めるGoogle Books公開複製、識別子5nFVAAAAMAAJ。",
    sourceUrl: "https://books.google.com/books?id=5nFVAAAAMAAJ",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "seler-sachs-auf-alten-wegen-1900": {
    sourceEdition:
      "Caecilie Seler『Auf alten Wegen in Mexiko und Guatemala: Reiseerinnerungen und Eindrücke aus den Jahren 1895-1897』（Berlin: Dietrich Reimer (Ernst Vohsen)、1900年初版）。",
    sourceProvider:
      "Getty Research Institute所蔵本を収めるInternet Archive公開画像（主底本）。主底本で欠落する原刊本文321頁のみ、Harvard University所蔵初版本の公開画像で補完。",
    sourceUrl:
      "https://archive.org/details/aufaltenwegeninm00sele",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "byam-chiapas-1897": {
    sourceEdition:
      "William W. Byam『A Sketch of the State of Chiapas, Mexico』（Los Angeles: Press of G. Rice & Sons, Incorporated、1897年初版）。",
    sourceProvider:
      "Library of Congress所蔵初版本を収めるInternet Archive公開画像（主底本）。同じ所蔵本のWikimedia Commons公開PDFを閲覧・頁照合に使用。",
    sourceUrl: "https://archive.org/details/sketchofstateofc00byam",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "robles-memoria-historica-chiapa-1813": {
    sourceEdition:
      "Mariano Robles Domínguez de Mazariegos『Memoria histórica de la provincia de Chiapa, una de las de Guatemala』（Cádiz: Imprenta Tormentaria, a cargo de D. J. D. Villegas、1813年初版）。",
    sourceProvider:
      "Universitat de València, Biblioteca Històrica所蔵本BH Var. 325(06)のデジタル複製（全74画像）。Biblioteca Virtual Miguel de Cervantesの書誌記録および刊本の折丁記述と照合。",
    sourceUrl:
      "https://www.cervantesvirtual.com/obra/memoria-historica-de-la-provincia-de-chiapa-una-de-las-de-guatemala/",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "brinton-nagualism-1894": {
    sourceEdition:
      "Daniel G. Brinton『Nagualism: A Study in Native American Folk-lore and History』（Philadelphia: MacCalla & Company, Printers、1894年）。『Proceedings of the American Philosophical Society』第33巻から作成された独立抜刷。",
    sourceProvider:
      "Cornell University Library所蔵の1894年独立抜刷を収めるInternet Archive公開画像（全78画像）。Project Gutenberg eBook No. 26426は頁境界、綴字、原注の照合に限って使用。",
    sourceUrl: "https://archive.org/details/cu31924020427542",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "pineda-chiapas-soconusco-1845": {
    sourceEdition:
      "Emeterio Pineda『Descripción geográfica del Departamento de Chiapas y Soconusco』（México: Imprenta de Ignacio Cumplido, Calle de los Rebeldes núm. 2、1845年初版）。",
    sourceProvider:
      "University of Minnesota所蔵本のGoogle Books／HathiTrustデジタル複製（全155画像、識別子UusxAQAAMAAJ／umn.31951p00340248y）。折り畳まれたまま撮影された2表は、1854年『メキシコ地理統計学会報』再録版の展開済み表を初版の可読部分と照合して補完。",
    sourceUrl: "https://books.google.com/books?id=UusxAQAAMAAJ",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "paniagua-catecismo-chiapas-1876": {
    sourceEdition:
      "Flavio Antonio Paniagua『Catecismo elemental de historia y estadística de Chiapas』（San Cristóbal Las-Casas: Imprenta del “Porvenir” a cargo de Manuel M. Trujillo、1876年初版）。",
    sourceProvider:
      "University of Michigan所蔵初版本のGoogle Booksデジタル複製（全123画像、識別子w7w3AAAAMAAJ）。原刊標題紙、参照著者一覧、序言、献辞、本文1–108頁、索引、正誤表を底本とした。",
    sourceUrl: "https://books.google.com/books?id=w7w3AAAAMAAJ",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "morris-colony-british-honduras-1883": {
    sourceEdition:
      "Daniel Morris『The Colony of British Honduras: Its Resources and Prospects; with Particular Reference to Its Indigenous Plants and Economic Productions』（London: Edward Stanford、1883年初版）。",
    sourceProvider:
      "New York Botanical Garden LuEsther T. Mertz Library所蔵初版本のInternet Archiveデジタル複製（識別子colonybritishho00morr）を底本とし、University of Toronto Robarts Library所蔵本（識別子colonyofbritishh00morruoft）を照合に用いた。Biodiversity Heritage Libraryは本書をパブリックドメインと表示している。",
    sourceUrl: "https://archive.org/details/colonybritishho00morr",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "henderson-british-honduras-1811": {
    sourceEdition:
      "George Henderson『An Account of the British Settlement of Honduras』（Second Edition, Enlarged, London: Printed for R. Baldwin, Paternoster Row、1811年）。",
    sourceProvider:
      "Harvard University所蔵本のInternet Archiveデジタル複製（識別子anaccountbritis00hendgoog）を主底本とし、New York Public Library所蔵本（識別子anaccountbritis01hendgoog）を照合に用いた。原刊標題紙、献辞、序文、第2版広告、目次、折込地図、本文1–237頁、巻末印記を収録。",
    sourceUrl:
      "https://archive.org/details/anaccountbritis00hendgoog",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "gann-maya-indians-1918": {
    sourceEdition:
      "Thomas W. F. Gann『The Maya Indians of Southern Yucatan and Northern British Honduras』（Smithsonian Institution, Bureau of American Ethnology, Bulletin 64, Washington: Government Printing Office、1918年初版）。",
    sourceProvider:
      "米国議会図書館ジェイ・I・キスラック参考コレクション所蔵本を収めるInternet Archive公開画像（識別子mayaindiansofsou00gann）を主底本とした。Project Gutenberg eBook No. 46973は構成、検索、頁境界および公開画像ファイルの照合に限って使用。",
    sourceUrl:
      "https://archive.org/details/mayaindiansofsou00gann",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "uring-voyages-travels-1928": {
    sourceEdition:
      "Nathaniel Uring『The Voyages and Travels of Captain Nathaniel Uring』Captain Alfred Dewar, O.B.E., R.N., B.Litt. (Oxon.) 序説・注（The Seafarers' Library, London: Cassell and Company Ltd.、1928年）。1726年初版本文の逐字再刊に序説、注、索引、半調写真図版8葉を加えた版。",
    sourceProvider:
      "Trent University所蔵本のInternet Archiveデジタル複製（識別子voyagestravelsof0000urin、全312画像）。1928年版に含まれない1726年初版の図版は補わず、同版所収の刊行物本文と図版を収録。",
    sourceUrl: "https://archive.org/details/voyagestravelsof0000urin",
    rights:
      "1726年原著は著作権保護期間を満了しています。1928年版は米国でパブリックドメインであり、オーストラリア国立図書館も当該版を「Edition Out of Copyright」と表示しています。デジタル画像には公開元の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "cook-balise-merida-1769": {
    sourceEdition:
      "Lieutenant Cook『Remarks on a Passage from the River Balise, in the Bay of Honduras, to Merida; the Capital of the Province of Jucatan, in the Spanish West Indies』（London: Printed for C. Parker, 1769年初版）。",
    sourceProvider:
      "John Carter Brown Library所蔵初版本のInternet Archive高精細デジタル複製（識別子remarksonpassage00cook）を主底本とした。Project Gutenberg eBook No. 74378の転写は検索、頁区分、判読の補助に限って参照し、本文確定には原刊画像を用いた。",
    sourceUrl:
      "https://archive.org/details/remarksonpassage00cook",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "swett-british-honduras-san-pedro-1868": {
    sourceEdition:
      "Charles Swett『A Trip to British Honduras, and to San Pedro, Republic of Honduras』（New Orleans: Price Current Print, 1868年初版）。",
    sourceProvider:
      "Library of Congress所蔵初版本のInternet Archiveデジタル複製（識別子triptobritishhon00swet）を主底本とした。同本で欠ける「序説」冒頭の無ノンブル頁（書誌上の原刊3頁）は、Harvard University所蔵本（識別子atriptobritishh01swetgoog）で補完した。",
    sourceUrl:
      "https://archive.org/details/triptobritishhon00swet",
    rights: publicDomainRights,
    publishedDate: "2026-07-29",
    updatedDate: "2026-07-29",
  },
  "gann-discoveries-central-america-1928": {
    sourceEdition:
      "Thomas Gann『Discoveries and Adventures in Central America』（London: Duckworth、1928年初版）。トーマス・A・ジョイスによる序文を含む。",
    sourceProvider:
      "Internet Archive公開画像（識別子discoveriesadven0000thom）を主底本とした。原刊画像を直接読み、同所のOCRは検索、頁分割、難読箇所の位置確認にのみ使用。HathiTrustの書誌および1929年Charles Scribner's Sons版は構成と難読箇所の照合に限って参照した。",
    sourceUrl:
      "https://archive.org/details/discoveriesadven0000thom",
    rights:
      "1928年初版は米国、英国および日本でパブリックドメインです。デジタル画像には公開元の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-30",
    updatedDate: "2026-07-30",
  },
  "juarros-compendio-guatemala-1857": {
    sourceEdition:
      "Domingo Juarros『Compendio de la historia de la ciudad de Guatemala』全2巻（Edición del Museo Guatemalteco, Guatemala: Imprenta de Luna, Calle de la Providencia núm. 2、1857年）。",
    sourceProvider:
      "Biblioteca Ludwig von Mises（Universidad Francisco Marroquín）所蔵1857年版を主底本とし、Harvard University所蔵本のGoogle Books／Internet Archiveデジタル複製（識別子compendiodelahi00juargoog）を全巻の構成、原刊頁、数値および難読箇所の照合に用いた。",
    sourceUrl:
      "https://biblioteca.ufm.edu/opac/record/1072319",
    rights:
      "1857年原刊は著作権保護期間を満了しています。デジタル画像には公開元の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-30",
    updatedDate: "2026-07-30",
  },
  "moran-cholti-1695": {
    sourceEdition:
      "Francisco Morán『Arte en lengua Cholti que quiere decir lengua de milperos』（1685–1695年写本）、William Gates papers, MSS 279 Series 8 Subseries 2 Subseries 5, box 42, folder 1。",
    sourceProvider:
      "Brigham Young University, L. Tom Perry Special Collections所蔵写本の全182頁・188画像デジタル複製（item 53990）を主底本とした。同館の文法タイプ稿（item 52917）・語彙転記（item 54344）およびUniversity of Pennsylvania所蔵C. Hermann Berendt写本（Ms. Coll. 700 Item 84）を頁対応と難読箇所の照合に用いた。",
    sourceUrl:
      "https://contentdm.lib.byu.edu/digital/collection/p15999coll16/id/53990/",
    rights:
      "1695年写本は著作権保護期間を満了しており、Brigham Young Universityの書誌でも「Public domain」と表示されています。デジタル画像には公開元の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-30",
    updatedDate: "2026-07-30",
  },
  "thompson-ethnology-mayas-1930": {
    sourceEdition:
      "J. Eric S. Thompson『Ethnology of the Mayas of Southern and Central British Honduras』（Field Museum of Natural History, Publication 274, Anthropological Series, Vol. XVII, No. 2, Chicago: Field Museum Press、1930年）。原刊27–213頁、地図1葉、写真図版24葉。",
    sourceProvider:
      "Biodiversity Heritage Library／Field Museum of Natural History LibraryのInternet Archiveデジタル複製（識別子ethnologyofmayas172thom）を主底本とした。同複製に欠ける原刊図版XVは、University of Texas所蔵本のGoogle Booksデジタル複製（volume ID NV1qAAAAMAAJ）から補完した。",
    sourceUrl: "https://doi.org/10.5962/bhl.title.3491",
    rights:
      "原著のデジタル公開版は、権利者Field Museum of Natural Historyの許諾により、Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported（CC BY-NC-SA 3.0）で提供されています。本日本語版は原著の翻案物として同一のCC BY-NC-SA 3.0で提供します。利用には原著者・原題・原刊情報・権利者・底本の表示、非営利利用、改変物への同一ライセンスの継承が必要です。追加の制限は設けません。本翻訳・編集はField Museum of Natural HistoryまたはBiodiversity Heritage Libraryの承認を意味しません。ライセンス本文：https://creativecommons.org/licenses/by-nc-sa/3.0/",
    publishedDate: "2026-07-30",
    updatedDate: "2026-07-30",
  },
  "berendt-baumwollenbau-yucatan-1863": {
    "sourceEdition": "Dr. H. Berendt, “Baumwollenbau in Yucatan,” Petermanns Geographische Mittheilungen, 9. Band, 1863, S. 389.",
    "sourceProvider": "New York Public Library所蔵本をGoogleがデジタル化し、Internet Archiveで公開した1863年原誌画像（識別子petermannsgeogr09haacgoog）を主底本とした。OCRは検索・判読の補助にのみ用いた。",
    "sourceUrl": "https://archive.org/details/petermannsgeogr09haacgoog",
    "rights": "1863年原刊本文および誌面はパブリックドメインです。底本はNew York Public Library所蔵本をGoogleがデジタル化し、Internet Archiveで公開した資料で、当該アイテムはNOT_IN_COPYRIGHT（米国）、個別のCreative Commonsライセンス指定なしです。画像・メタデータの利用にはInternet ArchiveのTermsおよびRights & Access表示が適用されます。再利用時は原著名、識別子petermannsgeogr09haacgoog、原刊頁および各機関名を表示します。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "berendt-analytical-alphabet-1869": {
    "sourceEdition": "Dr. C. H. Berendt, Analytical Alphabet for the Mexican & Central American Languages, New York: American Ethnological Society / American Photo-Lithographic Co., 1869, 自筆稿ファクシミリ1–8頁。",
    "sourceProvider": "Library of Congress所蔵初版画像（請求記号・識別子21020706）を主底本とし、Internet Archive公開の同一所蔵本（識別子analyticalalphab00bere）を画像取得・照合に用いた。",
    "sourceUrl": "https://www.loc.gov/item/21020706/",
    "rights": "1869年刊の原著本文およびファクシミリはパブリックドメインです。Library of Congressは当該資料をPublic Domain／Free to Use and Reuseとして公開しています。Internet Archiveの同一資料には個別のCreative Commonsライセンス指定がありません。再利用時は原著名、原刊頁、Library of Congress所蔵・公開、Internet Archive識別子analyticalalphab00bereを表示します。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "berendt-escritos-garcia-icazbalceta-1870": {
    "sourceEdition": "C. A. B. [Carl Hermann Berendt], “Los escritos de D. Joaquín García Icazbalceta,” Revista de Mérida 2 (1870); 再掲 Boletín de la Sociedad Mexicana de Geografía y Estadística, 2ª época, tomo II, 1870, pp. 642–647.",
    "sourceProvider": "UNAM・Instituto de Investigaciones Históricas『Fuentes para el estudio de la historia moderna de los pueblos indígenas de México』公開のBoletín再掲本文および巻PDF（所蔵表示IGg Fondo Reservado）を主底本とした。",
    "sourceUrl": "https://hmpi.historicas.unam.mx/fuentes/boletin-smge/los-escritos-d-joaquin-garcia-icazbalceta",
    "rights": "1870年原著本文および原誌誌面はパブリックドメインです。UNAM・Instituto de Investigaciones Históricasの公開ページは、非営利目的、無改変・無切除、完全な出典と電子アドレスの表示等を条件とし、それ以外には事前の書面許可を求めます（DR © 2019–2022）。個別のCreative Commonsライセンス指定はありません。本版はUNAMのページまたは誌面画像を転載していません。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "berendt-trabajos-linguisticos-juan-pio-perez-1871": {
    "sourceEdition": "Dr. C. Hermann Berendt, “Los trabajos lingüísticos de D. Juan Pío Pérez,” Boletín de la Sociedad Mexicana de Geografía y Estadística, 2ª época, tomo III, núms. 1–6, 1871, pp. 58–61; 別刷6頁。",
    "sourceProvider": "UNAM・Instituto de Investigaciones Históricas公開の原誌本文・巻PDFを主底本とし、University of Pennsylvania Libraries, Kislak Center, Berendt-Brinton Linguistic Collection, Ms. Coll. 700 Item 5の別刷（ARK 81431/p3bz61p4b）を校合本とした。",
    "sourceUrl": "https://hmpi.historicas.unam.mx/fuentes/boletin-smge/los-trabajos-linguisticos-d-juan-pio-perez",
    "rights": "1871年原著本文および原誌・別刷の印刷面はパブリックドメインです。UNAM公開ページは非営利、無改変・無切除、完全な出典表示等の条件を掲げ、個別のCreative Commonsライセンス指定はありません。Pennの校合本はRightsStatements.orgのNo Copyright—United States（NoC-US 1.0）表示です。本版は両機関の画像を転載していません。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "berendt-el-ramie-1871": {
    "sourceEdition": "Dr. C. H. Berendt, El ramié. Tratado sobre el cultivo y algunas noticias de esta planta, Mérida: Imprenta de M. Aldana Rivas, 1871, 39 + [1] pp.（Revista de Mérida掲載文の別刷）。",
    "sourceProvider": "Princeton University所蔵本をGoogleがデジタル化した全文を主底本とし、HathiTrust Digital Libraryの同一所蔵識別子njp.32101078193446、権利コードpd、Full Viewの書誌・画像で照合した。",
    "sourceUrl": "https://catalog.hathitrust.org/Record/009037780",
    "rights": "1871年原著本文および印刷面はパブリックドメインです。HathiTrustは本書をPublic Domain／Full View（権利コードpd）として公開し、個別のCreative Commonsライセンス指定はありません。Google／HathiTrustの画像およびOCRは転載せず、画像照合して作成した独自翻刻の日本語訳を収録しています。底本画像の利用にはGoogle BooksおよびHathiTrustの条件が適用されます。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "berendt-mexico-1872": {
    "sourceEdition": "Carl Hermann Berendt, “Mexico,” Deutsch-amerikanisches Conversations-Lexikon, Bd. 7, New York: F. Gerhard, 1872, pp. 261–288.",
    "sourceProvider": "University of Michigan所蔵本をInternet Archiveが公開する第7巻（識別子bub_gb_uXdMAAAAMAAJ_2）を主底本とした。原刊261–288頁の画像、テキスト層および頁単位の再OCRを照合した。",
    "sourceUrl": "https://archive.org/details/bub_gb_uXdMAAAAMAAJ_2",
    "rights": "1872年刊の原著本文はパブリックドメインです。Internet Archiveの当該アイテムはcontributorをUniversity of Michigan、licenseurlをPublic Domain Mark 1.0（http://creativecommons.org/publicdomain/mark/1.0/）と表示し、rights欄には個別指定がありません。公開画像の利用にはInternet ArchiveのTerms of Useが適用されます。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "berendt-indianer-tehuantepec-1873": {
    "sourceEdition": "H. Berendt, “Die Indianer des Isthmus von Tehuantepec,” Zeitschrift für Ethnologie, Bd. 5, 1873, pp. 146–153.",
    "sourceProvider": "Getty Research Institute所蔵本をInternet Archiveが公開する第5巻（識別子zeitschriftfre05berl）を主底本とした。原刊146–153頁の画像、テキスト層および頁単位の再OCRを照合した。",
    "sourceUrl": "https://archive.org/details/zeitschriftfre05berl",
    "rights": "1873年刊の原著本文はパブリックドメインです。Internet Archiveの当該アイテムはcontributorをGetty Research Institute、possible-copyright-statusをNOT_IN_COPYRIGHTと表示しています。個別のCreative Commonsライセンスおよびrights欄の指定はありません。公開画像の利用にはInternet ArchiveのTerms of Useが適用されます。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "berendt-carib-karif-language-1873": {
    "sourceEdition": "C. H. Berendt, “On a Grammar and Dictionary of the Carib or Karif Language, with Some Account of the People by Whom It Is Spoken,” Annual Report of the Board of Regents of the Smithsonian Institution for 1873, Washington: Government Printing Office, 1874, pp. 363–364.",
    "sourceProvider": "Smithsonian Institution年報1873年巻をInternet Archiveが公開する画像（識別子annual-report-board-of-regents-smithsonian_1873）を主底本とし、原刊363–364頁の画像とOCRを照合した。",
    "sourceUrl": "https://archive.org/details/annual-report-board-of-regents-smithsonian_1873",
    "rights": "1874年刊の原著本文は米国においてパブリックドメインです。Internet Archiveの当該アイテムには個別のCreative Commonsライセンス、rights欄、possible-copyright-status欄の指定がありません。公開画像の利用にはInternet ArchiveのTerms of Useが適用されます。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "berendt-darien-language-1874": {
    "sourceEdition": "C. Hermann Berendt, “The Darien Language: Paper Read before the American Ethnological Society, Nov. 12th, 1873,” The American Historical Record, vol. 3, no. 26, February 1874, pp. 54–59, map.",
    "sourceProvider": "Internet Archive公開の該当号（識別子sim_potters-american-monthly_1874-02_3_26、マイクロフィルム原資料番号IA1630708-07）を主底本とした。原刊54–59頁の画像とテキスト層を照合し、原刊55頁の地図を本文相当位置に収録した。",
    "sourceUrl": "https://archive.org/details/sim_potters-american-monthly_1874-02_3_26",
    "rights": "1874年刊の原著本文と地図はパブリックドメインです。Internet Archiveの当該アイテムはSerials in Microfilmコレクションとして公開され、contributorはInternet Archive、sourceはIA1630708-07 / microfilmです。個別のCreative Commonsライセンス、rights欄、possible-copyright-status欄の指定はありません。公開画像の利用にはInternet ArchiveのTerms of Useが適用されます。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "berendt-ethnologie-nicaragua-1874": {
    "sourceEdition": "“Wissenschaftliche Mittheilungen. Zur Ethnologie von Nicaragua,” Correspondenz-Blatt der deutschen Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, Jg. 5, Nr. 9, September 1874, pp. 70–72. Berendtの書簡から編集部が抄出した予備報告。",
    "sourceProvider": "Oxford University所蔵本をInternet Archiveが公開する1870–1875年合冊（識別子correspndenzbla00avgoog）を主底本とし、原刊70–72頁の画像とDjVu XMLを照合した。",
    "sourceUrl": "https://archive.org/details/correspndenzbla00avgoog",
    "rights": "1874年刊の原著本文はパブリックドメインです。Internet Archiveの当該アイテムは所蔵・提供元をOxford University、possible-copyright-statusをNOT_IN_COPYRIGHTと表示しています。個別のCreative Commonsライセンスおよびrights欄の指定はありません。公開画像の利用にはInternet ArchiveのTerms of Useが適用されます。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "berendt-ethnologie-nicaragua-1875": {
    "sourceEdition": "“Wissenschaftliche Mittheilungen. Zur Ethnologie von Nicaragua,” Correspondenz-Blatt der deutschen Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, Jg. 6, Nr. 6, Juni 1875, pp. 46–47. ベレントの書簡から編集部が掲げた続報。",
    "sourceProvider": "Oxford University所蔵本をInternet Archiveが公開する1870–1875年合冊（識別子 correspndenzbla00avgoog）を主底本とし、原刊46–47頁の画像とDjVu XMLを照合した。",
    "sourceUrl": "https://archive.org/details/correspndenzbla00avgoog",
    "rights": "1875年刊の原著本文はパブリックドメインです。Internet Archiveの当該アイテムはcontributorをOxford University、possible-copyright-statusをNOT_IN_COPYRIGHTと表示しています。個別のCreative Commonsライセンスおよびrights欄の指定はありません。公開画像の利用にはInternet ArchiveのTerms of Useが適用されます。",
    "publishedDate": "2026-08-15",
    "updatedDate": "2026-08-15"
  },
  "berendt-ancient-central-american-civilization-1876": {
    "sourceEdition": "C. H. Berendt, “Geographical Distribution of the Ancient Central American Civilization,” Journal of the American Geographical Society of New York, vol. 8, 1876, pp. 132–145. 1876年7月10日の会合で朗読された論文。",
    "sourceProvider": "JSTOR提供の掲載誌画像をInternet Archiveが公開するアイテム（識別子 jstor-196379、JSTOR stable 196379）を主底本とし、原刊132–145頁の画像とテキスト層を照合した。",
    "sourceUrl": "https://archive.org/details/jstor-196379",
    "rights": "1876年刊の原著本文はパブリックドメインです。Internet Archiveの当該アイテムはcontributorをJSTORと表示し、個別のCreative Commonsライセンス、rights欄、possible-copyright-status欄の指定はありません。収録PDF冒頭のJSTOR Early Journal Content告知は、非営利目的でのオンライン掲載・再配布を認める旨を記しています。公開画像の利用には同告知およびInternet ArchiveのTerms of Useが適用されます。",
    "publishedDate": "2026-08-15",
    "updatedDate": "2026-08-15"
  },
  "berendt-historical-documents-guatemala-1877": {
    "sourceEdition": "C. H. Berendt, “Collections of Historical Documents in Guatemala,” Annual Report of the Board of Regents of the Smithsonian Institution for the Year 1876, Washington: Government Printing Office, 1877, pp. 421–423.",
    "sourceProvider": "Smithsonian Institution年報1876年巻（1877年刊）をInternet Archiveが公開する画像（識別子 annual-report-board-of-regents-smithsonian_1876）を主底本とし、原刊421–423頁の画像とOCRを照合した。",
    "sourceUrl": "https://archive.org/details/annual-report-board-of-regents-smithsonian_1876",
    "rights": "1877年刊の原著本文は米国においてパブリックドメインです。Internet Archiveの当該アイテムはSmithsonian Institution年報を収録し、contributorをInternet Archiveと表示しています。個別のCreative Commonsライセンス、rights欄、possible-copyright-status欄の指定はありません。公開画像の利用にはInternet ArchiveのTerms of Useが適用されます。",
    "publishedDate": "2026-08-15",
    "updatedDate": "2026-08-15"
  },
  "berendt-veracruz-correspondence-1861-1862": {
    "sourceEdition": "C. Hermann Berendt, Correspondenz [und] Artikel aus Veracruz (erste Zeit der Intervention), 1861–1862, Berendt-Brinton Linguistic Collection, Ms. Coll. 700, Item 245.",
    "sourceProvider": "University of Pennsylvania Libraries, Kislak Center for Special Collections, Rare Books and Manuscripts所蔵資料のColenda公開PDF全140頁を主底本とし、ドイツ語・フランス語・スペイン語の印刷物と自筆稿を頁単位で照合した。OCRは検索・判読補助にのみ用いた。",
    "sourceUrl": "https://colenda.library.upenn.edu/catalog/81431-p3fx74j95",
    "rights": "原資料本文は米国においてパブリックドメインです。Pennのデジタル資料にはRightsStatements.orgのNo Copyright - United States（NoC-US 1.0）が表示されています。画像提供：University of Pennsylvania Libraries。本日本語訳には再利用ライセンスを設定していません。",
    "publishedDate": "2026-08-15",
    "updatedDate": "2026-08-15"
  },
  "berendt-drei-tage-cuba-1860": {
    "sourceEdition": "C. Hermann Berendt, Drei Tage auf der Insel Cuba. Reise Fragment für meine Tochter Helene, ca. 1860, Berendt-Brinton Linguistic Collection, Ms. Coll. 700, Item 230.",
    "sourceProvider": "University of Pennsylvania Libraries, Kislak Center for Special Collections, Rare Books and Manuscripts所蔵のドイツ語自筆稿を収めるColenda公開PDF全160頁を主底本とし、正像・鏡像・裏写りを頁単位で判別して照合した。OCRは検索・判読補助にのみ用いた。",
    "sourceUrl": "https://colenda.library.upenn.edu/catalog/81431-p3bz61v8h",
    "rights": "原写本本文は米国においてパブリックドメインです。Pennのデジタル資料にはRightsStatements.orgのNo Copyright - United States（NoC-US 1.0）が表示されています。画像提供：University of Pennsylvania Libraries。本日本語訳には再利用ライセンスを設定していません。",
    "publishedDate": "2026-08-15",
    "updatedDate": "2026-08-15"
  },
  "berendt-acasaguastlan-jilotepec-1878": {
    "sourceEdition": "Expedition nach Acasaguastlan und Jilotepec (Item 90); Letter to José Inocenta Cordon and related papers from the expedition of Franz Bromowicz, 1878 (Item 244); Nahuatl de San Agustin Acasaguastlan (Item 149), Berendt-Brinton Linguistic Collection, Ms. Coll. 700.",
    "sourceProvider": "University of Pennsylvania Libraries, Kislak Center for Special Collections, Rare Books and Manuscripts所蔵の三レコード（Item 90、244、149）を公開するColenda PDF計81頁を主底本とした。相互参照関係のある資料を一資料篇に収めたが、各レコードの出典境界と画像頁を保持した。OCRは検索・判読補助にのみ用いた。",
    "sourceUrl": "https://colenda.library.upenn.edu/catalog/81431-p37h1dx0s",
    "additionalSourceUrls": [
      "https://colenda.library.upenn.edu/catalog/81431-p33n2115h",
      "https://colenda.library.upenn.edu/catalog/81431-p34j0b71h"
    ],
    "rights": "原資料本文は米国においてパブリックドメインです。三つのPennデジタル資料にはRightsStatements.orgのNo Copyright - United States（NoC-US 1.0）が表示されています。画像提供：University of Pennsylvania Libraries。本日本語訳には再利用ライセンスを設定していません。",
    "publishedDate": "2026-08-15",
    "updatedDate": "2026-08-15"
  },
  "berendt-indigenas-america-central-1877": {
    sourceEdition:
      "C. Hermann Berendt, Los indígenas de la América Central y sus idiomas, 1877, William Gates papers, MSS 279, Series 10, Box 109, Folder 3.",
    sourceProvider:
      "L. Tom Perry Special Collections, Harold B. Lee Library, Brigham Young University所蔵のスペイン語草稿複写。BYU Digital Collectionsの公開画像から番号付本文1–35頁を復元配列し、公開画像11–46の無番号作業紙群は翻訳対象外とした。",
    sourceUrl:
      "https://contentdm.lib.byu.edu/digital/collection/Gates/id/104276",
    additionalSourceUrls: [
      "https://archives.lib.byu.edu/repositories/14/archival_objects/54387",
    ],
    rights:
      "原資料本文はパブリックドメインです。BYU Digital Collectionsの公開記録はRightsをPublic domain、Rights HolderをBrigham Young Universityと表示しています。公開・所蔵：L. Tom Perry Special Collections, Harold B. Lee Library, Brigham Young University。",
    publishedDate: "2026-08-15",
    updatedDate: "2026-08-15",
  },
  "berendt-palabras-modismos-nicaragua-1874": {
    sourceEdition:
      "Carl Hermann Berendt, Palabras y modismos de la lengua castellana según se habla en Nicaragua, 1874, Berendt-Brinton Linguistic Collection, Ms. Coll. 700, Item 178.",
    sourceProvider:
      "University of Pennsylvania Libraries, Kislak Center for Special Collections, Rare Books and Manuscripts所蔵のスペイン語自筆語彙集を収めるColenda公開PDF全425頁を主底本とし、本文1,346項目と追補273項目を原画像と照合した。",
    sourceUrl: "https://colenda.library.upenn.edu/catalog/81431-p3833nd59",
    rights:
      "原資料本文は米国においてパブリックドメインです。Pennのデジタル資料にはRightsStatements.orgのNo Copyright – United States（NoC-US 1.0）が表示されています。画像提供：University of Pennsylvania Libraries。",
    publishedDate: "2026-08-15",
    updatedDate: "2026-08-15",
  },
  "berendt-mangue-subtiaba-dossier-1874": {
    sourceEdition:
      "Lengua chorotega o mangue (Item 144); Apuntes sobre la lengua de subtiaba (Item 242); The Mangues (Chorotegans or Dirians), Nicaragua (Item 247), Berendt-Brinton Linguistic Collection, Ms. Coll. 700.",
    sourceProvider:
      "University of Pennsylvania Libraries, Kislak Center for Special Collections, Rare Books and Manuscripts所蔵の三レコードを公開するColenda PDF計103頁を主底本とした。相互参照関係のある資料を一資料篇に収め、各Itemと公開PDF頁の境界を保持した。",
    sourceUrl: "https://colenda.library.upenn.edu/catalog/81431-p36m33q58",
    additionalSourceUrls: [
      "https://colenda.library.upenn.edu/catalog/81431-p39c6sn0w",
      "https://colenda.library.upenn.edu/catalog/81431-p37d2qv0z",
    ],
    rights:
      "原資料本文は米国においてパブリックドメインです。三つのPennデジタル資料にはRightsStatements.orgのNo Copyright – United States（NoC-US 1.0）が表示されています。画像提供：University of Pennsylvania Libraries。",
    publishedDate: "2026-08-15",
    updatedDate: "2026-08-15",
  },
  "berendt-central-america-explorations-1867": {
    sourceEdition:
      "Carl Hermann Berendt, “Report of Explorations in Central America,” Annual Report of the Board of Regents of the Smithsonian Institution, Showing the Operations, Expenditures, and Condition of the Institution for the Year 1867, Washington: Government Printing Office, 1868, pp. 420–426.",
    sourceProvider:
      "Smithsonian Libraries所蔵本の原刊画像（同館デジタルライブラリ）を主底本とし、Internet Archive公開複製を原刊頁、原注、固有名詞、数値および難読箇所の照合に用いた。",
    sourceUrl:
      "https://library.si.edu/digital-library/book/annualreportofbo1867smit",
    rights: publicDomainRights,
    publishedDate: "2026-07-30",
    updatedDate: "2026-07-30",
  },
  "berendt-vermessungsarbeiten-mexiko-1862": {
    sourceEdition:
      "Dr. H. Berendt, “I. Vermessungs-Arbeiten in Mexiko,” Dr. H. Berendt’s Mittheilungen über Mexiko, Petermann’s Geographische Mittheilungen, 1862, Heft V, S. 171–173.",
    sourceProvider:
      "New York Public Library所蔵本をGoogleがデジタル化し、Internet Archiveで公開した1862年原誌画像（識別子petermannsgeogr05haacgoog）を主底本とした。OCRは検索・判読の補助にのみ用いた。",
    sourceUrl:
      "https://archive.org/details/petermannsgeogr05haacgoog",
    rights:
      "1862年原刊本文および誌面はパブリックドメインです。底本はNew York Public Library所蔵本をGoogleがデジタル化し、Internet Archiveで公開した資料で、当該アイテムの権利表示は「NOT_IN_COPYRIGHT」（米国）です。個別のCreative Commonsライセンス指定はありません。再利用時はInternet Archiveの利用規約とRights & Access表示に従い、資料名、識別子、原刊頁および各機関名を表示します。",
    publishedDate: "2026-08-14",
    updatedDate: "2026-08-14",
  },
  "berendt-maasse-gewichte-mexiko-1862": {
    sourceEdition:
      "Dr. H. Berendt, “II. Maasse und Gewichte in Mexiko,” Dr. H. Berendt’s Mittheilungen über Mexiko, Petermann’s Geographische Mittheilungen, 1862, Heft VI, S. 215–216.",
    sourceProvider:
      "New York Public Library所蔵本をGoogleがデジタル化し、Internet Archiveで公開した1862年原誌画像（識別子petermannsgeogr05haacgoog）を主底本とした。OCRは検索・判読の補助にのみ用いた。",
    sourceUrl:
      "https://archive.org/details/petermannsgeogr05haacgoog",
    rights:
      "1862年原刊本文および誌面はパブリックドメインです。底本はNew York Public Library所蔵本をGoogleがデジタル化し、Internet Archiveで公開した資料で、当該アイテムの権利表示は「NOT_IN_COPYRIGHT」（米国）です。個別のCreative Commonsライセンス指定はありません。再利用時はInternet Archiveの利用規約とRights & Access表示に従い、資料名、識別子、原刊頁および各機関名を表示します。",
    publishedDate: "2026-08-14",
    updatedDate: "2026-08-14",
  },
  "berendt-handel-veracruz-1862": {
    sourceEdition:
      "Dr. H. Berendt, “III. Der Handel von Veracruz,” Dr. H. Berendt’s Mittheilungen über Mexiko, Petermann’s Geographische Mittheilungen, 1862, Heft VI, S. 216–218.",
    sourceProvider:
      "New York Public Library所蔵本をGoogleがデジタル化し、Internet Archiveで公開した1862年原誌画像（識別子petermannsgeogr05haacgoog）を主底本とした。OCRは検索・判読の補助にのみ用いた。",
    sourceUrl:
      "https://archive.org/details/petermannsgeogr05haacgoog",
    rights:
      "1862年原刊本文および誌面はパブリックドメインです。底本はNew York Public Library所蔵本をGoogleがデジタル化し、Internet Archiveで公開した資料で、当該アイテムの権利表示は「NOT_IN_COPYRIGHT」（米国）です。個別のCreative Commonsライセンス指定はありません。再利用時はInternet Archiveの利用規約とRights & Access表示に従い、資料名、識別子、原刊頁および各機関名を表示します。",
    publishedDate: "2026-08-14",
    updatedDate: "2026-08-14",
  },
  "berendt-cochenille-produktion-oaxaca-1862": {
    sourceEdition:
      "Dr. H. Berendt, “IV. Die Cochenille-Produktion des Staates von Oaxaca in 100 Jahren (1758–1858),” Dr. H. Berendt’s Mittheilungen über Mexiko, Petermann’s Geographische Mittheilungen, 1862, Heft VII, S. 256–258.",
    sourceProvider:
      "New York Public Library所蔵本をGoogleがデジタル化し、Internet Archiveで公開した1862年原誌画像（識別子petermannsgeogr05haacgoog）を主底本とした。OCRは検索・判読の補助にのみ用いた。",
    sourceUrl:
      "https://archive.org/details/petermannsgeogr05haacgoog",
    rights:
      "1862年原刊本文および誌面はパブリックドメインです。底本はNew York Public Library所蔵本をGoogleがデジタル化し、Internet Archiveで公開した資料で、当該アイテムの権利表示は「NOT_IN_COPYRIGHT」（米国）です。個別のCreative Commonsライセンス指定はありません。再利用時はInternet Archiveの利用規約とRights & Access表示に従い、資料名、識別子、原刊頁および各機関名を表示します。",
    publishedDate: "2026-08-14",
    updatedDate: "2026-08-14",
  },
  "berendt-mexikanische-geographische-literatur-1862-1": {
    sourceEdition:
      "Dr. H. Berendt, “V. Die Mexikanische Geographische Literatur seit dem Jahre 1860,” Dr. H. Berendt’s Mittheilungen über Mexiko, Petermann’s Geographische Mittheilungen, 1862, Heft IX, S. 336–341（連載第1回）.",
    sourceProvider:
      "New York Public Library所蔵本をGoogleがデジタル化し、Internet Archiveで公開した1862年原誌画像（識別子petermannsgeogr05haacgoog）を主底本とした。OCRは検索・判読の補助にのみ用いた。",
    sourceUrl:
      "https://archive.org/details/petermannsgeogr05haacgoog",
    rights:
      "1862年原刊本文および誌面はパブリックドメインです。底本はNew York Public Library所蔵本をGoogleがデジタル化し、Internet Archiveで公開した資料で、当該アイテムの権利表示は「NOT_IN_COPYRIGHT」（米国）です。個別のCreative Commonsライセンス指定はありません。再利用時はInternet Archiveの利用規約とRights & Access表示に従い、資料名、識別子、原刊頁および各機関名を表示します。",
    publishedDate: "2026-08-14",
    updatedDate: "2026-08-14",
  },
  "garcia-pelaez-memorias-guatemala-1851-1852": {
    sourceEdition:
      "Francisco de Paula García Peláez, Memorias para la historia del antiguo reyno de Guatemala, tomo primero, Guatemala: Establecimiento tipográfico de L. Luna, 1851; tomos segundo y tercero, Guatemala: Establecimiento tipográfico de L. Luna, 1852.",
    sourceProvider:
      "第1巻・第2巻はInternet Archive公開の初版スキャン、第3巻はGoogle Books公開の初版スキャンを底本とした。第1巻の主底本に欠ける原刊274–275頁は、同じ1851年初版のWikimedia Commons公開複製で前後を照合して補完した。",
    sourceUrl:
      "https://archive.org/details/memoriasparalah00pelgoog",
    rights: publicDomainRights,
    publishedDate: "2026-07-30",
    updatedDate: "2026-07-30",
  },
  "maudslay-glimpse-guatemala-1899": {
    sourceEdition:
      "Anne Cary Maudslay and Alfred Percival Maudslay, A Glimpse at Guatemala, and Some Notes on the Ancient Monuments of Central America, London: John Murray, 1899.",
    sourceProvider:
      "Internet Archive公開の1899年初版スキャン（識別子 glimpseatguatema00maud）を主底本とし、Project Gutenberg eBook No. 47693の校訂済み転写を検索、頁区分、難読箇所の照合に用いた。",
    sourceUrl:
      "https://archive.org/details/glimpseatguatema00maud",
    rights: publicDomainRights,
    publishedDate: "2026-07-30",
    updatedDate: "2026-07-30",
  },
  "dunn-guatimala-central-america-1828": {
    sourceEdition:
      "Henry Dunn『Guatimala, or, The United Provinces of Central America, in 1827–8; Being Sketches and Memorandums Made during a Twelve Months' Residence in That Republic』（New York: G. & C. Carvill、1828年初版）。",
    sourceProvider:
      "English Wikisource公開の1828年初版スキャンおよび校訂済み転写。原刊画像を本文確定の基準とし、転写は検索、頁境界、難読箇所の照合に用いた。標題紙、著作権登録、目次、序文、本文9–318頁、巻末訂正を収録。",
    sourceUrl:
      "https://en.wikisource.org/wiki/Index:Guatimala_or_the_United_Provinces_of_Central_America_in_1827-8.pdf",
    rights: publicDomainRights,
    publishedDate: "2026-07-30",
    updatedDate: "2026-07-30",
  },
  "gibbs-british-honduras-1883": {
    sourceEdition:
      "Archibald Robertson Gibbs『British Honduras: An Historical and Descriptive Account of the Colony from Its Settlement, 1670』（London: Sampson Low, Marston, Searle, & Rivington、1883年初版）。",
    sourceProvider:
      "トロント大学図書館所蔵本のInternet Archiveデジタル複製（識別子britishhondurash00gibbuoft、全248画像）を底本とした。原刊前付、本文1–198頁、全15章、付録2編、および同本に合綴されたサンプソン・ロウ社刊行書目広告32頁を収録。",
    sourceUrl:
      "https://archive.org/details/britishhondurash00gibbuoft",
    rights: publicDomainRights,
    publishedDate: "2026-07-30",
    updatedDate: "2026-07-30",
  },
  "young-black-charaibs-st-vincent-1795": {
    sourceEdition:
      "Sir William Young（編）『An Account of the Black Charaibs in the Island of St. Vincent’s; with the Charaib Treaty of 1779, and Other Original Documents. Compiled from the Papers of the Late Sir William Young, Bart.』（London: Printed for J. Sewell; and Knight and Triphook、1795年初版）。",
    sourceProvider:
      "John Carter Brown Library所蔵本のInternet Archiveデジタル複製（識別子 accountofblackch00youn、全144画像）を底本とした。原刊標題紙の「1779」は1773年の誤植であるため、原題表記は保持し、書誌説明および訳文で実際の締結年を明示した。",
    sourceUrl:
      "https://archive.org/details/accountofblackch00youn",
    rights: publicDomainRights,
    publishedDate: "2026-07-30",
    updatedDate: "2026-07-30",
  },
  "sapper-mittelamerikanische-reisen-studien-1902": {
    sourceEdition:
      "Karl Sapper『Mittelamerikanische Reisen und Studien aus den Jahren 1888 bis 1900』（Braunschweig: Druck und Verlag von Friedrich Vieweg und Sohn、1902年初版）。",
    sourceProvider:
      "University of Toronto Robarts Library旧蔵本のInternet Archiveデジタル複製（識別子 mittelamerikanis00sapp）を主底本とした。同個体で欠ける原刊347頁は、同版別個体の公開画像で補完した。",
    sourceUrl:
      "https://archive.org/details/mittelamerikanis00sapp",
    rights: publicDomainRights,
    publishedDate: "2026-07-30",
    updatedDate: "2026-07-30",
  },
  "honduras-slaves-correspondence-1823": {
    sourceEdition:
      "Great Britain, House of Commons, Slaves. Population. Correspondence Relative to the Condition and Treatment of Slaves at Honduras, 1820–1823, House of Commons Paper 457, ordered to be printed 16 June 1823.",
    sourceProvider:
      "Center for Research Libraries（CRL）が原刊から作成したデジタル複製（Scans 001–100、識別子 c0567b14-208d-4656-9559-464ae5bb5726）を底本とした。公開元の利用条件に従いスキャン画像は転載せず、標題紙、表および系譜は本文情報から活字で再構成した。",
    sourceUrl: "https://www.crl.edu/",
    rights:
      "1823年原刊本文はパブリックドメインです。CRLのデジタル画像には同館の利用条件が適用され、本版には画像を転載していません。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "defence-settlers-honduras-1824": {
    sourceEdition:
      "The Defence of the Settlers of Honduras Against the Unjust and Unfounded Representations of Colonel George Arthur, Late Superintendent of That Settlement: Principally Contained in His Correspondence Relative to the Condition and Treatment of the Slaves at Honduras, 1820–1823, and Printed by Order of the House of Commons, 16th June, 1823, London: A. J. Valpy, 1824.",
    sourceProvider:
      "Harvard University所蔵の1824年ロンドン再刊版を収めるGoogle Booksデジタル複製（識別子 wsP68VpPgfUC）を底本とした。原刊標題紙、目次、本文、脚注、付録、署名者一覧、および1798年のスペイン軍来襲記録を収録。",
    sourceUrl: "https://books.google.com/books?id=wsP68VpPgfUC",
    rights: publicDomainRights,
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "lundell-vegetation-peten-1937": {
    sourceEdition:
      "Cyrus Longworth Lundell『The Vegetation of Petén: With an Appendix, Studies of Mexican and Central American Plants—I』（Carnegie Institution of Washington Publication No. 478, Washington, D.C.、1937年初版）。",
    sourceProvider:
      "Smithsonian Libraries and Archives所蔵本をBiodiversity Heritage Libraryが公開する全310画像のデジタル複製（BHL item 333361、Internet Archive識別子 vegetationpetey00lund）を底本とした。BHLは本資料を「In Copyright. Digitized with the permission of the rights holder」と表示している。底本に収録されていない背面ポケット図版10・14・26は補作せず、原位置に欠落を明示した。",
    sourceUrl: "https://www.biodiversitylibrary.org/item/333361",
    rights:
      "原著・底本画像は、Biodiversity Heritage Libraryが権利者Carnegie Institution for Scienceの許諾により、Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International（CC BY-NC-SA 4.0）で提供しています。本日本語版は翻案物として同一のCC BY-NC-SA 4.0で提供します。利用には原著者・原題・原刊情報・権利者・底本の表示、非営利利用、改変物への同一ライセンスの継承が必要です。追加の制限は設けません。本翻訳・編集はCarnegie Institution for Science、Smithsonian Libraries and ArchivesまたはBiodiversity Heritage Libraryの承認を意味しません。ライセンス本文：https://creativecommons.org/licenses/by-nc-sa/4.0/",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "sapper-alta-verapaz-1901": {
    sourceEdition:
      "Karl Sapper, “Die Alta Verapaz (Guatemala). Eine landeskundliche Skizze mit 5 Originalkarten,” Mittheilungen der Geographischen Gesellschaft in Hamburg, Bd. XVII, Hamburg: L. Friederichsen & Co., 1901, S. 78–224.",
    sourceProvider:
      "HathiTrust公開のPrinceton University所蔵『Mitteilungen der Geographischen Gesellschaft in Hamburg』第15–17巻合本（識別子 njp.32101077281143）に収められた第17巻所収本文を主底本とした。本文照合には同巻のGoogle Books別個体および1902年別刷を補助的に用いた。原図5枚は、Biblioteca Ludwig von Mises（Universidad Francisco Marroquín）所蔵単葉資料とAmerican Geographical Society Library（University of Wisconsin–Milwaukee）所蔵の1901年地質図を同版の標題・縮尺・刊記と照合して収録した。",
    sourceUrl:
      "https://babel.hathitrust.org/cgi/pt?id=njp.32101077281143",
    rights: publicDomainRights,
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "santo-thomas-colonisation-1844": {
    sourceEdition:
      "Compagnie belge de colonisation, Amérique Centrale. Colonisation du district de Santo-Thomas de Guatemala, par la Communauté de l’Union, fondée par la Compagnie belge de colonisation. Collection de renseignements publiés ou recueillis par la Compagnie, Paris: Rignoux, 1844.",
    sourceProvider:
      "HathiTrustが公開するイリノイ大学アーバナ・シャンペーン校所蔵本の全398画像（識別子 uiuo.ark:/13960/t3fz72q63）を主底本とした。底本所蔵本で欠ける第三部原刊3頁は、同版別個体の公開OCR本文を前後頁と照合して補完した。",
    sourceUrl:
      "https://babel.hathitrust.org/cgi/pt?id=uiuo.ark%3A%2F13960%2Ft3fz72q63",
    rights: publicDomainRights,
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "crowe-gospel-central-america-1850": {
    sourceEdition:
      "Frederick Crowe, The Gospel in Central America; Containing a Sketch of the Country, Physical and Geographical—Historical and Political—Moral and Religious; a History of the Baptist Mission in British Honduras, and of the Introduction of the Bible into the Spanish American Republic of Guatemala, London: Charles Gilpin, 1850.",
    sourceProvider:
      "HathiTrustが公開するノースカロライナ大学チャペルヒル校所蔵本の全634画像（識別子 nc01.ark:/13960/t83j6hq0b）を底本とした。綴じ込まれたチャールズ・ギルピン社刊行書目、前付、本文全三部、原注、正誤表、目次、末尾の折込地図を収録した。",
    sourceUrl:
      "https://babel.hathitrust.org/cgi/pt?id=nc01.ark%3A%2F13960%2Ft83j6hq0b",
    rights: publicDomainRights,
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "brigham-guatemala-quetzal-1887": {
    sourceEdition:
      "William Tufts Brigham『Guatemala: The Land of the Quetzal; A Sketch』（New York: Charles Scribner’s Sons、1887年初版）。",
    sourceProvider:
      "Getty Research Institute所蔵の1887年初版本を収めるInternet Archive公開画像（識別子 guatemalalandofq00brigiala）を底本とした。前付、本文1–453頁、付録、索引、全図版・地図、および巻末のスクリブナー社付載広告を収録。",
    sourceUrl:
      "https://archive.org/details/guatemalalandofq00brigiala",
    rights:
      "1887年原刊および原刊の図版・地図は著作権保護期間を満了しています。デジタル画像にはInternet Archiveおよび所蔵館の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "stoll-ethnographie-guatemala-1884": {
    sourceEdition:
      "Otto Stoll『Zur Ethnographie der Republik Guatemala』（Zürich: Druck von Orell Füssli & Co.、1884年初版）。",
    sourceProvider:
      "Harvard University Peabody Museum所蔵本を収めるInternet Archive公開画像（識別子bub_gb_I1kTAAAAYAAJ）を底本とした。原刊本文1–175頁、比較語彙表、付図を収録し、原刊標題紙画像を併載した。",
    sourceUrl:
      "https://archive.org/details/bub_gb_I1kTAAAAYAAJ",
    rights:
      "1884年原刊は著作権保護期間を満了しています。Internet Archiveの資料ページは当該デジタル資料をPublic Domain Mark 1.0で表示しています。デジタル画像には公開元・所蔵館の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-13",
    updatedDate: "2026-08-13",
  },
  "stoll-guatemala-reisen-schilderungen-1886": {
    sourceEdition:
      "Otto Stoll『Guatemala: Reisen und Schilderungen aus den Jahren 1878–1883』（Leipzig: F. A. Brockhaus、1886年初版）。",
    sourceProvider:
      "Wellcome Library所蔵の1886年初版本を収めるInternet Archive公開画像（識別子 b24883268、ark:/13960/t11p2wz5r）を底本とした。原刊前付V–XII頁、本文1–518頁、付録、索引、正誤表、挿図12点、折込気象表、政治地図・民族誌図を収録。",
    sourceUrl:
      "https://archive.org/details/b24883268",
    rights:
      "1886年原刊および原刊の図版・地図は著作権保護期間を満了しています。Internet Archiveに掲載されたWellcome Library所蔵本はPublic Domain Mark表示です。デジタル画像には公開元の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "stoll-ixil-language-1887": {
    sourceEdition:
      "Otto Stoll『Die Sprache der Ixil-Indianer: Ein Beitrag zur Ethnologie und Linguistik der Maya-Völker』（Leipzig: F. A. Brockhaus、1887年初版）。",
    sourceProvider:
      "Harvard University所蔵本を収めるInternet Archive公開画像（識別子bub_gb_f1oTAAAAYAAJ）を底本とした。原刊本文1–156頁、比較語彙、補遺、正誤表、巻末広告を収録し、原刊標題紙画像を併載した。",
    sourceUrl:
      "https://archive.org/details/bub_gb_f1oTAAAAYAAJ",
    rights:
      "1887年原刊は著作権保護期間を満了しています。Internet Archiveの資料ページは当該デジタル資料をPublic Domain Mark 1.0で表示しています。デジタル画像には公開元・所蔵館の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-13",
    updatedDate: "2026-08-13",
  },
  "stoll-pokom-languages-1888-1896": {
    sourceEdition:
      "Otto Stoll『Die Maya-Sprachen der Pokom-Gruppe』第一部『Die Sprache der Pokonchi-Indianer』（Wien: Alfred Hölder、1888年）および第二部『Die Sprache der K’ekchi-Indianer, nebst Anhang: Die Uspanteca-Sprache』（Leipzig: K. F. Köhler’s Antiquarium、1896年）。",
    sourceProvider:
      "Harvard University所蔵本を収めるInternet Archive公開画像（識別子bub_gb_r28AAAAAYAAJ）を主底本とした。第一部原刊183–184頁の欠落と185頁左欄の欠損はGoogle BooksのUniversity of California所蔵本（識別子eWRFAQAAIAAJ）で補完し、第二部はBayerische Staatsbibliothek公開資料（識別子11814635bsb）でも原画像照合した。両部の原刊標題紙画像を併載した。",
    sourceUrl:
      "https://archive.org/details/bub_gb_r28AAAAAYAAJ",
    rights:
      "1888年・1896年原刊は著作権保護期間を満了しています。Internet Archiveの主底本資料ページは当該デジタル資料をPublic Domain Mark 1.0で表示しています。補完・照合用画像には各公開元・所蔵館の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-13",
    updatedDate: "2026-08-13",
  },
  "brinton-chilan-balam-1882": {
    sourceEdition:
      "Daniel G. Brinton『The Books of Chilan Balam: The Prophetic and Historic Records of the Mayas of Yucatan』（Philadelphia: Edward Stern & Co.、1882年初版）。",
    sourceProvider:
      "Library of Congress所蔵の1882年初版本を収めるInternet Archive公開画像（識別子 booksofchilanbal00brin、全24画像）を底本とした。原刊標題紙、はしがき、本文5–19頁、原注13件、月名記号2図および日名記号1図（2頁）を収録。",
    sourceUrl:
      "https://archive.org/details/booksofchilanbal00brin",
    rights:
      "1882年原刊および原刊の図版は、米国・日本ともに著作権保護期間を満了しています。Internet Archiveに掲載されたLibrary of Congress所蔵本のデジタル画像には、公開元の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "codex-perez-pmm9-1877": {
    sourceEdition:
      "Juan Pío Pérez編纂、Crescencio Carrillo y Ancona写『Codex Pérez: manuscript, [1877]』Princeton University Library, Manuscripts Division, C0940, Princeton Mesoamerican Manuscripts no. 9。",
    sourceProvider:
      "Princeton University Library Digital Collectionsが公開する大型清書本のIIIF全142画像を直接の底本とし、1877年写本の配列、三部構成、注記、反復、表、数字、図像を基準にした。Juan Pío Pérezの1837年頃の原編集写本に付された頁番号、同系の『チラム・バラム』諸本、公開校訂本文・部分訳は、欠字、綴り、反復箇所、語の切れ目と解釈の照合に限って用いた。",
    sourceUrl:
      "https://digital-collections.princeton.edu/i/codex-pe%CC%81rez-manuscript-1877/item/dc2f6e4e-9ba2-4330-8114-71d4c71aec9a",
    rights:
      "Juan Pío Pérez（1859年没）およびCrescencio Carrillo y Ancona（1897年没）による写本文言は著作権保護期間を満了しています。Princeton University Libraryの個別資料ページは本写本画像を「Copyright Not Evaluated」と表示しています。同館のCopyright and Permissions Policiesは、所蔵資料の多くについて著作権を保有せず、同館が作成したデジタル複製にも新たな著作権を主張しない一方、個々の利用に関する法令・第三者権利・資料条件の確認を利用者へ求めています。本版は研究上必要な頭像、暦輪、日名グリフ、表の部分だけを収録し、資料名、所蔵機関、請求記号、該当葉を明記しています。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-12",
    updatedDate: "2026-08-12",
  },
  "roys-chilam-balam-chumayel-1933": {
    sourceEdition:
      "Ralph L. Roys, The Book of Chilam Balam of Chumayel, Carnegie Institution of Washington, Publication No. 438（Washington: Carnegie Institution of Washington、1933年初版）。",
    sourceProvider:
      "University of Michigan所蔵本を撮影したHathiTrustデジタル複製（識別子 mdp.39015010391277、書籍本体258コマ。底本PDFはCC0証明頁を加えた全259頁）を主底本とした。英訳部の公開転写は検索、頁対応、難読箇所の照合に限って使用し、校訂マヤ語本文、原刊索引、図版を含む本文確定は原刊画像に基づいた。底本で折り畳まれたまま撮影された図版2の北部ユカタン地図は、同じ1933年版の公開画像を照合して補った。",
    sourceUrl:
      "https://babel.hathitrust.org/cgi/pt?id=mdp.39015010391277",
    rights:
      "1933年原刊について、米国の当時の制度では刊行後28年目の更新登録が必要であり、Roys、書名その他の異表記で米国著作権更新記録を調査しましたが、該当登録を確認できなかったため、本公開では米国におけるパブリックドメイン資料として扱っています。日本では、著作権法第58条（保護期間の相互主義）により原産国の保護期間を超えないものとして、本公開では原著本文を保護対象外として扱っています。底本PDFにはHathiTrustのCC0表示があります。この表示はデジタル画像に関する表示であり、原著本文の権利状態とは区別しています。1967年University of Oklahoma Press版は使用していません。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "elorza-conquista-ytza-1714": {
    sourceEdition:
      "Francisco de Elorza y Rada『Nobiliario de el Valle de la Valdorba』（Pamplona: Francisco Antonio de Neyra、1714年初版）所収「Conquista de la provincia del Ytza, en la Nueva España, por el Conde de Lizarraga Vengoa」、原刊207–279頁。",
    sourceProvider:
      "Biblioteca Foral de Bizkaiaのデジタル複製（識別子 20.500.11938/74590）を主底本とした。判読、固有名詞、構文の照合にはPhilip Ainsworth Means『A Narrative of the Conquest of the Province of the Ytzas in New Spain』（Paris: Genet、1930年）の英訳および同書所収影印を用いたが、本文確定、頁境界、綴り、文書構成は1714年刊本を基準とした。",
    sourceUrl:
      "https://liburutegibiltegi.bizkaia.eus/handle/20.500.11938/74590",
    rights:
      "1714年原刊本文は著作権保護期間を満了しています。Biblioteca Foral de Bizkaiaの当該デジタル複製にはPublic Domain Markが表示されています。1930年ミーンズ版は判読・校合にのみ用い、その画像は本版に転載していません。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "chonay-totonicapan-title-1886": {
    sourceEdition:
      "Dionisio José Chonay, “Título de los señores de Totonicapán, escrito en lengua quiché el año de 1554, y traducido a la castellana el de 1834,” 『Boletín de la Sociedad Geográfica de Madrid』（Madrid、1886年）pp. 149–171。",
    sourceProvider:
      "Trent University, Thomas J. Bata Library所蔵本のInternet Archiveデジタル複製（識別子 titulodelossenor0000unse）を底本とした。Internet Archiveの書誌年は1885年だが、収録本文は1886年号であることを原刊本文と会務記録で確認し、本作に当たる原刊149–171頁のみを収録した。",
    sourceUrl:
      "https://archive.org/details/titulodelossenor0000unse",
    rights:
      "1554年原文書、1834年スペイン語訳および1886年刊行本文は、著作権保護期間を満了しています。Internet Archiveに掲載されたTrent University所蔵本のデジタル画像には、公開元の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "saville-reports-maya-yucatan-1921": {
    sourceEdition:
      "Marshall H. Saville, ed., Reports on the Maya Indians of Yucatan, Indian Notes and Monographs, Vol. IX, No. 3（New York: Museum of the American Indian, Heye Foundation、1921年）。",
    sourceProvider:
      "Smithsonian Libraries所蔵本のInternet Archiveデジタル複製（識別子 reportsonmayaind93savi）を底本とした。表紙、叢書説明、標題紙、目次、序文、原刊137–226頁の本文、用語集、参考文献、注を収録し、原刊の白紙頁も位置を明示した。",
    sourceUrl:
      "https://archive.org/details/reportsonmayaind93savi",
    rights:
      "1545年・1639年・1861年の原記録および1921年刊行本文は、著作権保護期間を満了しています。Internet Archiveに掲載されたSmithsonian Libraries所蔵本のデジタル画像には、公開元の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "brasseur-rabinal-achi-1862": {
    sourceEdition:
      "Charles-Étienne Brasseur de Bourbourg『Grammaire de la langue quichée, espagnole-française, mise en parallèle avec ses deux dialectes, cakchiquel et tzutuhil … servant d’introduction au Rabinal-Achi, drame indigène avec sa musique originale, texte quiché et traduction française en regard』（Paris: Arthus Bertrand／London: Trübner and Co.、1862年、Collection de documents dans les langues indigènes, tome II）。",
    sourceProvider:
      "John Carter Brown Library所蔵本のInternet Archiveデジタル複製（識別子 grammairedelalan02bras、全416画像）を主底本とし、Google Books公開の1862年版（識別子 DkHYREskWsUC）を頁対応と難読箇所の照合に用いた。明白なOCR誤認は原刊画像を基準に訂正し、第一部と第二部で頁番号が再び1から始まる構成、キチェ語・カクチケル語・ツトゥヒル語の語形、戯曲の反復、注、舞台指示、楽譜を保持した。",
    sourceUrl:
      "https://archive.org/details/grammairedelalan02bras",
    rights:
      "1862年原刊本文および原刊の標題紙・楽譜は著作権保護期間を満了しています。Internet Archiveに掲載されたJohn Carter Brown Library所蔵本およびGoogle Books公開画像には、各公開元の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "santibanez-geografia-regional-chiapas-1907": {
    sourceEdition:
      "Enrique Santibáñez『Geografía regional de Chiapas』（Tuxtla Gutiérrez: Imprenta del Gobierno del Estado, dirigida por Félix Santaella、1907年）。",
    sourceProvider:
      "Stanford University Libraries所蔵本を収めるGoogle Booksデジタル複製（識別子 Uny3p53UERMC、全90画像）を底本とした。デジタル版で重複撮影された前付と本文9頁は一度だけ収録し、標題紙、献辞、序文V–VII頁、本文9–66頁、全表、索引を訳出した。",
    sourceUrl:
      "https://books.google.com/books?id=Uny3p53UERMC",
    rights:
      "1907年原刊本文は著作権保護期間を満了しています。Google Booksに掲載されたStanford University Libraries所蔵本のデジタル画像には、公開元の利用条件が適用されます。本日本語訳はCreative Commons Attribution-NonCommercial-ShareAlike 4.0 International（CC BY-NC-SA 4.0）で提供します。利用には原著者・原題・原刊情報の表示、非営利利用、改変物への同一ライセンスの継承が必要です。ライセンス本文：https://creativecommons.org/licenses/by-nc-sa/4.0/",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "pineda-traslado-poderes-chiapas-1892": {
    sourceEdition:
      "Vicente Pineda『Chiapas. Traslado de los poderes públicos del Estado de San Cristóbal Las Casas a la Ciudad de Tuxtla Gutiérrez』（Imprenta de los Chiapanecos Libres de la Frontera, a cargo de Celso Costa、印刷地不詳、1892年）。",
    sourceProvider:
      "SciELO Mexico掲載のVíctor Manuel Esponda Jimeno「La traslación de poderes del Estado en 1892 vista por el licenciado Vicente Pineda」『LiminaR. Estudios sociales y humanísticos』第4巻第2号（2006年）109–129頁のうち、全文再録されたPineda本文（115–128頁）を底本とした。Espondaによる前説・伝記・作品目録・論文注は収録していない。再録に原刊頁が示されていないため、本文には再録誌面の頁境を明記した。",
    sourceUrl:
      "https://www.scielo.org.mx/scielo.php?pid=S1665-80272006000200109&script=sci_arttext",
    rights:
      "1892年原刊本文は著作権保護期間を満了しています。SciELO掲載ページの現行表示はCreative Commons Attribution-NonCommercial 4.0 International（CC BY-NC 4.0）です。本日本語訳はCreative Commons Attribution-NonCommercial-ShareAlike 4.0 International（CC BY-NC-SA 4.0）で提供します。利用には原著者・原題・原刊情報の表示、非営利利用、改変物への同一ライセンスの継承が必要です。ライセンス本文：https://creativecommons.org/licenses/by-nc-sa/4.0/",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "gage-new-survey-west-indias-1655": {
    sourceEdition:
      "Thomas Gage『A New Survey of the West-Indias: The English American His Travail by Sea and Land』（London: E. Cotes for John Sweeting、1655年、著者増補第二版）。",
    sourceProvider:
      "米国議会図書館ジェイ・I・キスラック・コレクション所蔵本のデジタル複製（書誌番号02004661、全259画像）を底本とした。前付、本文1–220頁、ポコンチ語／ポコマン語小文法、巻末詳細目次12葉、銅版地図4葉を収録し、地図は原刊の綴じ位置に従った。",
    sourceUrl: "https://www.loc.gov/item/02004661/",
    rights:
      "1655年原刊本文および原刊地図は、米国・日本ともに著作権保護期間を満了しています。米国議会図書館はジェイ・I・キスラック・コレクションの当該デジタル画像をパブリックドメインとして公開し、自由な利用と再利用を認めています。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-07-31",
    updatedDate: "2026-07-31",
  },
  "marure-bosquejo-revoluciones-centro-america-1837-1878": {
    sourceEdition:
      "Alejandro Marure『Bosquejo histórico de las revoluciones de Centro-América desde 1811 hasta 1834』第1巻（Guatemala: Imprenta de la N. Academia de Estudios、1837年初版）および第2巻（Guatemala: Tipografía de «El Progreso»、1878年再版）。",
    sourceProvider:
      "第1巻はフランシスコ・マロキン大学所蔵本のInternet Archiveデジタル複製（識別子 bosquejohistri00maruguat）を底本とした。第2巻は同大学所蔵の1878年再版本（識別子 bosquejohistri02alej）を主底本とし、同版別個体（識別子 bosquejohist00alejguat）を欠損・難読箇所の照合に用いた。第1巻の前付、本文1–295頁、文書I–LXVI頁、索引、正誤表および折込図版、第2巻の標題紙、本文5–143頁、文書III–LIX頁、索引、正誤表を収録した。第2巻第13章は底本自体が143頁途中で中断しているため、後代の著作から補作していない。",
    sourceUrl:
      "https://archive.org/details/bosquejohistri00maruguat",
    rights:
      "アレハンドロ・マルレは1851年に没しており、1837年初版および1878年再版の本文は著作権保護期間を満了しています。Internet Archiveに掲載されたフランシスコ・マロキン大学所蔵本のデジタル画像には、公開元および所蔵館の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "montgomery-journey-guatemala-1839": {
    sourceEdition:
      "George Washington Montgomery『Narrative of a Journey to Guatemala, in Central America, in 1838』（New York: Wiley & Putnam、1839年初版）。",
    sourceProvider:
      "Smithsonian Libraries所蔵の1839年初版本を収めるBiodiversity Heritage Library／Internet Archiveデジタル複製（識別子 narrativeofjour00mont、全208画像）を底本とした。原刊標題紙、著作権表示、献辞、目次、本文9–195頁、原注、諸表を収録。OCRは検索と照合の補助に限り、本文確定と頁境界は原刊画像に基づいた。",
    sourceUrl:
      "https://archive.org/details/narrativeofjour00mont",
    rights:
      "1839年原刊本文は米国・日本ともに著作権保護期間を満了しています。Biodiversity Heritage Libraryは当該資料を「Not in copyright」と表示しています。デジタル画像には公開元および所蔵館の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "carrera-memorias-1837-1840-1906": {
    sourceEdition:
      "Rafael Carrera（口述）／Ignacio Solís（編）『Memorias del General Carrera, 1837 á 1840』（Guatemala: Tipografía Sánchez & de Guise、1906年初版）。",
    sourceProvider:
      "Universidad Francisco Marroquín, Biblioteca Ludwig von Mises所蔵の1906年初版本を収めるInternet Archiveデジタル複製（識別子 memoriasdelgener00ignaguat、全96画像）を底本とした。原刊表紙、標題紙、編者刊行趣意、カレーラ略歴、真正性序論、本文3–91頁、編注を収録し、原刊頁の欠落がないことを全画像で確認した。",
    sourceUrl:
      "https://archive.org/details/memoriasdelgener00ignaguat",
    rights:
      "1906年原刊本文は著作権保護期間を満了しており、Internet Archiveの当該資料も「Not in copyright」と表示されています。デジタル画像には公開元および所蔵館の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "valle-anexion-centro-america-mexico-1924-1949": {
    sourceEdition:
      "Rafael Heliodoro Valle（編）『La anexión de Centro América a México』全6巻（México: Secretaría de Relaciones Exteriores、1924・1927・1936・1945・1946・1949年）。",
    sourceProvider:
      "Consejo Superior de Investigaciones Científicas（CSIC）、Biblioteca Americanista de Sevilla所蔵本をSimurgで公開した全6巻デジタル複製を底本とした。第V巻の複製で欠ける原刊11頁のみ、University of California所蔵同版のGoogle Books画像を照合して補った。本文、注、文書索引を全巻収録し、第VI巻末の全巻総合固有名索引49頁は綴り・巻頁参照を保持したファクシミリとして収録した。",
    sourceUrl: "https://simurg.csic.es/view/990000524000204201",
    rights:
      "Simurg掲載のデジタル複製はCreative Commons Attribution-ShareAlike 4.0 International（CC BY-SA 4.0）で提供されています。本日本語翻訳・編集版も同ライセンスで提供します。利用には原著者・原題・原刊情報・所蔵館およびSimurgの表示、変更の表示、改変物への同一ライセンスの継承が必要です。原資料および第三者素材の権利状態には影響しません。ライセンス本文：https://creativecommons.org/licenses/by-sa/4.0/",
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "montufar-memorias-revolucion-centro-america-1832": {
    sourceEdition:
      "Manuel Montúfar y Coronado［匿名刊行］『Memorias para la historia de la revolución de Centro-América, por un guatemalteco』（Jalapa: Impreso por Aburto y Blanco, en la Oficina del Gobierno、1832年初版）。",
    sourceProvider:
      "米国議会図書館所蔵の1832年初版本を収めるInternet Archiveデジタル複製（識別子 memoriasparalahi00mont、全302画像）を底本とした。原刊標題紙、著者の「注意」、前付I–XXXII頁の中央アメリカ概説、本文全5章、証拠文書第1–5号、原注を収録し、原刊本文および証拠文書1–257頁の頁境を保持した。",
    sourceUrl:
      "https://archive.org/details/memoriasparalahi00mont",
    rights:
      "マヌエル・モントゥファル・イ・コロナードは1844年に没しており、1832年原刊本文は米国・日本ともに著作権保護期間を満了しています。Internet Archiveに掲載された米国議会図書館所蔵本のデジタル画像には、公開元および所蔵館の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "ximenez-ayer-ms-1515-volume-2": {
    sourceEdition:
      "Francisco Ximénez『Empiezan las historias del origen de los indios de esta provincia de Guatemala; Escolios a las historias de el origen de los indios』Newberry Library, Edward E. Ayer Collection, Vault Ayer MS 1515, vol. 2, 無番号前付8面、ポポル・ヴフ第1葉表–第56葉裏、挿入白紙2面、歴史起源注解第1葉表–第6葉裏。",
    sourceProvider:
      "ニューベリー図書館所蔵写本を、米国議会図書館が旧World Digital Library資料19995として公開する全134画像で底本化した。ポポル・ヴフ本文は写本のカスティーリャ語欄を対象とし、無番号前付のキチェ語文は写本カラー画像および400 dpiマイクロフィルム像で照合した。歴史起源注解はMultepal／Áanalteʼ の外交的翻刻を検索・照合の補助とし、第5葉裏の別筆文はJosé de Aguilar『Sermones del Dulcissimo Nombre de Maria』第2巻（Sevilla、1701年）65–66頁とも照合した。",
    sourceUrl: "https://www.loc.gov/item/2021668226/",
    rights:
      "18世紀写本の本文は米国・日本ともに著作権保護期間を満了しています。米国議会図書館の当該項目は権利状態を「No Copyright - United States」と表示しています。所蔵・公開機関表記：Newberry Library, Edward E. Ayer Collection／Library of Congress。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-13",
    updatedDate: "2026-08-13",
  },
  "us-senate-central-america-correspondence-1853": {
    sourceEdition:
      "Message from the President of the United States, communicating, in compliance with a resolution of the Senate, certain correspondence in relation to Central America, 32d Congress, 2d Session, Senate Executive Document No. 27, United States Congressional Serial Set, no. 660（Washington、1853年、全106頁）。",
    sourceProvider:
      "U.S. Government Publishing Office（GovInfo）が公開する米国議会図書館法律図書館所蔵本の全106頁デジタル画像を主底本とした。OCRは検索と転記の補助に限り、本文、固有名詞、数値、原刊頁境界はページ画像によって確定した。",
    sourceUrl:
      "https://www.govinfo.gov/app/details/SERIALSET-00660_00_00-025-0027-0000",
    rights:
      "1853年刊の米国政府刊行物であり、原刊本文はパブリックドメインです。GovInfoのデジタル画像には公開元の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-02",
    updatedDate: "2026-08-02",
  },
  "molina-costa-rica-new-granada-1853": {
    sourceEdition:
      "Felipe Molina『Costa Rica and New Granada: An Inquiry into the Question of Boundaries, which is Pending between the Two Republics Aforesaid; with a Map for the Better Understanding of the Subject, and Documentary Evidence in Support of the Ancient Titles of Costa Rica; to which an Appendix has been Added, Containing a Brief Account of the Question between Costa Rica and Nicaragua』（Washington: R. A. Waters, Printer、1853年）。",
    sourceProvider:
      "米国議会図書館所蔵本をInternet Archiveがデジタル化した全74画像を本文・頁の主底本とし、ミシガン大学所蔵本のGoogle Books画像で文字を照合した。主底本画像で欠落する折込地図は、ブラウン大学ジョン・ヘイ図書館所蔵本をDaniel Gutiérrez Ardila（2012年）が掲載した画像で補完した。",
    sourceUrl: "https://archive.org/details/costaricanewgran00moli",
    rights:
      "フェリペ・モリーナは1855年に没しており、1853年初版の本文および原刊地図は著作権保護期間を満了したパブリックドメイン資料です。デジタル画像には公開元および所蔵館の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-02",
    updatedDate: "2026-08-02",
  },
  "squier-notes-central-america-1855": {
    sourceEdition:
      "E. G. Squier『Notes on Central America; Particularly the States of Honduras and San Salvador』（New York、1855年初版）。",
    sourceProvider:
      "Internet Archive掲載のLincoln Financial Foundation Collection本を本文・頁の主底本とし、米国議会図書館本で図版・折込図を照合。欠落していた標題紙対向の総図はBibliothèque nationale de France, Gallica所蔵の1854年原図で補完した。",
    sourceUrl: "https://archive.org/details/notesoncentralam00squi",
    rights:
      "E・G・スクワイアは1888年に没しており、1855年初版および1854年補完地図は著作権保護期間を満了したパブリックドメイン資料です。デジタル画像には公開元および所蔵館の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-01",
    updatedDate: "2026-08-01",
  },
  "peniche-relaciones-belice-1869": {
    sourceEdition:
      "Manuel Peniche「Historia de las relaciones de España y México con Inglaterra, sobre el establecimiento de Belice」『Boletín de la Sociedad Mexicana de Geografía y Estadística』segunda época, tomo I（México: Imprenta del Gobierno, en Palacio, a cargo de José María Sandoval、1869年）pp. 217–256, 377–403。",
    sourceProvider:
      "HathiTrust Digital Libraryが全文公開するニューヨーク公共図書館所蔵1869年本（識別子 nyp.33433001036700、書誌レコード 008606547）を採用底本とした。UNAM歴史研究所公開のInstituto de Geografía Fondo Reservado所蔵本三分冊は頁順・難読箇所・折込地図表記の補助照合に限って用いた。いずれの頁画像・地図画像・OCRも本版に転載していない。",
    sourceUrl:
      "https://babel.hathitrust.org/cgi/pt?id=nyp.33433001036700",
    rights:
      "1869年原刊本文および原刊折込地図は著作権保護期間を満了したパブリックドメイン資料です。HathiTrustのPublic Domain表示は原著の権利状態を示すもので、Googleデジタル化画像へのCreative Commonsライセンス付与を意味しません。本版にはHathiTrustおよびUNAMの画像・OCRを転載していません。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-09",
    updatedDate: "2026-08-09",
  },
  "southey-chronological-history-west-indies-1827": {
    sourceEdition:
      "Thomas Southey『Chronological History of the West Indies』全3巻（London: Longman, Rees, Orme, Brown, and Green、1827年初版）。",
    sourceProvider:
      "University of California Libraries所蔵本をInternet Archiveが公開した全3巻のデジタル複製（識別子 chronologicalhis01sout、chronologicalhis02sout、chronologicalhis03sout）を主底本とした。第2巻の主底本で欠ける原刊384–385頁は、Digital Library of India由来のInternet Archive公開本（識別子 in.ernet.dli.2015.47207）で補った。OCRは検索と照合の補助に限り、本文・数値・原刊頁境界は原刊画像によって確定した。",
    sourceUrl:
      "https://archive.org/details/chronologicalhis01sout",
    rights:
      "1827年原刊本文および原刊図像は著作権保護期間を満了しています。Internet Archiveの主底本はNot in Copyrightと表示されています。デジタル画像には公開元および所蔵館の利用条件が適用される場合があります。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "dieseldorff-ausgrabungen-coban-1893": {
    sourceEdition:
      "Erwin P. Dieseldorff「Ausgrabungen in Coban」『Zeitschrift für Ethnologie』Bd. 25（Berlin、1893年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 374–382。1893年6月10日付。Rudolf Virchowの試料分析報告を付す。",
    sourceProvider:
      "Internet Archive公開の『Zeitschrift für Ethnologie』第25巻スキャン（identifier: zeitschriftfuret2518unse）を主底本とし、原刊誌面とOCRを照合した。編集部導入、ディースルドルフ本文、図1–11、図注、脚注、ヴィルヒョウ付加報告を収録した。",
    sourceUrl:
      "https://archive.org/details/zeitschriftfuret2518unse",
    rights: publicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "dieseldorff-alte-bemalte-thongefaesse-guatemala-1893": {
    sourceEdition:
      "Erwin P. Dieseldorff「Alte bemalte Thongefässe von Guatemala」『Zeitschrift für Ethnologie』Bd. 25（Berlin、1893年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 547–551, Tafel XVI。Paul Schellhasを介して提出され、SchellhasおよびRudolf Virchowの付加発言を伴う。",
    sourceProvider:
      "Internet Archive公開の『Zeitschrift für Ethnologie』第25巻スキャン（identifier: zeitschriftfuret2518unse）を主底本とし、原刊誌面とOCRを照合した。編集部導入、ディースルドルフ本文、本文図1–2、図版XVI、シェルハスおよびヴィルヒョウの付加発言を収録した。",
    sourceUrl:
      "https://archive.org/details/zeitschriftfuret2518unse",
    rights: publicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "dieseldorff-gefaess-chama-1895": {
    sourceEdition:
      "Erwin P. Dieseldorff「Das Gefäss von Chamá」『Zeitschrift für Ethnologie』Bd. 27（Berlin、1895年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 770–776。1895年10月付。",
    sourceProvider:
      "Internet Archive公開の『Zeitschrift für Ethnologie』第27巻スキャン（identifier: zeitschriftfure25urgegoog）を主底本とし、原刊誌面とOCRを照合した。編集部導入、本文、引用、図1–5・図1a・図2aおよび図注を収録した。",
    sourceUrl:
      "https://archive.org/details/zeitschriftfure25urgegoog",
    rights: publicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "dieseldorff-reliefbild-chipolem-1895": {
    sourceEdition:
      "Erwin P. Dieseldorff「Reliefbild aus Chipolem」『Zeitschrift für Ethnologie』Bd. 27（Berlin、1895年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 777–780。1895年11月7日付。",
    sourceProvider:
      "Internet Archive公開の『Zeitschrift für Ethnologie』第27巻スキャン（identifier: zeitschriftfure25urgegoog）を主底本とし、原刊誌面とOCRを照合した。共通の編集部導入、本文、図1–6および図注を収録した。",
    sourceUrl:
      "https://archive.org/details/zeitschriftfure25urgegoog",
    rights: publicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "dieseldorff-cuculcan-1895": {
    sourceEdition:
      "Erwin P. Dieseldorff「Cuculcan」『Zeitschrift für Ethnologie』Bd. 27（Berlin、1895年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 780–783。1895年11月7日付。",
    sourceProvider:
      "Internet Archive公開の『Zeitschrift für Ethnologie』第27巻スキャン（identifier: zeitschriftfure25urgegoog）を主底本とし、原刊誌面とOCRを照合した。共通の編集部導入、本文、図1–19および図注を収録した。",
    sourceUrl:
      "https://archive.org/details/zeitschriftfure25urgegoog",
    rights: publicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "dieseldorff-tolteken-1896": {
    sourceEdition:
      "Erwin P. Dieseldorff「Wer waren die Tolteken?」『Festschrift für Adolf Bastian zu seinem 70. Geburtstage, 26. Juni 1896』（Berlin: Dietrich Reimer (Ernst Vohsen)、1896年）pp. 415–418。",
    sourceProvider:
      "Internet Archive公開の原刊スキャン（identifier: festschriftfrad00bastgoog）を主底本とし、原刊誌面とOCRを照合した。原刊415頁の著者名半標題、416頁の論文標題、417–418頁の本文を収録した。",
    sourceUrl:
      "https://archive.org/details/festschriftfrad00bastgoog",
    rights: publicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "cortes-y-larraz-descripcion-geografico-moral-1771": {
    sourceEdition:
      "Pedro Cortés y Larraz『Descripción geográfico-moral de la diócesis de Goathemala』1771年公式呈上筆記写本、Archivo General de Indias, ES.41091.AGI/15//GUATEMALA,948,N.2–N.3（地図・図版：MP-GUATEMALA,74–186）。",
    sourceProvider:
      "スペイン文化省（Ministerio de Cultura, España）・インディアス総合文書館（Archivo General de Indias）所蔵、PARES公開画像を主底本とした。PARES N.2: https://pares.mcu.es/ParesBusquedas20/catalogo/show/7023642?nm ／ N.3: https://pares.mcu.es/ParesBusquedas20/catalogo/show/7023643?nm。1958年刊本は筆記体の判読と本文校合に限って用い、同版独自の序説・注・編集物は収録していない。",
    sourceUrl:
      "https://pares.mcu.es/ParesBusquedas20/catalogo/show/7023642?nm",
    rights:
      "1771年原著本文はパブリックドメインです。掲載画像はPARESの再利用条件に基づき、スペイン文化省、インディアス総合文書館、請求記号およびPARES URLを表示して利用しています。画像自体に本版独自のCreative Commonsライセンスは設定していません。1958年版独自の序文・校訂・注・編集物は収録していません。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "perigny-ruines-nacun-1906": {
    sourceEdition:
      "Maurice de Périgny「Les ruines de Nacun」『La Nature』第1745号（Paris、1906年11月3日）pp. 360–362。",
    sourceProvider:
      "フランス国立図書館Gallica公開のモーリス・ド・ペリニー文書所収原刊切抜き（ark:/12148/btv1b108914998）を底本とした。原刊本文360–362頁、図版3点、キャプションを収録した。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/btv1b108914998",
    rights: publicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "perigny-exploration-yucatan-1906": {
    sourceEdition:
      "Maurice de Périgny「Une exploration au Yucatan」『Journal de la Société des Américanistes』nouvelle série, tome 3, no 2（Paris、1906年）pp. 340–341。",
    sourceProvider:
      "Persée公開の『Journal de la Société des Américanistes』原刊画像を底本とした。編集部導入、ペリニーの書簡本文、原刊340–341頁を収録した。",
    sourceUrl:
      "https://www.persee.fr/doc/jsa_0037-9174_1906_num_3_2_3469_t1_0340_0000_2",
    rights: publicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "lemoine-travers-peten-yucatan-1906": {
    sourceEdition:
      "Frédéric Lemoine「À travers le Peten et le Yucatan; par le comte Maurice de Périgny」『La Géographie』tome 13（Paris、1906年）pp. 482–485、閉会評p. 486。",
    sourceProvider:
      "フランス国立図書館Gallica公開の『La Géographie』第13巻原刊画像（ark:/12148/bpt6k377513）を底本とした。本文、行程図とキャプション、486頁冒頭まで続く閉会評を収録した。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/bpt6k377513",
    rights: publicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "perigny-peten-1907": {
    sourceEdition:
      "Maurice de Périgny「Le Peten」『La Géographie』tome 16（Paris、1907年）pp. 287–290。",
    sourceProvider:
      "フランス国立図書館Gallica公開の『La Géographie』第16巻原刊画像（ark:/12148/bpt6k377544）を底本とした。原刊287–290頁の本文を収録した。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/bpt6k377544",
    rights: publicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "perigny-maya-ruins-quintana-roo-1907": {
    sourceEdition:
      "Maurice de Périgny「Maya Ruins in Quintana Roo」『Records of the Past』volume 6（Washington、1907年）pp. 232–235。",
    sourceProvider:
      "Getty Research Institute所蔵原刊本のInternet Archiveデジタル複製を収めるWikimedia Commons公開PDFを底本とした。本文、節見出し、署名、編集注を収録した。",
    sourceUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c0/Records_of_the_past_%28IA_gri_33125000987509%29.pdf",
    rights:
      "原刊本文は著作権保護期間を満了しています。本PDFには原刊画像を転載していません。底本ファイルはWikimedia Commonsでパブリックドメイン資料として公開され、原スキャンはInternet ArchiveのGetty Research Institute所蔵本に由来します。再利用時は当該Commonsファイルページの権利表示および原提供機関の条件を確認してください。" +
      JapaneseEditionNoReuseRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "perigny-yucatan-inconnu-1908": {
    sourceEdition:
      "Maurice de Périgny「Yucatan inconnu」『Journal de la Société des Américanistes』tome 5（Paris、1908年）pp. 66–84。",
    sourceProvider:
      "Persée公開の『Journal de la Société des Américanistes』原刊画像を底本とした。原刊66–84頁の本文、地図、遺構図、写真図版、全キャプション、肩書を収録した。",
    sourceUrl:
      "https://www.persee.fr/doc/jsa_0037-9174_1908_num_5_1_3476",
    rights: perseePublicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "perigny-maler-discoveries-yucatan-1908": {
    sourceEdition:
      "Maurice de Périgny「Les dernières découvertes de M. Maler dans le Yucatan」『Journal de la Société des Américanistes』tome 5（Paris、1908年）pp. 95–98。",
    sourceProvider:
      "Persée公開の『Journal de la Société des Américanistes』原刊画像を底本とした。原刊95–98頁の本文を収録し、底本画像そのものは日本語版へ転載していない。",
    sourceUrl:
      "https://www.persee.fr/doc/jsa_0037-9174_1908_num_5_1_3484",
    rights: perseePublicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "dieseldorff-gegenstaende-guatemala-1893": {
    sourceEdition:
      "Eduard Seler「Gegenstände aus Guatemala」『Zeitschrift für Ethnologie』Bd. 25（Berlin、1893年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 275–277。E. P. DieseldorffおよびKarl Sapperの収集・発掘資料を扱う。",
    sourceProvider:
      "Getty Research Institute（Getty Library）所蔵本をInternet Archiveが公開した第25巻スキャン（identifier: zeitschriftfuret2518unse）を底本とし、原刊275–277頁と供献鉢の挿図を誌面画像・OCRで照合した。GettyのReproductions & Permissionsは項目別のUse Restrictionsと必要な第三者許諾の確認を利用者に求め、当該項目には個別ライセンス表示がない。",
    sourceUrl: "https://archive.org/details/zeitschriftfuret2518unse",
    rights: gettyArchiveRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-bemaltes-thongefaess-chama-1894": {
    sourceEdition:
      "Erwin P. Dieseldorff「Ein bemaltes Thongefäss mit figürlichen Darstellungen aus einem Grabe von Chamá」『Zeitschrift für Ethnologie』Bd. 26（Berlin、1894年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 372–377, Tafel VIII。Paul Schellhasの付加発言を伴う。",
    sourceProvider:
      "Robarts Library（University of Toronto Libraries）所蔵本をInternet Archiveが公開した第26巻スキャン（identifier: zeitschriftfre26berluoft）を底本とし、原刊372–377頁、本文図1–15、図版VIIIを照合した。当該項目には同館による個別の再利用条件やCreative Commonsライセンスは表示されていない。",
    sourceUrl: "https://archive.org/details/zeitschriftfre26berluoft",
    rights: robartsArchiveRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-vampyrkoepfige-gottheit-1894": {
    sourceEdition:
      "Erwin P. Dieseldorff「Ein Thongefäss mit Darstellung einer vampyrköpfigen Gottheit」『Zeitschrift für Ethnologie』Bd. 26（Berlin、1894年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 576–577, Tafel XIII。",
    sourceProvider:
      "Robarts Library（University of Toronto Libraries）所蔵本をInternet Archiveが公開した第26巻スキャン（identifier: zeitschriftfre26berluoft）を底本とし、原刊576–577頁と図版XIIIを照合した。当該項目には同館による個別の再利用条件やCreative Commonsライセンスは表示されていない。",
    sourceUrl: "https://archive.org/details/zeitschriftfre26berluoft",
    rights: robartsArchiveRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-neue-ausgrabungen-chajcar-1895": {
    sourceEdition:
      "Paul Schellhas「Neue Ausgrabungen des Hrn. Dieseldorff in Chajcar, Guatemala」Erwin P. Dieseldorffの発掘報告を収録、『Zeitschrift für Ethnologie』Bd. 27（Berlin、1895年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 320–323。",
    sourceProvider:
      "Google Booksが図書館蔵書をデジタル化し、Internet Archiveが公開した第27巻スキャン（identifier: zeitschriftfure25urgegoog）を底本とした。Googleの利用指針は個人的・非商業的利用、Google表示の保持、利用地での適法性確認を求め、当該Internet Archive項目に追加ライセンスは表示されていない。",
    sourceUrl: "https://archive.org/details/zeitschriftfure25urgegoog",
    rights: googleArchiveRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-two-vases-chama-1904": {
    sourceEdition:
      "E. P. Dieseldorff, Eduard Seler, Ernst Förstemann「Two Vases from Chama」Charles P. Bowditch編『Mexican and Central American Antiquities, Calendar Systems, and History: Twenty-four Papers』Bureau of American Ethnology, Bulletin 28（Washington: Government Printing Office、1904年）pp. 635–666, pls. XLVIII–XLIX。英訳者Selma Wesselhoeft、Alberta M. Parker。",
    sourceProvider:
      "Library of Congress Jay I. Kislak Reference Collection所蔵本をInternet Archiveが公開したスキャン（identifier: mexicancentralam00bowd）を底本とし、標題・目次、本文、図130–134、図版XLVIII–XLIXを照合した。Library of Congressはサイト閲覧とサイト外再利用を区別し、Rights and Access、Rights Advisory、適用法の確認を利用者の責任としている。当該項目に個別ライセンスは表示されていない。",
    sourceUrl: "https://archive.org/details/mexicancentralam00bowd",
    rights:
      "1904年原著および英訳はパブリックドメインです。Library of Congressは通常、掲載資料の著作権を所有せず利用許可を与えられないため、項目別の権利表示と適用法の確認を利用者に求めています。当該Internet Archive項目に個別ライセンスはありません。閲覧可能であることを底本画像の転載・改変許諾とは扱いません。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-jadeit-schmuck-1905": {
    sourceEdition:
      "Erwin P. Dieseldorff「Jadeit- und anderer Schmuck der Mayavölker」『Zeitschrift für Ethnologie』Bd. 37（Berlin、1905年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 408–411, 12 Textfiguren。Karl von den Steinenが通信を紹介した報告。",
    sourceProvider:
      "Getty Research Institute（Getty Library）所蔵本をInternet Archiveが公開した第37巻スキャン（identifier: zeitschriftfuret3719unse）を底本とし、原刊408–411頁と図12点を照合した。GettyのReproductions & Permissionsは項目別のUse Restrictionsと必要な第三者許諾の確認を利用者に求め、当該項目には個別ライセンス表示がない。",
    sourceUrl: "https://archive.org/details/zeitschriftfuret3719unse",
    rights: gettyArchiveRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-klassifizierung-funde-1909": {
    sourceEdition:
      "Erwin P. Dieseldorff「Klassifizierung seiner archäologischen Funde im nördlichen Guatemala」『Zeitschrift für Ethnologie』Bd. 41（Berlin、1909年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 862–874, figs. 1–99。",
    sourceProvider:
      "Internet Archiveがマイクロフィルム複製として公開する第41巻（identifier: zeitschrift-fuer-ethnologie_1909_41）を底本とし、原刊862–874頁、資料写真1–99を照合した。項目メタデータはcontributorをInternet Archiveとするのみで所蔵・提供図書館を特定せず、個別の再利用ライセンスも表示していない。",
    sourceUrl:
      "https://archive.org/details/zeitschrift-fuer-ethnologie_1909_41",
    rights:
      "1909年原刊本文はパブリックドメインです。当該Internet Archive項目は所蔵・提供図書館を特定せず、個別の再利用ライセンスを表示していません。公開閲覧・ダウンロードできることを底本画像の包括的な再利用許諾とは扱いません。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-tzultaca-mam-1926": {
    sourceEdition:
      "Erwin P. Dieseldorff「El Tzultacá y el Mam, los dioses prominentes de la religión Maya」『Anales de la Sociedad de Geografía e Historia de Guatemala』tomo II, año II, núm. 4（julio de 1926）pp. 378–386。1925年11月23日の講演。",
    sourceProvider:
      "Academia de Geografía e Historia de Guatemala（当時Sociedad de Geografía e Historia de Guatemala）刊行号をInternet Archiveが公開したスキャン（identifier: tomo-ii-anyo-ii-no-4-julio-1926）を底本とし、原刊378–386頁と写真3点を照合した。項目には別の所蔵・提供機関や個別再利用ライセンスは表示されていない。",
    sourceUrl: "https://archive.org/details/tomo-ii-anyo-ii-no-4-julio-1926",
    rights:
      "1926年原刊本文はパブリックドメインです。当該Internet Archive項目には別の所蔵・提供機関、Creative Commonsライセンス、その他の個別再利用条件が表示されていません。公開閲覧・ダウンロードできることを底本画像の包括的な再利用許諾とは扱いません。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-kunst-religion-band-i-1926": {
    sourceEdition:
      "E. P. Dieseldorff「Kunst und Religion der Mayavölker im alten und heutigen Mittelamerika」『Zeitschrift für Ethnologie』Bd. 57（1925年）Heft 1/2, pp. 1–45。本文図5点（図235–239）と図版53葉（図1–234）、計239図。",
    sourceProvider:
      "Universitätsbibliothek / Humboldt-Universität zu Berlinがdigi-hub / EVIFA Digitalで公開する原載誌第57巻スキャン（item id 1568386342916、URN urn:nbn:de:kobv:11-d-6501314）を本文・全図版の画像底本とした。1926年Julius Springer単行本版は書誌と本文異同の確認にのみ参照し、同電子版の画像データは収録していない。",
    sourceUrl:
      "https://www.digi-hub.de/viewer/metadata/1568386342916/9/-/",
    rights: digiHubCcByNcSaRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-14",
  },
  "dieseldorff-kunst-religion-band-ii-1931": {
    sourceEdition:
      "E. P. Dieseldorff「Kunst und Religion der Mayavölker II: Die Copaner Denkmäler」『Zeitschrift für Ethnologie』Bd. 62（1930年）Heft 1/6, pp. 1–44。本文図11点。1931年単行本版の訂正・改訂 pp. 45–46と図版24葉上の図27点を併録。",
    sourceProvider:
      "Universitätsbibliothek / Humboldt-Universität zu Berlinがdigi-hub / EVIFA Digitalで公開する原載誌第62巻スキャン（item id 1564414985756、URN urn:nbn:de:kobv:11-d-6482604）を本文・全図版の画像底本とした。1931年Julius Springer単行本版は訂正稿、書誌、本文異同の確認にのみ参照し、同電子版の画像データは収録していない。",
    sourceUrl:
      "https://www.digi-hub.de/viewer/metadata/1564414985756/9/-/",
    rights: digiHubCcByNcSaRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-14",
  },
  "dieseldorff-kekchi-will-1583-1932": {
    sourceEdition:
      "Erwin P. Dieseldorff「A Kekchi Will of 1583」『The Maya Society Quarterly』vol. I, no. 2（March 1932）pp. 65–67、編者注p. 68。",
    sourceProvider:
      "Newberry Library所蔵合冊本をInternet Archiveが公開したスキャン（identifier: Ayer_1_M2）を底本とし、原刊65–68頁を照合した。NewberryのOpen Access Policyは、合法な目的であれば商用・非商用を問わず許諾料・ライセンス料なしで所蔵資料の複製を利用可能とし、権利・フェアユース等の確認を利用者の責任としている。",
    sourceUrl: "https://archive.org/details/Ayer_1_M2",
    rights: newberryArchiveRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-cauac-thunderbolt-signs-1932": {
    sourceEdition:
      "E. P. Dieseldorff書簡抄、W. Gates導入・論評「Glyph Studies」所収『The Maya Society Quarterly』vol. I, no. 2（March 1932）pp. 68–70。",
    sourceProvider:
      "Newberry Library Edward E. Ayer Collection所蔵合冊本をInternet Archiveが公開したスキャン（identifier: Ayer_1_M2）を底本とし、書簡資料に属する導入、引用、挿入評、後続論評を照合した。NewberryのOpen Access Policyは、合法な目的であれば商用・非商用を問わず許諾料・ライセンス料なしで所蔵資料の複製を利用可能とし、権利・フェアユース等の確認を利用者の責任としている。",
    sourceUrl: "https://archive.org/details/Ayer_1_M2",
    rights: newberryArchiveRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-arqueologia-alta-verapaz-1936": {
    sourceEdition:
      "Erwin P. Dieseldorff「La arqueología de la Alta Verapaz y los problemas de los estudios mayas」『Anales de la Sociedad de Geografía e Historia de Guatemala』tomo XIII, año XIII, núm. 2（diciembre de 1936）pp. 183–191。",
    sourceProvider:
      "Internet Archive公開の同号スキャン（identifier: AnalesAGHGTomoXIIIAnyoXIIINo2Diciembre1936）を底本とし、原刊183–191頁、写真5点、原注を照合した。当該項目の公開記録はCC BY-NC-ND 4.0を表示している。",
    sourceUrl:
      "https://archive.org/details/AnalesAGHGTomoXIIIAnyoXIIINo2Diciembre1936",
    rights: iaCcByNcNdRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-calendario-maya-quirigua-1936": {
    sourceEdition:
      "Erwin P. Dieseldorff「El Calendario Maya de Quiriguá」『Anales de la Sociedad de Geografía e Historia de Guatemala』tomo XII, año XII, núm. 3（marzo de 1936）pp. 272–277。1935年12月14日の公開例会講演。",
    sourceProvider:
      "Internet Archive公開の同号スキャン（identifier: AnalesAGHGTomoXIIAnyoXIINo3Marzo1936）を底本とし、原刊272–277頁を照合した。当該項目の公開記録はCC BY-NC-ND 4.0を表示している。",
    sourceUrl:
      "https://archive.org/details/AnalesAGHGTomoXIIAnyoXIINo3Marzo1936",
    rights: iaCcByNcNdRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-plantas-medicinales-alta-verapaz-1939-1940": {
    sourceEdition:
      "Erwin P. Dieseldorff「Las plantas medicinales del departamento de Alta Verapaz」『Anales de la Sociedad de Geografía e Historia de Guatemala』tomo XVI, año XVI, núm. 2（diciembre de 1939）pp. 92–105、続篇・結篇núm. 3（marzo de 1940）pp. 192–206。",
    sourceProvider:
      "Internet Archive公開の両号スキャン（identifiers: AnalesAGHGTomoXVIAnyoXVINo2Diciembre1939、AnalesAGHGTomoXVIAnyoXVINo3Marzo1940）を底本とし、両部本文と植物図48点を照合した。両項目の公開記録はCC BY-NC-ND 4.0を表示している。",
    sourceUrl:
      "https://archive.org/details/AnalesAGHGTomoXVIAnyoXVINo2Diciembre1939",
    rights: iaCcByNcNdRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "dieseldorff-causa-calendario-quirigua-1940": {
    sourceEdition:
      "Erwin P. Dieseldorff「La causa por la cual los Mayas de Quiriguá comenzaron su calendario en 22 de septiembre del año 3373 A. J. C.」『Anales de la Sociedad de Geografía e Historia de Guatemala』tomo XVI, año XVI, núm. 4（junio de 1940）pp. 271–279。1939年7月31日の講演。",
    sourceProvider:
      "Internet Archive公開の同号スキャン（identifier: AnalesAGHGTomoXVIAnyoXVINo4Junio1940）を底本とし、原刊271–279頁とヒエログリフ図A1–E7を照合した。当該項目の公開記録はCC BY-NC-ND 4.0を表示している。",
    sourceUrl:
      "https://archive.org/details/AnalesAGHGTomoXVIAnyoXVINo4Junio1940",
    rights: iaCcByNcNdRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "schellhas-virchow-deformierter-schaedel-ulpan-1894": {
    sourceEdition:
      "Paul Schellhas, Rudolf Virchow「Deformirter Schädel von Ulpan bei Coban, Guatemala」『Zeitschrift für Ethnologie』Bd. 26（Berlin、1894年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 424–425。E. P. Dieseldorffが発掘した頭蓋を扱う。",
    sourceProvider:
      "Robarts Library（University of Toronto Libraries）所蔵本をInternet Archiveが公開した第26巻スキャン（identifier: zeitschriftfre26berluoft）を底本とし、原刊424–425頁を照合した。当該項目には同館による個別の再利用条件やCreative Commonsライセンスは表示されていない。",
    sourceUrl: "https://archive.org/details/zeitschriftfre26berluoft",
    rights: robartsArchiveRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "virchow-graeberschaedel-guatemala-1897": {
    sourceEdition:
      "Rudolf Virchow「Gräberschädel von Guatemala」『Zeitschrift für Ethnologie』Bd. 29（Berlin、1897年）Verhandlungen der Berliner Gesellschaft für Anthropologie, Ethnologie und Urgeschichte, pp. 324–328, figs. 1–2。E. P. Dieseldorffがコバン近郊で採集した頭蓋資料を扱う。",
    sourceProvider:
      "Getty Research Institute（Getty Library）所蔵本をInternet Archiveが公開した第29巻スキャン（identifier: zeitschriftfre29berl）を底本とし、原刊324–328頁と本文図1–2を照合した。GettyのReproductions & Permissionsは項目別のUse Restrictionsと必要な第三者許諾の確認を利用者に求め、当該項目には個別ライセンス表示がない。",
    sourceUrl: "https://archive.org/details/zeitschriftfre29berl",
    rights: gettyArchiveRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "perigny-yucatan-inconnu-geographie-1908": {
    sourceEdition:
      "Maurice de Périgny「Le Yucatan inconnu」『La Géographie』tome 18（Paris、1908年）pp. 227–238。",
    sourceProvider:
      "フランス国立図書館Gallica公開の原刊画像（ark:/12148/btv1b108916455）を底本とした。原刊227–238頁の本文、原注、節見出し、署名を収録し、底本画像そのものは日本語版へ転載していない。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/btv1b108916455",
    rights: gallicaPublicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "perigny-villes-mortes-amerique-centrale-1909": {
    sourceEdition:
      "Maurice de Périgny「Villes mortes de l’Amérique centrale」『Le Tour du Monde』nouvelle série, tome 15, nos 38–40（Paris、1909年9月18日・25日、10月2日）pp. 445–480。",
    sourceProvider:
      "Wikimedia Commons公開DjVuを底本とし、フランス国立図書館Gallica原提供画像（ark:/12148/bpt6k34472h）と照合した。三回連載本文、各回見出し、継続表示、署名、権利表示、および原刊頁から個別に切り出した図版41点と全キャプションを収録し、日本語キャプションを各図版の直下に配置した。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/bpt6k34472h",
    rights:
      "モーリス・ド・ペリニーの原刊本文はパブリックドメインです。原刊各回の「翻訳権・複製権留保」は1909年当時の表示であり、現在の保護状態を示しません。Commons底本はPublic Domain Mark 1.0表示です。原提供元Gallica/BnF由来画像の非商用利用または学術・科学出版では「Source gallica.bnf.fr / Bibliothèque nationale de France」の表示が必要で、商用利用はBnFの許諾および利用料の対象となります。" +
      JapaneseEditionNoReuseRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "perigny-ruines-rio-bec-1909": {
    sourceEdition:
      "Maurice de Périgny「Ruines de Rio Beque」『La Nature』no 1872（Paris、1909年4月10日）pp. 300–301。",
    sourceProvider:
      "フランス国立図書館Gallica公開の原刊画像（ark:/12148/btv1b108915054）を底本とした。本文、原注、図版2点と全キャプション、署名を収録した。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/btv1b108915054",
    rights: gallicaPublicDomainRights,
    publishedDate: "2026-08-10",
    updatedDate: "2026-08-10",
  },
  "perigny-lettre-costa-rica-1910": {
    sourceEdition:
      "Maurice de Périgny「Lettre de Costa Rica」『Bulletin de la Société de Géographie Commerciale de Paris』tome XXXII, no 1（Paris、1910年1月）pp. 39–40。",
    sourceProvider:
      "フランス国立図書館Gallica公開のモーリス・ド・ペリニー文書所収原刊切抜き（ark:/12148/btv1b10891635r、f1–f2）を底本とした。原刊39–40頁の本文と統計表を収録した。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/btv1b10891635r",
    rights: gallicaPublicDomainRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "perigny-costa-rica-pays-habitants-ressources-1910": {
    sourceEdition:
      "Maurice de Périgny「Costa-Rica. Le pays, ses habitants et ses ressources」『Bulletin de la Société de Géographie Commerciale de Paris』tome XXXII, no 10（Paris、1910年11月）pp. 693–714。",
    sourceProvider:
      "フランス国立図書館Gallica公開のモーリス・ド・ペリニー文書所収原刊切抜き（ark:/12148/btv1b108916383、f1–f11）を底本とした。原刊693–714頁の本文と統計表を収録した。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/btv1b108916383",
    rights: gallicaPublicDomainRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "perigny-ruines-nakcun-1911": {
    sourceEdition:
      "Maurice de Périgny「Les ruines de Nakcun」『Journal de la Société des Américanistes de Paris』tome 8（Paris、1911年）pp. 4–22。DOI: 10.3406/jsa.1911.3724。",
    sourceProvider:
      "Persée公開の『Journal de la Société des Américanistes de Paris』原刊画像を底本とした。原刊4–22頁の本文、原注、図版I–III、行程図、平面図、壁画図と全キャプションを収録した。",
    sourceUrl:
      "https://www.persee.fr/doc/jsa_0037-9174_1911_num_8_1_3724",
    rights: perseePublicDomainRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "perigny-costa-rica-nantes-1911": {
    sourceEdition:
      "Maurice de Périgny「Costa-Rica」『Bulletin trimestriel de la Société de Géographie Commerciale de Nantes』29e année, 1er trimestre（Nantes、1911年、1911年1月14日講演）pp. 18–35。",
    sourceProvider:
      "フランス国立図書館Gallica公開の原刊巻（ark:/12148/bpt6k107671r、f22–f39）を底本とした。原刊18–35頁の講演本文と統計表を収録した。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/bpt6k107671r",
    rights: gallicaPublicDomainRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "perigny-amerique-centrale-1911": {
    sourceEdition:
      "Maurice de Périgny「L’Amérique centrale」『Questions diplomatiques et coloniales』15e année, tome XXXI（Paris、1911年3月1日・3月16日・4月1日）pp. 297–307, 357–363, 407–413。",
    sourceProvider:
      "フランス国立図書館Gallica公開のモーリス・ド・ペリニー文書所収原刊切抜き（ark:/12148/btv1b10891637n、f1–f12）を底本とした。三回連載の本文、統計表、原刊300–301頁の折込地図を収録した。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/btv1b10891637n",
    rights: gallicaPublicDomainRights,
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "coronel-arte-maya-1620": {
    sourceEdition:
      "Juan Coronel『Arte en lengua de Maya, recopilado y enmendado por el P. F. Ioan Coronel de la Orden de S. Francisco, Guardia del Conuento de Tikax』（México: Imprenta de Diego Garrido, por Adriano César、1620年初版）。",
    sourceProvider:
      "Brigham Young University, L. Tom Perry Special Collections公開の1620年初版写真複製（William Gates papers, MSS 279 Series 8 Subseries 2 Subseries 13 Item 1, box 46, folder 2、CONTENTdm親レコード57684、46画像）を底本とした。同レコードは原資料を「Ms. (photocopy, negative).」と記す。判読と配列確認には同じWilliam Gates papersの旧転写稿（Item 2、親レコード136730）を補助として用い、語形、異同、欠葉および配列は1620年版画像へ戻して確定した。",
    sourceUrl:
      "https://contentdm.lib.byu.edu/digital/collection/p15999coll16/id/57684/",
    rights:
      "1620年原著は著作権保護期間を満了したパブリックドメイン資料です。BYU Digital Collections親レコード57684はデジタル底本を「Copyright Status: Public domain」と表示しており、これはCreative Commonsライセンスではなく公開機関によるパブリックドメイン表示です。BYUのDigital Collections Copyrightは、著作権保護期間を満了した資料を許諾または制限なく自由に利用できると案内しています。所蔵・公開機関表記：Original held in L. Tom Perry Special Collections, Harold B. Lee Library, Brigham Young University, Provo, UT 84602.",
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "beltran-arte-idioma-maya-1746": {
    sourceEdition:
      "Pedro Beltrán de Santa Rosa María『Arte de el idioma Maya reducido a succintas reglas, y semilexicon yucateco』（México: por la viuda de D. Joseph Bernardo de Hogal、1746年初版、John Carter Brown Library請求記号 B746 .B453a）。",
    sourceProvider:
      "John Carter Brown Library所蔵1746年初版を、同館原本に基づくInternet Archive公開の500 ppi・216画像（識別子 artedeelidiomama00belt）で第一底本とした。虫損で物理的に失われた原刊前付p. [4]冒頭の1語のみ、Smithsonian Libraries所蔵1859年再版の画像（識別子 artedelidiomamay00belt）で補った。1859年版独自の綴字変更・組替え・編集者注は採用していない。",
    sourceUrl: "https://archive.org/details/artedeelidiomama00belt",
    rights:
      "1746年原刊本文と1859年再版本文は著作権保護期間を満了したパブリックドメイン資料です。John Carter Brown Libraryのデジタル画像はCC BY 4.0で提供されています。画像クレジット：Courtesy of the John Carter Brown Library. Digital images licensed under CC BY 4.0. Cropping, rotation, tonal adjustment, and layout changes have been made for this edition. JCB公開条件：https://jcblibrary.org/permissions/ 。Smithsonian Librariesは、個別に別表示がないデジタル・ライブラリー上のパブリックドメイン書籍について、自由なダウンロード、利用、再利用、改変を認めています。Smithsonian Libraries公開条件：https://library.si.edu/copyright 。",
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "romero-bosquejo-chiapas-soconusco-1877": {
    sourceEdition:
      "Matías Romero『Bosquejo histórico de la agregación á México de Chiapas y Soconusco y de las negociaciones sobre límites entabladas por México con Centro-América y Guatemala』Tomo I（México: Imprenta del Gobierno, en Palacio, a cargo de Filomeno Mata、1877年）。",
    sourceProvider:
      "Columbia University Libraries所蔵本をGoogle Booksがデジタル化した公開複製（volume ID: xuJEAAAAYAAJ）を主底本とした。内蔵OCRは検索と転記の補助に限り、原刊前付i–xxiv頁、本文3–798頁、表、原注、正誤表は原刊画像で確定した。",
    sourceUrl: "https://books.google.com/books?id=xuJEAAAAYAAJ",
    rights:
      "1877年原刊本文はパブリックドメインです。底本提供機関はColumbia University Libraries。底本PDFはGoogle Booksによりパブリックドメインと表示され、同PDFの利用ガイドラインに従ってGoogleの表示を保持した原刊標題紙画像を収録しています。Columbia University Librariesの公開方針では、著作権保護のない資料は制限なく利用でき、学術研究に伴う刊行には通常条件を課さないとされています。日本語翻訳版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-11",
    updatedDate: "2026-08-11",
  },
  "pineda-sublevaciones-indigenas-chiapas-1888": {
    sourceEdition:
      "Vicente Pineda『Historia de las sublevaciones indígenas habidas en el Estado de Chiapas』（Chiapas: Tipografía del Gobierno, dirigida por J. J. Jiménez、1888年初版）のうち、標題作本文3–132頁。",
    sourceProvider:
      "La Trobe University OPAL公開の1888年刊本デジタル複製（DOI: 10.26181/22299244）を主底本とし、Universidad Autónoma de Nuevo León, Colección Digital所蔵本（identifier 1080013829）で頁配列、難読箇所、原刊標題紙を照合した。UANL公開画像は転載・切り抜きせず、原刊標題紙は文字転記のみを収録した。",
    sourceUrl: "https://doi.org/10.26181/22299244",
    rights:
      "1888年原刊本文は著作権保護期間を満了したパブリックドメイン資料です。La Trobe University OPALのレコードは原資料をPublic Domain、公開ファイルをCC0と表示しています。UANLは公開画像をCC BY-NC-ND 2.5 MXと表示しているため、その画像は本版に転載・切り抜きしていません。日本語翻訳・編集部分には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-14",
    updatedDate: "2026-08-14",
  },
  "codice-chimalpahin-volumen-3": {
    sourceEdition:
      "Instituto Nacional de Antropología e Historia, Biblioteca Nacional de Antropología e Historia所蔵『Códice Chimalpahin』第3巻、原冊 f.1r–203r、デジタル画像418点。翻訳対象本文は f.1r–202vの404面。",
    sourceProvider:
      "Instituto Nacional de Antropología e Historia（INAH）公式サイトが公開する第3巻原本画像を本文底本とし、現行綴じの全15史料を原冊順に転記・校合した。後代写本・近代校訂版・既刊外国語訳は、判読不能箇所、欠葉、異綴り、移配、異読の照合に限って用い、日本語本文の重訳元にはしていない。INAH原本画像は日本語版へ転載していない。",
    sourceUrl:
      "https://www.codicechimalpahin.inah.gob.mx/visualizador/volumen_3/index.php",
    rights:
      "16–17世紀の原著本文は著作権保護期間を満了したパブリックドメイン資料です。本文の転記・校合に用いたINAH公開のCódice Chimalpahin原本画像はCC BY-NC-ND 4.0で提供されていますが、本版には当該画像を転載していません。日本語翻訳・校訂・組版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-14",
    updatedDate: "2026-08-14",
  },
  "pomar-relacion-tezcuco-1582": {
    sourceEdition:
      "Juan Bautista de Pomar, Relaçion q se enbio a su magestad (Relación de Tezcuco), Benson Latin American Collection, Genaro García Collection, Ms. G57 f. 1r–92r and Ms. G58 f. 92r–102v, 17世紀初頭写本（原作1582年）。",
    sourceProvider:
      "Benson Latin American Collection, LLILAS Benson Latin American Studies and Collections, The University of Texas at Austin。デジタル資料識別子 utblac:e98983f6-9321-45cf-9976-40373dbd61a6。公開画像はG58、G57の順だが、所蔵原冊の物理的順序はG57、G58である。判読照合にはJoaquín García Icazbalceta刊本（1891年）とRené Acuña校訂本（1986年）を用いた。",
    sourceUrl:
      "https://collections.lib.utexas.edu/catalog/utblac%3Ae98983f6-9321-45cf-9976-40373dbd61a6",
    rights:
      "1582年原著本文と17世紀写本は著作権保護期間を満了したパブリックドメイン資料です。テキサス大学オースティン校のデジタル資料にはCreative Commons Public Domain Mark 1.0が明示されています。日本語翻訳・編集・組版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-20",
    updatedDate: "2026-08-20",
  },
  "chimalpahin-diario-1577-1615": {
    sourceEdition:
      "Domingo Francisco de San Antón Muñón Chimalpahin Cuauhtlehuanitzin『Diario』。主底本：Bibliothèque nationale de France, Département des Manuscrits, Mexicain 220, pp.1–282。冒頭補完：Biblioteca Nacional de Antropología e Historia, Colección Antigua, MS 256B, ff.17r–18v。Mexicain 220 pp.283–284の後代抜書は対象外。",
    sourceProvider:
      "フランス国立図書館Gallica公開のMexicain 220原冊画像（ark:/12148/btv1b8562411r）を本文正本とした。BNAH MS 256Bの冒頭補完部はLuis Reyes García「Un nuevo manuscrito de Chimalpahin」（1971年）掲載の四面画像・転写で独立照合した。Rafael Tenaの2001年校訂・スペイン語訳およびAxolotl Corpusは異読・固有名・年代の校合補助に限り、日本語本文の重訳元にはしていない。原稿画像は日本語版へ転載していない。",
    sourceUrl: "https://gallica.bnf.fr/ark:/12148/btv1b8562411r",
    rights:
      "16–17世紀の原著本文は著作権保護期間を満了したパブリックドメイン資料です。Gallica/BnF由来のデジタル画像は、非商用利用または学術・科学出版では「Source gallica.bnf.fr / Bibliothèque nationale de France」の表示を条件に無償で再利用でき、商用利用はBnFの許諾および利用料の対象となります。本版にはBnF画像、BNAH写本画像、Reyes García論文の図版、Tena校訂本文・スペイン語訳を転載していません。日本語翻訳・校訂・組版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-20",
    updatedDate: "2026-08-20",
  },
  "boturini-idea-catalogo-1746": {
    sourceEdition:
      "Lorenzo Boturini Benaduci, Idea de una nueva historia general de la América Septentrional, seguida del Catálogo del Museo Histórico Indiano, Madrid: Imprenta de Juan de Zúñiga, 1746年初版。",
    sourceProvider:
      "John Carter Brown Library所蔵第2本をデジタル化したInternet Archive項目 ideadeunanuevahi00botu_0（全324画像）を主底本とし、同館所蔵第1本 ideadeunanuevahi01botu およびGetty Research Institute所蔵本 deunanuevahistor00botu で前付、本文、原刊頁標識、図版、書誌表記を対校しました。",
    sourceUrl: "https://archive.org/details/ideadeunanuevahi00botu_0",
    rights:
      "1746年原刊は著作権保護期間を満了したパブリックドメイン資料です。John Carter Brown Library由来の主底本はWikimedia CommonsでPublic Domain Mark 1.0と表示されています。日本語翻訳・編集・組版には再利用ライセンスを設定していません。",
    publishedDate: "2026-08-20",
    updatedDate: "2026-08-20",
  },
  "flint-antiquities-nicaragua-palenque-builders-1882": {
    "sourceEdition": "Earl Flint, “Antiquities of Nicaragua—Origin of the Palenque Builders: A Letter from Dr. Earl Flint to Dr. Engelman,” The American Antiquarian and Oriental Journal, vol. IV, no. 4 (October 1882), pp. 289–302.",
    "sourceProvider": "Internet Archive公開巻 americanantiqua19peetgoog の原刊289–302頁を本文底本とし、HathiTrust mdp.39015016871488／osu.32435027251644を対校候補として記録しました。",
    "sourceUrl": "https://archive.org/details/americanantiqua19peetgoog",
    "rights": "原著本文と原刊誌面は米国で1929年以前に公刊されたパブリックドメイン資料です。Internet Archiveの当該項目にはrights／licenseurlの表示がなく、本版は同項目の誌面画像・OCRを転載していません。HathiTrustの対校巻はGoogleデジタル化資料であり、同館の公式再利用案内はGoogleスキャン画像・OCRの再ホスト、再配布および商用利用を制限する一方、画像から翻刻・要約・翻訳した本文には制限を設けないとしています。本版はHathiTrustの画像・OCRを転載していません。https://hathitrust.atlassian.net/wiki/spaces/GS/pages/2386591873/Reusing+HathiTrust+Content",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "flint-human-foot-prints-nicaragua-1884": {
    "sourceEdition": "Earl Flint, “Human Foot Prints in Nicaragua,” The American Antiquarian and Oriental Journal, vol. VI, no. 2 (March 1884), pp. 112–114.",
    "sourceProvider": "Internet Archive公開巻 americanantiqua01peetgoog の原刊112–114頁を本文底本とし、americanantiqua13peetgoogおよびHathiTrust mdp.39015014318490を対校資料としました。",
    "sourceUrl": "https://archive.org/details/americanantiqua01peetgoog",
    "rights": "原著本文と原刊誌面は米国で1929年以前に公刊されたパブリックドメイン資料です。Internet Archiveの当該項目にはrights／licenseurlの表示がなく、本版は同項目の誌面画像・OCRを転載していません。HathiTrustの対校巻はGoogleデジタル化資料であり、同館の公式再利用案内はGoogleスキャン画像・OCRの再ホスト、再配布および商用利用を制限する一方、画像から翻刻・要約・翻訳した本文には制限を設けないとしています。本版はHathiTrustの画像・OCRを転載していません。https://hathitrust.atlassian.net/wiki/spaces/GS/pages/2386591873/Reusing+HathiTrust+Content",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "flint-human-foot-prints-nicaragua-1885": {
    "sourceEdition": "Earl Flint, “Human Foot Prints in Nicaragua,” The American Antiquarian and Oriental Journal, vol. VII, no. 3 (May 1885), pp. 156–158.",
    "sourceProvider": "Internet Archive公開巻 americanantiqua34peetgoog の原刊156–158頁を本文底本とし、HathiTrust mdp.39015028719378を対校候補として記録しました。",
    "sourceUrl": "https://archive.org/details/americanantiqua34peetgoog",
    "rights": "原著本文と原刊誌面は米国で1929年以前に公刊されたパブリックドメイン資料です。Internet Archiveの当該項目にはrights／licenseurlの表示がなく、本版は同項目の誌面画像・OCRを転載していません。HathiTrustの対校巻はGoogleデジタル化資料であり、同館の公式再利用案内はGoogleスキャン画像・OCRの再ホスト、再配布および商用利用を制限する一方、画像から翻刻・要約・翻訳した本文には制限を設けないとしています。本版はHathiTrustの画像・OCRを転載していません。https://hathitrust.atlassian.net/wiki/spaces/GS/pages/2386591873/Reusing+HathiTrust+Content",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "flint-pre-adamite-foot-prints-1886": {
    "sourceEdition": "Earl Flint, “Pre-Adamite Foot-Prints,” The American Antiquarian and Oriental Journal, vol. VIII, no. 4 (July 1886), pp. 230–233.",
    "sourceProvider": "Internet Archive公開巻 americanantiqua27peetgoog の原刊230–233頁を本文底本とし、HathiTrust mdp.39015012874767を対校候補として記録しました。",
    "sourceUrl": "https://archive.org/details/americanantiqua27peetgoog",
    "rights": "原著本文と原刊誌面は米国で1929年以前に公刊されたパブリックドメイン資料です。Internet Archiveの当該項目にはrights／licenseurlの表示がなく、本版は同項目の誌面画像・OCRを転載していません。HathiTrustの対校巻はGoogleデジタル化資料であり、同館の公式再利用案内はGoogleスキャン画像・OCRの再ホスト、再配布および商用利用を制限する一方、画像から翻刻・要約・翻訳した本文には制限を設けないとしています。本版はHathiTrustの画像・OCRを転載していません。https://hathitrust.atlassian.net/wiki/spaces/GS/pages/2386591873/Reusing+HathiTrust+Content",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "flint-human-footprints-eocene-1888": {
    "sourceEdition": "Earl Flint, “Human Footprints in the Eocene,” The American Antiquarian and Oriental Journal, vol. X, no. 4 (July 1888), pp. 252–254.",
    "sourceProvider": "Internet Archive公開巻 americanantiqua00peetgoog の原刊252–254頁を本文底本とし、HathiTrust mdp.39015027068306を対校候補として記録しました。",
    "sourceUrl": "https://archive.org/details/americanantiqua00peetgoog",
    "rights": "原著本文と原刊誌面は米国で1929年以前に公刊されたパブリックドメイン資料です。Internet Archiveの当該項目にはrights／licenseurlの表示がなく、本版は同項目の誌面画像・OCRを転載していません。HathiTrustの対校巻はGoogleデジタル化資料であり、同館の公式再利用案内はGoogleスキャン画像・OCRの再ホスト、再配布および商用利用を制限する一方、画像から翻刻・要約・翻訳した本文には制限を設けないとしています。本版はHathiTrustの画像・OCRを転載していません。https://hathitrust.atlassian.net/wiki/spaces/GS/pages/2386591873/Reusing+HathiTrust+Content",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "flint-paleolithics-nicaragua-1888": {
    "sourceEdition": "Earl Flint, “Paleolithics in Nicaragua,” The American Antiquarian and Oriental Journal, vol. X, no. 6 (November 1888), pp. 381–382.",
    "sourceProvider": "Internet Archive公開巻 americanantiqua00peetgoog の原刊381–382頁を本文底本とし、HathiTrust mdp.39015027068306で書誌と巻を照合しました。",
    "sourceUrl": "https://archive.org/details/americanantiqua00peetgoog",
    "rights": "原著本文と原刊誌面は米国で1929年以前に公刊されたパブリックドメイン資料です。Internet Archiveの当該項目にはrights／licenseurlの表示がなく、本版は同項目の誌面画像・OCRを転載していません。HathiTrustの対校巻はGoogleデジタル化資料であり、同館の公式再利用案内はGoogleスキャン画像・OCRの再ホスト、再配布および商用利用を制限する一方、画像から翻刻・要約・翻訳した本文には制限を設けないとしています。本版はHathiTrustの画像・OCRを転載していません。https://hathitrust.atlassian.net/wiki/spaces/GS/pages/2386591873/Reusing+HathiTrust+Content",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "flint-nicaragua-foot-prints-1889": {
    "sourceEdition": "Earl Flint, “Nicaragua Foot-prints,” The American Antiquarian and Oriental Journal, vol. XI, no. 5 (September 1889), pp. 306–311.",
    "sourceProvider": "Bayerische Staatsbibliothek München／Münchener DigitalisierungsZentrum公開の bsb11547459、請求記号 Am.a. 110-11、原刊306–311頁（URN urn:nbn:de:bvb:12-bsb11547459-2、Googleデジタル化）を本文底本とし、HathiTrust mdp.39015012874775を対校巻として記録しました。",
    "sourceUrl": "https://www.digitale-sammlungen.de/en/view/bsb11547459",
    "rights": "原著本文は1889年に米国で公刊されたパブリックドメイン資料です。BSB／MDZのデジタル資料 bsb11547459 はRightsStatements.org「No Copyright - Non-Commercial Use Only 1.0」（NoC-NC 1.0）で公開されています。本版は非商用公開で、BSB／MDZの誌面画像を転載していません。出典：Bayerische Staatsbibliothek München, Am.a. 110-11, pp. 306–311, urn:nbn:de:bvb:12-bsb11547459-2, digitized by Google。https://rightsstatements.org/vocab/NoC-NC/1.0/ HathiTrustの対校巻はGoogleデジタル化資料で、同館の公式再利用案内が画像・OCRの再ホスト、再配布、商用利用を制限します。本版はHathiTrustの画像・OCRを転載していません。https://hathitrust.atlassian.net/wiki/spaces/GS/pages/2386591873/Reusing+HathiTrust+Content",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "flint-what-dr-flint-says-nicaragua-footprints-1890": {
    "sourceEdition": "Earl Flint, “What Dr. Flint Has to Say about the Nicaragua Footprints,” Science, new series, vol. 15, no. 362 (10 January 1890), pp. 30–32, DOI 10.1126/science.ns-15.362.30.",
    "sourceProvider": "JSTOR Early Journal ContentとしてInternet Archiveが公開する単論文 jstor-1762701 を本文底本としました。Science／AAASのDOIページは著者・題名・巻号・頁の書誌確認にのみ用い、同サイトのPDF画像は転載していません。",
    "sourceUrl": "https://archive.org/details/jstor-1762701",
    "rights": "原著本文は1890年に米国で公刊されたパブリックドメイン資料です。JSTOR Early Journal Contentの利用表示および現行利用規約は、同コンテンツの全部または一部を非商用目的で複製・使用・再配布でき、JSTORの出典表示を求めています。本版は非商用公開です。Courtesy of JSTOR。https://www.about.jstor.org/terms/ Science／AAASのDOIページは書誌確認だけに用い、AAASのPDF画像は転載していません。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "flint-prehistoric-horse-america-1891": {
    "sourceEdition": "Earl Flint, “Prehistoric Horse in America,” Scientific American Supplement, vol. XXXII, no. 832 (12 December 1891), p. 13299, DOI 10.1038/scientificamerican12121891-13299asupp.",
    "sourceProvider": "Internet ArchiveのSIMマイクロフィルム公開項目 sim_scientific-american-supplement_1891-12-12_32_832 を本文・図の底本とし、Project Gutenberg版『Scientific American Supplement, No. 832』を文字対校にのみ用いました。",
    "sourceUrl": "https://archive.org/details/sim_scientific-american-supplement_1891-12-12_32_832",
    "rights": "原著本文および原刊図版は1891年に米国で公刊されたパブリックドメイン資料です。Internet Archiveの当該項目にはrights／licenseurlの表示がなく、本版は記事内容として原刊図版一点を収録しました。Project Gutenberg版は文字対校にのみ用い、その電子書籍ファイルまたは同版固有の組版を転載していません。同版を再配布する場合はProject Gutenberg Licenseと商標条件が適用されます。https://www.gutenberg.org/policy/license",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "flint-rainfall-rivas-nicaragua-1898": {
    "sourceEdition": "Earl Flint, “Rainfall at Rivas, Nicaragua,” Monthly Weather Review, vol. 26, no. 7 (July 1898), pp. 304–305, DOI 10.1175/1520-0493(1898)26[304:RARN]2.0.CO;2.",
    "sourceProvider": "Internet ArchiveのSIMマイクロフィルム公開項目 sim_monthly-weather-review_1898-07_26_7 の原刊304–305頁を本文・表の底本とし、American Meteorological Societyの巻号目次・DOIページとNOAAの著者索引で書誌を照合しました。AMSサイトのPDF画像は転載していません。",
    "sourceUrl": "https://archive.org/details/sim_monthly-weather-review_1898-07_26_7",
    "rights": "原刊は1898年の米国気象局刊行物です。NWSの公式利用条件に従い、組み直した表を含む米国政府資料部分は著作権保護の対象外です。本版はNOAA／NWSの承認を意味せず、改変物を政府の公式資料として表示しません。https://www.weather.gov/disclaimer/ Internet Archiveの当該項目にはrights／licenseurlの表示がなく、誌面画像は転載していません。AMSの巻号目次・DOIページは書誌確認だけに用い、AMSサイトのPDF画像は転載していません。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "flint-rainfall-central-western-nicaragua-1899": {
    "sourceEdition": "Earl Flint, “Rainfall in Central and Western Nicaragua,” Monthly Weather Review, vol. 27, supplementary no. 13 (Summary 1899), p. 587, DOI 10.1175/1520-0493(1899)27[587a:RICAWN]2.0.CO;2.",
    "sourceProvider": "Internet ArchiveのSIMマイクロフィルム公開項目 sim_monthly-weather-review_1899_27_13 の原刊587頁を本文底本とし、American Meteorological Societyの巻号目次・DOIページで著者・書誌を照合しました。原刊著者行は “By Earl Flint, dated December 13, 1899.” であり、AMS配布PDF・HTML・同会固有の組版は転載していません。",
    "sourceUrl": "https://archive.org/details/sim_monthly-weather-review_1899_27_13",
    "rights": "原著本文と原刊誌面は1899年に米国で公刊され、現在はパブリックドメインに属します。Internet Archiveの当該項目にはrights／licenseurlの表示がなく、本版は同項目の誌面画像・OCRを転載していません。American Meteorological Societyの公式アーカイブは記事書誌、DOI、PDF導線および「Get Permissions」を表示し、現行許諾案内は同会が権利を有する記事部分の再利用に許諾申請を求めます。本版はAMS配布PDF・HTML・同会固有の組版を転載せず、1899年原刊本文をSIM原誌画像から翻刻・翻訳しました。https://www.ametsoc.org/ams/publications/permissions/",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "putnam-antiquity-man-america-1884": {
    "sourceEdition": "Frederick W. Putnam, remarks recorded by Edward L. Davis, in “Semi-Annual Meeting, April 30, 1884, at the Hall of the American Academy of Arts and Sciences, Boston,” Proceedings of the American Antiquarian Society, vol. 3, part 2, October 1884, pp. 77–93, at pp. 92–93.",
    "sourceProvider": "American Antiquarian Society公式公開PDF 48057588.pdfの会議録92–93頁を本文底本としました。原刊に独立表題はなく、本版の英語表題は本文の導入句に基づく便宜的表題です。",
    "sourceUrl": "https://www.americanantiquarian.org/proceedings/48057588.pdf",
    "rights": "1884年に公刊された原著本文はパブリックドメインです。American Antiquarian Society公式PDFの包括的表示は、個人利用の印刷、ダウンロードおよび電子メール送信を認める一方、複数サイトまたはlistservへの複製・送信には許諾を求めています。本版は同PDFを翻刻と頁境界の確認にのみ用い、原刊画像または固有の組版を転載していません。本日本語訳には再利用許諾を付与していません。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "mca-pre-adamite-track-1885": {
    "sourceEdition": "A. Mc A., “The Pre-Adamite Track,” The American Antiquarian and Oriental Journal, vol. VII, no. 6, November 1885, pp. 364–367, in “Correspondence.”",
    "sourceProvider": "Internet Archive公開のSIMマイクロフィルム項目 sim_american-antiquarian-and-oriental-journal_1885-11_7_6 の原刊364–367頁を本文底本としました。原誌末尾の署名は “A. Mc A.” です。",
    "sourceUrl": "https://archive.org/details/sim_american-antiquarian-and-oriental-journal_1885-11_7_6",
    "rights": "原著本文と1885年の原刊誌面はパブリックドメインです。Internet Archiveの当該項目にはrights／licenseurlの表示がありません。本版は同項目の誌面画像・OCRまたは固有の組版を転載していません。本日本語訳には再利用許諾を付与していません。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "unsigned-nicaragua-footprints-again-1886": {
    "sourceEdition": "Unsigned, “The Nicaragua Foot-Prints Again,” The American Antiquarian and Oriental Journal, vol. VIII, no. 6, November 1886, pp. 373–374, in “The Museum.”",
    "sourceProvider": "Internet Archive公開のSIMマイクロフィルム項目 sim_american-antiquarian-and-oriental-journal_1886-11_8_6 の原刊373–374頁を本文底本としました。記事は無署名で、原誌の見出しは “Nicaragua” です。",
    "sourceUrl": "https://archive.org/details/sim_american-antiquarian-and-oriental-journal_1886-11_8_6",
    "rights": "原著本文と1886年の原刊誌面はパブリックドメインです。Internet Archiveの当該項目にはrights／licenseurlの表示がありません。本版は同項目の誌面画像・OCRまたは固有の組版を転載していません。本日本語訳には再利用許諾を付与していません。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "brinton-ancient-human-footprint-nicaragua-1887": {
    "sourceEdition": "Daniel G. Brinton, “On an Ancient Human Footprint from Nicaragua,” Proceedings of the American Philosophical Society, vol. 24, no. 126, 1887, pp. 437–444. Read November 18, 1887; printed December 29, 1887.",
    "sourceProvider": "Biodiversity Heritage Library／Internet Archive公開の Proceedings of the American Philosophical Society 第24巻（BHL item 31428、Internet Archive identifier proceedingsofamep24amer）の原刊437–444頁および前置図版を本文・図版の底本とし、JSTOR stable 983095で書誌を照合しました。JSTOR配布PDFまたはその固有の組版は転載していません。",
    "sourceUrl": "https://www.biodiversitylibrary.org/item/31428",
    "rights": "原著本文と1887年の原刊誌面はパブリックドメインです。Biodiversity Heritage Library item 31428およびInternet Archive同巻はNOT_IN_COPYRIGHTと表示しています。図版2点は同じ公開誌面から採録し、JSTOR配布PDFまたはその固有の組版は転載していません。本日本語訳には再利用許諾を付与していません。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "editorial-age-nicaragua-footprints-1889": {
    "sourceEdition": "Unsigned editorial, “The Age of the Nicaragua Foot-Prints,” The American Antiquarian and Oriental Journal, vol. XI, no. 2, March 1889, pp. 120–121. The issue was edited by Stephen D. Peet.",
    "sourceProvider": "Internet Archive公開のSIMマイクロフィルム項目 sim_american-antiquarian-and-oriental-journal_1889-03_11_2 の原刊120–121頁および同号前扉を底本としました。原誌では “Editorial” 欄の無署名記事であり、本文が前扉を直接参照します。",
    "sourceUrl": "https://archive.org/details/sim_american-antiquarian-and-oriental-journal_1889-03_11_2",
    "rights": "原著本文、原刊前扉図版および1889年の原刊誌面はパブリックドメインです。Internet Archiveの当該項目にはrights／licenseurlの表示がありません。本文が直接参照する前扉図版1点を記事内容として採録し、余白調整、グレースケール化と軽微な階調補正のみを施しました。本日本語訳には再利用許諾を付与していません。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "crawford-neolithic-man-nicaragua-1891": {
    "sourceEdition": "J. Crawford, “Neolithic Man in Nicaragua,” The American Geologist, vol. 8, no. 3, September 1891, pp. 160–166.",
    "sourceProvider": "Biodiversity Heritage Library公開の The American Geologist 第8巻（BHL item 240809、Internet Archive identifier panamericangeolo81891desm）の原刊160–166頁を本文底本としました。後発の短縮再録版は底本に用いていません。",
    "sourceUrl": "https://www.biodiversitylibrary.org/item/240809",
    "rights": "原著本文と1891年の原刊誌面はパブリックドメインです。Biodiversity Heritage Libraryは当該第8巻をPublic domainと表示しています。底本はUniversity of Illinois Urbana-Champaign所蔵本であり、公開画像は本文、脚注、数値、綴りおよび頁境界の照合に用い、原刊誌面の画像は転載していません。本日本語訳には再利用許諾を付与していません。",
    "publishedDate": "2026-08-14",
    "updatedDate": "2026-08-14"
  },
  "squier-great-calendar-stone-1849": {
    "sourceEdition": "E. G. Squier, “Some New Discoveries respecting the Dates on the Great Calendar Stone of the Ancient Mexicans, with Observations on the Mexican Cycle of Fifty-two Years,” The American Journal of Science and Arts, Second Series, vol. VII, no. 20 (March 1849), pp. 153–157.",
    "sourceProvider": "Wellcome Collection所蔵分離刷（請求記号 b3192962x）を底本としました。",
    "sourceUrl": "https://wellcomecollection.org/works/pfbvr7hv",
    "rights": "原著はパブリックドメインです。Wellcome Collectionは当該デジタル画像をPublic Domain Mark 1.0で表示しています。https://creativecommons.org/publicdomain/mark/1.0/ 本日本語訳には再利用許諾を付与していません。",
    "publishedDate": "2026-08-26",
    "updatedDate": "2026-08-26"
  },
  "squier-british-encroachments-mosquito-question-1850": {
    "sourceEdition": "“British Encroachments and Aggressions in Central America: The Mosquito Question,” The American Whig Review, New Series, vol. V, nos. II–III (1850), pp. 188–203, 235–268. 原刊は無署名で、Charles Lee Stansifer, Ephraim George Squier: Diversos aspectos de su carrera en Centroamérica (1968), p. 64、およびDon C. Seitz, Letters from Francis Parkman to E. G. Squier (1911), p. 52によりスクワイアへ帰属します。",
    "sourceProvider": "Internet Archive公開本。提供元はLincoln Financial Foundation Collection（Allen County Public Library）です。",
    "sourceUrl": "https://archive.org/details/americanwhigrevi00newy",
    "rights": "原著はパブリックドメインです。Internet Archiveの当該資料ページには個別のCreative Commons等のライセンス表示がありません。原刊地図一点を記事内容として収録しています。本日本語訳には再利用許諾を付与していません。",
    "publishedDate": "2026-08-26",
    "updatedDate": "2026-08-26"
  },
  "squier-spanish-american-republics-1850": {
    "sourceEdition": "Anonymous, “The Spanish American Republics, and the Causes of Their Failure. Central America,” The American Whig Review, vol. 12, no. 34, October 1850, pp. 337–344. 原刊は無署名。本稿は原刊p. 344で完結し、p. 345から別稿 “Our Foreign Relations” が始まります。Don C. Seitz (1911), p. 52およびCharles Lee Stansifer (1968), p. 64によるEphraim George Squierへの帰属は、後世の暫定帰属として扱います。",
    "sourceProvider": "HathiTrust Digital Library公開のCornell University Library所蔵本（coo.31924079893891）を底本とし、拡大照合にInternet Archive公開の同号（sim_american-whig-review_1850-10_12_34）を用いました。",
    "sourceUrl": "https://hdl.handle.net/2027/coo.31924079893891",
    "rights": "原著および原刊誌面はパブリックドメインに属します。HathiTrustの当該Cornell University Library所蔵本は、Book ViewerでPublic Domainと表示されています。",
    "publishedDate": "2026-08-26",
    "updatedDate": "2026-08-26"
  },
  "squier-great-ship-canal-question-1850": {
    "sourceEdition": "“The Great Ship Canal Question: England and Costa Rica versus the United States and Nicaragua,” The American Whig Review, New Series, vol. VI, no. V (November 1850), pp. 441–455. 原刊は無署名で、Charles Lee Stansifer, Ephraim George Squier: Diversos aspectos de su carrera en Centroamérica (1968), p. 64、およびDon C. Seitz, Letters from Francis Parkman to E. G. Squier (1911), p. 52によりスクワイアへ帰属します。",
    "sourceProvider": "Internet Archive公開本。提供元はLincoln Financial Foundation Collection（Allen County Public Library）です。",
    "sourceUrl": "https://archive.org/details/americanwhigrevi00newy",
    "rights": "原著はパブリックドメインです。Internet Archiveの当該資料ページには個別のCreative Commons等のライセンス表示がありません。原刊445頁の地図一点を記事内容として収録しています。本日本語訳には再利用許諾を付与していません。",
    "publishedDate": "2026-08-26",
    "updatedDate": "2026-08-26"
  },
  "squier-judgment-by-default-1851": {
    "sourceEdition": "“Judgment by Default: Central America and the Administration,” The American Whig Review, New Series, vol. VII, no. III (March 1851), pp. 276–288. 原刊は無署名で、Charles Lee Stansifer, Ephraim George Squier: Diversos aspectos de su carrera en Centroamérica (1968), p. 64、およびMichael D. Olien, “E. G. Squier and the Miskito,” Ethnohistory 32.2 (1985), p. 130によりスクワイアへ帰属します。",
    "sourceProvider": "Internet Archive掲載のHarvard University所蔵・Googleデジタル化本と、Google Books掲載のUniversity of Wisconsin–Madison所蔵本を底本としました。",
    "sourceUrl": "https://archive.org/details/americanwhigrev06unkngoog",
    "rights": "原著はパブリックドメインです。Internet Archive掲載本の権利状態はNOT_IN_COPYRIGHT（米国）で、個別のCreative Commons等のライセンス表示はありません。Google Books別所蔵本にも個別のCreative Commons等のライセンス表示はありません。本日本語訳には再利用許諾を付与していません。",
    "publishedDate": "2026-08-26",
    "updatedDate": "2026-08-26"
  },
  ...squierBatch03PublicationMetadata,
  ...salvadorArchaeologyBatch02PublicationMetadata,
  ...lardeBatch01PublicationMetadata,
  ...lardeBatch02PublicationMetadata,
  ...squierRetainedPublicationMetadata,
  ...seitzPublicationMetadata,
  ...vallePublicationMetadata,
  ...carranzaPublicationMetadata,
  ...bailyPublicationMetadata,
  ...childsPublicationMetadata,
  ...usNavyNicaraguaCanalPublicationMetadata,
  ...selfridgeDarienPublicationMetadata,
  ...bonaparteNicaraguaCanalPublicationMetadata,
  ...bellyPercementPublicationMetadata,
  ...bellyATraversAmeriqueCentralePublicationMetadata,
  ...keasbeyNicaraguaCanalPublicationMetadata,
  ...conzemiusMiskitoSumuPublicationMetadata,
  ...youngMosquitoShorePublicationMetadata,
  ...garellaPanamaCanalPublicationMetadata,
  ...reclusPanamaDarienPublicationMetadata,
  ...rodriguesPanamaCanalPublicationMetadata,
  ...wyseCanalPanamaPublicationMetadata,
  ...congresInternationalCanalInteroceaniquePublicationMetadata,
  ...siguenzaObrasPublicationMetadata,
  ...thompsonOfficialVisitPublicationMetadata,
  ...waiknaPublicationMetadata,
  ...perignyRemainingPublicationMetadata,
  ...arceMemoriaPublicationMetadata,
  ...mezaPublicationMetadata,
  ...doubledayPublicationMetadata,
  ...henningsenOfficialReportPublicationMetadata,
  ...procesoWilliamWalkerPublicationMetadata,
  ...pimSeemannDottingsPublicationMetadata,
  ...peraltaCostaRicaMosquitosPublicationMetadata,
  ...rabasaEstadoChiapasPublicationMetadata,
  ...montufarWalkerCentroAmericaPublicationMetadata,
  ...barberenaHistoriaElSalvadorPublicationMetadata,
  ...stoneLencaPublicationMetadata,
  ...perezMemoriasPublicationMetadata,
  ...wellsWalkersExpeditionPublicationMetadata,
  ...walkerWarNicaraguaPublicationMetadata,
  ...brintonEssaysAmericanistPublicationMetadata,
  ...brintonFivePapersPublicationMetadata,
  ...brintonSecondFivePapersPublicationMetadata,
  ...brintonThirdFivePapersPublicationMetadata,
  ...brintonFourthFivePapersPublicationMetadata,
  ...brintonExtraTwoPapersPublicationMetadata,
  ...millaGomezCarrilloPublicationMetadata,
  ...galvaoPublicationMetadata,
  ...benzoniPublicationMetadata,
  ...nuixPublicationMetadata,
  ...palacioPublicationMetadata,
  ...gueguencePublicationMetadata,
  ...sahagunPublicationMetadata,
  ...herreraPublicationMetadata,
  ...bancroftNativeRacesPublicationMetadata,
  ...robertsonPublicationMetadata,
};

// Short works are assigned editorially from their original publication form.
// Page count is deliberately not used: short standalone books remain in the
// main catalogue, while concise journal, annual-report, newspaper, and source
// excerpts can be accumulated under a stable author key here.
const shortWorkAuthorBySlug = {
  ...paraveyFouSangShortWorkAuthors,
  "de-guignes-navigations-chinois-amerique-1761": "joseph-de-guignes",
  "cehm-manuscritos-betlemitas-xi-5": "cehm-betlemitas-documents",
  "cehm-beatificacion-pedro-joseph-betancur-lxix-1-1-1": "cehm-betlemitas-documents",
  "cehm-expedientes-betlemitas-xcvii-1-1792-1810": "cehm-betlemitas-documents",
  ...proceresShortWorkAuthors,
  "vle-panama-1831-article-1": "f-w-c",
  "vle-panama-1831-article-2": "f-w-c",
  "vle-interoceanic-1832-article-3": "f-w-c",
  "frus-nicaragua-mosquito-territory-1894": "united-states-department-of-state",
  "serrano-archivo-indias-panama-1911": "manuel-serrano-y-sanz",
  "foreign-office-mosquito-territory-1848": "great-britain-foreign-office",
  "rodriguez-relacion-espantable-terremoto-1541": "juan-rodriguez",
  "henningsen-official-report-granada-1857": "c-f-henningsen",
  "stone-northern-highland-tribes-lenca-1948": "doris-stone",
  "squier-great-calendar-stone-1849": "ephraim-george-squier",
  "squier-british-encroachments-mosquito-question-1850":
    "ephraim-george-squier",
  "squier-spanish-american-republics-1850": "anonymous-american-whig-review",
  "squier-great-ship-canal-question-1850": "ephraim-george-squier",
  "squier-judgment-by-default-1851": "ephraim-george-squier",
  "gonzalez-ruinas-tehuacan-1892": "dario-gonzalez",
  "morelet-testacea-novissima-pars-i-1849": "arthur-morelet",
  "morelet-testacea-novissima-pars-ii-1851": "arthur-morelet",
  "morelet-exploration-guatemala-1850":
    "arthur-morelet-achille-valenciennes",
  "peniche-relaciones-belice-1869": "manuel-peniche",
  "marimon-lacandones-1695": "sebastian-marimon-y-tudo",
  "esquinca-usumacinta": "jose-maria-esquinca",
  "sapper-eastern-lacandons-1891": "karl-sapper",
  "berendt-vermessungsarbeiten-mexiko-1862": "carl-hermann-berendt",
  "berendt-maasse-gewichte-mexiko-1862": "carl-hermann-berendt",
  "berendt-handel-veracruz-1862": "carl-hermann-berendt",
  "berendt-cochenille-produktion-oaxaca-1862": "carl-hermann-berendt",
  "berendt-mexikanische-geographische-literatur-1862-1":
    "carl-hermann-berendt",
  "berendt-baumwollenbau-yucatan-1863": "carl-hermann-berendt",
  "berendt-analytical-alphabet-1869": "carl-hermann-berendt",
  "berendt-escritos-garcia-icazbalceta-1870": "carl-hermann-berendt",
  "berendt-trabajos-linguisticos-juan-pio-perez-1871": "carl-hermann-berendt",
  "berendt-el-ramie-1871": "carl-hermann-berendt",
  "berendt-mexico-1872": "carl-hermann-berendt",
  "berendt-indianer-tehuantepec-1873": "carl-hermann-berendt",
  "berendt-carib-karif-language-1873": "carl-hermann-berendt",
  "berendt-darien-language-1874": "carl-hermann-berendt",
  "berendt-ethnologie-nicaragua-1874": "carl-hermann-berendt",
  "berendt-ethnologie-nicaragua-1875": "carl-hermann-berendt",
  "berendt-ancient-central-american-civilization-1876": "carl-hermann-berendt",
  "berendt-historical-documents-guatemala-1877": "carl-hermann-berendt",
  "berendt-central-america-explorations-1867": "carl-hermann-berendt",
  "berendt-veracruz-correspondence-1861-1862": "carl-hermann-berendt",
  "berendt-drei-tage-cuba-1860": "carl-hermann-berendt",
  "berendt-acasaguastlan-jilotepec-1878": "berendt-bromowicz-cordon",
  "berendt-indigenas-america-central-1877": "carl-hermann-berendt",
  "berendt-palabras-modismos-nicaragua-1874": "carl-hermann-berendt",
  "berendt-mangue-subtiaba-dossier-1874": "carl-hermann-berendt",
  "galindo-ruins-palenque-literary-gazette-1831": "juan-galindo",
  "galindo-noticias-peten-1831": "juan-galindo",
  "galindo-usumacinta-1833": "juan-galindo",
  "galindo-caribs-central-america-1833": "juan-galindo",
  "galindo-antiquities-peten-1834": "juan-galindo",
  "galindo-copan-full-report-1834": "juan-galindo",
  "galindo-copan-literary-gazette-1835": "juan-galindo",
  "galindo-eruption-cosiguina-1835": "juan-galindo",
  "galindo-ruins-copan-aas-1836": "juan-galindo",
  "galindo-on-central-america-1836": "juan-galindo",
  "friedrichsthal-yucatan-1841": "emanuel-von-friedrichsthal",
  "galindo-palenque-1832": "juan-galindo",
  "societe-geographie-central-america-report-1836":
    "societe-de-geographie-committee",
  "arthes-peten-1893": "federico-guillermo-arthes",
  "chonay-totonicapan-title-1886": "dionisio-jose-chonay",
  "us-senate-central-america-correspondence-1853":
    "united-states-department-of-state",
  "dieseldorff-ausgrabungen-coban-1893": "erwin-p-dieseldorff",
  "dieseldorff-alte-bemalte-thongefaesse-guatemala-1893":
    "erwin-p-dieseldorff",
  "dieseldorff-gefaess-chama-1895": "erwin-p-dieseldorff",
  "dieseldorff-reliefbild-chipolem-1895": "erwin-p-dieseldorff",
  "dieseldorff-cuculcan-1895": "erwin-p-dieseldorff",
  "dieseldorff-tolteken-1896": "erwin-p-dieseldorff",
  "perigny-ruines-nacun-1906": "maurice-de-perigny",
  "perigny-exploration-yucatan-1906": "maurice-de-perigny",
  "lemoine-travers-peten-yucatan-1906": "frederic-lemoine",
  "perigny-peten-1907": "maurice-de-perigny",
  "perigny-maya-ruins-quintana-roo-1907": "maurice-de-perigny",
  "dieseldorff-gegenstaende-guatemala-1893":
    "eduard-seler-dieseldorff-sapper",
  "dieseldorff-bemaltes-thongefaess-chama-1894": "erwin-p-dieseldorff",
  "dieseldorff-vampyrkoepfige-gottheit-1894": "erwin-p-dieseldorff",
  "dieseldorff-neue-ausgrabungen-chajcar-1895":
    "erwin-dieseldorff-paul-schellhas",
  "dieseldorff-two-vases-chama-1904":
    "dieseldorff-seler-foerstemann",
  "dieseldorff-jadeit-schmuck-1905": "erwin-p-dieseldorff",
  "dieseldorff-klassifizierung-funde-1909": "erwin-p-dieseldorff",
  "dieseldorff-tzultaca-mam-1926": "erwin-p-dieseldorff",
  "dieseldorff-kunst-religion-band-i-1926": "erwin-p-dieseldorff",
  "dieseldorff-kunst-religion-band-ii-1931": "erwin-p-dieseldorff",
  "dieseldorff-kekchi-will-1583-1932": "erwin-p-dieseldorff",
  "dieseldorff-cauac-thunderbolt-signs-1932":
    "dieseldorff-w-gates",
  "dieseldorff-arqueologia-alta-verapaz-1936": "erwin-p-dieseldorff",
  "dieseldorff-calendario-maya-quirigua-1936": "erwin-p-dieseldorff",
  "dieseldorff-plantas-medicinales-alta-verapaz-1939-1940":
    "erwin-p-dieseldorff",
  "dieseldorff-causa-calendario-quirigua-1940": "erwin-p-dieseldorff",
  "schellhas-virchow-deformierter-schaedel-ulpan-1894":
    "paul-schellhas-rudolf-virchow",
  "virchow-graeberschaedel-guatemala-1897": "rudolf-virchow",
  "perigny-yucatan-inconnu-1908": "maurice-de-perigny",
  "perigny-maler-discoveries-yucatan-1908": "maurice-de-perigny",
  "perigny-yucatan-inconnu-geographie-1908": "maurice-de-perigny",
  "perigny-villes-mortes-amerique-centrale-1909": "maurice-de-perigny",
  "perigny-ruines-rio-bec-1909": "maurice-de-perigny",
  "perigny-lettre-costa-rica-1910": "maurice-de-perigny",
  "perigny-costa-rica-pays-habitants-ressources-1910":
    "maurice-de-perigny",
  "perigny-ruines-nakcun-1911": "maurice-de-perigny",
  "perigny-costa-rica-nantes-1911": "maurice-de-perigny",
  "perigny-amerique-centrale-1911": "maurice-de-perigny",
  "flint-antiquities-nicaragua-palenque-builders-1882": "earl-flint",
  "flint-human-foot-prints-nicaragua-1884": "earl-flint",
  "flint-human-foot-prints-nicaragua-1885": "earl-flint",
  "flint-pre-adamite-foot-prints-1886": "earl-flint",
  "flint-human-footprints-eocene-1888": "earl-flint",
  "flint-paleolithics-nicaragua-1888": "earl-flint",
  "flint-nicaragua-foot-prints-1889": "earl-flint",
  "flint-what-dr-flint-says-nicaragua-footprints-1890": "earl-flint",
  "flint-prehistoric-horse-america-1891": "earl-flint",
  "flint-rainfall-rivas-nicaragua-1898": "earl-flint",
  "flint-rainfall-central-western-nicaragua-1899": "earl-flint",
  "putnam-antiquity-man-america-1884": "frederick-w-putnam",
  "mca-pre-adamite-track-1885": "a-mc-a",
  "unsigned-nicaragua-footprints-again-1886": "anonymous-american-antiquarian",
  "brinton-ancient-human-footprint-nicaragua-1887": "daniel-g-brinton",
  "editorial-age-nicaragua-footprints-1889": "american-antiquarian-editorial",
  "crawford-neolithic-man-nicaragua-1891": "john-crawford",
  ...valleShortWorkAuthors,
  ...squierBatch03ShortWorkAuthors,
  ...salvadorArchaeologyBatch02ShortWorkAuthors,
  ...lardeBatch01ShortWorkAuthors,
  ...lardeBatch02ShortWorkAuthors,
  ...squierRetainedShortWorkAuthors,
  ...perignyRemainingShortWorkAuthors,
  ...brintonFivePapersShortWorkAuthors,
  ...brintonSecondFivePapersShortWorkAuthors,
  ...brintonThirdFivePapersShortWorkAuthors,
  ...brintonFourthFivePapersShortWorkAuthors,
  ...brintonExtraTwoPapersShortWorkAuthors,
};

export const publicationReleaseTag = "publications-current";
export const publicationReleaseUrl =
  `https://github.com/takochanchan/takochanchan.github.io/releases/download/${publicationReleaseTag}`;

const releaseAssetUrl = (relativePath) => {
  const fileName = relativePath.slice(relativePath.lastIndexOf("/") + 1);
  return `${publicationReleaseUrl}/${encodeURIComponent(fileName)}`;
};

const comparePublicationYears = (left, right) => {
  const leftKnown = Number.isInteger(left.year);
  const rightKnown = Number.isInteger(right.year);
  if (leftKnown !== rightKnown) return leftKnown ? -1 : 1;
  if (!leftKnown) return 0;
  return left.year - right.year;
};

// Administrative, judicial, diplomatic, and institutional records retain this
// class even when the source documents were issued as an official compilation.
const documentCollectionSlugs = new Set([
  "garcia-documentos-ineditos-mexico-v13-1907",
  "garcia-documentos-ineditos-mexico-v14-1907",
  "garcia-documentos-ineditos-mexico-v15-1907",
  "arevalo-documentos-antiguos-guatemala-1857",
  "diez-noticias-sacras-reales-mss3023-vol-1",
  "garcia-documentos-ineditos-mexico-v01-1905",
  "garcia-documentos-ineditos-mexico-v02-1905",
  "garcia-documentos-ineditos-mexico-v03-1905",
  "garcia-documentos-ineditos-mexico-v04-1906",
  "garcia-documentos-ineditos-mexico-v05-1906",
  "garcia-documentos-ineditos-mexico-v06-1906",
  "garcia-documentos-ineditos-mexico-v07-1906",
  "garcia-documentos-ineditos-mexico-v08-1906",
  "garcia-documentos-ineditos-mexico-v09-1906",
  "garcia-documentos-ineditos-mexico-v10-1907",
  "garcia-documentos-ineditos-mexico-v11-1907",
  "garcia-documentos-ineditos-mexico-v12-1907",

  "cehm-manuscritos-betlemitas-xi-5",
  "cehm-expedientes-betlemitas-xcvii-1-1792-1810",
  "cehm-beatificacion-pedro-joseph-betancur-lxix-1-1-1",
  "proceso-contra-william-walker-1860",
  "egan-wyer-1930",
  "us-senate-central-america-correspondence-1853",
  "frus-nicaragua-mosquito-territory-1894",
  "foreign-office-mosquito-territory-1848",
]);

export const publications = publicationRecords.map((item) => {
  const metadata = publicationMetadata[item.slug];
  if (!metadata) {
    throw new Error(`Missing publication metadata: ${item.slug}`);
  }
  const bibliography = canonicalBibliography.get(item.slug);
  if (!bibliography) {
    throw new Error(`Missing canonical bibliography: ${item.slug}`);
  }
  const shortWorkAuthorKey = shortWorkAuthorBySlug[item.slug] ?? null;
  const recordClass = documentCollectionSlugs.has(item.slug)
    ? "document-collection"
    : shortWorkAuthorKey ? "short-work" : "major-work";
  if (bibliography.recordClass !== recordClass) {
    throw new Error(
      `Bibliographic record class differs for ${item.slug}: ` +
        `${bibliography.recordClass} / ${recordClass}`,
    );
  }
  const { sourceAccess, attribution, ...canonicalFields } = bibliography;
  return {
    ...item,
    ...metadata,
    ...canonicalFields,
    recordClass,
    authorKey: shortWorkAuthorKey,
    sourceAccessStatus: sourceAccess.status,
    sourceAccessNote: sourceAccess.note ?? null,
    sourceUrl: sourceAccess.status === "online" ? sourceAccess.url : null,
    ...(attribution
      ? {
          attributedTo: attribution.attributedTo,
          attributionStatus: attribution.status,
          attributionNote: attribution.note,
        }
      : {}),
    searchShard: item.searchShard ?? "001",
    pdfUrl: releaseAssetUrl(item.pdf),
    epubUrl: releaseAssetUrl(item.epub),
  };
}).map(normalizePublicationAttributes);

if (canonicalBibliography.size !== publications.length) {
  throw new Error(
    `Canonical bibliography coverage differs: ` +
      `${canonicalBibliography.size} / ${publications.length}`,
  );
}

export const majorPublications = publications.filter(
  (item) => item.recordClass === "major-work",
);

export const shortPublications = publications.filter(
  (item) => item.recordClass === "short-work",
);

export const documentPublications = publications.filter(
  (item) => item.recordClass === "document-collection",
);

export const shortPublicationAuthors = [
  ...shortPublications.reduce((groups, item) => {
    const group = groups.get(item.authorKey) ?? {
      key: item.authorKey,
      name: item.author,
      publications: [],
    };
    if (group.name !== item.author) {
      throw new Error(
        `Inconsistent author label for ${item.authorKey}: ${group.name} / ${item.author}`,
      );
    }
    group.publications.push(item);
    groups.set(item.authorKey, group);
    return groups;
  }, new Map()).values(),
]
  .map((group) => ({
    ...group,
    publications: group.publications.sort(
      (a, b) =>
        comparePublicationYears(a, b) || a.title.localeCompare(b.title, "ja"),
    ),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "ja"));

export const taxonomy = {
  types: [...new Set(publications.flatMap((item) => item.types))].sort((a, b) =>
    a.localeCompare(b, "ja"),
  ),
  regions: [
    ...new Set(publications.flatMap((item) => item.regions)),
  ].sort((a, b) => a.localeCompare(b, "ja")),
  languages: [
    ...new Set(publications.flatMap((item) => item.languages)),
  ].sort((a, b) => a.localeCompare(b, "ja")),
};















