// Destination details for the Circuit Planner accordion.
// Upstream: https://www.adotrip.com/api/v1/destinations?city=delhi,agra
//
// The app goes through our proxy (same one used by packages/HPTDC/geocoding)
// because www.adotrip.com serves an incomplete TLS chain that Android rejects.
// The proxy also keeps the API base URL in one place.

const DEST_IMAGE_BASE = 'https://www.adotrip.com/public/destinations-images/';
const ATTRACTION_IMAGE_BASE = 'https://www.adotrip.com/';

function resolveProxyCandidates() {
  const out = [];
  const envProxy = String(process.env.EXPO_PUBLIC_PACKAGES_PROXY_URL || '')
    .trim()
    .replace(/\/+$/, '');
  if (envProxy) out.push(envProxy);
  if (typeof __DEV__ === 'undefined' || __DEV__) {
    for (const c of ['http://10.0.2.2:8787', 'http://localhost:8787']) {
      if (!out.includes(c)) out.push(c);
    }
  }
  return out;
}

function abortError() {
  const e = new Error('Aborted');
  e.name = 'AbortError';
  return e;
}

async function fetchWithTimeout(url, signal, timeoutMs) {
  const ctrl = new AbortController();
  let timedOut = false;
  const onAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener?.('abort', onAbort, { once: true });
  }
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: ctrl.signal,
    });
  } catch (e) {
    if (timedOut) throw new Error('Destination details timed out. Please try again.');
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', onAbort);
  }
}

function errorFromBody(raw, status) {
  try {
    const json = JSON.parse(raw);
    if (typeof json?.error === 'string' && json.error.trim()) return json.error.trim();
    if (typeof json?.message === 'string' && json.message.trim()) return json.message.trim();
  } catch {}
  return `Destination details failed (${status}).`;
}

const ENTITIES = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '…',
};

