import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspace = createRequire(resolve(directory, '../../../package.json'));
const { build } = workspace('esbuild');

for (const format of ['esm', 'cjs']) {
  for (const entry of ['server', 'v18', 'v19']) {
    const server = entry === 'server';
    const file = resolve(
      directory,
      `dist/${entry}.${format === 'esm' ? 'es' : 'cjs'}.js`,
    );
    const result = await build({
      stdin: {
        resolveDir: directory,
        contents: `export { createBridgeComponent } from ${JSON.stringify(file)}`,
      },
      bundle: true,
      write: false,
      metafile: true,
      treeShaking: true,
      platform: server ? 'node' : 'browser',
      format,
      packages: 'external',
    });
    const text = result.outputFiles[0].text;
    const imports = Object.values(result.metafile.outputs).flatMap((output) =>
      output.imports.map((item) => item.path),
    );
    if (server) {
      assert(
        !imports.some((path) => path.startsWith('react-dom/client')),
        `${entry}/${format} imported a DOM renderer`,
      );
      assert(
        !/hydrateRoot|rootMap/.test(text),
        `${entry}/${format} retained the browser Root lifecycle`,
      );
      assert(
        text.includes('normalizeBridgeSSR'),
        'Node provider lost stream normalization',
      );
    } else {
      assert(
        !imports.some((path) =>
          /^(node:|acorn$|htmlparser2$|react-dom\/server)/.test(path),
        ),
        `${entry}/${format} imported Node rendering dependencies`,
      );
      assert(
        !text.includes('normalizeBridgeSSR') &&
          !text.includes('module-federation/bridge-ssr/producer/v1'),
        `${entry}/${format} retained producer stream processing`,
      );
      assert(
        !text.includes('bridgeInfo.renderStream'),
        `${entry}/${format} retained the Node lifecycle`,
      );
      assert(text.includes('hydrateRoot'), 'Browser provider lost hydration');
    }
    console.log(`${entry}/${format}: runtime boundary passed`);
  }
}
