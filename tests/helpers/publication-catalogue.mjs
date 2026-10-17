import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

// Test-only oracle: never import src/publications or regenerate this fixture
// from production data. Review additions against the publication's bibliography.
export const publicationCounts = records => ({
  books: records.filter(item => item.recordClass === "major-work").length,
  papers: records.filter(item => item.recordClass === "short-work").length,
  documentCollections: records.filter(item => item.recordClass === "document-collection").length,
});

export function catalogueExpectations(fixture) {
  assert.equal(fixture.schemaVersion, 1, "unsupported catalogue expectation schema");
  const expectedRecords = fixture.records;
  const expectedGroups = fixture.groups;
  const expectedBySlug = new Map(expectedRecords.map(item => [item.slug, item]));
  assert.equal(expectedBySlug.size, expectedRecords.length, "duplicate expectation slug");
  const classes = new Set(["major-work", "short-work", "document-collection"]);
  for (const item of expectedRecords) {
    assert.ok(item.slug && classes.has(item.recordClass), `${item.slug}: invalid expectation class`);
    assert.match(item.searchShard, /^\d{3}$/, `${item.slug}: invalid expectation shard`);
  }

  const groupedSlugs = new Set();
  const groupSlugs = new Set();
  const expectedSeriesBySlug = new Map();
  for (const group of expectedGroups) {
    assert.ok(group.slug && !groupSlugs.has(group.slug) && !expectedBySlug.has(group.slug),
      `${group.slug}: duplicate expectation group`);
    groupSlugs.add(group.slug);
    assert.ok(group.memberSlugs.length > 0, `${group.slug}: empty expectation group`);
    const members = group.memberSlugs.map(slug => {
      assert.ok(expectedBySlug.has(slug), `${group.slug}: unregistered expectation member ${slug}`);
      assert.ok(!groupedSlugs.has(slug), `${slug}: duplicate expectation membership`);
      groupedSlugs.add(slug);
      return expectedBySlug.get(slug);
    });
    assert.ok(members.every(item => item.recordClass === members[0].recordClass),
      `${group.slug}: mixed expectation classes`);
    if (group.seriesVolumeCount !== undefined) {
      assert.ok(Number.isInteger(group.seriesVolumeCount) && group.seriesVolumeCount > 0,
        `${group.slug}: invalid series volume count`);
      const numbers = members.map(item => item.seriesVolumeNumber);
      assert.ok(numbers.every(number => Number.isInteger(number) && number >= 1 && number <= group.seriesVolumeCount),
        `${group.slug}: invalid published volume number`);
      assert.equal(new Set(numbers).size, members.length, `${group.slug}: duplicate published volume number`);
      assert.deepEqual(numbers, [...numbers].sort((a, b) => a - b), `${group.slug}: published volume order`);
      assert.ok(members.every(item => typeof item.originalAuthor === "string" && item.originalAuthor.length > 0),
        `${group.slug}: missing expected volume author`);
      const allNumbers = Array.from({ length: group.seriesVolumeCount }, (_, index) => index + 1);
      expectedSeriesBySlug.set(group.slug, {
        allNumbers,
        publishedVolumes: members,
        unpublishedNumbers: allNumbers.filter(number => !numbers.includes(number)),
      });
    }
  }
  const expectedCatalogueCount = recordClass =>
    expectedRecords.filter(item => item.recordClass === recordClass).length -
    expectedGroups.filter(group => expectedBySlug.get(group.memberSlugs[0]).recordClass === recordClass)
      .reduce((removed, group) => removed + group.memberSlugs.length - 1, 0);

  return {
    expectedCatalogue: fixture,
    expectedRecords,
    expectedGroups,
    expectedBySlug,
    expectedMajor: expectedRecords.filter(item => item.recordClass === "major-work"),
    expectedShort: expectedRecords.filter(item => item.recordClass === "short-work"),
    expectedDocuments: expectedRecords.filter(item => item.recordClass === "document-collection"),
    expectedBooks: expectedCatalogueCount("major-work"),
    expectedPapers: expectedCatalogueCount("short-work"),
    expectedDocumentCollections: expectedCatalogueCount("document-collection"),
    expectedSeriesBySlug,
  };
}

export const {
  expectedCatalogue, expectedRecords, expectedGroups, expectedBySlug,
  expectedMajor, expectedShort, expectedDocuments,
  expectedBooks, expectedPapers, expectedDocumentCollections, expectedSeriesBySlug,
} = catalogueExpectations(JSON.parse(await readFile(
  new URL("../fixtures/publication-catalogue.json", import.meta.url), "utf8",
)));
