import { execFileSync } from 'node:child_process';
import path from 'node:path';

describe('webpack public API', () => {
  it('builds a container with sharing and remotes without private webpack imports', () => {
    const output = execFileSync(
      process.execPath,
      [path.join(__dirname, 'public-webpack-api/run.js')],
      { encoding: 'utf-8', env: { ...process.env, NODE_OPTIONS: '' } },
    );
    expect(JSON.parse(output)).toEqual({
      errors: [],
      privateImports: [],
      sharedModuleExecuted: true,
    });
  }, 60000);
});
