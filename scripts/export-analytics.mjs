import { createSign } from "node:crypto";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { cataloguePublications } from "../src/catalogue-publications.mjs";
import { catalogueFiles, reportRecords, startDate } from "./analytics-report.mjs";

const propertyId = process.env.GA4_PROPERTY_ID;
if (!/^\d+$/.test(propertyId || "")) throw new Error("GA4_PROPERTY_ID must be the numeric property ID");
if (!process.env.GA4_SERVICE_ACCOUNT_JSON) throw new Error("GA4_SERVICE_ACCOUNT_JSON is not configured");
const credentials = JSON.parse(process.env.GA4_SERVICE_ACCOUNT_JSON);
if (credentials.type !== "service_account" || !credentials.client_email || !credentials.private_key) {
  throw new Error("Invalid service account configuration");
}
const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const signingInput = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({
  iss: credentials.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly",
  aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
})}`;
const signature = createSign("RSA-SHA256").update(signingInput).sign(credentials.private_key, "base64url");
const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST", signal: AbortSignal.timeout(30000),
  body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${signingInput}.${signature}` }),
});
if (!tokenResponse.ok) throw new Error(`Google authentication failed (${tokenResponse.status})`);
const { access_token: accessToken } = await tokenResponse.json();
if (!accessToken) throw new Error("Google did not return an access token");
const filePath = new URL("../analytics-data/downloads.json", import.meta.url);
let previous = { files: [] };
try { previous = JSON.parse(await readFile(filePath, "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; }
const files = new Map((previous.files || []).map(file => [file.key, file]));
for (const file of catalogueFiles(cataloguePublications)) files.set(file.key, file);
const allFiles = [...files.values()];
// Exclude today; GA4 can subsequently revise the most recent completed days.
const todayJst = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const endDate = new Date(Date.parse(`${todayJst}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
if (endDate < startDate) {
  console.log("No completed reporting day yet; keep the pending report.");
  process.exit(0);
}
const pages = [];
let offset = 0;
let totalRows;
do {
  const result = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: "POST", signal: AbortSignal.timeout(60000),
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }, { name: "linkId" }], metrics: [{ name: "eventCount" }],
      dimensionFilter: { andGroup: { expressions: [
        { filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "archive_download" } } },
        { filter: { fieldName: "hostName", stringFilter: { matchType: "EXACT", value: "takochanchan.github.io" } } },
      ] } },
      orderBys: [{ dimension: { dimensionName: "date" } }, { dimension: { dimensionName: "linkId" } }],
      offset: String(offset), limit: "100000",
    }),
  });
  if (!result.ok) throw new Error(`GA4 Data API failed (${result.status}); keep the previous public report`);
  const page = await result.json();
  const rowCount = Number(page.rowCount || 0);
  if (!Number.isSafeInteger(rowCount) || rowCount < 0 || (totalRows !== undefined && rowCount !== totalRows)) {
    throw new Error("GA4 report changed during pagination; keep the previous public report");
  }
  totalRows = rowCount;
  if (page.metadata?.timeZone && page.metadata.timeZone !== "Asia/Tokyo") throw new Error("GA4 reporting timezone must be Asia/Tokyo");
  if (page.dimensionHeaders?.map(header => header.name).join(",") !== "date,linkId" ||
      page.metricHeaders?.map(header => header.name).join(",") !== "eventCount") throw new Error("Unexpected GA4 report schema");
  pages.push(page);
  const received = page.rows?.length || 0;
  offset += received;
  if (received === 0 && offset < totalRows) throw new Error("Incomplete GA4 pagination");
} while (offset < totalRows);
if (offset !== totalRows) throw new Error("GA4 report row count mismatch");
const records = reportRecords(pages, allFiles);
if (records.some(row => row.date < startDate || row.date > endDate)) throw new Error("GA4 row outside requested date range");
const report = {
  version: 1, status: "ready", source: "GA4 archive_download", startDate, endDate,
  updatedAt: new Date().toISOString(), timezone: "Asia/Tokyo",
  metric: "site_download_requests", botFiltering: "known-bots-and-client-signals; not guaranteed human-only",
  files: allFiles, records,
};
await mkdir(new URL("../analytics-data/", import.meta.url), { recursive: true });
await writeFile(filePath, JSON.stringify(report, null, 2) + "\n");
console.log(`Prepared public download aggregates: ${records.length} daily file rows.`);
