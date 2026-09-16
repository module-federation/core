// Use built workspace MF packages without modifying the pnpm store. A normal
// pnpm install restores the published preview links.
const fs = require('node:fs/promises');
const path = require('node:path');
(async () => {
  const target = await fs.mkdtemp(
    path.join(require('node:os').tmpdir(), 'weather-mf-packages-'),
  );
  const installed =
    await require('../modernjs-ssr/cache-updates/playground/packages.cjs')(
      path.resolve(__dirname, '../modernjs-ssr/cache-updates'),
      target,
    );
  for (const app of [
    'host',
    'remote',
    'remote-new-version',
    'dynamic-remote',
    'dynamic-remote-new-version',
  ]) {
    const scope = path.join(__dirname, app, 'node_modules/@module-federation');
    for (const name of await fs.readdir(scope)) {
      const link = path.join(scope, name);
      if (!(await fs.lstat(link)).isSymbolicLink())
        throw Error('Expected pnpm symlink: ' + link);
      await fs.unlink(link);
      await fs.symlink(
        path.join(installed, 'node_modules/@module-federation', name),
        link,
      );
    }
  }
  console.log('Weather demo uses workspace builds: ' + installed);
})();
