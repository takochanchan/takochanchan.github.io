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
   `takochan-stats` service account. Give it only Viewer access to the takochan
   GA4 property. The GA property timezone must be Asia/Tokyo.
2. Use Workload Identity Federation through that service account. Do not weaken
   an organization policy to create a JSON key. The workflow now uses short-lived
   OAuth access tokens, with only the `analytics.readonly` scope.
3. In Google Cloud Shell, run the reviewed `scripts/setup-analytics-wif.py` with
   `--project YOUR_PROJECT_ID --property-id YOUR_NUMERIC_GA4_ID`. The operator
   must be allowed to enable APIs, configure federation, and change this service
   account's IAM policy. The script does not create keys, change organization
   policies, or grant project-wide roles.
4. Register the four repository Actions Variables printed by that script:
   `GA4_PROPERTY_ID`, `GA4_SERVICE_ACCOUNT_EMAIL`, `GA4_WIF_PROVIDER`, and
   finally `GA4_STATS_ENABLED=true`. No service account JSON secret is needed.
5. Allow up to five minutes for Google IAM changes to propagate, then run
   `Update public download statistics` on `main`. It subsequently runs daily
   at 05:17 JST. Even on the first day, it checks actual report access and the
   property timezone, while retaining the pending public report until a completed
   reporting day exists.
6. Confirm `archive_download` in GA Realtime using an ordinary browser.
   Allow normal GA processing before expecting the public report.

The dedicated provider restricts federation to GitHub repository ID
`1310601565`, owner ID `308618393`, branch `refs/heads/main`, the exact
`analytics-stats.yml` workflow, and only `schedule` or `workflow_dispatch`
events. Forks, pull requests, other workflows, and other branches are excluded.
The service-account binding uses only `roles/iam.workloadIdentityUser`, on
that service account only. Existing provider settings that differ are rejected
rather than silently broadened. The setup script can resume compatible setup.

The exporter queries daily file counts from 2026-10-14 through yesterday,
paginated and filtered to the dedicated event and site hostname. It rejects
thresholded/sampled/incomplete/unmapped results and retains the previous report
on errors. Dates and counts can be revised by GA processing.

Only daily aggregate file counts and public catalogue metadata are exported to
`analytics-data/downloads.json`. No IP, client ID, session ID, exact event time,
Google account, property ID or credentials are exported. The normal Pages build
publishes JSON for the statistics display; CSV export is not provided.
Existing build, test and search gates remain in force.
The schedule performs a SHA-checked update of that one file and explicitly starts
the existing Pages workflow. It never force-pushes or edits publication assets.

## Verification

Run `node --test tests/analytics.test.mjs tests/analytics-report.test.mjs` and
the normal `npm run build`, `npm test`, `npm run verify:remote-search` gates.
Check deployed `/analytics.mjs`, the shared HTML script reference, `/stats/`
and `/about/#analytics`. Actual GA receipt requires authorized access to GA;
a successful Pages deployment alone does not prove receipt.
