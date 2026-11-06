// @ts-nocheck

import ModuleFederationPlugin from '../../../src/lib/container/ModuleFederationPlugin';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
const webpack = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
import path from 'path';
import fs from 'fs';
import os from 'os';

// Before webpack 5.111 the hashes are already available when the runtime module is
// generated, so there is nothing to regress; from 5.111 they are not, and resolving
// them throws.
const [major, minor] = webpack.version.split('.').map(Number);
const hashesUnsettledDuringGeneration =
  major > 5 || (major === 5 && minor >= 111);
const describeIfSupported = hashesUnsettledDuringGeneration
  ? describe
  : describe.skip;

describeIfSupported(
  'FederationRuntimeModule with content-hashed output filenames (production)',
  () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fed-runtime-hash-'));
      fs.writeFileSync(
        path.join(tempDir, 'package.json'),
        '{ "name": "test-remote", "version": "1.0.0" }',
      );
      fs.writeFileSync(path.join(tempDir, 'exposed.js'), 'export default 1;');
      fs.writeFileSync(
        path.join(tempDir, 'main.js'),
        "import('./exposed').then(console.log);",
      );
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    const build = async (filename: string) => {
      const outputPath = path.join(tempDir, 'dist');
      const compiler = webpack({
        mode: 'production',
        devtool: false,
        context: tempDir,
        entry: { main: './main.js' },
        // webpack 5.111.0's default minimizer throws on its own (css syntax export), unrelated to hashing
        optimization: { minimize: false },
        output: {
          path: outputPath,
          filename,
          chunkFilename: filename,
          uniqueName: 'fed-runtime-hash-test',
          publicPath: 'auto',
        },
        plugins: [
          new ModuleFederationPlugin({
            name: 'remote',
            filename: 'remoteEntry.js',
            exposes: { './exposed': './exposed.js' },
            manifest: false,
          }),
        ],
      });
      const stats = await new Promise<any>((resolve, reject) => {
        compiler.run((err: any, s: any) => (err ? reject(err) : resolve(s)));
      });
      await new Promise<void>((resolve) => compiler.close(() => resolve()));
      const { errors } = stats.toJson({ all: false, errors: true });
      if (errors.length) return { errors, rootOutputDirs: {} };
      const files = fs
        .readdirSync(outputPath, { recursive: true })
        .map(String)
        .filter((f) => f.endsWith('.js'));
      const rootOutputDirs: Record<string, string> = {};
      for (const file of files) {
        const match = fs
          .readFileSync(path.join(outputPath, file), 'utf-8')
          .match(/rootOutputDir:\s*"([^"]*)"/);
        if (match) rootOutputDirs[file] = match[1];
      }
      return { errors, rootOutputDirs };
    };

    it.each([
      ['[name].[contenthash].js'],
      ['[name].[contenthash].[chunkhash].js'],
      ['nested/[name].[contenthash:8].js'],
      ['nested/dir/[name].[fullhash:8].[contenthash].[chunkhash].js'],
    ])('emits rootOutputDir for %s without hash errors', async (filename) => {
      const { errors, rootOutputDirs } = await build(filename);

      expect(errors).toEqual([]);
      // the entry chunk follows the hashed template; the container entry sits at the root
      const files = Object.keys(rootOutputDirs);
      expect(files.length).toBeGreaterThanOrEqual(2);
      expect(files.some((f) => /\.[0-9a-f]{8,}/.test(path.basename(f)))).toBe(
        true,
      );
      for (const file of files) {
        const depth = path
          .dirname(file)
          .split(path.sep)
          .filter((d) => d !== '.').length;
        expect(rootOutputDirs[file]).toBe('../'.repeat(depth));
      }
      expect(files).toContain('remoteEntry.js');
      expect(
        files.some(
          (f) =>
            f !== 'remoteEntry.js' &&
            f.startsWith(
              filename.split('/')[0] === 'nested' ? 'nested/' : 'main.',
            ),
        ),
      ).toBe(true);
    });
  },
);
