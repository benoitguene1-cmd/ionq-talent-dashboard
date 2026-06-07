// Minimal zero-dependency static server for Railway.
// Serves index.html on the port Railway provides ($PORT), binding 0.0.0.0.
// Optional password protection: set AUTH_USER and AUTH_PASS env vars in Railway
// to require HTTP Basic Auth before the dashboard loads.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const AUTH_USER = process.env.AUTH_USER || '';
const AUTH_PASS = process.env.AUTH_PASS || '';
const HTML = fs.readFileSync(path.join(__dirname, 'index.html'));

function authed(req) {
  if (!AUTH_USER || !AUTH_PASS) return true; // no auth configured -> public
  const header = req.headers.authorization || '';
  const b64 = header.split(' ')[1] || '';
  const [user, pass] = Buffer.from(b64, 'base64').toString().split(':');
  return user === AUTH_USER && pass === AUTH_PASS;
}

http.createServer((req, res) => {
  if (req.url === '/health') { res.writeHead(200); return res.end('ok'); }
  if (!authed(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="IonQ Talent Mapping"' });
    return res.end('Authentication required');
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(HTML);
}).listen(PORT, '0.0.0.0', () => console.log('IonQ dashboard listening on ' + PORT));
