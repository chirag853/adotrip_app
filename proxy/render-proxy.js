// packages + HPTDC TLS proxy — zero dependencies, plain Node.js.
// Deploy free on Render (Mumbai region): New → Web Service → this repo,
// Start command: `node proxy/render-proxy.js`, env PORT is auto-provided.
// Then set in the app: EXPO_PUBLIC_PACKAGES_PROXY_URL=https://<service>.onrender.com
//
// Why: www.adotrip.com serves only the leaf certificate (GoDaddy G2 chain,
// intermediate missing). Browsers compensate via AIA chasing, but Android
// native and plain Node fail verification. This proxy adds the missing
// GoDaddy G2 intermediate (proxy/certs/gdig2-intermediate.pem) to its trust
// store, verifies upstream properly (no insecure bypass), and re-serves the
// JSON with the host's valid certificate.

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const tls = require('tls');

// Local dev secrets: load .env without adding a dependency. Production
// (Render/Cloudflare) should set these variables in the dashboard instead.
try {
  const envText = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (
      key === 'OPENROUTER_API_KEY' ||
      key === 'OPENROUTER_MODEL' ||
      process.env[key] === undefined
    ) {
      process.env[key] = value;
    }
  }
} catch {
  // .env is optional in production.
}

const UPSTREAM = 'https://www.adotrip.com/api/v1/packages';
const PORT = Number(process.env.PORT || 8787);
const AI_MODEL = process.env.OPENROUTER_MODEL || 'minimax/minimax-m3.1-flash:free';
const AI_TIMEOUT_MS = 120000;

// Nominatim (OpenStreetMap) geocoding — map pins ke liye. Free, no key.
// Usage policy: max 1 request/second + a real User-Agent. The app geocodes
// stops sequentially; this cache avoids repeat lookups after a re-render.
const GEOCODE_TTL_MS = 6 * 60 * 60 * 1000;
const geocodeCache = new Map();

// System roots + the missing GoDaddy G2 intermediate = complete chain.
const agent = new https.Agent({
  ca: [...tls.rootCertificates, fs.readFileSync(path.join(__dirname, 'certs', 'gdig2-intermediate.pem'), 'utf8')],
  keepAlive: true,
});

// Holiday page (/holiday/<slug>) ke inline <script> me package detail JSON
// `console.log({...});` ke roop me embedded hota hai. Us object ko nikaalo
// jisme package ke fields (slug / package_name) hon; warna null.
// (Page par abhi sirf ek console.log hai, but safe rehne ke liye sab scan
// karte hain aur string ke andar wale </script> ke liye 3 candidate try.)
function extractEmbeddedPackage(html) {
  const marker = 'console.log(';
  let at = -1;
  while ((at = html.indexOf(marker, at + 1)) !== -1) {
    let end = at;
    for (let tries = 0; tries < 3; tries++) {
      end = html.indexOf('</script>', end + 1);
      if (end === -1) break;
      let s = html.slice(at + marker.length, end).trim();
      if (s.endsWith(';')) s = s.slice(0, -1).trim();
      if (s.endsWith(')')) s = s.slice(0, -1).trim();
      if (!s.startsWith('{') || !s.endsWith('}')) continue;
      try {
        const obj = JSON.parse(s);
        if (obj && typeof obj === 'object' && (obj.slug || obj.package_name)) return obj;
      } catch {}
    }
  }
  return null;
}

// Fallback tab jab /api/v1/packages/<slug> JSON route na chale (Oct 2026 me
// ek baar 404 ho gayi thi): holiday page ka embedded JSON nikaal ke serve karo.
function holidayPageDetail(slug, res) {
  const ureq = https.get(
    `https://www.adotrip.com/holiday/${encodeURIComponent(slug)}`,
    { agent, headers: { Accept: 'text/html', 'User-Agent': 'AdotripApp-Proxy/1.0' }, timeout: 20000 },
    (ures) => {
      const chunks = [];
      ures.on('data', (c) => chunks.push(c));
      ures.on('end', () => {
        const status = ures.statusCode || 502;
        if (status >= 400) {
          // Slug galat / package removed -> upstream ka status waisa hi pass.
          return send(res, status, Buffer.concat(chunks), ures.headers['content-type']);
        }
        const pkg = extractEmbeddedPackage(Buffer.concat(chunks).toString('utf8'));
        if (!pkg) {
          return send(res, 502, JSON.stringify({ error: 'detail data not found in holiday page', slug }));
        }
        return send(res, 200, JSON.stringify({ status: true, message: 'Package detail fetched successfully.', data: pkg }));
      });
    }
  );
  ureq.on('timeout', () => ureq.destroy(new Error('upstream timeout')));
  ureq.on('error', (e) => send(res, 502, JSON.stringify({ error: 'upstream failed', detail: e.message })));
  return ureq;
}

