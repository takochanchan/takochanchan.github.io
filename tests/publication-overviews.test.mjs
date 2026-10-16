import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cataloguePublications } from "../src/catalogue-publications.mjs";
import { publicationOverviews, validatePublicationOverviews } from "../src/publication-overviews.mjs";

const escapeHtml = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

test("every bibliography and volume has an individually written overview within 1000 characters", () => {
  validatePublicationOverviews(cataloguePublications);
});

test("overview validation rejects missing, oversized, orphaned and duplicated volume text", () => {
  const catalogue = [{ slug: "work", volumes: [{ slug: "v1" }, { slug: "v2" }] }];
  const valid = { work: "全巻の概要。", v1: "第一巻の概要。", v2: "第二巻の概要。" };
  assert.doesNotThrow(() => validatePublicationOverviews(catalogue, { ...valid, work: "字".repeat(1000) }));
  assert.throws(() => validatePublicationOverviews(catalogue, { ...valid, v1: " " }), /Missing/);
  assert.throws(() => validatePublicationOverviews(catalogue, { ...valid, v1: "字".repeat(1001) }), /1000/);
  assert.throws(() => validatePublicationOverviews(catalogue, { ...valid, extra: "余分" }), /Unknown/);
  assert.throws(() => validatePublicationOverviews(catalogue, { ...valid, v2: valid.v1 }), /individually/);
});

test("all overview text is in the initial HTML, inside closed native disclosures, and matches structured data", async () => {
  for (const item of cataloguePublications) {
    const html = await readFile(new URL(`../dist/publications/${item.slug}/index.html`, import.meta.url), "utf8");
    const entries = [item, ...(item.volumes.length > 1 ? item.volumes : [])];
    const disclosures = [...html.matchAll(/<details\b([^>]*)class="publication-overview"([^>]*)>([\s\S]*?)<\/details>/gu)];
    assert.equal(disclosures.length, entries.length, `${item.slug}: disclosure count`);
    for (let i = 0; i < entries.length; i++) {
      const [, before, after, body] = disclosures[i];
      const slug = entries[i].slug;
      assert.doesNotMatch(before + after, /\bopen(?:\s|=|$)/u, `${slug}: closed initially`);
      assert.ok(after.includes(`id="overview-${slug}"`), `${slug}: independent control`);
      assert.match(body, /^\s*<summary\b[\s\S]*?<\/summary>/u, `${slug}: native keyboard control`);
      assert.ok(body.includes(`<p>${escapeHtml(publicationOverviews[slug])}</p>`), `${slug}: full text in HTML`);
    }
    const structured = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gu)]
      .flatMap(match => JSON.parse(match[1]));
    const work = structured.find(value => value.identifier === item.slug);
    assert.ok(work, `${item.slug}: structured work`);
    assert.equal(work.abstract, publicationOverviews[item.slug]);
    if (item.volumes.length > 1) {
      assert.deepEqual(work.hasPart.map(part => part.abstract), item.volumes.map(volume => publicationOverviews[volume.slug]));
    }
  }
});
