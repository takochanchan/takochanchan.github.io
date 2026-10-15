import assert from "node:assert/strict";
import test from "node:test";
import { catalogueExpectations, publicationCounts } from "./helpers/publication-catalogue.mjs";

// Deliberately small, independent examples; volume 2 is not yet published.
const fixture = () => ({
  schemaVersion: 1,
  records: [
    { slug: "book", recordClass: "major-work", searchShard: "001" },
    { slug: "paper", recordClass: "short-work", searchShard: "002" },
    { slug: "volume-1", recordClass: "document-collection", searchShard: "002", seriesVolumeNumber: 1, originalAuthor: "Author A" },
    { slug: "volume-3", recordClass: "document-collection", searchShard: "002", seriesVolumeNumber: 3, originalAuthor: "Author B" },
  ],
  groups: [{ slug: "series", memberSlugs: ["volume-1", "volume-3"], seriesVolumeCount: 4 }],
});

test("next volume updates unit counts and publication status without changing catalogue counts", () => {
  const data = fixture();
  const before = catalogueExpectations(data);
  assert.deepEqual(publicationCounts(before.expectedRecords), { books: 1, papers: 1, documentCollections: 2 });
  assert.equal(before.expectedDocumentCollections, 1);
  assert.deepEqual(before.expectedSeriesBySlug.get("series").unpublishedNumbers, [2, 4]);

  data.records.push({ slug: "volume-2", recordClass: "document-collection", searchShard: "002", seriesVolumeNumber: 2, originalAuthor: "Author C" });
  data.groups[0].memberSlugs.splice(1, 0, "volume-2");
  const after = catalogueExpectations(data);
  assert.deepEqual(publicationCounts(after.expectedRecords), { books: 1, papers: 1, documentCollections: 3 });
  assert.equal(after.expectedDocumentCollections, 1);
  assert.deepEqual(after.expectedSeriesBySlug.get("series").publishedVolumes.map(item => item.seriesVolumeNumber), [1, 2, 3]);
  assert.deepEqual(after.expectedSeriesBySlug.get("series").unpublishedNumbers, [4]);
});

test("independent fixture rejects omitted, repeated, and misclassified group members", () => {
  const missing = fixture();
  missing.records.pop();
  assert.throws(() => catalogueExpectations(missing), /unregistered expectation member volume-3/);
  const duplicate = fixture();
  duplicate.records.push({ ...duplicate.records[0] });
  assert.throws(() => catalogueExpectations(duplicate), /duplicate expectation slug/);
  const repeated = fixture();
  repeated.groups[0].memberSlugs.push("volume-1");
  assert.throws(() => catalogueExpectations(repeated), /duplicate expectation membership/);
  const wrongClass = fixture();
  wrongClass.records[3].recordClass = "major-work";
  assert.throws(() => catalogueExpectations(wrongClass), /mixed expectation classes/);
  const unknownClass = fixture();
  unknownClass.records[0].recordClass = "unknown";
  assert.throws(() => catalogueExpectations(unknownClass), /invalid expectation class/);
});

test("series expectations reject duplicate, out-of-range, unordered, or unspecified volumes", () => {
  for (const number of [1, 0, 5, undefined]) {
    const data = fixture();
    data.records[3].seriesVolumeNumber = number;
    assert.throws(() => catalogueExpectations(data), /(?:duplicate|invalid) published volume number/);
  }
  const unordered = fixture();
  unordered.groups[0].memberSlugs.reverse();
  assert.throws(() => catalogueExpectations(unordered), /published volume order/);
  const noAuthor = fixture();
  delete noAuthor.records[3].originalAuthor;
  assert.throws(() => catalogueExpectations(noAuthor), /missing expected volume author/);
});
