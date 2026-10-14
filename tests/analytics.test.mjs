import test from "node:test";
import assert from "node:assert/strict";
import { initAnalytics, downloadFile, fileKey, measurementId, optOutKey } from "../src/analytics.mjs";

const href = "https://github.com/takochanchan/takochanchan.github.io/releases/download/publications-current/test.pdf";
function environment({ navigator = {}, stored = null, hostname = "takochanchan.github.io" } = {}) {
  const listeners = {};
  const scripts = [];
  const preference = { addEventListener(type, callback) { this.click = callback; } };
  const status = {};
  const window = {
    navigator: { userAgent: "Mozilla/5.0 Safari/605.1", ...navigator },
    location: { hostname, origin: `https://${hostname}`, pathname: "/publications/test/", reload() {} },
    localStorage: { getItem() { return stored; }, setItem(key, value) { assert.equal(key, optOutKey); stored = value; } },
  };
  const document = {
    referrer: "https://example.org/private?email=not-to-be-sent",
    querySelector: selector => selector.includes("preference") ? preference : status,
    createElement: () => ({}),
    head: { appendChild: script => scripts.push(script) },
    addEventListener: (type, callback) => { listeners[type] = callback; },
  };
  const click = (url = href, extra = {}) => listeners.click?.({
    type: "click", isTrusted: true, target: { closest: () => ({ href: url }) }, ...extra,
  });
  return { window, document, listeners, scripts, preference, click };
}
test("loads only the dedicated GA tag once and removes referrer details", () => {
  const e = environment(); initAnalytics(e.window, e.document); initAnalytics(e.window, e.document);
  assert.equal(e.scripts.length, 1);
  assert.ok(e.scripts[0].src.endsWith(measurementId));
  const config = e.window.dataLayer.find(row => row[0] === "config")[2];
  assert.equal(config.page_referrer, "https://example.org");
  assert.equal(config.allow_google_signals, false);
  assert.equal(e.window.dataLayer.filter(row => row[1] === "page_view").length, 1);
});
test("skips bots, automated browsers, privacy signals, opt-out and previews", () => {
  for (const options of [{ navigator: { userAgent: "GPTBot/1.0" } }, { navigator: { webdriver: true } },
    { navigator: { doNotTrack: "1" } }, { navigator: { globalPrivacyControl: true } },
    { stored: "1" }, { hostname: "localhost" }]) {
    const e = environment(options); initAnalytics(e.window, e.document);
    assert.equal(e.scripts.length, 0); assert.equal(e.window.dataLayer, undefined);
  }
});
test("counts trusted PDF and EPUB save clicks, suppressing synthetic and rapid repeats", () => {
  const e = environment(); initAnalytics(e.window, e.document);
  e.click(href, { isTrusted: false }); e.click(); e.click(); e.click(href.replace(".pdf", ".epub"));
  e.click("https://example.org/test.pdf");
  const events = e.window.dataLayer.filter(row => row[1] === "archive_download");
  assert.equal(events.length, 2);
  assert.equal(events[0][2].file_extension, "pdf");
  assert.equal(events[1][2].file_extension, "epub");
  assert.notEqual(events[0][2].link_id, events[1][2].link_id);
  e.preference.click(); e.click(href.replace("test.pdf", "next.pdf"));
  assert.equal(e.window.dataLayer.filter(row => row[1] === "archive_download").length, 2);
  assert.equal(e.window[`ga-disable-${measurementId}`], true);
});
test("middle-click works, right-click and PDF viewing do not count as saves", () => {
  const e = environment(); initAnalytics(e.window, e.document);
  e.listeners.auxclick({ type: "auxclick", button: 2, isTrusted: true, target: { closest: () => ({ href }) } });
  e.click(href, { target: { closest: () => null } });
  e.listeners.auxclick({ type: "auxclick", button: 1, isTrusted: true, target: { closest: () => ({ href }) } });
  assert.equal(e.window.dataLayer.filter(row => row[1] === "archive_download").length, 1);
});
test("identifiers survive query changes, distinguish formats and reject foreign URLs", () => {
  assert.equal(downloadFile(href + "?tracking=private#page=1").key, downloadFile(href).key);
  assert.notEqual(fileKey("test.pdf"), fileKey("test.epub"));
  assert.ok(fileKey("長い資料名".repeat(50) + ".pdf").length < 100);
  assert.equal(downloadFile(href.replace("github.com", "github.com.evil.example")), null);
  assert.equal(downloadFile(href.replace(".pdf", ".zip")), null);
});
