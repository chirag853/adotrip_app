// packages-proxy.worker.js — Cloudflare Worker (free) as a TLS proxy for the
// Adotrip packages API. Deploy once, then set in the app:
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
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors() });
    }
    const url = new URL(request.url);

    // Health check: <worker>?ping=1
    if (url.searchParams.get('ping') !== null) {
      return new Response(
        JSON.stringify({ ok: true, proxy: 'adotrip-packages', time: new Date().toISOString() }),
        { headers: { ...cors(), 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
      );
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

function cors() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
