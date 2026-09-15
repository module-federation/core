const fs = require('node:fs/promises');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = process.env.SSR_CACHE_PRODUCTION_DIR;
const modules = path.join(process.env.SSR_CACHE_PACKAGES_ROOT, 'node_modules');
async function build(app) {
  const result = spawnSync(
    process.execPath,
    [path.join(modules, '@modern-js/app-tools/bin/modern.js'), 'build'],
    {
      cwd: path.join(root, app),
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'inherit',
    },
  );
  if (result.status !== 0) throw Error('Modern build failed: ' + app);
}
(async () => {
  await fs.symlink(modules, path.join(root, 'node_modules'));
  await fs.copyFile(
    path.join(__dirname, 'config.ts'),
    path.join(root, 'config.ts'),
  );
  for (const app of ['remote', 'remote-b', 'static', 'dynamic', 'console']) {
    const dir = path.join(root, app);
    await fs.cp(path.join(__dirname, app), dir, { recursive: true });
    await fs.mkdir(path.join(dir, 'node_modules'));
    for (const name of await fs.readdir(modules)) {
      if (name.startsWith('.')) continue;
      await fs.symlink(
        path.join(modules, name),
        path.join(dir, 'node_modules', name),
      );
    }
    await build(app);
  }
  for (const app of ['remote', 'remote-b']) {
    const releases = path.join(
      root,
      'releases',
      app === 'remote-b' ? 'palette' : '',
    );
    await fs.mkdir(releases, { recursive: true });
    await fs.cp(path.join(root, app, 'dist'), path.join(releases, 'v1'), {
      recursive: true,
    });
    for (const file of ['src/Counter.tsx', 'src/Palette.tsx']) {
      const target = path.join(root, app, file);
      await fs.writeFile(
        target,
        (await fs.readFile(target, 'utf8')).replaceAll('v1', 'v2'),
      );
    }
  }
  const config = path.join(root, 'config.ts');
  await fs.writeFile(
    config,
    (await fs.readFile(config, 'utf8')).replaceAll('/v1/', '/v2/'),
  );
  for (const app of ['remote', 'remote-b']) {
    await build(app);
    await fs.cp(
      path.join(root, app, 'dist'),
      path.join(root, 'releases', app === 'remote-b' ? 'palette' : '', 'v2'),
      { recursive: true },
    );
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
