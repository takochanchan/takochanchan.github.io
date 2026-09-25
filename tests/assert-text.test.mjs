import assert from "node:assert/strict";
import test from "node:test";
import { matchText, doesNotMatchText } from "./helpers/assert-text.mjs";

test("HTML assertions inspect the entire document and keep failures small", () => {
  const document = "x".repeat(1_400_000) + '<strong id="book-match-count">191</strong>';
  matchText(document, /book-match-count">191/);
  doesNotMatchText(document, /book-match-count">190/);
  for (const check of [
    () => matchText(document, /book-match-count">190/),
    () => doesNotMatchText(document, /book-match-count">191/),
  ]) {
    assert.throws(check, error => error.code === "ERR_ASSERTION" &&
      error.message.length < 300 && !error.message.includes("xxxxxxxx"));
  }
});

test("HTML assertions do not carry state across a reused global expression", () => {
  const pattern = /present/g;
  matchText("present", pattern);
  matchText("present", pattern);
  assert.equal(pattern.lastIndex, 0);
});
