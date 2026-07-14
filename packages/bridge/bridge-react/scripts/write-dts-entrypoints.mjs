import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const entrypoints = {
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
