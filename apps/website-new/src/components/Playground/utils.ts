import type {
  PlaygroundState,
  ProducerConfigState,
  ProducerExpose,
  ProducerShared,
} from './state';

const DEFAULT_PRODUCER_NAME = 'playground_provider';
const DEFAULT_HOST_NAME = 'playground_consumer';

function normalizeProducerName(producer: ProducerConfigState): string {
  return producer.name || DEFAULT_PRODUCER_NAME;
}

function normalizeFilename(producer: ProducerConfigState): string {
  return producer.filename || 'remoteEntry.js';
}

function buildExposesConfig(exposes: ProducerExpose[], indent: string): string {
  const usable = exposes.filter((item) => item.moduleName && item.importPath);
  if (!usable.length) {
    return `${indent}exposes: {},`;
  }

  const lines = usable.map(
    (item) => `${indent}  "${item.moduleName}": "${item.importPath}",`,
  );

  return [`${indent}exposes: {`, ...lines, `${indent}},`].join('\n');
}

function buildSharedConfig(shared: ProducerShared[], indent: string): string {
  const usable = shared.filter((item) => item.packageName);
  if (!usable.length) {
    return `${indent}shared: {},`;
  }

  const blocks = usable.map((item) => {
    const inner: string[] = [];
    inner.push(`${indent}  "${item.packageName}": {`);
    inner.push(`${indent}    singleton: ${item.singleton ? 'true' : 'false'},`);
    inner.push(`${indent}    eager: ${item.eager ? 'true' : 'false'},`);
    if (item.requiredVersion) {
      inner.push(`${indent}    requiredVersion: "${item.requiredVersion}",`);
    }
    inner.push(`${indent}  },`);
    return inner.join('\n');
  });

  return [`${indent}shared: {`, ...blocks, `${indent}},`].join('\n');
}

function buildManifestConfig(
  producer: ProducerConfigState,
  indent: string,
): string {
  if (!producer.manifestEnabled) {
    return '';
  }
  const filePath = producer.manifestPath || './dist';
  const fileName = 'mf-manifest.json';

  return [
    `${indent}manifest: {`,
    `${indent}  filePath: '${filePath}',`,
    `${indent}  fileName: '${fileName}',`,
    `${indent}},`,
  ].join('\n');
}

function generateWebpackProducerConfig(producer: ProducerConfigState): string {
  const name = normalizeProducerName(producer);
  const filename = normalizeFilename(producer);
  const indent = '      ';
  const exposes = buildExposesConfig(producer.exposes, indent);
  const shared = buildSharedConfig(producer.shared, indent);
  const manifest = buildManifestConfig(producer, indent);

  const lines: string[] = [
    "const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');",
    '',
    'module.exports = {',
    '  devServer: {',
    '    port: 2000,',
    '  },',
    '  output: {',
    "    publicPath: 'http://localhost:2000/',",
    '  },',
    '  plugins: [',
    '    new ModuleFederationPlugin({',
    `      name: '${name}',`,
    `      filename: '${filename}',`,
    exposes,
    shared,
  ];

  if (manifest) {
    lines.push(manifest);
  }

  lines.push('    }),', '  ],', '};');

  return lines.filter(Boolean).join('\n');
}

function generateRspackProducerConfig(producer: ProducerConfigState): string {
  const name = normalizeProducerName(producer);
  const filename = normalizeFilename(producer);
  const indent = '      ';
  const exposes = buildExposesConfig(producer.exposes, indent);
  const shared = buildSharedConfig(producer.shared, indent);
  const manifest = buildManifestConfig(producer, indent);

  const lines: string[] = [
    "import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';",
    "import type { Configuration } from '@rspack/core';",
    '',
    'const config: Configuration = {',
    '  plugins: [',
    '    new ModuleFederationPlugin({',
    `      name: '${name}',`,
    `      filename: '${filename}',`,
    exposes,
    shared,
  ];

  if (manifest) {
    lines.push(manifest);
  }

  lines.push('    }),', '  ],', '};', '', 'export default config;');

  return lines.filter(Boolean).join('\n');
}

function generateViteProducerConfig(producer: ProducerConfigState): string {
  const name = normalizeProducerName(producer);
  const filename = normalizeFilename(producer);
  const indent = '      ';
  const exposes = buildExposesConfig(producer.exposes, indent);
  const shared = buildSharedConfig(producer.shared, indent);
  const manifestLine = producer.manifestEnabled
    ? `${indent}manifest: true,`
    : '';

  const lines: string[] = [
    "import { defineConfig } from 'vite';",
    "import { federation } from '@module-federation/vite';",
    '',
    'export default defineConfig({',
    '  plugins: [',
    '    federation({',
    `      name: '${name}',`,
    `      filename: '${filename}',`,
    exposes,
    shared,
  ];

  if (manifestLine) {
    lines.push(manifestLine);
  }

  lines.push('    }),', '  ],', '});');

  return lines.filter(Boolean).join('\n');
}

