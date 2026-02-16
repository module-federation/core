import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = resolve(__dirname, '../templates');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readText(relativePath) {
  return readFileSync(resolve(templatesDir, relativePath), 'utf-8');
}

function verifyRslibConfig() {
  const config = readText('lib-common/rslib.config.ts');

  assert(
    config.includes("import { pluginPublint } from 'rsbuild-plugin-publint';"),
    'lib-common/rslib.config.ts must import pluginPublint',
  );

  assert(
    config.includes('pluginPublint()'),
    'lib-common/rslib.config.ts must include pluginPublint() in plugins',
  );
}

function verifyTemplatePackage(relativePath) {
  const text = readText(relativePath);
  const pkg = JSON.parse(text);
  const exportsRoot = pkg?.exports?.['.'] || {};

  assert(
    pkg?.devDependencies?.['rsbuild-plugin-publint'],
    `${relativePath} must declare rsbuild-plugin-publint`,
  );

  assert(
    exportsRoot.types === './dist/esm/index.d.ts',
    `${relativePath} exports["."].types must point to ./dist/esm/index.d.ts`,
  );

  assert(
    exportsRoot.import === './dist/esm/index.js',
    `${relativePath} exports["."].import must point to ./dist/esm/index.js`,
  );

  assert(
    exportsRoot.require === './dist/cjs/index.cjs',
    `${relativePath} exports["."].require must point to ./dist/cjs/index.cjs`,
  );

  assert(
    pkg.module === './dist/esm/index.js',
    `${relativePath} module must point to ./dist/esm/index.js`,
  );

  assert(
    pkg.types === './dist/esm/index.d.ts',
    `${relativePath} types must point to ./dist/esm/index.d.ts`,
  );
}

function main() {
  verifyRslibConfig();
  verifyTemplatePackage('provider-rslib-ts/package.json.handlebars');
  verifyTemplatePackage('provider-rslib-storybook-ts/package.json.handlebars');
  console.log('create-module-federation rslib template checks passed');
}

main();
