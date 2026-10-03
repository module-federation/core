const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { createRequire } = require('node:module');
function setup(stage) {
  if (process.versions.node.split('.')[0] !== '24')
    throw new Error('Use Node 24, matching AGENTS.md.');
  const repo = path.resolve(
    process.env.COMPOSITION_PROOF_REPO || path.resolve(__dirname, '../../..'),
  );
  cp.execFileSync(
    'corepack',
    [
      'pnpm',
      'exec',
      'turbo',
      'run',
      'build',
      '--filter=@module-federation/enhanced',
      '--concurrency=4',
    ],
    { cwd: repo, stdio: 'inherit' },
  );
  fs.mkdirSync(stage, { recursive: true });
  cp.execFileSync(
    'corepack',
    [
      'pnpm',
      '-C',
      path.join(repo, 'packages/enhanced'),
      'pack',
      '--pack-destination',
      stage,
    ],
    { cwd: repo, stdio: 'inherit' },
  );
  for (const copy of ['a', 'b'])
    fs.copyFileSync(
      path.join(stage, 'module-federation-enhanced-2.9.1.tgz'),
      path.join(stage, `enhanced-${copy}.tgz`),
    );
  const pkg = require(path.join(repo, 'packages/enhanced/package.json'));
  const overrides = Object.fromEntries(
    Object.keys(pkg.dependencies).map((name) => [
      name,
      'link:' +
        fs.realpathSync(
          path.join(repo, 'packages/enhanced/node_modules', name),
        ),
    ]),
  );
  fs.writeFileSync(
    path.join(stage, 'package.json'),
    JSON.stringify(
      {
        private: true,
        packageManager: 'pnpm@10.28.0',
        dependencies: {
          'enhanced-a': 'file:./enhanced-a.tgz',
          'enhanced-b': 'file:./enhanced-b.tgz',
          webpack:
            'link:' + fs.realpathSync(path.join(repo, 'node_modules/webpack')),
        },
        pnpm: { overrides },
      },
      null,
      2,
    ),
  );
  fs.writeFileSync(
    path.join(stage, '.npmrc'),
    'auto-install-peers=false\nstore-dir=./.pnpm-store\n',
  );
  const consumer = JSON.parse(
    fs.readFileSync(path.join(stage, 'package.json')),
  );
  delete consumer.dependencies['enhanced-b'];
  fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify(consumer));
  cp.execFileSync(
    'corepack',
    ['pnpm', 'install', '--offline', '--ignore-scripts'],
    { cwd: stage, stdio: 'inherit' },
  );
  consumer.dependencies['enhanced-b'] = 'file:./enhanced-b.tgz';
  fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify(consumer));
  cp.execFileSync(
    'corepack',
    ['pnpm', 'install', '--offline', '--ignore-scripts'],
    { cwd: stage, stdio: 'inherit' },
  );
  // Install an actual tarball whose compiler modules are transpiled from the
  // exact baseline source; all other artifacts/dependencies stay locked locally.
  const baseline = '84cee419c5c7dc2bb87d1a92cd7fb8e15e409aec';
  const legacy = path.join(stage, 'legacy-package');
  fs.mkdirSync(legacy, { recursive: true });
  cp.execFileSync('tar', [
    '-xzf',
    path.join(stage, 'enhanced-a.tgz'),
    '-C',
    legacy,
  ]);
  const swc = createRequire(path.join(repo, 'package.json'))('@swc/core');
  for (const file of [
    'lib/container/ModuleFederationPlugin',
    'lib/container/runtime/FederationCompositionPlugin',
  ]) {
    const source = cp.execFileSync(
      'git',
      ['show', `${baseline}:packages/enhanced/src/${file}.ts`],
      { cwd: repo, encoding: 'utf8' },
    );
    const output = swc.transformSync(source, {
      jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
      module: { type: 'commonjs' },
    });
    fs.writeFileSync(
      path.join(legacy, `package/dist/src/${file}.js`),
      output.code,
    );
  }
  cp.execFileSync('tar', [
    '-czf',
    path.join(stage, 'enhanced-legacy.tgz'),
    '-C',
    legacy,
    'package',
  ]);
  consumer.dependencies['enhanced-legacy'] = 'file:./enhanced-legacy.tgz';
  fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify(consumer));
  cp.execFileSync(
    'corepack',
    ['pnpm', 'install', '--offline', '--ignore-scripts'],
    { cwd: stage, stdio: 'inherit' },
  );
  const familyNames = [
    'runtime-tools',
    'webpack-bundler-runtime',
    'runtime',
    'runtime-core',
    'sdk',
  ];
  for (const family of ['a', 'b']) {
    for (const name of familyNames) {
      const src = path.join(repo, 'packages', name);
      const dst = path.join(
        stage,
        `family-${family}/node_modules/@module-federation`,
        name,
      );
      fs.mkdirSync(dst, { recursive: true });
      fs.copyFileSync(
        path.join(src, 'package.json'),
        path.join(dst, 'package.json'),
      );
      fs.cpSync(path.join(src, 'dist'), path.join(dst, 'dist'), {
        recursive: true,
      });
      const deps = { ...require(path.join(src, 'package.json')).dependencies };
      for (const dep of Object.keys(deps)) {
        if (
          dep.startsWith('@module-federation/') &&
          familyNames.includes(dep.slice('@module-federation/'.length))
        )
          continue;
        const link = path.join(dst, 'node_modules', dep);
        if (fs.existsSync(link)) continue;
        fs.mkdirSync(path.dirname(link), { recursive: true });
        fs.symlinkSync(
          fs.realpathSync(path.join(src, 'node_modules', dep)),
          link,
        );
      }
    }
  }
  cp.execFileSync(
    'corepack',
    ['pnpm', 'install', '--offline', '--frozen-lockfile', '--ignore-scripts'],
    { cwd: stage, stdio: 'inherit' },
  );
  return stage;
}
module.exports = setup;
