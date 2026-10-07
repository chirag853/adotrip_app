// Live Holiday Packages API — https://www.adotrip.com/api/v1/packages
// Example: GET /api/v1/packages?per_page=10&search=kerala
// NOTE: Never hardcode Cookie (XSRF-TOKEN / adotrip_session) — it expires.
// This API returns JSON without cookies, so a plain fetch is enough.

const DEFAULT_BASE_URL = 'https://www.adotrip.com/api/v1/packages';
const SUBTHEMES_URL = 'https://www.adotrip.com/api/v1/subthemes';
const SITE_URL = 'https://www.adotrip.com';

// Set the base URL via .env:
// EXPO_PUBLIC_PACKAGES_API_URL=<custom base>
// Proxy (Cloudflare Worker — proxy/packages-proxy.worker.js — with a valid cert):
// EXPO_PUBLIC_PACKAGES_PROXY_URL=https://<worker>.workers.dev
// For local emulator dev without cloud deploy: run `npm run proxy` and set
// EXPO_PUBLIC_PACKAGES_PROXY_URL=http://10.0.2.2:8787 (emulator -> host localhost).
function resolveBaseUrl() {
  const v = process.env.EXPO_PUBLIC_PACKAGES_API_URL;
  return String(v || DEFAULT_BASE_URL).trim().replace(/\/+$/, '');
}

function resolveProxyUrl() {
  const v = process.env.EXPO_PUBLIC_PACKAGES_PROXY_URL;
  const s = String(v || '').trim().replace(/\/+$/, '');
  return s || null;
}

// All proxies to try in order: configured .env proxy first, then local dev
// proxy candidates (no cloud deploy needed for emulator/web dev).
function resolveProxyCandidates() {
  const out = [];
  const envProxy = resolveProxyUrl();
  if (envProxy) out.push(envProxy);
  if (typeof __DEV__ === 'undefined' || __DEV__) {
    // Android emulator maps 10.0.2.2 -> host localhost; web/iOS use localhost.
    for (const c of ['http://10.0.2.2:8787', 'http://localhost:8787']) {
      if (!out.includes(c)) out.push(c);
    }
  }
  return out;
}

function toAbsoluteUrl(u) {
  if (!u) return undefined;
  const s = String(u).trim();
  if (!s) return undefined;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('//')) return `https:${s}`;
  if (s.startsWith('/')) return `${SITE_URL}${s}`;
  return `${SITE_URL}/${s}`;
}

function pickFirst(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return undefined;
}

function toNumber(v, fallback = 0) {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v);
  if (typeof v === 'string') {
    const n = Number(v.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(n) && n > 0) return Math.round(n);
  }
  return fallback;
}

