// Run the enhanced suites again on older webpack releases: the minimum that
// the webpack peer dependency allows, and the workspace root's webpack, which
// the e2e apps use. FEDERATION_WEBPACK_PATH makes the plugins and the test
// harness load that copy.
const { spawnSync } = require('child_process');
const path = require('path');
const { peerDependencies } = require('../../package.json');

const versionOf = (entry) =>
  require(path.join(path.dirname(entry), '../package.json')).version;

const peerMinimum = require.resolve('webpack-peer-minimum');
const declaredMinimum = peerDependencies.webpack.replace(/^\^/, '');
if (versionOf(peerMinimum) !== declaredMinimum) {
  throw new Error(
    `webpack-peer-minimum is ${versionOf(peerMinimum)}, but the webpack peer ` +
      `range starts at ${declaredMinimum}. Update the devDependency alias.`,
  );
}

const targets = [
  peerMinimum,
  require.resolve('webpack', {
    paths: [path.resolve(__dirname, '../../../..')],
  }),
];
for (const webpackPath of targets) {
  console.log(`Running enhanced tests on webpack ${versionOf(webpackPath)}`);
  const result = spawnSync('pnpm', ['run', 'test:suites'], {
    cwd: path.resolve(__dirname, '../..'),
    env: { ...process.env, FEDERATION_WEBPACK_PATH: webpackPath },
    stdio: 'inherit',
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
