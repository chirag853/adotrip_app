// Proxy restart — purana atka hua proxy (EADDRINUSE) kill karke fresh start.
// Run: npm run proxy:restart
// Bar-bar "port busy / API load nahi ho rahi" ka sabse common kaaran yahi hai:
// subah wala `npm run proxy` background me atka reh jata hai.
const { execSync, spawn } = require('child_process');

function killPort(port) {
  try {
    // Windows: LISTENING PID nikalo
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
      const m = line.match(/LISTENING\s+(\d+)/i);
      if (m) pids.add(m[1]);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`purana proxy band (PID ${pid})`);
      } catch {}
    }
    return pids.size > 0;
  } catch {
    return false; // port pehle se free
  }
}

const had = killPort(8787);
if (!had) console.log('port 8787 free tha');
setTimeout(() => {
  const child = spawn('node', ['proxy/render-proxy.js'], { stdio: 'inherit' });
  child.on('error', (e) => {
    console.error('proxy start fail:', e.message);
    process.exit(1);
  });
}, had ? 1500 : 100);
