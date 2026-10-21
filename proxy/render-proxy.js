// packages TLS proxy — zero dependencies, plain Node.js.
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

const UPSTREAM = 'https://www.adotrip.com/api/v1/packages';
const PORT = Number(process.env.PORT || 8787);

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

function send(res, status, body, contentType) {
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
    'Cache-Control': 'no-store', // hamesha live data — koi caching nahi
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '', 'text/plain');
  if (req.method !== 'GET') return send(res, 405, JSON.stringify({ error: 'GET only' }));

  let q;
  try {
    q = new URL(req.url, 'http://local').searchParams;
  } catch {
    return send(res, 400, JSON.stringify({ error: 'bad request' }));
  }

  // Health check: <proxy>?ping=1 -> { ok: true }
  // Phone browser ya `npm run proxy:check` se turant pata chalta hai
  // proxy zinda hai ya nahi — bina API hit kiye.
  if (q.get('ping') !== null) {
    return send(res, 200, JSON.stringify({ ok: true, proxy: 'adotrip-packages', time: new Date().toISOString() }));
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
