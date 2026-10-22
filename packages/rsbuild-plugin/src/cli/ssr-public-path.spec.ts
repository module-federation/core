import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRslib } from '@rslib/core';
import { describe, expect, it } from '@rstest/core';
import { pluginModuleFederation } from './index';

// Build the real Rslib integration: async-node does not otherwise require publicPath.
describe('Rslib SSR publicPath runtime', () => {
  it.each(['node', 'dual'] as const)(
    'emits the configured publicPath for target=%s',
    async (target) => {
      const root = await mkdtemp(path.join(tmpdir(), 'mf-rslib-public-path-'));
      try {
        await writeFile(
          path.join(root, 'package.json'),
          JSON.stringify({ name: 'ssr-public-path-fixture', private: true }),
        );
        await mkdir(path.join(root, 'src'));
        await writeFile(
          path.join(root, 'src/index.js'),
          'export const value = 42;',
        );
        const rslib = await createRslib({
          cwd: root,
          config: {
            lib: [{ format: 'mf', dts: false }],
            output: {
              assetPrefix: 'https://cdn.example.com/library/',
              minify: false,
              distPath: { root: path.join(root, 'dist') },
            },
            plugins: [
              pluginModuleFederation(
                {
                  name: 'ssr_public_path',
                  filename: 'remoteEntry.js',
                  dts: false,
                  manifest: false,
                  exposes: { './Value': './src/index.js' },
                },
                { target },
              ),
            ],
          },
        });
        await rslib.build();
        const nodeDir = target === 'dual' ? 'dist/ssr' : 'dist';
        const output = await readFile(
          path.join(root, nodeDir, 'remoteEntry.js'),
          'utf8',
        );
        const expected =
          target === 'dual'
            ? 'https://cdn.example.com/library/ssr/'
            : 'https://cdn.example.com/library/';
        expect(output).toContain(`__webpack_require__.p = "${expected}"`);
        expect(output).toContain('readFile');
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    },
  );
});
