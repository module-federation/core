const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { fork, spawn } = require('node:child_process');
const { once } = require('node:events');
const root = __dirname;
let host, build, assets;
const mime = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};
(async () => {
  assets = http.createServer(async (req, res) => {
    try {
      const name = decodeURIComponent(
        new URL(req.url, 'http://localhost').pathname,
      );
      const file = path.resolve(root, 'releases', '.' + name);
      if (!file.startsWith(path.join(root, 'releases') + path.sep)) {
        res.writeHead(403);
        return res.end();
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'content-type',
        mime[path.extname(file)] || 'application/octet-stream',
      );
      res.end(await fs.readFile(file));
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });
  assets.listen(
    Number(process.env.WEATHER_ASSET_PORT || 3066),
    process.env.WEATHER_HOST || '127.0.0.1',
  );
  await once(assets, 'listening');
  const env = {
    ...process.env,
    SSR_CACHE_ASSET_URL:
      process.env.SSR_CACHE_ASSET_URL ||
      'http://127.0.0.1:' + assets.address().port,
  };
  build = spawn(process.execPath, [path.join(root, 'build.cjs')], {
    env,
    stdio: 'inherit',
  });
  const [code] = await once(build, 'exit');
  if (code !== 0) throw Error('Build failed');
  function launch() {
    host = fork(
      path.join(root, 'modern-mf-server/serve.cjs'),
      [path.join(root, 'host/weather.config.cjs')],
      {
        env,
        execArgv: [
          '--expose-gc',
          ...(process.argv.includes('--debug') ? ['--inspect=9230'] : []),
        ],
        stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
      },
    );
    host.on('message', (m) => {
      if (m.ready) {
        env.WEATHER_PORT = new URL(m.url).port;
        console.log('PLAYGROUND_READY ' + JSON.stringify(m));
        process.send?.(m);
      }
    });
    host.on('exit', (code) => {
      if (code) console.error('Host exited', code);
      stop(code || 0);
    });
  }
  launch();
})().catch((e) => {
  console.error(e);
  stop(1);
});
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  host?.kill();
  build?.kill();
  assets?.close();
  setTimeout(
    () => process.exit(typeof code === 'number' ? code : 0),
    300,
  ).unref();
}
process.once('SIGINT', () => stop());
process.once('SIGTERM', () => stop());
process.once('disconnect', () => stop());
