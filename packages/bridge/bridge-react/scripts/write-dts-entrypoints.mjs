import { mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const entrypoints = {
  'dist/service-runtime-plugin.d.ts': [
    "export { default } from './service/runtime-plugin';",
  ],
  'dist/service-runtime-plugin.node.d.ts': [
    "export { default } from './service/runtime-plugin.node';",
  ],
  'dist/plugin.d.ts': [
    "export { default } from './provider/plugin';",
    "export * from './provider/plugin';",
  ],
  'dist/router.d.ts': ["export * from './router/default';"],
  'dist/router-v5.d.ts': ["export * from './router/v5';"],
  'dist/router-v6.d.ts': ["export * from './router/v6';"],
  'dist/router-v7.d.ts': ["export * from './router/v7';"],
  'dist/lazy-load-component-plugin.d.ts': [
    "export { default } from './plugins/lazy-load-component-plugin';",
    "export * from './plugins/lazy-load-component-plugin';",
  ],
  'dist/lazy-utils.d.ts': ["export * from './lazy/utils';"],
  'dist/data-fetch-utils.d.ts': ["export * from './lazy/data-fetch';"],
  'dist/data-fetch-server-middleware.d.ts': [
    "export { default } from './lazy/data-fetch/data-fetch-server-middleware';",
  ],
  'dist/size-limited-cache.d.ts': [
    "export * from './shared/size-limited-cache';",
  ],
};

for (const [file, lines] of Object.entries(entrypoints)) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${lines.join('\n')}\n`);
}

// ESM wrappers share the canonical declaration tree with CommonJS. Copying
// the tree would duplicate global declarations and nominal cache/enum types
// when a program consumes both formats in the same compilation.
for (const file of await readdir('dist')) {
  if (!file.endsWith('.d.ts')) continue;
  const source = await readFile(`dist/${file}`, 'utf8');
  const target = `./${file.replace(/\.d\.ts$/, '.js')}`;
  const lines = [`export * from '${target}';`];
  if (/export\s+(?:default|\{\s*default\s*\})/.test(source)) {
    lines.push(
      `declare const defaultExport: typeof import('${target}').default;`,
      'export default defaultExport;',
    );
  }
  await writeFile(
    `dist/${file.replace(/\.d\.ts$/, '.d.mts')}`,
    `${lines.join('\n')}\n`,
  );
}