// A single item from the API -> same shape as the app's package cards
// (compatible with HolidayDetailScreen)
// Real shape (verified Oct 2026):
// { data: { packages: [{ id, package_name, slug, final_price, duration,
//   banner_image_url, package_url }], pagination: {...} } }
// fallbackLocation: used when the API item has no location field (e.g. search "kerala" -> "Kerala")
export function normalizePackage(raw, idx = 0, fallbackLocation = 'India') {
  const r = raw || {};
  const id = String(pickFirst(r, ['id', 'package_id', 'slug', 'uuid']) ?? `api-${idx}`);

  const title = String(
    pickFirst(r, ['title', 'name', 'package_name', 'heading', 'slug']) ?? 'Tour Package'
  ).replace(/-/g, ' ');

  const location = String(
    pickFirst(r, [
      'location',
      'destination',
      'destination_name',
      'city',
      'cities',
      'places',
      'route',
      'sector',
    ]) ?? pickFirst(r?.destination || {}, ['name', 'title']) ?? ''
  ).trim();

  // API (adotrip) does not send a location field — derive one so cards
  // don't all show "India": prefer explicit field, else try to pull the
  // destination out of "Switzerland Tour Packages for Family" style titles,
  // else fall back to the search text.
  function locationFromTitle(t) {
    const s = String(t || '').trim();
    if (!s) return '';
    // "Switzerland Tour Packages for Family" -> "Switzerland"
    // "Kerala 4N Tour Package" -> "Kerala"
    let m = s.match(/^([A-Za-z ]+?)\s+(Tour|Holiday|Honeymoon|Family|Packages?|Trip)/i);
    if (m && m[1] && m[1].trim().length >= 3) return m[1].trim();
    const first = s.split(/[-–—|,]/)[0].trim().split(/\s+/).slice(0, 2).join(' ');
    return first.length >= 3 ? first : '';
  }

  const price = toNumber(
    pickFirst(r, ['offer_price', 'sale_price', 'price', 'starting_price', 'starting_from', 'amount', 'final_price']),
    0
  );
  const oldPrice =
    toNumber(pickFirst(r, ['mrp', 'actual_price', 'old_price', 'regular_price', 'was_price']), 0) ||
    Math.round(price * 1.25) ||
    0;

  // Images ALWAYS come from banner_image_url (user requirement).
  // API sends: banner_image_url = "https://www.adotrip.com/packages/<file>"
  // and banner_image = "<file>" (filename only). No `image`/`thumbnail` fields.
  const bannerFile = pickFirst(r, ['banner_image', 'banner']) ?? undefined;
  const imageRaw = pickFirst(r, ['banner_image_url', 'banner_image', 'image', 'thumbnail', 'banner', 'cover', 'img', 'photo', 'image_url', 'thumb']) ??
    r?.images?.[0] ?? (Array.isArray(r?.gallery) ? r.gallery[0] : undefined) ??
    (typeof r?.images === 'string' ? r.images : undefined);
  let image = toAbsoluteUrl(typeof imageRaw === 'object' ? imageRaw?.url ?? imageRaw?.src : imageRaw);
  if (!image && bannerFile) {
    // filename only ("1780651809_x.webp") -> full adotrip packages URL
    const f = String(bannerFile).trim().replace(/^\/+/, '');
    if (f) image = f.startsWith('http') ? f : `${SITE_URL}/packages/${f}`;
  }

  // Adotrip sends duration as a nights count (e.g. 4 -> "4N/5D")
  const durRaw = pickFirst(r, ['duration', 'days', 'nights_days', 'day_night', 'total_days', 'no_of_days']);
  const days = typeof durRaw === 'number' && Number.isFinite(durRaw) && durRaw > 0
    ? `${durRaw}N/${durRaw + 1}D`
    : String(durRaw ?? '');
  let tag = String(pickFirst(r, ['tag', 'category', 'type', 'badge', 'label']) ?? '');
  if (!tag) {
    // Derive a useful tag from the title when API sends none
    const tl = `${title} ${id}`.toLowerCase();
    if (/honeymoon|couple/.test(tl)) tag = 'Honeymoon';
    else if (/switzer|dubai|thailand|bali|singapore|europe|malaysia|international/.test(tl)) tag = 'International';
    else if (/beach|andaman|goa|maldives/.test(tl)) tag = 'Beach';
    else if (/hill|kashmir|manali|shimla/.test(tl)) tag = 'Hill Station';
    else if (/family/.test(tl)) tag = 'Family';
    else tag = 'Bestseller';
  }
  const rating = Number(pickFirst(r, ['rating', 'avg_rating', 'stars'])) || 4.5;
  const reviews = toNumber(pickFirst(r, ['reviews', 'reviews_count', 'total_reviews']), 0) || 100;

  const desc = String(
    pickFirst(r, ['short_desc', 'short_description', 'description', 'overview', 'summary', 'excerpt']) ?? ''
  );

  const finalLocation = location || locationFromTitle(title) || fallbackLocation;

  return {
    id,
    slug: String(r?.slug ?? r?.package_slug ?? (typeof id === 'string' && id.includes('-') ? id : '') ?? '').trim() || undefined,
    package_url: String(r?.package_url ?? r?.url ?? '').trim() || undefined,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    location: finalLocation,
    price: price || 9999,
    oldPrice: oldPrice || Math.round((price || 9999) * 1.25),
    rating: Number.isFinite(rating) ? rating : 4.5,
    reviews,
    days: days || '4N/5D',
    tag,
    emoji: '🌴',
    color: '#0B6E4F',
    image,
    imageDirect: image, // original https URL (fails on Android due to broken chain)
    desc: desc || 'Flights, hotels, sightseeing, transfers & daily breakfast included. Full itinerary available in the app.',
    _raw: r,
  };
}

