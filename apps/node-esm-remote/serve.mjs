// Tiny static file server for dist/ — just enough to let a Node host import
// the remote entry and its chunks over http://localhost:3030.
import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORT = Number(process.env.PORT) || 3030;
const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');

const CONTENT_TYPES = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(
    new URL(req.url, 'http://localhost').pathname,
  );
  const filePath = path.join(DIST, urlPath);

  // Prevent path traversal outside dist/.
  if (
    !filePath.startsWith(DIST) ||
    !existsSync(filePath) ||
    !statSync(filePath).isFile()
  ) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  console.log(`[node-esm-remote:server] GET ${urlPath}`);
  res.writeHead(200, {
    'Content-Type':
      CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream',
  });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(
    `[node-esm-remote:server] serving ${DIST} at http://localhost:${PORT}`,
  );
});
