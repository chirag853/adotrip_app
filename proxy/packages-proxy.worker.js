// packages-proxy.worker.js — Cloudflare Worker (free) as a TLS proxy for the
// Adotrip packages + HPTDC APIs. Deploy once, then set in the app:
//
//   EXPO_PUBLIC_PACKAGES_PROXY_URL=https://<your-worker>.workers.dev
//
// Why: www.adotrip.com serves an incomplete certificate chain (missing
// intermediate). Browsers compensate via AIA chasing, but Android native
// (OkHttp) and Node fail with SSLHandshakeException / "unable to verify the
// first certificate". This worker talks to upstream server-side and re-serves
// the JSON with Cloudflare's valid certificate, so the app connects cleanly.
//
// Deploy (2 min):
//   1. https://dash.cloudflare.com -> Workers & Pages -> Create Worker
//   2. Paste this file -> Save & Deploy. No secrets needed.

const UPSTREAM = 'https://www.adotrip.com/api/v1/packages';

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors() });
    }
    const url = new URL(request.url);

    if (
      request.method === 'POST' &&
      (url.pathname === '/api/ai/plan' || url.searchParams.get('ai_plan') !== null)
    ) {
      return aiPlan(request, env);
    }
    if (request.method === 'POST') {
      return new Response(JSON.stringify({ error: 'POST only supported on /api/ai/plan' }), {
        status: 405,
        headers: cors(),
      });
    }

    // Health check: <worker>?ping=1
    if (url.searchParams.get('ping') !== null) {
      return new Response(
        JSON.stringify({ ok: true, proxy: 'adotrip-packages', time: new Date().toISOString() }),
        { headers: { ...cors(), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
      );
    }

    // Leaflet + map tiles through the worker, so the phone's WebView doesn't
    // depend on unpkg/OSM being directly reachable or on a browser UA.
    if (url.pathname === '/api/leaflet.js') return mapAsset('js', url);
    if (url.pathname === '/api/leaflet.css') return mapAsset('css', url);
    if (url.pathname === '/api/tile') return mapTile(url);

    // Geocoding for the Circuit Planner map:
    //   <worker>/api/geocode?q=Manali
    //   <worker>?geocode=Manali (legacy shortcut)
    if (url.pathname === '/api/geocode' || url.searchParams.get('geocode') !== null) {
      return geocode(url);
    }

    // Destination details for the Circuit Planner accordion:
    //   <worker>/api/destinations?city=delhi,agra
    if (url.pathname === '/api/destinations' || url.searchParams.get('destinations') !== null) {
      return destinations(url);
    }

    // Subthemes list: <worker>?subthemes=1
    if (url.searchParams.get('subthemes') !== null) {
      const res = await fetch('https://www.adotrip.com/api/v1/subthemes', {
        headers: { Accept: 'application/json', 'User-Agent': 'AdotripApp-Proxy/1.0' },
      });
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: {
          ...cors(),
          'Content-Type': res.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'no-store', // hamesha live data — koi caching nahi
        },
      });
    }

    // HPTDC hotels: <worker>?hptdc=1
    // Optional filters: circuit_type, class, hotel_type, search, per_page, page.
    if (url.searchParams.get('hptdc') !== null) {
      const upstream = new URL('https://www.adotrip.com/api/v1/hptdc');
      const circuit = String(url.searchParams.get('circuit_type') || '').slice(0, 60);
      const cls = String(url.searchParams.get('class') || '').slice(0, 30);
      const hotelType = String(url.searchParams.get('hotel_type') || '').slice(0, 60);
      const search = String(url.searchParams.get('search') || '').slice(0, 60);
      const perPage = Math.min(100, Math.max(1, parseInt(url.searchParams.get('per_page'), 10) || 100));
      const page = Math.max(1, parseInt(url.searchParams.get('page'), 10) || 1);
      if (circuit) upstream.searchParams.set('circuit_type', circuit);
      if (cls) upstream.searchParams.set('class', cls);
      if (hotelType) upstream.searchParams.set('hotel_type', hotelType);
      if (search) upstream.searchParams.set('search', search);
      upstream.searchParams.set('per_page', String(perPage));
      upstream.searchParams.set('page', String(page));

      const res = await fetch(upstream.toString(), {
        headers: { Accept: 'application/json', 'User-Agent': 'AdotripApp-Proxy/1.0' },
      });
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: {
          ...cors(),
          'Content-Type': res.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    // HPTDC hotel detail: <worker>?hptdc_detail=<slug>
    // Slug upstream path me jata hai, isliye strict validation.
    if (url.searchParams.get('hptdc_detail') !== null) {
      const slug = String(url.searchParams.get('hptdc_detail') || '')
        .trim()
        .replace(/^\/+|\/+$/g, '')
        .slice(0, 120);
      if (!/^[A-Za-z0-9-]+$/.test(slug)) {
        return new Response(JSON.stringify({ error: 'bad hotel slug' }), {
          status: 400,
          headers: cors(),
        });
      }

      const res = await fetch(
        `https://www.adotrip.com/api/v1/hptdc/hotels/${encodeURIComponent(slug)}`,
        {
          headers: { Accept: 'application/json', 'User-Agent': 'AdotripApp-Proxy/1.0' },
        }
      );
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: {
          ...cors(),
          'Content-Type': res.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    // Image proxy: <worker>?img=https://www.adotrip.com/packages/xxx.jpg
    const img = url.searchParams.get('img');
    if (img) {
      let target;
      try {
        target = new URL(img);
      } catch {
        return new Response(JSON.stringify({ error: 'bad img url' }), { status: 400, headers: cors() });
      }
      if (!/^www\.adotrip\.com$/i.test(target.hostname)) {
        return new Response(JSON.stringify({ error: 'img host not allowed' }), { status: 403, headers: cors() });
      }
      const res = await fetch(target.toString(), {
        headers: { 'User-Agent': 'AdotripApp-Proxy/1.0' },
      });
      const buf = await res.arrayBuffer();
      return new Response(buf, {
        status: res.status,
        headers: {
          ...cors(),
          'Content-Type': res.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=3600', // photo 1 ghanta cache (roz nahi badalti)
        },
      });
    }

    // Package detail: <worker>?detail=<slug> -> upstream /api/v1/packages/<slug>
    const detail = url.searchParams.get('detail');
    if (detail !== null) {
      const slug = String(detail || '').replace(/^\/+|\/+$/g, '').slice(0, 120);
      if (!/^[A-Za-z0-9-_]+$/.test(slug)) {
        return new Response(JSON.stringify({ error: 'bad detail slug' }), { status: 400, headers: cors() });
      }
      const res = await fetch(`${UPSTREAM}/${encodeURIComponent(slug)}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'AdotripApp-Proxy/1.0' },
      });
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: {
          ...cors(),
          'Content-Type': res.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'no-store',
        },
      });
    }

    const perPage = url.searchParams.get('per_page') || '10';
    const search = url.searchParams.get('search') || '';

    const upstream = new URL(UPSTREAM);
    upstream.searchParams.set('per_page', perPage);
    if (search) upstream.searchParams.set('search', search);

    const res = await fetch(upstream.toString(), {
      headers: { Accept: 'application/json', 'User-Agent': 'AdotripApp-Proxy/1.0' },
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        ...cors(),
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-store', // hamesha live data — koi caching nahi
      },
    });
  },
};

const MAP_ASSET_URLS = {
  js: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
  css: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css',
};
const MAP_ASSET_TYPES = {
  js: 'application/javascript; charset=utf-8',
  css: 'text/css; charset=utf-8',
};

async function mapAsset(kind, requestUrl) {
  const source = MAP_ASSET_URLS[kind];
  if (!source) {
    return new Response(JSON.stringify({ error: 'unknown map asset' }), {
      status: 404,
      headers: cors(),
    });
  }
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const cacheKey = new Request(`${requestUrl.origin}/__map-cache/leaflet/${kind}`, {
    method: 'GET',
  });
  let response = null;
  if (cache) {
    try {
      response = await cache.match(cacheKey);
    } catch {}
  }
  if (!response) {
    const upstream = await fetch(source, {
      headers: { Accept: '*/*', 'User-Agent': 'AdotripApp/1.0 (map proxy)' },
    });
    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: 'map upstream failed', status: upstream.status }),
        { status: 502, headers: cors() }
      );
    }
    response = new Response(await upstream.arrayBuffer(), {
      status: 200,
      headers: {
        'Content-Type': MAP_ASSET_TYPES[kind],
        'Cache-Control': 'public, max-age=86400',
      },
    });
    if (cache) {
      try {
        await cache.put(cacheKey, response.clone());
      } catch {}
    }
  }
  return new Response(response.body, {
    status: 200,
    headers: {
      ...cors(),
      'Content-Type': MAP_ASSET_TYPES[kind],
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

async function mapTile(url) {
  const z = parseInt(url.searchParams.get('z'), 10);
  const x = parseInt(url.searchParams.get('x'), 10);
  const y = parseInt(url.searchParams.get('y'), 10);
  if (!Number.isInteger(z) || !Number.isInteger(x) || !Number.isInteger(y) || z < 0 || z > 19) {
    return new Response(JSON.stringify({ error: 'bad tile coordinates' }), {
      status: 400,
      headers: cors(),
    });
  }
  const max = 2 ** z;
  if (x < 0 || x >= max || y < 0 || y >= max) {
    return new Response(JSON.stringify({ error: 'bad tile coordinates' }), {
      status: 400,
      headers: cors(),
    });
  }

  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const cacheKey = new Request(url.toString(), { method: 'GET' });
  let response = null;
  if (cache) {
    try {
      response = await cache.match(cacheKey);
    } catch {}
  }
  if (!response) {
    const upstream = await fetch(
      `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
      {
        headers: {
          Accept: 'image/png,*/*',
          Referer: 'https://www.adotrip.com/',
          'User-Agent': 'AdotripApp/1.0 (map proxy; +https://www.adotrip.com)',
        },
      }
    );
    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: 'map tile upstream failed', status: upstream.status }),
        { status: 502, headers: cors() }
      );
    }
    response = new Response(await upstream.arrayBuffer(), {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
    if (cache) {
      try {
        await cache.put(cacheKey, response.clone());
      } catch {}
    }
  }
  return new Response(response.body, {
    status: 200,
    headers: {
      ...cors(),
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

async function destinations(url) {
  const raw = String(url.searchParams.get('city') || url.searchParams.get('destinations') || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
  const city = raw
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
    .join(',');
  if (!city || !/^[a-z0-9 ,.'&()-]+$/.test(city)) {
    return new Response(JSON.stringify({ error: 'city is required (comma-separated)' }), {
      status: 400,
      headers: { ...cors(), 'Content-Type': 'application/json' },
    });
  }

  const upstream = new URL('https://www.adotrip.com/api/v1/destinations');
  upstream.searchParams.set('city', city);
  const res = await fetch(upstream.toString(), {
    headers: { Accept: 'application/json', 'User-Agent': 'AdotripApp-Proxy/1.0' },
  });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      ...cors(),
      'Content-Type': res.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

async function geocode(url) {
  const query = String(url.searchParams.get('q') || url.searchParams.get('geocode') || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
  if (!query) {
    return new Response(JSON.stringify({ error: 'q is required' }), {
      status: 400,
      headers: { ...cors(), 'Content-Type': 'application/json' },
    });
  }

  const upstream = new URL('https://nominatim.openstreetmap.org/search');
  upstream.searchParams.set('format', 'jsonv2');
  upstream.searchParams.set('limit', '1');
  upstream.searchParams.set('addressdetails', '0');
  upstream.searchParams.set('q', query);

  const res = await fetch(upstream.toString(), {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
      'User-Agent': 'AdotripApp/1.0 (https://www.adotrip.com; support@adotrip.com)',
    },
  });
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      ...cors(),
      'Content-Type': res.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

async function aiPlan(request, env) {
  const apiKey = env?.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          'OPENROUTER_API_KEY not configured. Set it with `wrangler secret put OPENROUTER_API_KEY`.',
      }),
      { status: 500, headers: { ...cors(), 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid JSON body' }), {
      status: 400,
      headers: { ...cors(), 'Content-Type': 'application/json' },
    });
  }

  const route = String(body.route || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
  if (!route) {
    return new Response(JSON.stringify({ error: 'route is required' }), {
      status: 400,
      headers: { ...cors(), 'Content-Type': 'application/json' },
    });
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

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://www.adotrip.com',
      'X-Title': 'Adotrip AI Circuit Planner',
      'User-Agent': 'AdotripApp-Proxy/1.0',
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL || 'minimax/minimax-m3.1-flash:free',
      messages: [
        { role: 'system', content: 'Adotrip is an expert AI travel planner.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 10000,
    }),
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: {
      ...cors(),
      'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
