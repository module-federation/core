/*
 * @rstest-environment node
 */

import { execFileSync } from 'child_process';
import path from 'path';

describe('two installed copies of enhanced in one process', () => {
  it('builds and restores from the filesystem cache with both copies', () => {
    const packageRoot = path.resolve(__dirname, '../../..');
    const output = execFileSync(
      process.execPath,
      [path.join(__dirname, 'duplicate-enhanced-copies/run.js')],
      {
        encoding: 'utf-8',
        env: {
          ...process.env,
          NODE_OPTIONS: '',
          NODE_PATH: path.join(packageRoot, 'node_modules'),
        },
      },
    );
    const result = JSON.parse(output);

    expect(result.thrown).toBeUndefined();
    for (const name of ['first', 'second']) {
      const { cold, warm } = result[name];
      expect(cold.errors).toEqual([]);
      expect(warm.errors).toEqual([]);
      expect(cold.logs).toEqual([]);
      expect(warm.logs).toEqual([]);
      expect(cold.federationModules).toEqual([
        'consume-shared-module',
        'provide-module',
        'remote-module',
      ]);
      expect(cold.rebuilt).toBe(3);
      expect(warm.federationModules).toEqual(cold.federationModules);
      expect(warm.rebuilt).toBe(0);
    }
  }, 120000);
});
