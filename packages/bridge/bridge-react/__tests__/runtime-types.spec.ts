import { spawnSync } from 'node:child_process';
import path from 'node:path';

describe('published runtime types', () => {
  it('extends enhanced/runtime instances in ESM and CommonJS consumers', () => {
    const result = spawnSync(
      'pnpm',
      [
        'exec',
        'tsc',
        '-p',
        path.join(__dirname, 'fixtures/runtime-consumer/tsconfig.json'),
      ],
      { cwd: path.resolve(__dirname, '..'), encoding: 'utf8' },
    );
    if (result.status !== 0) {
      throw new Error(result.error?.message || result.stdout + result.stderr);
    }
  }, 30000);
});