function send(res, status, body, contentType, cacheControl) {
  // Client may abort an image request while its headers are already streaming
  // (or upstream may fail mid-stream). Never try to write a second response —
  // an uncaught ERR_HTTP_HEADERS_SENT would kill the whole proxy.
  if (res.headersSent) {
    try {
      res.destroy();
    } catch {}
    return;
  }
  res.writeHead(status, {
    'Content-Type': contentType || 'application/json',
    'Cache-Control': cacheControl || 'no-store', // live API data is never cached
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

function readJsonBody(req, limit = 32768) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new Error('invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

async function handleAiPlan(req, res) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return send(
      res,
      500,
      JSON.stringify({
        error:
          'OPENROUTER_API_KEY not configured. Add it to .env (server-side) and restart the proxy.',
      })
    );
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (e) {
    return send(res, 400, JSON.stringify({ error: e.message }));
  }

  const route = String(body.route || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
  if (!route) {
    return send(res, 400, JSON.stringify({ error: 'route is required' }));
  }

  const days = Math.max(1, Math.min(10, parseInt(body.days, 10) || 4));
  const adults = Math.max(1, Math.min(20, parseInt(body.adults, 10) || 1));
  const startDate = String(body.startDate || '').slice(0, 40);
  const endDate = String(body.endDate || '').slice(0, 40);
  const dateLine =
    startDate && endDate
      ? ` Travel dates: ${startDate} to ${endDate}.`
      : startDate
        ? ` Travel start date: ${startDate}.`
        : ' Dates are flexible.';

  const prompt =
    `Plan a detailed trip itinerary for the following route: ${route} for ${days} days. ` +
    `Travellers: ${adults} adult${adults > 1 ? 's' : ''}.${dateLine} ` +
    'Format the response as a JSON array with one object per day. ' +
    'Each object must have keys: day, city, attraction_name, morning, afternoon, food, hotel, transport, title, summary, and estimated_visit_duration. ' +
    'Return only valid JSON, no markdown or commentary. Keep every field concise.';

  const payload = JSON.stringify({
    model: AI_MODEL,
    messages: [
      { role: 'system', content: 'Adotrip is an expert AI travel planner.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 10000,
  });

  const upstream = https.request(
    {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://www.adotrip.com',
        'X-Title': 'Adotrip AI Circuit Planner',
        'User-Agent': 'AdotripApp-Proxy/1.0',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: AI_TIMEOUT_MS,
    },
    (ures) => {
      const chunks = [];
      ures.on('data', (c) => chunks.push(c));
      ures.on('end', () =>
        send(
          res,
          ures.statusCode || 502,
          Buffer.concat(chunks),
          ures.headers['content-type'] || 'application/json'
        )
      );
    }
  );
  upstream.on('timeout', () => upstream.destroy(new Error('OpenRouter timeout')));
  upstream.on('error', (e) =>
    send(res, 502, JSON.stringify({ error: 'AI planner upstream failed', detail: e.message }))
  );
  upstream.write(payload);
  upstream.end();
}

function handleGeocode(res, query) {
  const clean = String(query || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
  if (!clean) {
    return send(res, 400, JSON.stringify({ error: 'q is required' }));
  }

  const cacheKey = clean.toLowerCase();
  const cached = geocodeCache.get(cacheKey);
  if (cached && Date.now() - cached.at < GEOCODE_TTL_MS) {
    return send(res, 200, cached.body, 'application/json');
  }

  const upstream = new URL('https://nominatim.openstreetmap.org/search');
  upstream.searchParams.set('format', 'jsonv2');
  upstream.searchParams.set('limit', '1');
  upstream.searchParams.set('addressdetails', '0');
  upstream.searchParams.set('q', clean);

  const greq = https.get(
    upstream,
    {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
        'User-Agent': 'AdotripApp/1.0 (https://www.adotrip.com; support@adotrip.com)',
      },
      timeout: 15000,
    },
    (gres) => {
      const chunks = [];
      gres.on('data', (c) => chunks.push(c));
      gres.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (gres.statusCode === 200) {
          try {
            const parsed = JSON.parse(body);
            if (Array.isArray(parsed)) {
              geocodeCache.set(cacheKey, { at: Date.now(), body });
              if (geocodeCache.size > 250) {
                geocodeCache.delete(geocodeCache.keys().next().value);
              }
            }
          } catch {}
        }
        send(res, gres.statusCode || 502, body, gres.headers['content-type'] || 'application/json');
      });
    }
  );
  greq.on('timeout', () => greq.destroy(new Error('geocode timeout')));
  greq.on('error', (e) =>
    send(res, 502, JSON.stringify({ error: 'geocode upstream failed', detail: e.message }))
  );
}

// Map assets + tiles are served through this proxy so the app's WebView never
// depends on unpkg/OSM being reachable from the phone. This also gives the
// native WebView a proper User-Agent (some tile hosts reject anonymous ones).
const MAP_ASSET_URLS = {
  js: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
  css: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
};
const MAP_ASSET_TYPES = {
  js: 'application/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
};
const mapAssetCache = new Map();
const tileCache = new Map();
const TILE_CACHE_MAX = 240;

function fetchMapResource(target, res, options = {}) {
  const { contentType, cacheStore, cacheKey, maxAge = 86400, redirects = 3 } = options;
  const upstreamReq = https.get(
    target,
    {
      headers: {
        Accept: '*/*',
        'User-Agent': 'AdotripApp/1.0 (map proxy; +https://www.adotrip.com)',
      },
      timeout: 15000,
    },
    (upstream) => {
      if (
        redirects > 0 &&
        upstream.statusCode >= 300 &&
        upstream.statusCode < 400 &&
        upstream.headers.location
      ) {
        upstream.resume();
        let next;
        try {
          next = new URL(upstream.headers.location, target).toString();
        } catch {
          return send(res, 502, JSON.stringify({ error: 'map redirect invalid' }));
        }
        return fetchMapResource(next, res, { ...options, redirects: redirects - 1 });
      }
      if (upstream.statusCode !== 200) {
        upstream.resume();
        return send(
          res,
          502,
          JSON.stringify({ error: 'map upstream failed', status: upstream.statusCode })
        );
      }
      const chunks = [];
      upstream.on('data', (c) => chunks.push(c));
      upstream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (cacheStore && cacheKey) cacheStore.set(cacheKey, buffer);
        send(
          res,
          200,
          buffer,
          contentType || upstream.headers['content-type'] || 'application/octet-stream',
          `public, max-age=${maxAge}`
        );
      });
      upstream.on('error', (e) =>
        send(res, 502, JSON.stringify({ error: 'map upstream failed', detail: e.message }))
      );
    }
  );
  upstreamReq.on('timeout', () => upstreamReq.destroy(new Error('map upstream timeout')));
  upstreamReq.on('error', (e) =>
    send(res, 502, JSON.stringify({ error: 'map upstream failed', detail: e.message }))
  );
}

function handleMapAsset(res, kind) {
  const cached = mapAssetCache.get(kind);
  if (cached) {
    return send(res, 200, cached, MAP_ASSET_TYPES[kind], 'public, max-age=86400');
  }
  const target = MAP_ASSET_URLS[kind];
  if (!target) return send(res, 404, JSON.stringify({ error: 'unknown map asset' }));
  return fetchMapResource(target, res, {
    contentType: MAP_ASSET_TYPES[kind],
    cacheStore: mapAssetCache,
    cacheKey: kind,
  });
}

function handleTile(res, q) {
  const z = parseInt(q.get('z'), 10);
  const x = parseInt(q.get('x'), 10);
  const y = parseInt(q.get('y'), 10);
  if (!Number.isInteger(z) || !Number.isInteger(x) || !Number.isInteger(y) || z < 0 || z > 19) {
    return send(res, 400, JSON.stringify({ error: 'bad tile coordinates' }));
  }
  const max = 2 ** z;
  if (x < 0 || x >= max || y < 0 || y >= max) {
    return send(res, 400, JSON.stringify({ error: 'bad tile coordinates' }));
  }

  const cacheKey = `${z}/${x}/${y}`;
  const cached = tileCache.get(cacheKey);
  if (cached) {
    return send(res, 200, cached, 'image/png', 'public, max-age=86400');
  }
  if (tileCache.size >= TILE_CACHE_MAX) {
    const oldest = tileCache.keys().next().value;
    if (oldest) tileCache.delete(oldest);
  }
  return fetchMapResource(
    `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
    res,
    { contentType: 'image/png', cacheStore: tileCache, cacheKey }
  );
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '', 'text/plain');

  let q;
  let pathname;
  try {
    const parsedUrl = new URL(req.url, 'http://local');
    q = parsedUrl.searchParams;
    pathname = parsedUrl.pathname;
    if (req.method === 'POST') {
      if (pathname === '/api/ai/plan' || q.get('ai_plan') !== null) {
        return handleAiPlan(req, res);
      }
      return send(res, 405, JSON.stringify({ error: 'POST only supported on /api/ai/plan' }));
    }
  } catch {
    return send(res, 400, JSON.stringify({ error: 'bad request' }));
  }
  if (req.method !== 'GET') return send(res, 405, JSON.stringify({ error: 'GET only' }));

  // Health check: <proxy>?ping=1 -> { ok: true }
  // Phone browser ya `npm run proxy:check` se turant pata chalta hai
  // proxy zinda hai ya nahi — bina API hit kiye.
  if (q.get('ping') !== null) {
    return send(res, 200, JSON.stringify({ ok: true, proxy: 'adotrip-packages', time: new Date().toISOString() }));
  }

  // Leaflet + map tiles through the proxy. The phone's WebView gets these from
  // the same reachable proxy as the rest of the app, so no unpkg/OSM DNS or
  // user-agent surprises, and no permanent "Loading map…" overlay.
  if (pathname === '/api/leaflet.js') return handleMapAsset(res, 'js');
  if (pathname === '/api/leaflet.css') return handleMapAsset(res, 'css');
  if (pathname === '/api/tile') return handleTile(res, q);

  // Geocoding for the Circuit Planner map:
  //   <proxy>/api/geocode?q=Manali
  //   <proxy>?geocode=Manali (legacy shortcut)
  if (pathname === '/api/geocode' || q.get('geocode') !== null) {
    return handleGeocode(res, q.get('q') || q.get('geocode') || '');
  }

  // HPTDC hotels: <proxy>?hptdc=1
  // Optional filters: circuit_type, class, hotel_type, search, per_page, page.
  // Same upstream host as packages, so the same TLS agent works.
  if (q.get('hptdc') !== null) {
    const upstream = new URL('https://www.adotrip.com/api/v1/hptdc');
    const circuit = String(q.get('circuit_type') || '').slice(0, 60);
    const cls = String(q.get('class') || '').slice(0, 30);
    const hotelType = String(q.get('hotel_type') || '').slice(0, 60);
    const search = String(q.get('search') || '').slice(0, 60);
    const perPage = Math.min(100, Math.max(1, parseInt(q.get('per_page'), 10) || 100));
    const page = Math.max(1, parseInt(q.get('page'), 10) || 1);
    if (circuit) upstream.searchParams.set('circuit_type', circuit);
    if (cls) upstream.searchParams.set('class', cls);
    if (hotelType) upstream.searchParams.set('hotel_type', hotelType);
    if (search) upstream.searchParams.set('search', search);
    upstream.searchParams.set('per_page', String(perPage));
    upstream.searchParams.set('page', String(page));

    const hreq = https.get(
      upstream.toString(),
      { agent, headers: { Accept: 'application/json', 'User-Agent': 'AdotripApp-Proxy/1.0' }, timeout: 20000 },
      (hres) => {
        const chunks = [];
        hres.on('data', (c) => chunks.push(c));
        hres.on('end', () =>
          send(res, hres.statusCode || 502, Buffer.concat(chunks), hres.headers['content-type'])
        );
      }
    );
    hreq.on('timeout', () => hreq.destroy(new Error('upstream timeout')));
    hreq.on('error', (e) => send(res, 502, JSON.stringify({ error: 'upstream failed', detail: e.message })));
    return;
  }

  // HPTDC hotel detail: <proxy>?hptdc_detail=<slug>
  // Slug upstream path me jata hai, isliye strict validation.
  if (q.get('hptdc_detail') !== null) {
    const slug = String(q.get('hptdc_detail') || '')
      .trim()
      .replace(/^\/+|\/+$/g, '')
      .slice(0, 120);
    if (!/^[A-Za-z0-9-]+$/.test(slug)) {
      return send(res, 400, JSON.stringify({ error: 'bad hotel slug' }));
    }

    const upstream = `https://www.adotrip.com/api/v1/hptdc/hotels/${encodeURIComponent(slug)}`;
    const dreq = https.get(
      upstream,
      { agent, headers: { Accept: 'application/json', 'User-Agent': 'AdotripApp-Proxy/1.0' }, timeout: 20000 },
      (dres) => {
        const chunks = [];
        dres.on('data', (c) => chunks.push(c));
        dres.on('end', () =>
          send(res, dres.statusCode || 502, Buffer.concat(chunks), dres.headers['content-type'])
        );
      }
    );
    dreq.on('timeout', () => dreq.destroy(new Error('upstream timeout')));
    dreq.on('error', (e) => send(res, 502, JSON.stringify({ error: 'upstream failed', detail: e.message })));
    return;
  }

  // Image proxy: <proxy>?img=https://www.adotrip.com/packages/xxx.jpg
  // Needed because banner_image_url has the same broken cert as the JSON API.
  const img = q.get('img');
  if (img) {
    let target;
    try {
      target = new URL(img);
    } catch {
      return send(res, 400, JSON.stringify({ error: 'bad img url' }));
    }
    if (!/^www\.adotrip\.com$/i.test(target.hostname)) {
      return send(res, 403, JSON.stringify({ error: 'img host not allowed' }));
    }
    const ireq = https.get(
      target.toString(),
      { agent, headers: { 'User-Agent': 'AdotripApp-Proxy/1.0' }, timeout: 20000 },
      (ires) => {
        if (ires.statusCode >= 300 && ires.statusCode < 400 && ires.headers.location) {
          return send(res, ires.statusCode, JSON.stringify({ error: 'redirect blocked' }));
        }
        res.writeHead(ires.statusCode || 200, {
          'Content-Type': ires.headers['content-type'] || 'image/jpeg',
          'Cache-Control': 'public, max-age=3600', // photo 1 ghanta cache (roz nahi badalti)
          'Access-Control-Allow-Origin': '*',
        });
        ires.on('error', () => {
          try {
            res.destroy();
          } catch {}
        });
        ires.pipe(res);
      }
    );
    ireq.on('timeout', () => ireq.destroy(new Error('img upstream timeout')));
    ireq.on('error', (e) => send(res, 502, JSON.stringify({ error: 'img upstream failed', detail: e.message })));
    return;
  }

  // Subthemes list: <proxy>?subthemes=1 -> upstream /api/v1/subthemes
  // (NO Cookie forwarded — plain upstream fetch returns 200.)
  if (q.get('subthemes') !== null) {
    const ureq = https.get(
      'https://www.adotrip.com/api/v1/subthemes',
      { agent, headers: { Accept: 'application/json', 'User-Agent': 'AdotripApp-Proxy/1.0' }, timeout: 20000 },
      (ures) => {
        const chunks = [];
        ures.on('data', (c) => chunks.push(c));
        ures.on('end', () =>
          send(res, ures.statusCode || 502, Buffer.concat(chunks), ures.headers['content-type'])
        );
      }
    );
    ureq.on('timeout', () => ureq.destroy(new Error('upstream timeout')));
    ureq.on('error', (e) => send(res, 502, JSON.stringify({ error: 'upstream failed', detail: e.message })));
    return;
  }

  // Package detail: <proxy>?detail=<slug>
  // Pehle ASLI JSON API hit karte hain: /api/v1/packages/<slug> (jaisi app
  // direct bhi try karti hai) — list wale slug ko aage laga ke.
  // Agar woh route na chale (Oct 2026 me 404 ho gayi thi) to fallback:
  // holiday page (/holiday/<slug>) ka embedded console.log({...}) JSON.
  // Dono me se jo mile, wahi { status, message, data } envelope me jaata hai.
  const detail = q.get('detail');
  if (detail !== null) {
    const slug = String(detail || '').replace(/^\/+|\/+$/g, '').slice(0, 120);
    if (!/^[A-Za-z0-9-_]+$/.test(slug)) {
      return send(res, 400, JSON.stringify({ error: 'bad detail slug' }));
    }

    const apiReq = https.get(
      `https://www.adotrip.com/api/v1/packages/${encodeURIComponent(slug)}`,
      { agent, headers: { Accept: 'application/json', 'User-Agent': 'AdotripApp-Proxy/1.0' }, timeout: 20000 },
      (ares) => {
        const chunks = [];
        ares.on('data', (c) => chunks.push(c));
        ares.on('end', () => {
          const status = ares.statusCode || 502;
          const body = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try {
            json = JSON.parse(body);
          } catch {}
          const pkg = json?.data;
          if (
            status >= 200 && status < 300 &&
            pkg && typeof pkg === 'object' && (pkg.slug || pkg.package_name)
          ) {
            // Asli API chal rahi hai -> pass-through.
            return send(res, 200, JSON.stringify({
              status: true,
              message: json.message || 'Package detail fetched successfully.',
              data: pkg,
            }));
          }
          // API route gayab/fail (404, HTML, etc.) -> holiday page fallback.
          return holidayPageDetail(slug, res);
        });
      }
    );
    apiReq.on('timeout', () => apiReq.destroy(new Error('upstream timeout')));
    apiReq.on('error', () => holidayPageDetail(slug, res));
    return;
  }

  // Theme packages: <proxy>?packages_url=<encoded /api/v1/holidays/.../packages>
  // Holidays screen ke chips /api/v1/subthemes ke response se yahi URL use karte hain.
  const themePackagesUrl = q.get('packages_url');
  if (themePackagesUrl !== null) {
    let target;
    try {
      target = new URL(themePackagesUrl);
    } catch {
      return send(res, 400, JSON.stringify({ error: 'bad packages_url' }));
    }
    const allowed =
      /^www\.adotrip\.com$/i.test(target.hostname) &&
      /^\/api\/v1\/(holidays|packages)\//.test(target.pathname) &&
      /\/packages\/?$/.test(target.pathname);
    if (!allowed) {
      return send(res, 403, JSON.stringify({ error: 'packages_url host/path not allowed' }));
    }

    const treq = https.get(
      target.toString(),
      { agent, headers: { Accept: 'application/json', 'User-Agent': 'AdotripApp-Proxy/1.0' }, timeout: 20000 },
      (tres) => {
        const chunks = [];
        tres.on('data', (c) => chunks.push(c));
        tres.on('end', () =>
          send(res, tres.statusCode || 502, Buffer.concat(chunks), tres.headers['content-type'])
        );
      }
    );
    treq.on('timeout', () => treq.destroy(new Error('upstream timeout')));
    treq.on('error', (e) => send(res, 502, JSON.stringify({ error: 'upstream failed', detail: e.message })));
    return;
  }

  const perPage = Math.min(200, Math.max(1, parseInt(q.get('per_page'), 10) || 10));
  const page = Math.max(1, parseInt(q.get('page'), 10) || 1);
  const search = String(q.get('search') || '').slice(0, 60);

  const upstream = new URL(UPSTREAM);
  upstream.searchParams.set('per_page', String(perPage));
  upstream.searchParams.set('page', String(page));
  if (search) upstream.searchParams.set('search', search);

  const ureq = https.get(
    upstream.toString(),
    { agent, headers: { Accept: 'application/json', 'User-Agent': 'AdotripApp-Proxy/1.0' }, timeout: 20000 },
    (ures) => {
      const chunks = [];
      ures.on('data', (c) => chunks.push(c));
      ures.on('end', () =>
        send(res, ures.statusCode || 502, Buffer.concat(chunks), ures.headers['content-type'])
      );
    }
  );
  ureq.on('timeout', () => ureq.destroy(new Error('upstream timeout')));
  ureq.on('error', (e) => send(res, 502, JSON.stringify({ error: 'upstream failed', detail: e.message })));
});

server.listen(PORT, () => {
  console.log(`packages proxy on :${PORT}`);
  // Phone se kholne wala URL yahin print — IP match na ho to
  // `node scripts/set-proxy-ip.js` chalao aur `npx expo start -c` se restart karo.
  try {
    const os = require('os');
    for (const arr of Object.values(os.networkInterfaces())) {
      for (const n of arr || []) {
        if (n.family === 'IPv4' && !n.internal && /^(192\.168\.|10\.|172\.)/.test(n.address)) {
          console.log(`phone URL: http://${n.address}:${PORT}?ping=1`);
        }
      }
    }
  } catch {}
});
server.on('error', (e) => {
  if (e?.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} busy hai — purana proxy abhi bhi chal raha hai. ` +
      `Use band karo ya chalao: npm run proxy:restart`
    );
    process.exit(1);
  }
  throw e;
});