// banner_image_url is https://www.adotrip.com/... (broken cert -> Android
// Image fails too). Rewrite it via the working proxy: <proxy>?img=<encoded>.
// Only adotrip hosts are allowed (see proxy allowlist).
export function proxiedImageUrl(proxyBase, originalUrl) {
  if (!proxyBase || !originalUrl) return originalUrl;
  const s = String(originalUrl);
  if (!/adotrip\.com/i.test(s)) return originalUrl;
  const base = String(proxyBase).trim().replace(/\/+$/, '');
  return `${base}?img=${encodeURIComponent(s)}`;
}

function extractList(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.data)) return json.data.data; // Laravel paginator nested
  if (Array.isArray(json?.data?.packages)) return json.data.packages; // Adotrip: { data: { packages: [...] } }
  if (Array.isArray(json?.packages)) return json.packages;
  if (Array.isArray(json?.results)) return json.results;
  if (Array.isArray(json?.items)) return json.items;
  return [];
}

// Top filter chips: GET /api/v1/subthemes (NO Cookie needed — plain fetch
// returns 200; never hardcode XSRF-TOKEN/adotrip_session, it expires).
// Returns [{ id, name, slug, total_count, ... }]. Retries via proxy on SSL
// errors, same as packages. Falls back to [] so the screen keeps static chips.
export async function fetchSubthemes({ signal, timeoutMs = 20000 } = {}) {
  const params = new URLSearchParams({ subthemes: '1' });
  try {
    return await getSubthemes(SUBTHEMES_URL, signal, timeoutMs);
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
    if (e?.code === 'SSL_VERIFY_FAILED' || e?.code === 'OFFLINE' || e?.code === 'TIMEOUT') {
      const candidates = resolveProxyCandidates();
      let lastErr = e;
      for (const proxy of candidates) {
        try {
          return await getSubthemes(`${proxy}?${params.toString()}`, signal, timeoutMs);
        } catch (pe) {
          if (pe?.name === 'AbortError') throw pe;
          lastErr = pe;
        }
      }
      throw lastErr;
    }
    throw e;
  }
}

async function getSubthemes(url, signal, timeoutMs) {
  const ctrl = new AbortController();
  let timedOut = false;
  const onOuterAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener?.('abort', onOuterAbort, { once: true });
  }
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, timeoutMs);
  let res;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
    });
  } catch (e) {
    if (timedOut) {
      const t = new Error('Request timed out.');
      t.code = 'TIMEOUT';
      t.cause = String(e?.message || e);
      throw t;
    }
    throw toFriendlyError(e);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', onOuterAbort);
  }
  if (!res.ok) {
    const err = new Error(`Subthemes API failed (${res.status})`);
    err.code = 'HTTP';
    err.status = res.status;
    throw err;
  }
  const json = await res.json();
  const raw = json?.data?.subthemes ?? json?.data ?? [];
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((t) => ({
      id: String(t?.id ?? t?.slug ?? t?.name ?? ''),
      name: String(t?.name ?? '').trim(),
      slug: String(t?.slug ?? '').trim(),
      total_count: Number(t?.total_count ?? 0) || 0,
    }))
    .filter((t) => t.name);
}
// NOTE: Never add an SSL bypass (trust-all / rejectUnauthorized:false) here —
// Play Store policy + MITM risk. The cert chain must be fixed on the server (fullchain).
// If direct HTTPS fails with SSL_VERIFY_FAILED and a proxy is configured
// (EXPO_PUBLIC_PACKAGES_PROXY_URL), we retry via the proxy. When both fail,
// the Holidays screen falls back to bundled PACKAGES so the UI never goes blank.
export async function fetchPackages({ search = '', perPage = 10, signal, timeoutMs = 20000 } = {}) {
  const q = String(search || '').trim();
  const base = resolveBaseUrl();
  const pp = Math.min(50, Math.max(1, parseInt(perPage, 10) || 10));
  const params = new URLSearchParams({ per_page: String(pp) });
  if (q) params.set('search', q);
  const url = `${base}?${params.toString()}`;

  const locFallback = q ? q.charAt(0).toUpperCase() + q.slice(1) : 'India';
  try {
    return await getJson(url, signal, timeoutMs, locFallback);
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
    // Direct host has a broken cert (SSL_VERIFY_FAILED) — retry via proxy
    // candidates. Env proxy first (cloud, works for production builds),
    // then local dev proxy (`npm run proxy`, no deploy needed).
    // When both fail, the Holidays screen falls back to bundled PACKAGES.
    if (e?.code === 'SSL_VERIFY_FAILED' || e?.code === 'OFFLINE' || e?.code === 'TIMEOUT') {
      const candidates = resolveProxyCandidates();
      let lastErr = e;
      for (const proxy of candidates) {
        const proxyUrl = `${proxy}?${params.toString()}`;
        try {
          const list = await getJson(proxyUrl, signal, timeoutMs, locFallback);
          // JSON came via proxy -> images must also go via proxy,
          // else Android Image fails on the same broken cert.
          return list.map((p) => ({ ...p, image: proxiedImageUrl(proxy, p.imageDirect || p.image) }));
        } catch (pe) {
          if (pe?.name === 'AbortError') throw pe;
          lastErr = pe;
          lastErr.cause = `${e.message} | proxy ${proxy}: ${pe.message}`;
          // Try next candidate (e.g. local proxy not running -> try next).
        }
      }
      throw lastErr;
    }
    throw e;
  }
}

