const path = require('node:path');
const fs = require('node:fs/promises');
const { spawnSync } = require('node:child_process');
(async () => {
  for (const app of [
    'remote',
    'remote-new-version',
    'dynamic-remote',
    'dynamic-remote-new-version',
    'host',
  ]) {
    const result = spawnSync(
      'pnpm',
      ['--dir', path.join(__dirname, app), 'run', 'build'],
      { env: { ...process.env, NODE_ENV: 'production' }, stdio: 'inherit' },
    );
    if (result.status !== 0) throw Error('Modern build failed: ' + app);
    if (app.includes('remote')) {
      const target = path.join(
        __dirname,
        'releases',
        app.startsWith('dynamic') ? 'palette' : '',
        app.endsWith('new-version') ? 'v2' : 'v1',
      );
      await fs.rm(target, { recursive: true, force: true });
      await fs.cp(path.join(__dirname, app, 'dist'), target, {
        recursive: true,
      });
    }
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
