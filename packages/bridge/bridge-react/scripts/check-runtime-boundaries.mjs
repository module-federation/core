import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
      `dist/${entry}.${format === 'esm' ? 'mjs' : 'cjs'}`,
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

for (const format of ['esm', 'cjs']) {
  for (const entry of ['base', 'index']) {
    for (const server of [false, true]) {
      const name = `${entry}${server ? '.node' : ''}`;
      const file = resolve(
        directory,
        `dist/${name}.${format === 'esm' ? 'mjs' : 'cjs'}`,
      );
      const result = await build({
        stdin: {
          resolveDir: directory,
          contents: `export { createReactRemote, ReactRemote } from ${JSON.stringify(file)}`,
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
          `${name}/${format} imported a DOM renderer`,
        );
        assert(
          !/claimRemoteHydration|hydrateRemoteRoot|ownerRef/.test(text),
          `${name}/${format} retained the browser mount lifecycle`,
        );
        assert(
          text.includes('BridgeSSRContext'),
          'Node consumer lost request registration',
        );
      } else {
        assert(
          !imports.some((path) =>
            /^(node:|acorn$|htmlparser2$|react-dom\/server)/.test(path),
          ),
          `${name}/${format} imported Node rendering dependencies`,
        );
        assert(
          !text.includes('BridgeSSRContext'),
          `${name}/${format} retained Node request registration`,
        );
        assert(
          text.includes('hydrateRemoteRoot'),
          'Browser consumer lost independent hydration',
        );
      }
      console.log(`${name}/${format}: consumer runtime boundary passed`);
    }
  }
}

// ESM consumers of the fixed APIs must not pay for the unified dispatcher or
// the other renderer. CJS entry objects expose all exports and are not a
// downstream tree-shaking contract.
for (const entry of ['base', 'index']) {
  for (const server of [false, true]) {
    for (const api of ['createRemoteAppComponent', 'createLazyComponent']) {
      const name = `${entry}${server ? '.node' : ''}`;
      const result = await build({
        stdin: {
          resolveDir: directory,
          contents: `export { ${api} } from ${JSON.stringify(resolve(directory, `dist/${name}.mjs`))}`,
        },
        bundle: true,
        write: false,
        treeShaking: true,
        platform: server ? 'node' : 'browser',
        format: 'esm',
        packages: 'external',
      });
      const source = result.outputFiles[0].text;
      assert(
        !source.includes('createConsumer'),
        `${name}/${api} retained the unified consumer`,
      );
      if (api === 'createRemoteAppComponent') {
        assert(
          !source.includes('createLazyComponentResource'),
          `${name}/${api} retained the plain component loader`,
        );
      } else {
        assert(
          !source.includes('RemoteAppWrapper'),
          `${name}/${api} retained the Bridge renderer`,
        );
        assert(
          !source.includes('BridgeSSRContext'),
          `${name}/${api} retained Bridge SSR registration`,
        );
      }
      console.log(`${name}/${api}: independent ESM tree shaking passed`);
    }
  }
}

// The public Parser export is bundled once, without htmlparser2's unused DOM
// convenience APIs and the second entities table pulled in by dom-serializer.
for (const format of ['es', 'cjs']) {
  const graph = JSON.parse(
    readFileSync(
      resolve(directory, `dist/build-modules.${format}.json`),
      'utf8',
    ),
  );
  const modules = Object.values(graph).flatMap((chunk) => Object.keys(chunk));
  assert.equal(
    modules.filter((id) => /htmlparser2.*\/Parser\.js$/.test(id)).length,
    1,
  );
  assert(
    modules.some((id) => /entities@6.*decode-data-html/.test(id)),
    'Parser lost its entity decoder',
  );
  assert(
    !modules.some((id) =>
      /domhandler|domutils|dom-serializer|entities@4/.test(id),
    ),
    'Parser retained unused DOM utilities',
  );
  console.log(`${format}: public Parser dependency boundary passed`);
}
