// Only this site's public measurement ID belongs in browser code.
export const measurementId = "G-29GF94JX5Y";
export const downloadEvent = "archive_download";
export const optOutKey = "takochan.analytics.optout";

// A short, stable file identifier avoids GA's parameter length limits.
// Build/export validation rejects collisions; this is not a security hash.
export function fileKey(name) {
  let value = 14695981039346656037n;
  for (const char of new TextEncoder().encode(name)) {
    value = BigInt.asUintN(64, (value ^ BigInt(char)) * 1099511628211n);
  }
  return `dl_${value.toString(16).padStart(16, "0")}`;
}

export function downloadFile(href) {
  try {
    const url = new URL(href);
    if (url.origin !== "https://github.com" ||
        !url.pathname.startsWith("/takochanchan/takochanchan.github.io/releases/download/")) return null;
    const name = decodeURIComponent(url.pathname.split("/").at(-1));
    const format = name.match(/\.(pdf|epub)$/i)?.[1].toLowerCase();
    return format ? { name, format, key: fileKey(name), url: url.origin + url.pathname } : null;
  } catch { return null; }
}

export function initAnalytics(w, d) {
  if (w.__takochanAnalyticsInitialized) return;
  w.__takochanAnalyticsInitialized = true;
  const nav = w.navigator;
  const automated = nav.webdriver === true ||
    /bot\b|crawler|spider|headlesschrome|python-requests|curl\/|wget\/|chatgpt-user|claude-user|perplexity-user|google-extended|facebookexternalhit/i.test(nav.userAgent || "");
  const privacySignal = nav.globalPrivacyControl === true ||
    nav.doNotTrack === "1" || w.doNotTrack === "1";
  let optedOut = false;
  try { optedOut = w.localStorage.getItem(optOutKey) === "1"; } catch { /* storage can be unavailable */ }
  let enabled = false;
  const preference = d.querySelector("[data-analytics-preference]");
  const status = d.querySelector("[data-analytics-status]");
  function showPreference() {
    if (preference) {
      preference.hidden = false;
      preference.disabled = privacySignal || automated;
      preference.textContent = optedOut ? "アクセス解析を有効にする" : "アクセス解析を停止する";
    }
    if (status) status.textContent = privacySignal
      ? "ブラウザのプライバシー設定に従い、アクセス解析を停止しています。"
      : automated ? "この環境ではアクセス解析を行いません。"
      : optedOut ? "このブラウザではアクセス解析を停止しています。" : "このブラウザではアクセス解析が有効です。";
  }
  showPreference();
  preference?.addEventListener("click", () => {
    optedOut = !optedOut;
    w[`ga-disable-${measurementId}`] = optedOut;
    enabled = !optedOut && !privacySignal && !automated;
    try { w.localStorage.setItem(optOutKey, optedOut ? "1" : "0"); } catch { /* current-page choice still applies */ }
    showPreference();
    if (!optedOut) w.location.reload();
  });
  if (automated || privacySignal || optedOut ||
      w.location.hostname !== "takochanchan.github.io") return;
  enabled = true;
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };
  w.gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
  });
  w.gtag("js", new Date());
  let referrer = "";
  try { referrer = new URL(d.referrer).origin; } catch { /* direct visit */ }
  w.gtag("config", measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: w.location.origin + w.location.pathname,
    page_referrer: referrer,
    cookie_flags: "SameSite=Lax;Secure",
  });
  w.gtag("event", "page_view", { send_to: measurementId });
  const script = d.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  d.head.appendChild(script);
  const recent = new Map();
  function record(event) {
    if (!enabled || event.isTrusted !== true ||
        (event.type === "auxclick" && event.button !== 1)) return;
    const link = event.target?.closest?.("a[download]");
    const file = link && downloadFile(link.href);
    if (!file) return;
    const now = Date.now();
    if (recent.has(file.key) && now - recent.get(file.key) < 1500) return;
    recent.set(file.key, now);
    w.gtag("event", downloadEvent, {
      send_to: measurementId,
      link_id: file.key,
      file_extension: file.format,
      file_name: file.name.slice(0, 100),
      link_url: file.url,
      transport_type: "beacon",
    });
    // Do not delay or cancel the download when analytics is unavailable.
  }
  d.addEventListener("click", record, { capture: true });
  d.addEventListener("auxclick", record, { capture: true });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  initAnalytics(window, document);
}
