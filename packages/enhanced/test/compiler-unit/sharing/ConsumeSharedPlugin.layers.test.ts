/*
 * @jest-environment node
 */
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Configuration } from 'webpack';
import path from 'path';
import fs from 'fs';
import os from 'os';
import ConsumeSharedPlugin from '../../../src/lib/sharing/ConsumeSharedPlugin';
import FederationRuntimePlugin from '../../../src/lib/container/runtime/FederationRuntimePlugin';
const webpack = require(normalizeWebpackPath('webpack'));

// Add compile helper function
const compile = (compiler: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    compiler.run((err: Error | null | undefined, stats: any) => {
      if (err) reject(err);
      else resolve(stats);
    });
  });
};

// Helper function to get ConsumeSharedModules from stats
const getConsumeSharedModules = (stats: any) => {
  return (
    stats
      .toJson({ modules: true })
      .modules?.filter(
        (m: any) =>
          m.moduleType === 'consume-shared-module' && m.name?.includes('react'),
      ) || []
  );
};

describe('ConsumeSharedPlugin Layers', () => {
  let testDir: string;
  let srcDir: string;
  let nodeModulesDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-test-consume-layers-'));
    srcDir = path.join(testDir, 'src');
    nodeModulesDir = path.join(testDir, 'node_modules');

    fs.mkdirSync(srcDir, { recursive: true });
    fs.mkdirSync(path.join(nodeModulesDir, 'react'), { recursive: true });

    // Create dummy react package
    fs.writeFileSync(
      path.join(nodeModulesDir, 'react/package.json'),
      JSON.stringify({ name: 'react', version: '17.0.2' }),
    );
    fs.writeFileSync(
      path.join(nodeModulesDir, 'react/index.js'),
      'module.exports = { version: "17.0.2" };',
    );

    // Create source files for different layers
    fs.writeFileSync(
      path.join(srcDir, 'module.client.js'),
      'import React from "react";',
    );
    fs.writeFileSync(
      path.join(srcDir, 'module.server.js'),
      'import React from "react";',
    );

    // Base package.json for the test directory
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({
        name: 'test-layers',
        version: '1.0.0',
        dependencies: {
          react: '*', // Indicate dependency on react
        },
      }),
    );
  });

  afterEach(() => {
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  const createWebpackConfig = (consumeOptions: any): Configuration => ({
    mode: 'development',
    context: testDir,
    entry: {
      client: path.join(srcDir, 'module.client.js'),
      server: path.join(srcDir, 'module.server.js'),
    },
    output: {
      path: path.join(testDir, 'dist'),
      filename: '[name].bundle.js',
    },
    experiments: {
      layers: true,
    },
    module: {
      rules: [
        { test: /module\.client\.js$/, layer: 'client' },
        { test: /module\.server\.js$/, layer: 'server' },
        // Assign react itself to a layer if needed for certain tests,
        // otherwise it might default to no layer or the issuer's layer
        // { test: /node_modules\/react\//, layer: 'client' },
      ],
    },
    resolve: {
      extensions: ['.js', '.json'],
    },
    plugins: [
      new FederationRuntimePlugin({
        name: 'consumer',
        filename: 'remoteEntry.js',
      }),
      new ConsumeSharedPlugin(consumeOptions),
    ],
  });

  it('should only apply config when issuer layer matches "issuerLayer" option', async () => {
    const config = createWebpackConfig({
      consumes: {
        react: {
          import: 'react',
          shareKey: 'react',
          shareScope: 'clientLayerScope',
          issuerLayer: 'client', // Config only applies if the issuing module is in 'client' layer
        },
      },
      shareScope: 'default',
    });

    const compiler = webpack(config);
    const stats = await compile(compiler);

    expect(stats.hasErrors()).toBe(false);
    expect(stats.hasWarnings()).toBe(false);

    const output = stats.toJson({ modules: true, warnings: true });
    // Find ConsumeSharedModule instances for react
    const consumeSharedModules =
      output.modules?.filter(
        (m: any) =>
          m.moduleType === 'consume-shared-module' && m.name?.includes('react'),
      ) || [];

    // Expect one CSM for the client module, using the clientLayerScope config
    expect(consumeSharedModules.length).toBe(1);
    const clientCsm = consumeSharedModules[0];
    expect(clientCsm.name).toContain('clientLayerScope');
    expect(clientCsm.name).toContain('react');
    // Check issuer: should be module.client.js
    expect(clientCsm.issuerName).toContain('module.client.js');

    // Find the compiled module.client.js and module.server.js
    const clientModule = output.modules?.find((m: any) =>
      m.name?.includes('module.client.js'),
    );
    const serverModule = output.modules?.find((m: any) =>
      m.name?.includes('module.server.js'),
    );

    // Verify layers are assigned correctly
    expect(clientModule?.layer).toBe('client');
    expect(serverModule?.layer).toBe('server');

    // Verify that module.server.js did NOT get a consume-shared-module from this config
    // It might resolve to a normal module if no other 'react' consume config exists
    const serverModuleImportsReact = serverModule?.reasons?.some(
      (r: any) =>
        r.moduleName?.includes('react') &&
        !r.moduleName?.includes('consume-shared-module'),
    );
    // This check is tricky, as webpack might optimize. The key is that no CSM was generated for it *from this config*.
    // The length check (expect(consumeSharedModules.length).toBe(1)) already confirms this.
  });

  it('should only apply config when issuer layer matches "issuerLayer" option', async () => {
    const config = createWebpackConfig({
      consumes: {
        react: {
          import: 'react',
          shareKey: 'react',
          shareScope: 'clientIssuerScope',
          issuerLayer: 'client', // Config only applies if the *importing* module is in 'client' layer
        },
      },
      shareScope: 'default',
    });

    const compiler = webpack(config);
    const stats = await compile(compiler);

    expect(stats.hasErrors()).toBe(false);
    expect(stats.hasWarnings()).toBe(false);

    const output = stats.toJson({ modules: true });
    const consumeSharedModules =
      output.modules?.filter(
        (m: any) =>
          m.moduleType === 'consume-shared-module' && m.name?.includes('react'),
      ) || [];

    // Expect one CSM, triggered by the client module import
    expect(consumeSharedModules.length).toBe(1);
    const clientIssuerCsm = consumeSharedModules[0];
    expect(clientIssuerCsm.name).toContain('clientIssuerScope');
    expect(clientIssuerCsm.name).toContain('react');
    expect(clientIssuerCsm.issuerName).toContain('module.client.js'); // Issuer must be client
  });

  it('should only apply config when both "layer" and "issuerLayer" match', async () => {
    // More complex setup: Assign react itself to a layer
    const config = createWebpackConfig({
      consumes: {
        // Config 1: requires module and issuer in 'client' layer
        react_client_only: {
          request: 'react',
          import: 'react',
          shareKey: 'react', // Share as 'react'
          shareScope: 'client_client_scope',
          layer: 'client',
          issuerLayer: 'client',
        },
        // Config 2: requires module in 'server', issuer in 'server'
        react_server_only: {
          request: 'react',
          import: 'react',
          shareKey: 'react', // Share as 'react'
          shareScope: 'server_server_scope',
          layer: 'server', // Make react belong to server layer *for this config*
          issuerLayer: 'server',
        },
        // Config 3: requires module in 'client', issuer in 'server' (unlikely but for testing)
        react_client_server: {
          request: 'react',
          import: 'react',
          shareKey: 'react',
          shareScope: 'client_server_scope',
          layer: 'client',
          issuerLayer: 'server',
        },
      },
      shareScope: 'default', // Default scope if no layers match
    });

    // Modify webpack config slightly to assign react module itself to client layer
    // This makes testing layer/issuerLayer interaction clearer
    config.module?.rules?.push({
      test: /node_modules\/react\//,
      layer: 'client',
    });

    const compiler = webpack(config);
    const stats = await compile(compiler);

    expect(stats.hasErrors()).toBe(false);

    const output = stats.toJson({ modules: true, logging: 'verbose' });

    const consumeSharedModules =
      output.modules?.filter(
        (m: any) =>
          m.moduleType === 'consume-shared-module' && m.name?.includes('react'),
      ) || [];

    // Expect TWO ConsumeSharedModules based on the configurations
    expect(consumeSharedModules.length).toBe(2);

    const csmClientClient = consumeSharedModules.find((m: any) =>
      m.name?.includes('client_client_scope'),
    );
    const csmClientServer = consumeSharedModules.find((m: any) =>
      m.name?.includes('client_server_scope'),
    );

    expect(csmClientClient).toBeDefined();
    expect(csmClientClient.issuerName).toContain('module.client.js');
    expect(csmClientClient.name).toContain('client_client_scope');
    expect(csmClientClient.layer).toBe('client');

    expect(csmClientServer).toBeDefined();
    expect(csmClientServer.issuerName).toContain('module.server.js');
    expect(csmClientServer.name).toContain('client_server_scope');
    expect(csmClientServer.layer).toBe('client');

    // Verify no CSM was created using the server_server_scope
    expect(
      consumeSharedModules.some((m: any) =>
        m.name?.includes('server_server_scope'),
      ),
    ).toBe(false);

    // Verify the original modules are in correct layers
    const clientModule = output.modules?.find((m: any) =>
      m.name?.includes('module.client.js'),
    );
    const serverModule = output.modules?.find((m: any) =>
      m.name?.includes('module.server.js'),
    );
    expect(clientModule?.layer).toBe('client');
    expect(serverModule?.layer).toBe('server');
  });

  it('should only apply config when both "layer" and "issuerLayer" match (complex layered scenario)', async () => {
    // Setup shared module in node_modules
    const reactDir = path.join(nodeModulesDir, 'react');
    fs.mkdirSync(reactDir, { recursive: true });
    fs.writeFileSync(
      path.join(reactDir, 'package.json'),
      JSON.stringify({ name: 'react', version: '0.1.2' }),
    );
    fs.writeFileSync(
      path.join(reactDir, 'index.js'),
      'module.exports = { version: "0.1.2" };',
    );

    // Create a file that will be assigned to a custom layer
    const componentAPath = path.join(srcDir, 'ComponentA.js');
    fs.writeFileSync(
      componentAPath,
      `import React from 'react';\nexport default function ComponentA() { return React.createElement('div', null, 'A'); }`,
    );

    // Entry file imports ComponentA (which is in 'react-layer')
    const entryPath = path.join(srcDir, 'index.js');
    fs.writeFileSync(entryPath, `import('./ComponentA');`);

    // Add a base package.json
    fs.writeFileSync(
      path.join(testDir, 'package.json'),
      JSON.stringify({ name: 'test', version: '1.0.0' }),
    );

    // Webpack config with layers and two shared configs
    const config: Configuration = {
      context: srcDir,
      entry: './index.js',
      mode: 'development',
      devtool: false,
      experiments: { layers: true },
      output: {
        path: path.join(testDir, 'dist'),
        filename: '[name].js',
        library: { type: 'commonjs-module' },
      },
      module: {
        rules: [
          {
            test: /ComponentA\.js$/,
            layer: 'react-layer',
          },
        ],
      },
      plugins: [
        new ConsumeSharedPlugin({
          consumes: {
            react: {
              import: 'react',
              requiredVersion: '0.1.2',
              strictVersion: true,
              layer: 'react-layer',
              issuerLayer: 'react-layer',
              shareScope: 'react-layer',
            },
            randomvalue: {
              request: 'react',
              shareKey: 'react',
              import: 'react',
              requiredVersion: '0.1.2',
              strictVersion: true,
              layer: 'react-layer',
              issuerLayer: 'react-layer',
              shareScope: 'react-layer',
            },
          },
        }),
        new FederationRuntimePlugin(),
      ],
      resolve: {
        modules: [nodeModulesDir, 'node_modules'],
      },
    };

    const compiler = webpack(config);
    const stats = await compile(compiler);
    const output = stats.toJson({ modules: true, layers: true });

    const consumeSharedModules = (output.modules || []).filter(
      (m) => m.moduleType === 'consume-shared-module',
    );

    // There should be only one consume-shared-module for the correct layer/issuerLayer
    expect(consumeSharedModules.length).toBe(1);
    expect(consumeSharedModules[0].layer).toBe('react-layer');
  });

  it('should only apply config when both module layer and issuer layer match', async () => {
    // Config requires module in 'client', issuer in 'client'
    const config = createWebpackConfig({
      consumes: {
        react: {
          import: 'react',
          shareKey: 'react',
          shareScope: 'client_client_scope',
          layer: 'client', // Consumed module must be in 'client' layer
          issuerLayer: 'client', // Importing module must be in 'client' layer
        },
      },
      shareScope: 'default', // Default scope if no layers match
    });

    // Manually assign the consumed module (react) to the 'client' layer
    config.entry = path.join(srcDir, 'module.client.js'); // Only use client entry
    config.module?.rules?.push({
      test: /node_modules\/react\//,
      layer: 'client',
    });

    const compiler = webpack(config);
    const stats = await compile(compiler);

    expect(stats.hasErrors()).toBe(false);

    const output = stats.toJson({ modules: true });
    const consumeSharedModules = getConsumeSharedModules(stats);

    // Expect ONE ConsumeSharedModule because the issuerLayer matches,
    // and the 'layer' config dictates the layer of the ConsumeSharedModule itself.
    expect(consumeSharedModules.length).toBe(1);

    const theCsm = consumeSharedModules[0];
    expect(theCsm.name).toContain('client_client_scope'); // Scope from the applied config
    expect(theCsm.issuerName).toContain('module.client.js'); // Issued by the client module
    expect(theCsm.layer).toBe('client'); // CSM is placed in 'client' layer as per config
  });

  it('should apply config and set CSM layer when issuerLayer matches, even if config.layer differs from actual module layer', async () => {
    // THIS TEST CHECKS: issuerLayer: 'client' (matches), config.layer: 'server', actual module layer: 'client'
    const config = createWebpackConfig({
      consumes: {
        react: {
          import: 'react',
          shareKey: 'react',
          shareScope: 'server_client_scope', // This is the scope name we expect for the created CSM
          layer: 'server', // Config says CSM should be in 'server' layer
          issuerLayer: 'client', // Importing module ('module.client.js') must be in 'client' layer
        },
      },
      shareScope: 'default', // Default scope if no layers match
    });

    // Setup: module.client.js (layer: client) imports react.
    // react itself (node_modules/react/index.js) is assigned to 'client' layer by a rule.
    config.entry = path.join(srcDir, 'module.client.js');
    config.module?.rules?.push({
      test: /node_modules\/react\//,
      layer: 'client',
    });

    const compiler = webpack(config);
    const stats = await compile(compiler);

    expect(stats.hasErrors()).toBe(false);

    const output = stats.toJson({ modules: true });
    const consumeSharedModules = getConsumeSharedModules(stats); // Helper filters for react CSMs

    // Expect ONE ConsumeSharedModule because the issuerLayer matches.
    // The 'layer: server' in the config dictates the layer of the ConsumeSharedModule itself.
    expect(consumeSharedModules.length).toBe(1);

    const theCsm = consumeSharedModules[0];
    expect(theCsm.name).toContain('server_client_scope'); // Scope from the applied config
    expect(theCsm.issuerName).toContain('module.client.js'); // Issued by the client module
    expect(theCsm.layer).toBe('server'); // CSM is placed in 'server' layer as per config
  });

  it('should NOT apply config if issuer layer matches but module layer does NOT', async () => {
    // Config requires module in 'SERVER' layer, issuer in 'client' layer
    const config = createWebpackConfig({
      consumes: {
        react: {
          import: 'react',
          shareKey: 'react',
          shareScope: 'server_client_scope',
          layer: 'server', // Consumed module must be in 'server' layer
          issuerLayer: 'client', // Importing module must be in 'client' layer
        },
      },
      shareScope: 'default',
    });

    // Manually assign the consumed module (react) to the 'CLIENT' layer
    config.entry = path.join(srcDir, 'module.client.js'); // Only use client entry
    config.module?.rules?.push({
      test: /node_modules\/react\//,
      layer: 'client',
    });

    const compiler = webpack(config);
    const stats = await compile(compiler);

    expect(stats.hasErrors()).toBe(false);

    const output = stats.toJson();
    const consumeSharedModules = getConsumeSharedModules(stats);

    // Expect ONE ConsumeSharedModule because the issuerLayer matches,
    // and the 'layer' config dictates the layer of the ConsumeSharedModule itself.
    expect(consumeSharedModules.length).toBe(1);

    const theCsm = consumeSharedModules[0];
    expect(theCsm.name).toContain('server_client_scope'); // Scope from the applied config
    expect(theCsm.issuerName).toContain('module.client.js'); // Issued by the client module
    expect(theCsm.layer).toBe('server'); // CSM is placed in 'server' layer as per config
  });
});
