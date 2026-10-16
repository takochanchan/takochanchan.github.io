import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cataloguePublications } from "../src/catalogue-publications.mjs";
import { publicationOverviews, validatePublicationOverviews } from "../src/publication-overviews.mjs";

const escapeHtml = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

test("every published volume has an individually written detailed overview of approximately 1000 characters", () => {
  validatePublicationOverviews(cataloguePublications);
  assert.equal(Object.keys(publicationOverviews).length, cataloguePublications.reduce((count, item) => count + item.volumes.length, 0));
});

test("overview validation rejects missing, short, oversized, orphaned and duplicated volume text", () => {
  const catalogue = [{ slug: "work", volumes: [{ slug: "v1" }, { slug: "v2" }] }];
  const valid = { v1: "甲".repeat(900), v2: "乙".repeat(900) };
  assert.doesNotThrow(() => validatePublicationOverviews(catalogue, { ...valid, v1: "字".repeat(1000) }));
  assert.throws(() => validatePublicationOverviews(catalogue, { ...valid, v1: " " }), /Missing/);
  assert.throws(() => validatePublicationOverviews(catalogue, { ...valid, v1: "字".repeat(799) }), /approximately/);
  assert.throws(() => validatePublicationOverviews(catalogue, { ...valid, v1: "字".repeat(799) + " ".repeat(100) }), /approximately/);
  assert.throws(() => validatePublicationOverviews(catalogue, { ...valid, v1: "字".repeat(1001) }), /1000/);
  assert.throws(() => validatePublicationOverviews(catalogue, { ...valid, extra: "余分" }), /Unknown/);
  assert.throws(() => validatePublicationOverviews(catalogue, { ...valid, work: "総括" }), /Unknown/);
  assert.throws(() => validatePublicationOverviews(catalogue, { ...valid, v2: valid.v1 }), /individually/);
});

test("original descriptions remain visible and unchanged, with volume disclosures immediately below them", async () => {
  for (const item of cataloguePublications) {
    const html = await readFile(new URL(`../dist/publications/${item.slug}/index.html`, import.meta.url), "utf8");
    const original = `<p class="publication-hero__description">${escapeHtml(item.description)}</p>`;
    const descriptionAt = html.indexOf(original);
    assert.ok(descriptionAt >= 0, `${item.slug}: original description preserved exactly`);
    const afterDescription = html.slice(descriptionAt + original.length);
    assert.match(afterDescription, /^\s*<div class="publication-overview-list">\s*<details\b/u, `${item.slug}: details immediately below original`);
    assert.ok(html.includes(`<meta name="description" content="${escapeHtml(item.description)}">`), `${item.slug}: original meta description`);
    assert.equal((html.match(/class="publication-hero__description"/gu) ?? []).length, 1, `${item.slug}: one visible original description`);
    const entries = item.volumes;
    const disclosures = [...html.matchAll(/<details\b([^>]*)class="publication-overview"([^>]*)>([\s\S]*?)<\/details>/gu)];
    assert.equal(disclosures.length, entries.length, `${item.slug}: disclosure count`);
    for (let i = 0; i < entries.length; i++) {
      const [, before, after, body] = disclosures[i];
      const slug = entries[i].slug;
      assert.doesNotMatch(before + after, /\bopen(?:\s|=|$)/u, `${slug}: closed initially`);
      assert.ok(after.includes(`id="overview-${slug}"`), `${slug}: independent control`);
      assert.match(body, /^\s*<summary\b[\s\S]*?<\/summary>/u, `${slug}: native keyboard control`);
      const paragraphs = publicationOverviews[slug].split(/\n\s*\n/u).map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join("");
      assert.ok(body.includes(`<div class="publication-overview__body">${paragraphs}</div>`), `${slug}: full text in initial HTML`);
      const label = `${entries.length > 1 ? entries[i].volumeLabel + "の" : ""}詳細概要`;
      assert.ok(body.includes(`<span class="publication-overview__show">${escapeHtml(label)}</span>`), `${slug}: volume-specific button`);
    }
    const structured = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gu)]
      .flatMap(match => JSON.parse(match[1]));
    const work = structured.find(value => value.identifier === item.slug);
    assert.ok(work, `${item.slug}: structured work`);
    assert.equal(work.description, item.description, `${item.slug}: original structured description`);
    assert.equal(work.abstract, publicationOverviews[item.slug]);
    if (item.volumes.length > 1) {
      assert.deepEqual(work.hasPart.map(part => part.abstract), item.volumes.map(volume => publicationOverviews[volume.slug]));
    }
  }
});
