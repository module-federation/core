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
  'packages/enhanced/jest.embed.ts',
];

const result = spawnSync('node', args, { stdio: 'inherit' });
if (result.status !== 0) {
  process.exit(result.status);
}
