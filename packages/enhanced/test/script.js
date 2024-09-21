const { spawnSync } = require('child_process');
const jestPath = require.resolve('jest-cli/bin/jest');
const args = [
  '--expose-gc',
  '--max-old-space-size=4096',
  '--experimental-vm-modules',
  '--trace-deprecation',
  jestPath,
  '--logHeapUsage',
  '--config',
  'packages/enhanced/jest.config.ts',
  '--silent',
];

const result = spawnSync('node', args, { stdio: 'inherit' });
if (result.status !== 0) {
  if (result.stderr) {
    console.log('################');
    console.error(result.stderr);
  } else {
    console.log('################');
    console.log(result.stdout);
  }
  process.exit(result.status);
}
