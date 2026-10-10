import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { publications } from "../src/publications.mjs";
import { cataloguePublications } from "../src/catalogue-publications.mjs";

const slug = "robles-diario-sucesos-notables-1853";
const members = [slug + "-vol-1", slug + "-vol-2"];
test("Robles has two original volumes under one bibliography", () => {
  const units = members.map(id => publications.find(item => item.slug === id));
  assert.ok(units.every(Boolean));
  assert.deepEqual(units.map(item => item.pageCount), [481, 487]);
  assert.deepEqual(units.map(item => item.searchShard), ["002", "002"]);
  const work = cataloguePublications.find(item => item.slug === slug);
  assert.ok(work);
  assert.equal(work.author, "アントニオ・デ・ロブレス");
  assert.equal(work.originalAuthor, "Antonio de Robles");
  assert.equal(work.pageCount, 968);
  assert.deepEqual(work.volumes.map(item => item.slug), members);
  assert.equal(work.volumes.length, 2);
  for (const item of [...units, work]) {
    assert.match(item.sourceProvider, /Biblioteca Nacional de España/u);
    assert.match(item.sourceProvider, /bdh0000147570/u);
    assert.match(item.rights, /Imágenes procedentes de los fondos de la Biblioteca Nacional de España\./u);
    assert.match(item.rights, /uso-reproducciones/u);
    assert.doesNotMatch(item.rights, /CC BY|CC0|利用者|提供された/u);
    assert.match(item.sourceUrl, /id=0000147570/u);
  }
});

test("Robles public page exposes four edition files and accurate BNE attribution", async () => {
  const page = await readFile(new URL("../dist/publications/" + slug + "/index.html", import.meta.url), "utf8");
  for (const vol of [1, 2]) {
    for (const format of ["pdf", "epub"]) {
      assert.ok(page.includes("Antonio_de_Robles_Diario_1665_1703_1853_Vol" + vol + "_Japanese_Translation." + format));
    }
  }
  assert.match(page, /Imágenes procedentes de los fondos de la Biblioteca Nacional de España\./u);
  assert.match(page, /uso-reproducciones/u);
  assert.doesNotMatch(page, /Volumen-[23]\.pdf|利用者から提供|提供されたPDF|\.docx/u);
});
