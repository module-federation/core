/*
 * @rstest-environment node
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import type { Stats } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import { MIN_RUNTIME_VERSION } from '@module-federation/managers';
import ModuleFederationPlugin from '../../../src/lib/container/ModuleFederationPlugin';

const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

const pnpmStore = path.resolve(__dirname, '../../../../../node_modules/.pnpm');

function olderRuntimeTools() {
  const [older] = fs
    .readdirSync(pnpmStore)
    .filter((dir) =>
      /^@module-federation\+runtime-tools@2\.\d+\.\d+$/.test(dir),
    );
  return path.join(
    pnpmStore,
    older,
    'node_modules/@module-federation/runtime-tools',
  );
}

describe('an older runtime family', () => {
  let context: string;
  afterAll(() => fs.rmSync(context, { recursive: true, force: true }));

  it('fails the build and names the minimum runtime version', async () => {
    context = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-older-family-'));
    fs.writeFileSync(path.join(context, 'index.js'), 'export default 1;');

    const stats = await new Promise<Stats>((resolve, reject) =>
      webpack(
        {
          context,
          mode: 'production',
          devtool: false,
          target: 'async-node',
          entry: './index.js',
          output: { path: path.join(context, 'dist') },
          plugins: [
            new ModuleFederationPlugin({
              name: 'older_family_host',
              remotes: {
                remote: 'remote@http://localhost:3001/remoteEntry.js',
              },
              implementation: olderRuntimeTools(),
              dts: false,
              manifest: false,
            }),
          ],
        },
        (err, result) => (err ? reject(err) : resolve(result!)),
      ),
    );

    const errors = stats.toJson({ all: false, errors: true }).errors;
    expect(errors?.map(({ message }) => message)).toEqual([
      expect.stringMatching(
        new RegExp(
          `webpack-bundler-runtime at .* does not export "\\./compose"; the federation runtime packages must be ${MIN_RUNTIME_VERSION.replace(/\./g, '\\.')} or newer`,
        ),
      ),
    ]);
  });
});
