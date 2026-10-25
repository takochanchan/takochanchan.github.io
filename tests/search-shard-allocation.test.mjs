import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import {
  activeSearchShards,
  browserSearchShards,
  readSearchShardConfig,
  validateSearchShardAssignments,
} from "../scripts/search/shard-config.mjs";

const config = await readSearchShardConfig(fileURLToPath(new URL("../", import.meta.url)));
const existing = [
  ...Array.from({ length: 277 }, (_, i) => ({ slug: `legacy-${i}`, searchShard: "001" })),
  ...Array.from({ length: 199 }, (_, i) => ({ slug: `second-${i}`, searchShard: "002" })),
];

test("003 is configured without loading an empty index", () => {
  assert.deepEqual(config.shards.map(shard => shard.id), ["001", "002", "003"]);
  assert.equal(config.defaultShard, "001");
  assert.equal(config.shards[1].sealedWorks, 199);
  assert.equal(config.shards[2].repository, "takochanchan/takochan-search-index-003");
  assert.deepEqual(activeSearchShards(config, existing).map(shard => shard.id), ["001", "002"]);
  assert.deepEqual(browserSearchShards(config, existing).map(shard => shard.id), ["001", "002"]);
});

test("the first new work activates 003 for both the client and remote verification", () => {
  const publications = [...existing, { slug: "new-work", searchShard: "003" }];
  assert.deepEqual(activeSearchShards(config, publications).map(shard => shard.id), ["001", "002", "003"]);
  const browser = browserSearchShards(config, publications);
  assert.equal(browser[2].pagefindModule, "https://takochanchan.github.io/takochan-search-index-003/pagefind/pagefind.js");
  assert.equal(validateSearchShardAssignments(publications, config).get("003"), 1);
});

test("sealed shards reject additions and movements while 003 retains its work budget", () => {
  for (const id of ["001", "002"]) {
    assert.throws(() => activeSearchShards(config, [...existing, { slug: "new-work", searchShard: id }]), /is sealed/);
    const moved = existing.map((work, i) => i === (id === "001" ? 0 : 277) ? { ...work, searchShard: "003" } : work);
    assert.throws(() => activeSearchShards(config, moved), /is sealed/);
  }
  const full = [...existing, ...Array.from({ length: 300 }, (_, i) => ({ slug: `third-${i}`, searchShard: "003" }))];
  assert.equal(validateSearchShardAssignments(full, config).get("003"), 300);
  assert.throws(() => activeSearchShards(config, [...full, { slug: "overflow", searchShard: "003" }]), /301\/300/);
  assert.throws(() => activeSearchShards(config, [...existing, { slug: "unknown", searchShard: "004" }]), /unknown search shard/);
});
