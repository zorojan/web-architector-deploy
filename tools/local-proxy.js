const http = require('http');
const url = require('url');

const PORT = process.env.PROXY_PORT ? parseInt(process.env.PROXY_PORT) : 8080;
const FRONTEND_PORT = process.env.FRONTEND_PORT ? parseInt(process.env.FRONTEND_PORT) : 5173;

function proxyRequest(req, res, target) {
  const parsed = url.parse(target + req.url);
  const options = {
    hostname: parsed.hostname,
    port: parsed.port,
    path: parsed.path,
    method: req.method,
    headers: Object.assign({}, req.headers, { host: parsed.host }),
  };

  const proxy = http.request(options, function (pres) {
    res.writeHead(pres.statusCode, pres.headers);
    pres.pipe(res, { end: true });
  });

  proxy.on('error', function (err) {
  console.error('Proxy error for', target + req.url, err && err.stack ? err.stack : err);
  res.writeHead(502, { 'Content-Type': 'text/plain' });
  res.end('Bad gateway: ' + err.message);
  });

  req.pipe(proxy, { end: true });
}

const server = http.createServer((req, res) => {
  const host = req.headers.host || '';
  const path = req.url || '/';

  // Route /api to backend (localhost:3001)
  if (path.startsWith('/api/')) {
    return proxyRequest(req, res, 'http://localhost:3001');
  }

  // Route /admin to admin dev server (localhost:3000)
  if (path === '/admin' || path.startsWith('/admin/')) {
    // rewrite /admin -> / for the admin server
    const originalUrl = req.url;
    req.url = req.url.replace(/^\/admin/, '') || '/';
  return proxyRequest(req, res, 'http://localhost:3000');
  }

  // Everything else -> frontend dev server (configurable)
  return proxyRequest(req, res, `http://localhost:${FRONTEND_PORT}`);
});

server.listen(PORT, () => {
  console.log(`Local proxy listening on http://localhost:${PORT}`);
  console.log(`Routes: /api -> http://localhost:3001, /admin -> http://localhost:3000, / -> http://localhost:${FRONTEND_PORT}`);
});
