// With --base-packages, exercise actual built plugins and Bridge artifacts from
// both revisions. Without it, package tests verify the current combination.
import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  symlinkSync,
  rmSync,
  readFileSync,
  existsSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const packages = resolve(import.meta.dirname, '../packages');
const baseIndex = process.argv.indexOf('--base-packages');
const baseline =
  baseIndex < 0 ? undefined : resolve(process.argv[baseIndex + 1]);
const combinations = [
  {
    label: 'current plugin/current Bridge',
    plugin: packages,
    bridge: packages,
  },
];
if (baseline)
  combinations.push(
    { label: 'old plugin/new Bridge', plugin: baseline, bridge: packages },
    { label: 'new plugin/old Bridge', plugin: packages, bridge: baseline },
  );
for (const { label, plugin, bridge } of combinations) {
  const fixture = mkdtempSync(join(tmpdir(), 'bridge-alias-compat-'));
  try {
    mkdirSync(join(fixture, 'node_modules/@module-federation'), {
      recursive: true,
    });
    symlinkSync(
      resolve(bridge, 'bridge/bridge-react'),
      join(fixture, 'node_modules/@module-federation/bridge-react'),
      'dir',
    );
    const Plugin = require(
      resolve(plugin, 'bridge/bridge-react-webpack-plugin/dist/index.cjs.js'),
    );
    const resolveFixture = createRequire(join(fixture, 'package.json'));
    for (const version of [5, 6, 7]) {
      const originalRouter = resolve(
        packages,
        `bridge/bridge-react-webpack-plugin/__tests__/mockRouterDir/router-v${version}/${version === 7 ? 'react-router' : 'react-router-dom'}`,
      );
      let applied = false;
      const compiler = {
        context: fixture,
        options: { resolve: { alias: { 'react-router-dom': originalRouter } } },
        hooks: {
          afterEnvironment: {
            tap(_name, callback) {
              applied = true;
              callback();
            },
          },
        },
      };
      new Plugin({ moduleFederationOptions: {} }).apply(compiler);
      assert(applied);
      const alias = compiler.options.resolve.alias['react-router-dom$'];
      assert(
        alias,
        `${label}/v${version}: existsSync gate silently skipped the alias`,
      );
      const resolved = resolveFixture.resolve(alias);
      assert(existsSync(resolved));
      // Also compile the actual physical file for consumers whose webpack
      // configuration bypasses package exports, as the README has documented.
      const file = resolve(
        bridge,
        'bridge/bridge-react',
        alias.replace('@module-federation/bridge-react/', ''),
      );
      const result = await build({
        entryPoints: [file],
        bundle: true,
        write: false,
        metafile: true,
        platform: 'browser',
        format: 'esm',
        packages: 'external',
      });
      assert(result.outputFiles[0].contents.length > 0);
      const inputs = Object.keys(result.metafile.inputs);
      if (bridge === packages) {
        assert(
          inputs.some((input) => input.endsWith(`router-v${version}.mjs`)),
          `${label}: legacy alias did not reach the current ESM implementation`,
        );
      }
      console.log(
        `${label}/v${version}: plugin hook, alias resolution and browser build passed`,
      );
    }
    // Enhanced and Rspack's existing disabled-router path and the documented
    // physical router path must still resolve, without selecting Node exports.
    for (const name of ['base', 'router']) {
      const file = resolve(bridge, 'bridge/bridge-react', `dist/${name}.es.js`);
      assert(existsSync(file));
      const result = await build({
        entryPoints: [file],
        bundle: true,
        write: false,
        platform: 'browser',
        format: 'esm',
        packages: 'external',
      });
      assert(!result.outputFiles[0].text.includes('BridgeSSRContext'));
    }
    if (bridge === packages) {
      const manifest = JSON.parse(
        readFileSync(
          resolve(bridge, 'bridge/bridge-react/package.json'),
          'utf8',
        ),
      );
      for (const [name, entry] of Object.entries(manifest.exports)) {
        // Router adapters require application-specific peer aliases; their
        // ESM build paths are exercised above for all supported versions.
        if (typeof entry !== 'object' || name.startsWith('./router')) continue;
        // Native CJS forwarding preserves the exact entry object identity.
        if (name.includes('*')) continue;
        const current = entry.require?.default;
        if (current) {
          const legacy = current.replace(/\.cjs$/, '.cjs.js');
          assert.strictEqual(
            require(resolve(bridge, 'bridge/bridge-react', legacy)),
            require(resolve(bridge, 'bridge/bridge-react', current)),
          );
        }
      }
    }
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
}
