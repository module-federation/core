import type { SourceFile } from '../bundler';
import { RSPACK_CONFIG } from '../bundler';
import type {
  ProducerConfigState,
  ProducerExpose,
  ProducerShared,
} from '../state';

const DEFAULT_PRODUCER_NAME = 'playground_provider';

function normalizeProducerName(producer: ProducerConfigState): string {
  return producer.name || DEFAULT_PRODUCER_NAME;
}

function normalizeFilename(producer: ProducerConfigState): string {
  return producer.filename || 'remoteEntry.js';
}

function normalizeImportPath(importPath: string, fallback: string): string {
  const trimmed = importPath.trim();
  const value = trimmed || fallback;
  return value.replace(/^\.\//, '');
}

function buildExposesObject(exposes: ProducerExpose[]): string {
  const usable = exposes.filter((item) => item.moduleName && item.importPath);
  if (!usable.length) {
    return '        exposes: {},';
  }

  const lines = usable.map((item) => {
    return `        '${item.moduleName}': '${item.importPath}',`;
  });

  return ['        exposes: {', ...lines, '        },'].join('\n');
}

function buildSharedObject(shared: ProducerShared[]): string {
  const usable = shared.filter((item) => item.packageName);
  if (!usable.length) {
    return '        shared: {},';
  }

  const blocks = usable.map((item) => {
    const inner: string[] = [];
    inner.push(`        '${item.packageName}': {`);
    inner.push(`          singleton: ${item.singleton ? 'true' : 'false'},`);
    inner.push(`          eager: ${item.eager ? 'true' : 'false'},`);
    if (item.requiredVersion) {
      inner.push(`          requiredVersion: '${item.requiredVersion}',`);
    }
    inner.push('        },');
    return inner.join('\n');
  });

  return ['        shared: {', ...blocks, '        },'].join('\n');
}

function buildManifestJson(producer: ProducerConfigState): string {
  const exposes: Record<string, unknown> = {};
  producer.exposes.forEach((expose) => {
    if (!expose.moduleName || !expose.importPath) {
      return;
    }
    exposes[expose.moduleName] = {
      path: expose.importPath,
      description: expose.description || undefined,
    };
  });

  const shared: Record<string, unknown> = {};
  producer.shared.forEach((item) => {
    if (!item.packageName) {
      return;
    }
    shared[item.packageName] = {
      singleton: item.singleton,
      eager: item.eager,
      requiredVersion: item.requiredVersion || undefined,
    };
  });

  const manifest = {
    name: normalizeProducerName(producer),
    version: producer.version || '1.0.0',
    remoteEntry: normalizeFilename(producer),
    exposes,
    shared,
  };

  return JSON.stringify(manifest, null, 2);
}

function buildProducerConfig(producer: ProducerConfigState): string {
  const name = normalizeProducerName(producer);
  const filename = normalizeFilename(producer);
  const exposes = buildExposesObject(producer.exposes);
  const shared = buildSharedObject(producer.shared);

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
    `      name: '${name}',`,
    `      filename: '${filename}',`,
    exposes,
    shared,
    '    }),',
    '  ],',
    '};',
    '',
    'export default config;',
  ];

  return lines.join('\n');
}

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Module Federation Producer Preview</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

function createEntrySource(moduleName: string, importPath: string): string {
  const cleanedModuleName = moduleName || './Button';

  return [
    "import React from 'react';",
    "import { createRoot } from 'react-dom/client';",
    `import RemoteComponent from './${importPath.replace(/^\.\//, '')}';`,
    '',
    'const App = () => {',
    '  return (',
    '    <main>',
    `      <h1>Producer: ${cleanedModuleName}</h1>`,
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

function createComponentSource(expose: ProducerExpose): string {
  const label = expose.moduleName || './Button';

  return [
    "import React from 'react';",
    '',
    'const Button: React.FC = () => {',
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
    `      Remote button from ${label}`,
    '    </button>',
    '  );',
    '};',
    '',
    'export default Button;',
  ].join('\n');
}

export function createProducerSourceFiles(
  producer: ProducerConfigState,
): SourceFile[] {
  const files: SourceFile[] = [];

  const configCode = buildProducerConfig(producer);
  files.push({ filename: RSPACK_CONFIG, text: configCode });

  files.push({ filename: 'index.html', text: HTML_TEMPLATE });

  const firstExpose = producer.exposes.find(
    (item) => item.moduleName && item.importPath,
  );
  const defaultImportPath = 'src/components/Button.tsx';
  const importPath = firstExpose
    ? normalizeImportPath(firstExpose.importPath, defaultImportPath)
    : defaultImportPath;
  const moduleName = firstExpose?.moduleName || './Button';

  files.push({
    filename: 'index.tsx',
    text: createEntrySource(moduleName, importPath),
  });

  const seenPaths = new Set<string>();
  producer.exposes.forEach((expose) => {
    if (!expose.importPath) {
      return;
    }
    const normalizedPath = normalizeImportPath(
      expose.importPath,
      defaultImportPath,
    );
    if (seenPaths.has(normalizedPath)) {
      return;
    }
    seenPaths.add(normalizedPath);
    files.push({
      filename: normalizedPath,
      text: createComponentSource(expose),
    });
  });

  if (producer.manifestEnabled) {
    const rawPath = producer.manifestPath || './dist';
    const dir = rawPath.replace(/^\.\//, '');
    const manifestFilename = dir
      ? `${dir}/mf-manifest.json`
      : 'mf-manifest.json';
    const manifestText = buildManifestJson(producer);
    files.push({ filename: manifestFilename, text: manifestText });
  }

  return files;
}
