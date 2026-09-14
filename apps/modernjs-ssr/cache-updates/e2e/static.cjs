const fs = require('node:fs/promises');
const path = require('node:path');
const { createRequire } = require('node:module');
const { spawnSync } = require('node:child_process');
const installed =
  process.env.SSR_CACHE_PACKAGES_ROOT || path.resolve(__dirname, '..');
const r = createRequire(path.join(installed, 'package.json'));
function packageRoot(entry) {
  let dir = path.dirname(entry);
  while (!require('node:fs').existsSync(path.join(dir, 'package.json'))) {
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error(`Package root not found: ${entry}`);
    dir = parent;
  }
  return dir;
}
(async () => {
  const root = await fs.mkdtemp(
    path.join(require('node:os').tmpdir(), 'mf-published-static-'),
  );
  const modern = path.join(root, 'modern');
  const mf = path.join(root, 'mf');
  await fs.mkdir(path.join(modern, 'tests'), { recursive: true });
  await fs.mkdir(path.join(mf, 'packages'), { recursive: true });
  const core = packageRoot(r.resolve('@modern-js/server-core'));
  const plugin = packageRoot(r.resolve('@module-federation/modern-js-v3'));
  const rspack = r.resolve('@rspack/core');
  const runtime = packageRoot(
    createRequire(rspack).resolve('@module-federation/runtime-tools'),
  );
  for (const [from, to] of [
    [path.join(core, 'dist'), path.join(modern, 'dist')],
    [plugin, path.join(mf, 'packages/modernjs-v3')],
    [runtime, path.join(mf, 'packages/runtime-tools')],
    [path.join(installed, 'node_modules'), path.join(mf, 'node_modules')],
    [
      path.dirname(path.dirname(runtime)),
      path.join(mf, 'packages/node_modules'),
    ],
  ])
    await fs.symlink(from, to);
  await fs.copyFile(
    path.join(__dirname, 'static.test.cjs'),
    path.join(modern, 'tests/application.static-mf.test.cjs'),
  );
  console.log(
    'STATIC_PUBLISHED',
    JSON.stringify({ root, core, plugin, runtime, rspack }),
  );
  for (const mode of ['readable', 'numeric', 'optimized']) {
    const result = spawnSync(
      process.execPath,
      ['--test', path.join(modern, 'tests/application.static-mf.test.cjs')],
      {
        env: {
          ...process.env,
          SSR_CACHE_MF_ROOT: mf,
          SSR_CACHE_RSPACK_ENTRY: rspack,
          SSR_STATIC_NUMERIC: mode === 'numeric' ? '1' : '0',
          SSR_STATIC_OPTIMIZE: mode === 'optimized' ? '1' : '0',
        },
        stdio: 'inherit',
      },
    );
    if (result.status !== 0)
      throw new Error(`static ${mode}: ${result.status ?? result.signal}`);
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