// Area descriptions and "how to reach" text arrive as HTML. Avoid adding an
// HTML renderer just for an accordion preview: turn it into clean text.
function stripHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/li>/gi, ' ')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&[a-zA-Z#0-9]+;/g, (m) => ENTITIES[m.toLowerCase()] || m)
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value, max) {
  const s = String(value || '').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

function destinationImage(file) {
  if (!file) return '';
  const s = String(file).trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `${DEST_IMAGE_BASE}${encodeURIComponent(s.replace(/^\/+/, ''))}`;
}

function adotripImage(file) {
  if (!file) return '';
  const s = String(file).trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('//')) return `https:${s}`;
  return `${ATTRACTION_IMAGE_BASE}${s
    .replace(/^\/+/, '')
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}

function parseGallery(raw) {
  if (!raw) return [];
  let list = raw;
  if (typeof raw === 'string') {
    try {
      list = JSON.parse(raw);
    } catch {
      list = [];
    }
  }
  if (!Array.isArray(list)) return [];
  return list.map(destinationImage).filter(Boolean);
}

function normalizeAttraction(item, index) {
  const duration = String(item?.duration || '').trim();
  const distance = String(item?.distance || '').trim();
  return {
    id: String(item?.id ?? `${item?.slug_id || 'attraction'}-${index}`),
    title: String(item?.title || 'Attraction').trim(),
    description: truncate(stripHtml(item?.description), 240),
    image: adotripImage(item?.image),
    meta: [duration, distance].filter(Boolean).join(' • '),
  };
}

function normalizeReach(item, index) {
  return {
    id: String(item?.id ?? `${item?.slug_id || 'reach'}-${index}`),
    title: String(item?.title || 'How to reach').trim(),
    description: truncate(stripHtml(item?.description), 320),
    highlights: [item?.highlight_1, item?.highlight_2, item?.highlight_3]
      .map((v) => stripHtml(v))
      .filter(Boolean),
    image: adotripImage(item?.image),
  };
}

function normalizeDestination(item, attractions, reach) {
  const gallery = parseGallery(item?.area_gallary);
  const image = destinationImage(item?.area_master_image) || gallery[0] || '';
  const days = Number(item?.days) || 0;
  const views = Number(item?.view) || 0;
  return {
    id: String(item?.area_id ?? item?.id ?? item?.url_title ?? item?.area ?? ''),
    name: String(item?.area || 'Destination').trim(),
    city: String(item?.city || '').trim(),
    state: String(item?.state || '').trim(),
    country: String(item?.country || '').trim(),
    urlTitle: String(item?.url_title || '').trim(),
    description: truncate(stripHtml(item?.area_desc || item?.meta_desc), 760),
    image,
    gallery,
    days,
    views,
    trending: Number(item?.is_trending) === 1 || Number(item?.trending_point) > 0,
    attractions,
    reach,
  };
}

/**
 * Fetch destination + attraction + reach details for the selected cities.
 * Cities are sent exactly like the Adotrip API expects: `delhi,agra`.
 *
 * @param {string[]|string} stops destination names / route stops
 * @param {{ signal?: AbortSignal, timeoutMs?: number }} options
 * @returns {Promise<{ cities: string[], groups: Array, total: number }>}
 */
export async function fetchDestinationDetails(stops, { signal, timeoutMs = 35000 } = {}) {
  const cities = [];
  const seen = new Set();
  for (const raw of Array.isArray(stops) ? stops : [stops]) {
    for (const part of String(raw || '').split(',')) {
      const city = part.trim().replace(/\s+/g, ' ');
      if (!city) continue;
      const key = city.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cities.push(key);
    }
  }
  if (!cities.length) throw new Error('Add at least one destination.');

  const cityParam = cities.join(',');
  const candidates = resolveProxyCandidates();
  if (!candidates.length) {
    throw new Error(
      'Destination details are not configured. Set EXPO_PUBLIC_PACKAGES_PROXY_URL and restart the app.'
    );
  }

  let lastError = null;
  for (const base of candidates) {
    const url = `${base}/api/destinations?city=${encodeURIComponent(cityParam)}`;
    let res;
    try {
      res = await fetchWithTimeout(url, signal, timeoutMs);
    } catch (e) {
      if (e?.name === 'AbortError') throw abortError();
      lastError = e;
      continue;
    }

    const raw = await res.text();
    let json = null;
    try {
      json = JSON.parse(raw);
    } catch {}

    if (!res.ok) {
      // The upstream API uses 404 + { status:false, message } when a city has
      // no destination records. That is an empty result, not a broken proxy.
      if (json?.status === false) {
        if (/no destinations found/i.test(String(json.message || ''))) {
          return { cities, groups: [], total: 0 };
        }
        throw new Error(json.message || `Destination details failed (${res.status}).`);
      }
      // Older proxy builds don't have /api/destinations yet.
      if (res.status === 404 || res.status === 405) {
        lastError = new Error(
          'Destination details service is not configured. Restart the proxy and try again.'
        );
        continue;
      }
      throw new Error(errorFromBody(raw, res.status));
    }

    if (!json) {
      throw new Error('Destination details returned an invalid response.');
    }
    if (json.status === false) {
      if (/no destinations found/i.test(String(json.message || ''))) {
        return { cities, groups: [], total: 0 };
      }
      throw new Error(json.message || 'Could not fetch destination details.');
    }

    const data = json.data || {};
    // Old proxy versions fall through to the packages endpoint instead of
    // returning 404, so a packages payload means the route is not deployed.
    if (
      !Array.isArray(data.destinations) &&
      (Array.isArray(data.packages) || Array.isArray(json.packages))
    ) {
      lastError = new Error(
        'Destination details service is not configured. Restart the proxy and try again.'
      );
      continue;
    }
    const list = Array.isArray(data.destinations) ? data.destinations : [];
    if (!list.length) return { cities, groups: [], total: 0 };

    const attractionsByDestination = new Map();
    for (const item of Array.isArray(data.attractions) ? data.attractions : []) {
      const key = String(item?.slug_id ?? '');
      if (!key) continue;
      if (!attractionsByDestination.has(key)) attractionsByDestination.set(key, []);
      const current = attractionsByDestination.get(key);
      current.push(normalizeAttraction(item, current.length));
    }

    const reachByDestination = new Map();
    for (const item of Array.isArray(data.reach_destinations) ? data.reach_destinations : []) {
      const key = String(item?.slug_id ?? '');
      if (!key) continue;
      if (!reachByDestination.has(key)) reachByDestination.set(key, []);
      const current = reachByDestination.get(key);
      current.push(normalizeReach(item, current.length));
    }

    const normalized = list.map((item) => {
      const key = String(item?.area_id ?? '');
      return normalizeDestination(
        item,
        attractionsByDestination.get(key) || [],
        reachByDestination.get(key) || []
      );
    });

    const groupsByCity = new Map();
    for (const dest of normalized) {
      const key = dest.city.toLowerCase() || 'other';
      if (!groupsByCity.has(key)) {
        groupsByCity.set(key, { city: dest.city || 'Other', destinations: [] });
      }
      groupsByCity.get(key).destinations.push(dest);
    }

    const groups = [...groupsByCity.values()].sort((a, b) => {
      const ai = cities.indexOf(a.city.toLowerCase());
      const bi = cities.indexOf(b.city.toLowerCase());
      if (ai === -1 && bi === -1) return a.city.localeCompare(b.city);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    return { cities, groups, total: normalized.length };
  }

  throw lastError || new Error('Could not reach the destinations service. Please try again.');
}
