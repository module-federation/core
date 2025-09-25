/*
 * @jest-environment node
 */
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Configuration } from 'webpack';
import path from 'path';
import fs from 'fs';
import os from 'os';
import ConsumeSharedPlugin from '../../../src/lib/sharing/ConsumeSharedPlugin';

const webpack = require(normalizeWebpackPath('webpack'));

const compile = (compiler: any): Promise<any> =>
  new Promise((resolve, reject) => {
    compiler.run((err: Error | null | undefined, stats: any) => {
      if (err) reject(err);
      else resolve(stats);
    });
  });

interface CreateCompilerOpts {
  context: string;
  entry: string;
  resolve: Record<string, any>;
  plugins: any[];
}

const createCompiler = ({
  context,
  entry,
  resolve,
  plugins,
}: CreateCompilerOpts) => {
  const config: Configuration = {
    mode: 'development',
    context,
    entry,
    output: {
      path: path.join(context, 'dist'),
      filename: 'bundle.js',
    },
    resolve,
    plugins,
    infrastructureLogging: { level: 'error' },
    stats: 'errors-warnings',
  };
  return webpack(config);
};

describe('ConsumeSharedPlugin - alias consumption generic path-equality', () => {
  let testDir: string;
  let srcDir: string;
  let nmDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-consume-alias-'));
    srcDir = path.join(testDir, 'src');
    nmDir = path.join(testDir, 'node_modules');

    fs.mkdirSync(srcDir, { recursive: true });
    fs.mkdirSync(path.join(nmDir, 'next/dist/compiled/react'), {
      recursive: true,
    });
    fs.mkdirSync(path.join(nmDir, 'next/dist/compiled/react-dom/client'), {
      recursive: true,
    });
    fs.mkdirSync(path.join(nmDir, 'next/dist/compiled/react'), {
      recursive: true,
    });

    // Stub compiled React and ReactDOM client entries without package.json nearby
    fs.writeFileSync(
      path.join(nmDir, 'next/dist/compiled/react/index.js'),
      'module.exports = { marker: "compiled-react" };',
    );
    fs.writeFileSync(
      path.join(nmDir, 'next/dist/compiled/react-dom/client.js'),
      'module.exports = { marker: "compiled-react-dom-client" };',
    );
    fs.writeFileSync(
      path.join(nmDir, 'next/dist/compiled/react/jsx-runtime.js'),
      'module.exports = { jsx: function(){ return "compiled-jsx"; } };',
    );
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('maps bare "react" and "react-dom/client" to consumes when aliased to compiled paths', async () => {
    // Import bare specifiers (will be aliased to compiled locations)
    fs.writeFileSync(
      path.join(srcDir, 'index.js'),
      [
        "import React from 'react';",
        "import ReactDomClient from 'react-dom/client';",
        'console.log(React.marker, ReactDomClient.marker);',
      ].join('\n'),
    );

    const compiler = createCompiler({
      context: testDir,
      entry: path.join(srcDir, 'index.js'),
      resolve: {
        alias: {
          react: path.join(nmDir, 'next/dist/compiled/react'),
          'react-dom/client': path.join(
            nmDir,
            'next/dist/compiled/react-dom/client.js',
          ),
        },
      },
      plugins: [
        new ConsumeSharedPlugin({
          experiments: { aliasConsumption: true },
          consumes: {
            react: {
              import: 'react',
              shareKey: 'react',
              shareScope: 'default',
              requiredVersion: false,
            },
            'react-dom/client': {
              import: 'react-dom/client',
              shareKey: 'react-dom/client',
              shareScope: 'default',
              requiredVersion: false,
            },
          },
        }),
      ],
    });

    const stats = await compile(compiler);
    expect(stats.hasErrors()).toBe(false);
    const json = stats.toJson({ modules: true });

    const consumeModules = (json.modules || []).filter(
      (m: any) => m.moduleType === 'consume-shared-module',
    );

    // Verify that both consumes were created
    expect(
      consumeModules.some((m: any) => String(m.name).includes('react')),
    ).toBe(true);
    expect(
      consumeModules.some((m: any) =>
        String(m.name).includes('react-dom/client'),
      ),
    ).toBe(true);
  });

  it('supports prefix consumes (react/) via generic resolver mapping for jsx-runtime', async () => {
    fs.writeFileSync(
      path.join(srcDir, 'prefix.js'),
      ["import jsx from 'react/jsx-runtime';", 'console.log(!!jsx.jsx);'].join(
        '\n',
      ),
    );

    const compiler = createCompiler({
      context: testDir,
      entry: path.join(srcDir, 'prefix.js'),
      resolve: {
        alias: {
          'react/jsx-runtime': path.join(
            nmDir,
            'next/dist/compiled/react/jsx-runtime.js',
          ),
        },
      },
      plugins: [
        new ConsumeSharedPlugin({
          experiments: { aliasConsumption: true },
          consumes: {
            'react/': {
              import: 'react/',
              shareKey: 'react',
              shareScope: 'default',
              requiredVersion: false,
              include: { request: /jsx-runtime$/ },
              allowNodeModulesSuffixMatch: true,
            },
          },
        }),
      ],
    });

    const stats = await compile(compiler);
    expect(stats.hasErrors()).toBe(false);
    const json = stats.toJson({ modules: true });
    const consumeModules = (json.modules || []).filter(
      (m: any) => m.moduleType === 'consume-shared-module',
    );
    expect(
      consumeModules.some((m: any) =>
        String(m.name).includes('react/jsx-runtime'),
      ),
    ).toBe(true);
  });

  it('respects issuer layer when configured and still resolves via alias (Windows-style alias path)', async () => {
    const layerDir = path.join(srcDir, 'layerA');
    fs.mkdirSync(layerDir, { recursive: true });
    fs.writeFileSync(
      path.join(layerDir, 'index.js'),
      [
        "import React from 'react';",
        'console.log(React && React.marker);',
      ].join('\n'),
    );

    // Simulate a Windows-style absolute path in alias target
    const winAlias = (p: string) => p.split(path.sep).join('\\\\');

    const compiler = createCompiler({
      context: testDir,
      entry: path.join(layerDir, 'index.js'),
      resolve: {
        alias: {
          react: winAlias(path.join(nmDir, 'next/dist/compiled/react')),
        },
      },
      plugins: [
        new ConsumeSharedPlugin({
          experiments: { aliasConsumption: true },
          consumes: {
            react: {
              import: 'react',
              shareKey: 'react',
              shareScope: 'default',
              requiredVersion: false,
              layer: 'pages-dir-browser',
              issuerLayer: 'pages-dir-browser',
              allowNodeModulesSuffixMatch: true,
            },
          },
        }),
      ],
    });

    // Attach a rule to assign issuer layer to layerA
    (compiler.options.module = compiler.options.module || {}).rules = [
      {
        test: /layerA[\\/].*\.js$/,
        layer: 'pages-dir-browser',
      },
    ];

    const stats = await compile(compiler);
    expect(stats.hasErrors()).toBe(false);
    const json = stats.toJson({ modules: true });
    const consumeModules = (json.modules || []).filter(
      (m: any) => m.moduleType === 'consume-shared-module',
    );
    expect(consumeModules.length).toBeGreaterThan(0);
    expect(
      consumeModules.some((m: any) =>
        String(m.name).includes('(pages-dir-browser)'),
      ),
    ).toBe(true);
  });

  it('does not map across layers when issuerLayer mismatches', async () => {
    // Entry under layer "layer-A"
    const layerDir = path.join(srcDir, 'layerA2');
    fs.mkdirSync(layerDir, { recursive: true });
    fs.writeFileSync(
      path.join(layerDir, 'index.js'),
      ["import React from 'react';", 'console.log(!!React);'].join('\n'),
    );

    const compiler = createCompiler({
      context: testDir,
      entry: path.join(layerDir, 'index.js'),
      resolve: {
        alias: {
          react: path.join(nmDir, 'next/dist/compiled/react'),
        },
      },
      plugins: [
        new ConsumeSharedPlugin({
          experiments: { aliasConsumption: true },
          consumes: {
            // Configure consume only for a different layer
            react$B: {
              import: 'react',
              shareKey: 'react',
              shareScope: 'default',
              requiredVersion: false,
              issuerLayer: 'layer-B',
              layer: 'layer-B',
              allowNodeModulesSuffixMatch: true,
            },
          },
        }),
      ],
    });

    // Assign issuer layer to source module
    (compiler.options.module = compiler.options.module || {}).rules = [
      { test: /layerA2[\\/].*\.js$/, layer: 'layer-A' },
    ];

    const stats = await compile(compiler);
    expect(stats.hasErrors()).toBe(false);
    const json = stats.toJson({ modules: true });
    const consumeModules = (json.modules || []).filter(
      (m: any) => m.moduleType === 'consume-shared-module',
    );
    // No consume mapping should be created due to issuerLayer mismatch
    expect(consumeModules.length).toBe(0);
  });

  it('prefers matching issuerLayer when multiple consume configs exist', async () => {
    // Entry under layer "layer-A"
    const layerDir = path.join(srcDir, 'layerA3');
    fs.mkdirSync(layerDir, { recursive: true });
    fs.writeFileSync(
      path.join(layerDir, 'index.js'),
      ["import React from 'react';", 'console.log(!!React);'].join('\n'),
    );

    const compiler = createCompiler({
      context: testDir,
      entry: path.join(layerDir, 'index.js'),
      resolve: {
        alias: {
          react: path.join(nmDir, 'next/dist/compiled/react'),
        },
      },
      plugins: [
        new ConsumeSharedPlugin({
          experiments: { aliasConsumption: true },
          consumes: {
            react$B: {
              import: 'react',
              shareKey: 'react',
              shareScope: 'default',
              requiredVersion: false,
              issuerLayer: 'layer-B',
              layer: 'layer-B',
              allowNodeModulesSuffixMatch: true,
            },
            react$A: {
              import: 'react',
              shareKey: 'react',
              shareScope: 'default',
              requiredVersion: false,
              issuerLayer: 'layer-A',
              layer: 'layer-A',
              allowNodeModulesSuffixMatch: true,
            },
          },
        }),
      ],
    });

    (compiler.options.module = compiler.options.module || {}).rules = [
      { test: /layerA3[\\/].*\.js$/, layer: 'layer-A' },
    ];

    const stats = await compile(compiler);
    expect(stats.hasErrors()).toBe(false);
    const json = stats.toJson({ modules: true });
    const consumeModules = (json.modules || []).filter(
      (m: any) => m.moduleType === 'consume-shared-module',
    );
    expect(consumeModules.length).toBe(1);
    // Ensure the consume references the matching issuer layer in its readable name
    expect(String(consumeModules[0].name)).toContain('(layer-A)');
  });
});
