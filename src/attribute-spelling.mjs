// Catalogue labels only: preserve titles, source descriptions and classification axes.
// Keep historical territories, broad language groups and distinct document forms separate.
const regionAliases = {
  "エル・サルバドル": "エルサルバドル",
  "サルバドル": "エルサルバドル",
  "コスタ・リカ": "コスタリカ",
  "新スペイン": "ヌエバ・エスパーニャ",
  "ヌエバ・エスパニャ": "ヌエバ・エスパーニャ",
  "メキシコ市": "メキシコシティ",
};

export const attributeSpellingAliases = {
  types: {
    "紀行": "旅行記",
    "地理誌": "地誌",
  },
  regions: regionAliases,
  languages: {
    "マングエ語": "マンゲ語",
  },
  tags: {
    ...regionAliases,
    "エル・サルバドル史": "エルサルバドル史",
    "サンサルバドル": "サン・サルバドル",
    "シウダー・レアル": "シウダ・レアル",
    "フスト・ルフィーノ・バリオス": "フスト・ルフィノ・バリオス",
    "ベレン会": "ベツレヘム会",
    "植民地時代": "植民地期",
    "マングエ語": "マンゲ語",
  },
};

export function normalizePublicationAttributes(publication) {
  const result = { ...publication };
  const searchAliases = new Set(publication.searchAliases ?? []);
  for (const [field, aliases] of Object.entries(attributeSpellingAliases)) {
    const values = (publication[field] ?? []).map((value) => {
      const clean = value.trim();
      return Object.hasOwn(aliases, clean) ? aliases[clean] : clean;
    });
    result[field] = [...new Set(values)];
    for (const [alias, canonical] of Object.entries(aliases)) {
      if (result[field].includes(canonical)) searchAliases.add(alias);
    }
  }
  result.searchAliases = [...searchAliases];
  return result;
}
