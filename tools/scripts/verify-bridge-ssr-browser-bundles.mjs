#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const roots =
  process.env.BRIDGE_SSR_REMOTE_BUNDLER === 'vite'
    ? [
        'apps/bridge-ssr-demo/remote-vue/dist-vite/assets',
        'apps/bridge-ssr-demo/remote-vue/dist-vite/remoteEntry.js',
      ]
    : [
        'apps/bridge-ssr-demo/remote-react/dist/static',
        'apps/bridge-ssr-demo/remote-vue/dist/static',
      ];
const forbidden = [
  'react-dom/server',
  '@vue/server-renderer',
  'export-app.server',
];

async function files(directory) {
  if ((await stat(directory)).isFile()) return [directory];
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const target = path.join(directory, entry.name);
        return entry.isDirectory() ? files(target) : [target];
      }),
    )
  ).flat();
}

for (const root of roots) {
  for (const file of await files(root)) {
    if (!/\.(?:js|mjs|cjs)$/.test(file)) continue;
    const source = await readFile(file, 'utf8');
    for (const token of forbidden) {
      if (source.includes(token)) {
        throw new Error(
          `Browser bundle ${file} contains server-only token ${token}`,
        );
      }
    }
  }
}
console.log(
  '[bridge-ssr] browser bundles exclude server-only renderers and preparation',
);
