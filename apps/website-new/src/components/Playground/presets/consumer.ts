import type { SourceFile } from '../bundler';
import { RSPACK_CONFIG } from '../bundler';
import type { PlaygroundState } from '../state';

function normalizeProducerName(state: PlaygroundState): string {
  return state.producer.name || 'playground_provider';
}

function normalizeHostName(state: PlaygroundState): string {
  return state.consumer.build.hostName || 'playground_consumer';
}

function normalizeRemoteAlias(state: PlaygroundState): string {
  return state.consumer.build.remoteAlias || 'playground_remote';
}

function normalizeExposedModule(state: PlaygroundState): string {
  return state.consumer.runtime.exposedModule || './Button';
}

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Module Federation Host Preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

function buildRuntimeHostConfig(): string {
  const lines: string[] = [
    "import * as rspack from '@rspack/browser';",
    '',
    'const config = {',
    '  mode: "development",',
    '  devtool: false,',
    '  entry: "./index.tsx",',
    '  module: {',
    '    rules: [',
    '      {',
    '        test: /\\.tsx?$/,',
    '        use: {',
    "          loader: 'builtin:swc-loader',",
    '          options: {',
    '            jsc: {',
    '              target: "es2017",',
    '              parser: {',
    '                syntax: "typescript",',
    '                tsx: true,',
    '              },',
    '              transform: {',
    '                react: {',
    '                  runtime: "automatic",',
    '                },',
    '              },',
    '            },',
    '          },',
    '        },',
    '      },',
    '    ],',
    '  },',
    '};',
    '',
    'export default config;',
  ];

  return lines.join('\n');
}

function buildPluginHostConfig(
  state: PlaygroundState,
  remoteEntryUrl: string,
): string {
  const hostName = normalizeHostName(state);
  const remoteAlias = normalizeRemoteAlias(state);
  const remoteName = normalizeProducerName(state);
  const remoteUrl =
    remoteEntryUrl ||
    state.consumer.build.remoteEntryUrl ||
    'http://localhost:3001/remoteEntry.js';

  const lines: string[] = [
    "import * as rspack from '@rspack/browser';",
    '',
    'const config = {',
    '  mode: "development",',
    '  devtool: false,',
    '  entry: "./index.tsx",',
    '  module: {',
    '    rules: [',
    '      {',
    '        test: /\\.tsx?$/,',
    '        use: {',
    "          loader: 'builtin:swc-loader',",
    '          options: {',
    '            jsc: {',
    '              target: "es2017",',
    '              parser: {',
    '                syntax: "typescript",',
    '                tsx: true,',
    '              },',
    '              transform: {',
    '                react: {',
    '                  runtime: "automatic",',
    '                },',
    '              },',
    '            },',
    '          },',
    '        },',
    '      },',
    '    ],',
    '  },',
    '  plugins: [',
    '    new rspack.container.ModuleFederationPlugin({',
    `      name: '${hostName}',`,
    '      remotes: {',
    `        ${remoteAlias}: '${remoteName}@${remoteUrl}',`,
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
  ];

  return lines.join('\n');
}

function createRuntimeHostEntry(
  state: PlaygroundState,
  manifestUrl: string,
): string {
  const hostName = normalizeHostName(state);
  const remoteName =
    state.consumer.runtime.remoteName || normalizeProducerName(state);
  const exposed = normalizeExposedModule(state);
  const id = `${remoteName}/${exposed.replace(/^\.\//, '')}`;
  const url =
    manifestUrl ||
    state.consumer.runtime.manifestUrl ||
    'http://localhost:3001/mf-manifest.json';

  return [
    "import React, { useEffect, useState } from 'react';",
    "import { createRoot } from 'react-dom/client';",
    "import { createInstance } from '@module-federation/enhanced/runtime';",
    '',
    'const mf = createInstance({',
    `  name: '${hostName}',`,
    '  remotes: [',
    '    {',
    `      name: '${remoteName}',`,
    `      entry: '${url}',`,
    '    },',
    '  ],',
    '});',
    '',
    'const App: React.FC = () => {',
    '  const [RemoteComponent, setRemoteComponent] = useState<React.ComponentType | null>(null);',
    '  const [error, setError] = useState<string | null>(null);',
    '',
    '  useEffect(() => {',
    '    let cancelled = false;',
    '',
    '    async function load() {',
    '      try {',
    `        const mod: any = await mf.loadRemote('${id}');`,
    '        const Comp = mod && (mod.default || mod);',
    '        if (!cancelled) {',
    '          setRemoteComponent(() => Comp as React.ComponentType);',
    '        }',
    '      } catch (e) {',
    '        if (!cancelled) {',
    '          setError(e instanceof Error ? e.message : String(e));',
    '        }',
    '      }',
    '    }',
    '',
    '    load();',
    '',
    '    return () => {',
    '      cancelled = true;',
    '    };',
    '  }, []);',
    '',
    '  if (error) {',
    '    return <div>Failed to load remote: {error}</div>;',
    '  }',
    '',
    '  if (!RemoteComponent) {',
    '    return <div>Loading remote...</div>;',
    '  }',
    '',
    '  return (',
    '    <main>',
    `      <h1>Runtime host consuming ${id}</h1>`,
    '      <RemoteComponent />',
    '    </main>',
    '  );',
    '};',
    '',
    'const container = document.getElementById("root");',
    'if (container) {',
    '  const root = createRoot(container);',
    '  root.render(<App />);',
    '}',
  ].join('\n');
}

function createPluginHostEntry(state: PlaygroundState): string {
  const alias = normalizeRemoteAlias(state);
  const exposed = normalizeExposedModule(state);
  const moduleId = `${alias}/${exposed.replace(/^\.\//, '')}`;

  return [
    "import React from 'react';",
    "import { createRoot } from 'react-dom/client';",
    '',
    `const RemoteComponent = React.lazy(() => import('${moduleId}'));`,
    '',
    'const App: React.FC = () => {',
    '  return (',
    '    <main>',
    `      <h1>Build-time host consuming ${moduleId}</h1>`,
    '      <React.Suspense fallback="Loading remote...">',
    '        <RemoteComponent />',
    '      </React.Suspense>',
    '    </main>',
    '  );',
    '};',
    '',
    'const container = document.getElementById("root");',
    'if (container) {',
    '  const root = createRoot(container);',
    '  root.render(<App />);',
    '}',
  ].join('\n');
}

export function createConsumerRuntimeSourceFiles(
  state: PlaygroundState,
  manifestUrl: string,
): SourceFile[] {
  const files: SourceFile[] = [];

  files.push({ filename: RSPACK_CONFIG, text: buildRuntimeHostConfig() });
  files.push({ filename: 'index.html', text: HTML_TEMPLATE });
  files.push({
    filename: 'index.tsx',
    text: createRuntimeHostEntry(state, manifestUrl),
  });

  return files;
}

export function createConsumerBuildSourceFiles(
  state: PlaygroundState,
  remoteEntryUrl: string,
): SourceFile[] {
  const files: SourceFile[] = [];

  files.push({
    filename: RSPACK_CONFIG,
    text: buildPluginHostConfig(state, remoteEntryUrl),
  });
  files.push({ filename: 'index.html', text: HTML_TEMPLATE });
  files.push({ filename: 'index.tsx', text: createPluginHostEntry(state) });

  return files;
}
