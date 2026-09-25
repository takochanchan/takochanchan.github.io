import assert from "node:assert/strict";

// Test the complete document while keeping failures independent of its size.
function contains(text, pattern) {
  assert.equal(typeof text, "string", "text assertion requires a string");
  assert.ok(pattern instanceof RegExp, "text assertion requires a RegExp");
  return new RegExp(pattern.source, pattern.flags).test(text);
}

export function matchText(text, pattern, message) {
  assert.ok(contains(text, pattern), message ??
    `Expected ${pattern} in document (${text.length} characters checked)`);
}

export function doesNotMatchText(text, pattern, message) {
  assert.ok(!contains(text, pattern), message ??
    `Unexpected ${pattern} in document (${text.length} characters checked)`);
}