async function getJson(url, signal, timeoutMs, locFallback = 'India') {

  // Caller AbortController (screen unmount) + own timeout — combine both
  const ctrl = new AbortController();
  let timedOut = false;
  const onOuterAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener?.('abort', onOuterAbort, { once: true });
  }
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
    });
  } catch (e) {
    if (timedOut) {
      const t = new Error('Request timed out. Check your internet connection and tap Retry.');
      t.code = 'TIMEOUT';
      t.cause = String(e?.message || e);
      throw t;
    }
    throw toFriendlyError(e);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', onOuterAbort);
  }
  if (!res.ok) {
    const err = new Error(
      res.status >= 500
        ? `Server busy (${res.status}). Showing popular packages — tap Retry to reload live deals.`
        : `Packages API failed (${res.status})`
    );
    err.code = res.status >= 500 ? 'SERVER' : 'HTTP';
    err.status = res.status;
    throw err;
  }
  let json;
  try {
    json = await res.json();
  } catch (e) {
    const err = new Error('Invalid server response. Tap Retry.');
    err.code = 'BAD_JSON';
    err.cause = String(e?.message || e);
    throw err;
  }
  const list = extractList(json);
  return list.map((x, i) => normalizePackage(x, i, locFallback));
}

// ---------- Package detail: GET /api/v1/packages/{slug} ----------
// Verified Oct 2026: 200 + { status, data: { id, package_name, slug,
// duration_text, price: { final_price }, banner_image_url, gallery[],
// description(html), highlights(html), itinerary[], itinerary_html,
// inclusions(html), exclusions(html), terms(html), cancellation_policy(html),
// themes[], state_name, similar_packages[] } }
// Proxy: <proxy>?detail=<slug> -> upstream /api/v1/packages/<slug>
function decodeEntities(s) {
  return String(s || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      try { return String.fromCharCode(parseInt(n, 10)); } catch { return ''; }
    });
}

export function stripHtml(html) {
  if (!html) return '';
  return decodeEntities(
    String(html)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|li|h\d|tr)>/gi, '\n')
      .replace(/<[^>]*>/g, '')
  )
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
    .trim();
}

export function extractListItems(html) {
  if (!html) return [];
  const s = String(html);
  const items = [];
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let m;
  while ((m = liRe.exec(s)) !== null) {
    const t = stripHtml(m[1]);
    if (t) items.push(t);
  }
  if (items.length) return items;
  // Terms-style: multiple <p>1. ...</p><p>2. ...</p>
  const pRe = /<(p|div)[^>]*>([\s\S]*?)<\/\1>/gi;
  const paras = [];
  while ((m = pRe.exec(s)) !== null) {
    const t = stripHtml(m[2]);
    if (t) paras.push(t);
  }
  return paras;
}

