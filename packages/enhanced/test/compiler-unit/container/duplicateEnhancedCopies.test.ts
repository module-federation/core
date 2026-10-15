/*
 * @rstest-environment node
 */

import { execFileSync } from 'child_process';
import path from 'path';

describe('two installed copies of enhanced in one process', () => {
  it('restores persisted caches in a fresh process with reversed copy load order', () => {
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
    expect(result.initial.thrown).toBeUndefined();
    expect(result.restored.thrown).toBeUndefined();
    expect(result.initial.pid).not.toBe(result.restored.pid);
    expect(result.initial.loadOrder).toEqual(['first', 'second']);
    expect(result.restored.loadOrder).toEqual(['second', 'first']);
    for (const name of ['first', 'second']) {
      const { cold, warm } = result.initial[name];
      const restored = result.restored[name].cold;
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
      expect(restored.errors).toEqual([]);
      expect(restored.logs).toEqual([]);
      expect(restored.federationModules).toEqual(cold.federationModules);
      expect(restored.rebuilt).toBe(0);
    }
  }, 120000);
});
