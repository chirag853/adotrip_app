// Proxy auto-start — har `npm start` / `npm run dev:phone` par chalta hai.
// - Port free -> proxy detached me start (terminal band karne par bhi chalta rahega).
// - Port busy + ?ping=1 OK -> kuch nahi (proxy healthy hai).
// - Port busy + ping FAIL -> atka hua process kill + fresh start.
// Iske baad proxy bhoolna / atka rehna band — API load ka sabse bada kaaran khatm.
const { execSync, spawn } = require('child_process');
const http = require('http');

const PORT = Number(process.env.PROXY_PORT || 8787);

function pidsOnPort(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
      const m = line.match(/LISTENING\s+(\d+)/i);
      if (m) pids.add(m[1]);
    }
    return [...pids];
  } catch {
    return [];
  }
}

function ping(port, timeoutMs = 4000) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}?ping=1`, { timeout: timeoutMs }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try {
          resolve(res.statusCode === 200 && JSON.parse(body).ok === true);
        } catch {
          resolve(false);
        }
      });
    });
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.on('error', () => resolve(false));
  });
}

function startDetached() {
  const child = spawn('node', ['proxy/render-proxy.js'], {
    cwd: require('path').join(__dirname, '..'),
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();
}

(async () => {
  const pids = pidsOnPort(PORT);
  if (pids.length === 0) {
    startDetached();
    console.log(`proxy auto-start (port ${PORT} free tha)`);
    return;
  }
  if (await ping(PORT)) {
    console.log(`proxy already running (port ${PORT}, PID ${pids.join(',')})`);
    return;
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
      console.log(`atka hua proxy kill (PID ${pid})`);
    } catch {}
  }
  setTimeout(() => {
    startDetached();
    console.log(`proxy fresh start (port ${PORT})`);
  }, 1500);
})();