// itinerary_html: <b>Day 1: Title</b> + <ul><li>..</li></ul> blocks.
// Returns [{ day, title, points[] }]. Falls back to structured itinerary[].
export function parseItineraryHtml(html, structured = []) {
  const out = [];
  const s = String(html || '');
  if (s) {
    // Split on Day headings: <b>Day 1: Arrival...</b>
    const headRe = /<b[^>]*>\s*(Day\s*\d+\s*:?[^<]*)<\/b>/gi;
    const heads = [];
    let m;
    while ((m = headRe.exec(s)) !== null) {
      heads.push({ title: stripHtml(m[1]), index: m.index });
    }
    if (heads.length) {
      for (let i = 0; i < heads.length; i++) {
        const chunk = s.slice(heads[i].index, i + 1 < heads.length ? heads[i + 1].index : s.length);
        const pts = extractListItems(chunk);
        const num = (heads[i].title.match(/Day\s*(\d+)/i) || [])[1];
        out.push({
          day: num ? parseInt(num, 10) : i + 1,
          title: heads[i].title.replace(/^Day\s*\d+\s*:?\s*/i, '').trim() || heads[i].title,
          points: pts,
        });
      }
      if (out.length) return out;
    }
    // No Day headings — treat each <ul> as a day
    const ulRe = /<ul[^>]*>([\s\S]*?)<\/ul>/gi;
    let di = 0;
    while ((m = ulRe.exec(s)) !== null) {
      const pts = extractListItems(m[0]);
      if (pts.length) {
        di += 1;
        out.push({ day: di, title: `Day ${di}`, points: pts });
      }
    }
    if (out.length) return out;
  }
  // Structured fallback: [{ day, program_title, program_des }]
  if (Array.isArray(structured)) {
    return structured.map((it, i) => ({
      day: Number(it?.day) || i + 1,
      title: String(it?.program_title ?? '').trim() || `Day ${Number(it?.day) || i + 1}`,
      points: String(it?.program_des ?? '')
        .split(/(?<=[.])\s+|\n+/)
        .map((x) => x.trim())
        .filter((x) => x.length > 3)
        .slice(0, 8),
    }));
  }
  return out;
}

export function normalizeDetail(raw) {
  const d = raw?.data ?? raw ?? {};
  const slug = String(d?.slug ?? '').trim();
  const gallery = Array.isArray(d?.gallery) ? d.gallery : [];
  const images = gallery
    .map((g) => toAbsoluteUrl(typeof g === 'string' ? g : g?.url))
    .filter(Boolean);
  if (!images.length && d?.banner_image_url) {
    const b = toAbsoluteUrl(d.banner_image_url);
    if (b) images.push(b);
  }
  const price = toNumber(d?.price?.final_price ?? d?.final_price ?? d?.price, 0) || 6050;
  const similarRaw = Array.isArray(d?.similar_packages) ? d.similar_packages : [];
  return {
    id: String(d?.id ?? slug ?? ''),
    slug,
    title: String(d?.package_name ?? d?.title ?? 'Tour Package'),
    durationText: String(d?.duration_text ?? '').trim()
      || `${d?.duration_nights ?? 2} Nights / ${d?.duration_days ?? 3} Days`,
    nights: Number(d?.duration_nights) || 0,
    daysCount: Number(d?.duration_days) || 0,
    price,
    oldPrice: Math.round(price * 1.2),
    state: String(d?.state_name ?? '').trim(),
    isDomestic: d?.is_domestic !== false,
    images,
    description: stripHtml(d?.description),
    highlights: extractListItems(d?.highlights),
    itinerary: parseItineraryHtml(d?.itinerary_html, d?.itinerary),
    inclusions: extractListItems(d?.inclusions),
    exclusions: extractListItems(d?.exclusions),
    inclusionChecks: Array.isArray(d?.inclusions_checks) ? d.inclusions_checks.map(String) : [],
    terms: extractListItems(d?.terms),
    cancellation: extractListItems(d?.cancellation_policy),
    themes: Array.isArray(d?.themes) ? d.themes.map((t) => String(t?.name ?? t ?? '')).filter(Boolean) : [],
    pageUrl: String(d?.page_url ?? '').trim() || undefined,
    similar: similarRaw.map((x, i) => normalizePackage(x, i)),
    _raw: d,
  };
}

