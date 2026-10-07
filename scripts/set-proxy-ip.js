// Auto-fix EXPO_PUBLIC_PACKAGES_PROXY_URL to this PC's current LAN IP.
// Run: node scripts/set-proxy-ip.js  (also runs automatically on `npm start`)
const fs = require('fs');
const os = require('os');
const path = require('path');

function lanIp() {
  const nets = os.networkInterfaces();
  for (const arr of Object.values(nets)) {
    for (const n of arr || []) {
      if (n.family === 'IPv4' && !n.internal && !n.address.startsWith('169.254.')) {
        if (n.address.startsWith('192.168.') || n.address.startsWith('10.') || n.address.startsWith('172.')) return n.address;
      }
    }
  }
  return null;
}

const ip = lanIp();
if (!ip) {
  console.log('LAN IP nahi mila — Wi-Fi check karo.');
  process.exit(1);
}
const envPath = path.join(__dirname, '..', '.env');
let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const url = `http://${ip}:8787`;
if (/^EXPO_PUBLIC_PACKAGES_PROXY_URL=.*/m.test(env)) {
  env = env.replace(/^EXPO_PUBLIC_PACKAGES_PROXY_URL=.*/m, `EXPO_PUBLIC_PACKAGES_PROXY_URL=${url}`);
} else {
  env += `\nEXPO_PUBLIC_PACKAGES_PROXY_URL=${url}\n`;
}
fs.writeFileSync(envPath, env);
console.log(`Proxy URL set: ${url}`);
