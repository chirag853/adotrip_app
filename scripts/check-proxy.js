// Proxy health check — PC se proxy + upstream dono test karta hai.
// Run: npm run proxy:check
// Phone me API load na ho to pehle ye chalao: FAIL wali line hi asli kaaran hai.
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

function proxyUrl() {
  try {
    const env = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
    const m = env.match(/^EXPO_PUBLIC_PACKAGES_PROXY_URL=(.*)$/m);
    const v = (m?.[1] || '').trim();
    if (v) return v.replace(/\/+$/, '');
  } catch {}
  return 'http://localhost:8787';
}

function get(url, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { Accept: 'application/json' }, timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body }));
    });
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 'TIMEOUT' }); });
    req.on('error', (e) => resolve({ ok: false, status: 'ERR', err: e.message }));
  });
}

(async () => {
  const base = proxyUrl();
  console.log(`proxy: ${base}\n`);
  let fail = 0;
  const line = (name, r, hint) => {
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${name}${r.status !== undefined && !r.ok ? ` (status: ${r.status}${r.err ? `, ${r.err}` : ''})` : ''}`);
    if (!r.ok) { fail++; console.log(`      -> ${hint}`); }
  };

  line('proxy zinda (?ping=1)', await get(`${base}?ping=1`),
    '`npm run proxy:restart` chalao (proxy band hai ya port busy).');
  const list = await get(`${base}?per_page=2`);
  let listOk = list.ok;
  try {
    const j = JSON.parse(list.body || '{}');
    listOk = list.ok && Array.isArray(j?.data?.packages) && j.data.packages.length > 0;
  } catch { listOk = false; }
  line('packages list (upstream)', { ok: listOk, status: list.status },
    'Proxy on hai par adotrip upstream fail — net check karo, 2 min baad retry.');
  const det = await get(`${base}?detail=weekend-getaway-mahabalipuram`);
  let detOk = det.ok;
  try {
    const j = JSON.parse(det.body || '{}');
    detOk = det.ok && !!j?.data?.package_name;
  } catch { detOk = false; }
  line('package detail (upstream)', { ok: detOk, status: det.status },
    'Detail fail — list chal rahi to app list dikhayegi, detail me Retry aayega.');

  console.log(fail === 0
    ? '\nSab OK — phir bhi phone me na khule to: same Wi-Fi? .env IP fresh? `npx expo start -c`?'
    : `\n${fail} check FAIL — upar wali line ka hint follow karo.`);
  process.exit(fail === 0 ? 0 : 1);
})();