function generateRsbuildProducerConfig(producer: ProducerConfigState): string {
  const name = normalizeProducerName(producer);
  const indent = '      ';
  const exposes = buildExposesConfig(producer.exposes, indent);
  const shared = buildSharedConfig(producer.shared, indent);
  const manifest = buildManifestConfig(producer, indent);

  const lines: string[] = [
    "import { defineConfig } from '@rsbuild/core';",
    "import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';",
    '',
    'export default defineConfig({',
    '  plugins: [',
    '    pluginModuleFederation({',
    `      name: '${name}',`,
    exposes,
    shared,
  ];

  if (manifest) {
    lines.push(manifest);
  }

  lines.push('    }),', '  ],', '});');

  return lines.filter(Boolean).join('\n');
}

function generateWebpackConsumerConfig(state: PlaygroundState): string {
  const { producer, consumer } = state;
  const hostName = consumer.build.hostName || DEFAULT_HOST_NAME;
  const remoteAlias = consumer.build.remoteAlias || 'playground_remote';
  const remoteName = normalizeProducerName(producer);
  const remoteEntryUrl =
    consumer.build.remoteEntryUrl || 'http://localhost:3001/remoteEntry.js';

  return [
    "const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');",
    '',
    'module.exports = {',
    '  plugins: [',
    '    new ModuleFederationPlugin({',
    `      name: '${hostName}',`,
    '      remotes: {',
    `        ${remoteAlias}: '${remoteName}@${remoteEntryUrl}',`,
    '      },',
    '      shared: {',
    '        react: { singleton: true },',
    "        'react-dom': { singleton: true },",
    '      },',
    '    }),',
    '  ],',
    '};',
  ].join('\n');
}

function generateRspackConsumerConfig(state: PlaygroundState): string {
  const { producer, consumer } = state;
  const hostName = consumer.build.hostName || DEFAULT_HOST_NAME;
  const remoteAlias = consumer.build.remoteAlias || 'playground_remote';
  const remoteName = normalizeProducerName(producer);
  const remoteEntryUrl =
    consumer.build.remoteEntryUrl || 'http://localhost:3001/remoteEntry.js';

  return [
    "import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';",
    "import type { Configuration } from '@rspack/core';",
    '',
    'const config: Configuration = {',
    '  plugins: [',
    '    new ModuleFederationPlugin({',
    `      name: '${hostName}',`,
    '      remotes: {',
    `        ${remoteAlias}: '${remoteName}@${remoteEntryUrl}',`,
    '      },',
    '      shared: {',
    '        react: { singleton: true },',
    "        'react-dom': { singleton: true },",
    '      },',
    '    }),',
    '  ],',
    '};',
    '',
    'export default config;',
  ].join('\n');
}

function generateViteConsumerConfig(state: PlaygroundState): string {
  const { producer, consumer } = state;
  const remoteAlias = consumer.build.remoteAlias || 'playground_remote';
  const remoteName = normalizeProducerName(producer);
  const remoteEntryUrl =
    consumer.build.remoteEntryUrl || 'http://localhost:3001/remoteEntry.js';

  return [
    "import { defineConfig } from 'vite';",
    "import { federation } from '@module-federation/vite';",
    '',
    'export default defineConfig({',
    '  plugins: [',
    '    federation({',
    "      name: 'playground_consumer',",
    '      remotes: {',
    `        ${remoteAlias}: '${remoteName}@${remoteEntryUrl}',`,
    '      },',
    '      shared: {',
    '        react: { singleton: true },',
    "        'react-dom': { singleton: true },",
    '      },',
    '    }),',
    '  ],',
    '});',
  ].join('\n');
}

function generateRsbuildConsumerConfig(state: PlaygroundState): string {
  const { producer, consumer } = state;
  const hostName = consumer.build.hostName || DEFAULT_HOST_NAME;
  const remoteAlias = consumer.build.remoteAlias || 'playground_remote';
  const remoteName = normalizeProducerName(producer);
  const remoteEntryUrl =
    consumer.build.remoteEntryUrl || 'http://localhost:3001/remoteEntry.js';

  return [
    "import { defineConfig } from '@rsbuild/core';",
    "import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';",
    '',
    'export default defineConfig({',
    '  server: {',
    '    port: 3000,',
    '  },',
    '  plugins: [',
    '    pluginModuleFederation({',
    `      name: '${hostName}',`,
    '      remotes: {',
    `        ${remoteAlias}: '${remoteName}@${remoteEntryUrl}',`,
    '      },',
    '      shared: {',
    '        react: { singleton: true },',
    "        'react-dom': { singleton: true },",
    '      },',
    '    }),',
    '  ],',
    '});',
  ].join('\n');
}

