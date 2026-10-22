// Map geocoding for the Circuit Planner. The app talks to our proxy, which
// forwards to OpenStreetMap Nominatim with a proper User-Agent. Keeping this
// behind the proxy avoids CORS/rate-limit surprises and gives the app one
// place to configure its backend URL.

const cache = new Map();

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

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const timer = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    signal?.addEventListener?.('abort', onAbort, { once: true });
  });
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
    if (timedOut) throw new Error('Map lookup timed out. Please try again.');
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', onAbort);
  }
}

function errorFromBody(raw, status) {
  try {
    const json = JSON.parse(raw);
    const err = json?.error;
    if (typeof err === 'string' && err.trim()) return err.trim();
    if (err && typeof err === 'object') return err.message || err.detail || `Map lookup failed (${status}).`;
    if (json?.detail) return String(json.detail);
  } catch {}
  return `Map lookup failed (${status}).`;
}

async function geocodeOne(query, signal, timeoutMs) {
  const candidates = resolveProxyCandidates();
  if (!candidates.length) {
    throw new Error(
      'Map service is not configured. Set EXPO_PUBLIC_PACKAGES_PROXY_URL and restart the app.'
    );
  }

  let lastError = null;
  for (const base of candidates) {
    const url = `${base}/api/geocode?q=${encodeURIComponent(query)}`;
    let res;
    try {
      res = await fetchWithTimeout(url, signal, timeoutMs);
    } catch (e) {
      if (e?.name === 'AbortError') throw e;
      lastError = e;
      continue;
    }

    const raw = await res.text();
    if (!res.ok) {
      // Older local proxy/worker builds don't have /api/geocode yet.
      if (res.status === 404 || res.status === 405) {
        lastError = new Error(errorFromBody(raw, res.status));
        continue;
      }
      throw new Error(errorFromBody(raw, res.status));
    }

    let json = null;
    try {
      json = JSON.parse(raw);
    } catch {}
    const first = Array.isArray(json)
      ? json[0]
      : json?.results?.[0] || json?.data?.[0] || null;
    if (!first) return null;

    const latitude = Number(first.lat ?? first.latitude);
    const longitude = Number(first.lon ?? first.lng ?? first.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

    return {
      latitude,
      longitude,
      displayName: String(first.display_name || first.name || query),
    };
  }

  throw lastError || new Error('Could not reach the map service. Please try again.');
}

/**
 * Resolve selected destination names to map coordinates.
 * Nominatim's usage policy asks for max 1 request/second, so uncached lookups
 * are spaced out. Results keep the original index so marker numbers still
 * match the destination chips even if one place cannot be found.
 */
export async function geocodeStops(stops, { signal, timeoutMs = 18000 } = {}) {
  const results = [];
  let didNetwork = false;
  let lastError = null;

  for (let i = 0; i < stops.length; i += 1) {
    const query = String(stops[i] || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!query) continue;

    if (signal?.aborted) throw abortError();

    const key = query.toLowerCase();
    const hit = cache.get(key);
    if (hit) {
      results.push({ ...hit, index: i, name: query });
      continue;
    }

    if (didNetwork) await sleep(1100, signal);
    didNetwork = true;

    try {
      const coords = await geocodeOne(query, signal, timeoutMs);
      if (coords) {
        cache.set(key, coords);
        results.push({ ...coords, index: i, name: query });
      }
    } catch (e) {
      if (e?.name === 'AbortError') throw e;
      lastError = e;
    }
  }

  if (!results.length && lastError) throw lastError;
  return results;
}
