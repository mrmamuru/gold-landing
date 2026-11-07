// Local test server:  node dev-server.js   → http://localhost:3000
// Local admin password: put it in a file named ".dev-password" (git-ignored), or set ADMIN_PASSWORD env
process.env.LOCAL_DEV = '1';
if (!process.env.ADMIN_PASSWORD) {
  try { process.env.ADMIN_PASSWORD = require('fs').readFileSync(__dirname + '/.dev-password', 'utf8').trim(); } catch {}
}
if (!process.env.ADMIN_PASSWORD) { console.error('Create a .dev-password file with your local admin password'); process.exit(1); }

const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

const routes = { '/api/go': require('./api/go'), '/api/link': require('./api/link'), '/api/config': require('./api/config') };
const pages = { '/': 'index.html', '/admin': 'admin.html', '/admin.html': 'admin.html', '/index.html': 'index.html' };

http.createServer(async (req, res) => {
  const p = new URL(req.url, 'http://x').pathname;
  if (routes[p]) return routes[p](req, res);
  if (pages[p]) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(fs.readFileSync(path.join(__dirname, pages[p])));
  }
  res.statusCode = 404; res.end('Not found');
}).listen(PORT, () => {
  console.log(`Landing: http://localhost:${PORT}/`);
  console.log(`Admin:   http://localhost:${PORT}/admin  (password from .dev-password)`);
});