export async function fetchPackageDetail({ slug = '', signal, timeoutMs = 20000 } = {}) {
  const s = String(slug || '').trim().replace(/^\/+|\/+$/g, '');
  if (!s) {
    const err = new Error('Package not found.');
    err.code = 'BAD_SLUG';
    throw err;
  }
  const base = resolveBaseUrl();
  const url = `${base}/${encodeURIComponent(s)}`;
  try {
    return await getDetailJson(url, signal, timeoutMs);
  } catch (e) {
    if (e?.name === 'AbortError') throw e;
    if (e?.code === 'SSL_VERIFY_FAILED' || e?.code === 'OFFLINE' || e?.code === 'TIMEOUT') {
      const candidates = resolveProxyCandidates();
      let lastErr = e;
      for (const proxy of candidates) {
        try {
          const detail = await getDetailJson(
            `${proxy}?detail=${encodeURIComponent(s)}`, signal, timeoutMs
          );
          const proxyBase = String(proxy).trim().replace(/\/+$/, '');
          return {
            ...detail,
            images: detail.images.map((u) => proxiedImageUrl(proxyBase, u)),
            similar: detail.similar.map((p) => ({
              ...p,
              image: proxiedImageUrl(proxyBase, p.imageDirect || p.image),
            })),
          };
        } catch (pe) {
          if (pe?.name === 'AbortError') throw pe;
          lastErr = pe;
          lastErr.cause = `${e.message} | proxy ${proxy}: ${pe.message}`;
        }
      }
      throw lastErr;
    }
    throw e;
  }
}

async function getDetailJson(url, signal, timeoutMs) {
  const ctrl = new AbortController();
  let timedOut = false;
  const onOuterAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener?.('abort', onOuterAbort, { once: true });
  }
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, timeoutMs);
  let res;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
    });
  } catch (e) {
    if (timedOut) {
      const t = new Error('Request timed out. Check your internet connection and tap Retry.');
      t.code = 'TIMEOUT';
      t.cause = String(e?.message || e);
      throw t;
    }
    throw toFriendlyError(e);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', onOuterAbort);
  }
  if (!res.ok) {
    const err = new Error(
      res.status === 404 ? 'Package not found.' : `Package detail failed (${res.status})`
    );
    err.code = res.status === 404 ? 'NOT_FOUND' : 'HTTP';
    err.status = res.status;
    throw err;
  }
  let json;
  try {
    json = await res.json();
  } catch (e) {
    const err = new Error('Invalid server response. Tap Retry.');
    err.code = 'BAD_JSON';
    err.cause = String(e?.message || e);
    throw err;
  }
  const data = json?.data ?? json;
  if (!data || (typeof data === 'object' && !data.package_name && !data.slug && !data.id)) {
    const err = new Error('Package not found.');
    err.code = 'NOT_FOUND';
    throw err;
  }
  return normalizeDetail(json);
}

// Convert a raw native error (Android: javax.net.ssl.SSLHandshakeException /
// CertPathValidatorException) into a user-understandable message.
// The original message is kept in `cause`. `code` survives so the screen
// can decide between offline banner vs SSL banner vs generic error.
function toFriendlyError(e) {
  const raw = String(e?.message || e || '');
  // In Node the real TLS cause sits in `cause` ("unable to verify the first certificate"),
  // on Android/Hermes it is directly in the message (javax.net.ssl.SSLHandshakeException...).
  const causeRaw = String(e?.cause?.message || e?.cause || '');
  const combined = `${raw} ${causeRaw}`;
  if (e?.name === 'AbortError' || /aborted/i.test(combined)) return e;
  if (/ssl|cert|handshak|trust anchor|unable to verify/i.test(combined)) {
    const err = new Error(
      "Couldn't load packages. Check your internet connection and tap Retry."
    );
    err.cause = raw || causeRaw;
    err.code = 'SSL_VERIFY_FAILED';
    return err;
  }
  if (/network request failed|failed to fetch|fetch failed|networkerror|load failed|offline|enotfound|econn|etimedout|socket/i.test(combined)) {
    const err = new Error(
      "No internet connection. Check your connection and tap Retry."
    );
    err.cause = raw || causeRaw;
    err.code = 'OFFLINE';
    return err;
  }
  if (/timeout/i.test(combined)) {
    const err = new Error(
      'Request timed out. Check your internet connection and tap Retry.'
    );
    err.cause = raw || causeRaw;
    err.code = 'TIMEOUT';
    return err;
  }
  const err = new Error(raw || 'Could not load packages from the API');
  err.cause = causeRaw || undefined;
  err.code = 'UNKNOWN';
  return err;
}