export function generateProducerConfigSnippet(
  producer: ProducerConfigState,
): string {
  switch (producer.buildTool) {
    case 'rspack':
      return generateRspackProducerConfig(producer);
    case 'vite':
      return generateViteProducerConfig(producer);
    case 'rsbuild':
      return generateRsbuildProducerConfig(producer);
    case 'webpack':
    default:
      return generateWebpackProducerConfig(producer);
  }
}

export function generateConsumerConfigSnippet(state: PlaygroundState): string {
  switch (state.producer.buildTool) {
    case 'rspack':
      return generateRspackConsumerConfig(state);
    case 'vite':
      return generateViteConsumerConfig(state);
    case 'rsbuild':
      return generateRsbuildConsumerConfig(state);
    case 'webpack':
    default:
      return generateWebpackConsumerConfig(state);
  }
}

export function generateManifestSnippet(state: PlaygroundState): string {
  const { producer } = state;

  const exposes: Record<string, unknown> = {};
  producer.exposes.forEach((expose) => {
    if (!expose.moduleName || !expose.importPath) return;
    exposes[expose.moduleName] = {
      path: expose.importPath,
      description: expose.description || undefined,
    };
  });

  const shared: Record<string, unknown> = {};
  producer.shared.forEach((item) => {
    if (!item.packageName) return;
    shared[item.packageName] = {
      singleton: item.singleton,
      eager: item.eager,
      requiredVersion: item.requiredVersion || undefined,
    };
  });

  const manifest = {
    name: normalizeProducerName(producer),
    version: producer.version || '1.0.0',
    exposes,
    shared,
  };

  return JSON.stringify(manifest, null, 2);
}

export function generateRuntimeUsageSnippet(state: PlaygroundState): string {
  const { producer, consumer } = state;
  const hostName = consumer.build.hostName || DEFAULT_HOST_NAME;
  const remoteName =
    consumer.runtime.remoteName || normalizeProducerName(producer);
  const exposed = consumer.runtime.exposedModule || './Button';
  const manifestUrl =
    consumer.runtime.manifestUrl || 'http://localhost:3001/mf-manifest.json';
  const id = `${remoteName}/${exposed.replace(/^\.\//, '')}`;

  return [
    "import { createInstance } from '@module-federation/enhanced/runtime';",
    '',
    'const mf = createInstance({',
    `  name: '${hostName}',`,
    '  remotes: [',
    '    {',
    `      name: '${remoteName}',`,
    `      entry: '${manifestUrl}',`,
    '    },',
    '  ],',
    '});',
    '',
    'export async function loadPlaygroundButton() {',
    `  const mod = await mf.loadRemote('${id}');`,
    '  const anyModule: any = mod;',
    '  const Button = anyModule.default || anyModule;',
    '  return Button;',
    '}',
  ].join('\n');
}

export function generatePluginConsumerUsageSnippet(
  state: PlaygroundState,
): string {
  const alias = state.consumer.build.remoteAlias || 'playground_remote';
  const exposed = state.consumer.runtime.exposedModule || './Button';
  const moduleId = `${alias}/${exposed.replace(/^\.\//, '')}`;

  return [
    "import React from 'react';",
    '',
    `const RemoteButton = React.lazy(() => import('${moduleId}'));`,
    '',
    'export function App() {',
    '  return (',
    '    <React.Suspense fallback="Loading remote button...">',
    '      <RemoteButton />',
    '    </React.Suspense>',
    '  );',
    '}',
  ].join('\n');
}

export function generateProducerComponentSnippet(
  producer: ProducerConfigState,
): string {
  const firstExpose = producer.exposes[0];
  const moduleName = firstExpose?.moduleName || './Button';

  return [
    "import React from 'react';",
    '',
    `export const Button = () => {`,
    '  return (',
    '    <button',
    '      style={{',
    "        padding: '8px 12px',",
    '        borderRadius: 6,',
    "        border: '1px solid #e5e7eb',",
    "        background: '#0f172a',",
    "        color: '#f9fafb',",
    "        cursor: 'pointer',",
    '      }}',
    '    >',
    `      Remote button from ${moduleName}`,
    '    </button>',
    '  );',
    '};',
  ].join('\n');
}
