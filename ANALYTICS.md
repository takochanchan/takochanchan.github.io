# takochan access and download measurement

GA4 measurement ID: `G-29GF94JX5Y` (public, dedicated to this site).
The Google login, numeric property ID and service account credentials are never
included in browser assets or the public statistics snapshot.

## Collection

- `src/analytics.mjs` loads on canonical catalogue, bibliography and policy pages.
- `archive_download` records a trusted browser click on a PDF/EPUB save link.
  This measures a request, not successful transfer or an individual person.
- PDF reader buttons, GitHub direct requests, crawler downloads, builds and search
  indexing do not emit this event. Rapid repeats of one file within 1.5 seconds
  are suppressed. Ordinary later repeat downloads remain separate operations.
- The stable `link_id` is derived from the filename. Export validates uniqueness
  and maps it to the canonical work, volume and format. Standard `linkId` and
  `eventCount` API fields are used; no custom dimension registration is needed.
- GA enhanced measurement may also emit `file_download` for PDF. Public reports
  filter only `archive_download`; never add the two events together. EPUB is
  supported explicitly because GA's default extension list omits it.
- GA excludes known bots. The client also skips declared bots, WebDriver,
  synthetic clicks, DNT/GPC and opt-out browsers. This is not Turnstile or a
  guarantee of human-only traffic; sophisticated automated browsers can pass.
- Advertising storage/personalization are denied; Google Signals are disabled.
  Page URLs omit query/fragment and the configured referrer is origin-only.
  Review GA enhanced measurement settings if additional event collection is
  unwanted. No identity or email is supplied by this integration.
- Users can disable collection at `/about/#analytics`. Downloads remain usable
  with JavaScript/analytics blocked or disabled. Browsers may block GA requests.

## Activate automatic public statistics

The provided measurement ID enables sending events, not reading reports.
Until the following setup is complete, `/stats/` shows an unpublished-data state;
it does not represent unavailable data as zero downloads.

1. In Google Cloud, enable Google Analytics Data API and create a dedicated
   service account. Give that account only Viewer access to the takochan GA4
   property. Do not grant GA access to the public or unrelated users.
2. Set repository Actions variable `GA4_PROPERTY_ID` to the numeric property ID
   (not the `G-` measurement ID). The GA property timezone must be Asia/Tokyo.
3. Save the service account JSON key in repository Actions secret
   `GA4_SERVICE_ACCOUNT_JSON`. Never commit, paste into website code, or log it.
   A future keyless Workload Identity configuration can replace this credential.
4. Set repository Actions variable `GA4_STATS_ENABLED` to `true`, then run
   `Update public download statistics`. It subsequently runs daily at 05:17 JST.
5. Confirm `archive_download` in GA Realtime using an ordinary browser (not
   WebDriver). Allow normal GA processing before expecting the public report.

The exporter queries daily file counts from 2026-10-14 through yesterday,
paginated and filtered to the dedicated event and site hostname. It rejects
thresholded/sampled/incomplete/unmapped results and retains the previous report
on errors. Dates and counts can be revised by GA processing.

Only daily aggregate file counts and public catalogue metadata are exported to
`analytics-data/downloads.json`. No IP, client ID, session ID, exact event time,
Google account, property ID or credentials are exported. The normal Pages build
publishes JSON and CSV; existing build, test and search gates remain in force.
The schedule performs a SHA-checked update of that one file and explicitly starts
the existing Pages workflow. It never force-pushes or edits publication assets.

## Verification

Run `node --test tests/analytics.test.mjs tests/analytics-report.test.mjs` and
the normal `npm run build`, `npm test`, `npm run verify:remote-search` gates.
Check deployed `/analytics.mjs`, the shared HTML script reference, `/stats/`
and `/about/#analytics`. Actual GA receipt requires authorized access to GA;
a successful Pages deployment alone does not prove receipt.
