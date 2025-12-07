import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { normalizeRuntimePlugins } from './utils.js';

const require = createRequire(import.meta.url);
const MF_RUNTIME_PACKAGES = [
  '@module-federation/runtime',
  '@module-federation/runtime-core',
  '@module-federation/sdk',
  '@module-federation/webpack-bundler-runtime',
];

/**
 * Rspeedy-friendly wrapper around the standard Rsbuild Module Federation plugin.
 *
 * - Forces the Lynx runtime plugin so remotes load through `lynx.requireModuleAsync`
 *   instead of DOM JSONP.
 * - Leaves user-provided MF options untouched.
 */
export function pluginModuleFederationRspeedy(options = {}) {
  const { runtimePlugins, ...rest } = options;

  const mfPlugin = pluginModuleFederation(
    {
      ...rest,
      runtimePlugins: normalizeRuntimePlugins(runtimePlugins),
    },
    {
      // Rspeedy uses a single environment; keeping the default environment name
      // ensures manifests line up with the runtime.
      environment: rest.environment || 'mf',
    },
  );

  // Wrap the original plugin so we can add Lynx-specific transpilation hints.
  return {
    name: 'rspeedy:module-federation',
    setup(api) {
      api.modifyBundlerChain((chain) => {
        const mfRuntimeRule = chain.module.rule('rspeedy:mf-runtime-transpile');
        mfRuntimeRule
          .test(
            /([\\/]@module-federation[\\/](runtime|runtime-core|sdk|webpack-bundler-runtime)[\\/]|[\\/]webpack-bundler-runtime[\\/]).*\\.(js|cjs|mjs)$/,
          )
          .use('swc')
          .loader('builtin:swc-loader')
          .options({
            jsc: {
              parser: { syntax: 'ecmascript' },
              target: 'es2019',
            },
          });
      });

      // Ensure the MF runtime libraries are transpiled for the main-thread bundle
      // so operators like `??=` are down-leveled for Lepus.
      api.modifyRsbuildConfig((config, { mergeRsbuildConfig }) => {
        const mfRuntimeDirs =
          MF_RUNTIME_PACKAGES.map(pathDirOf).filter(Boolean);

        const include = Array.isArray(config.source?.include)
          ? config.source.include.slice()
          : config.source?.include
            ? [config.source.include]
            : [];

        mfRuntimeDirs.forEach((dir) => {
          if (!include.includes(dir)) {
            include.push(dir);
          }
        });

        return mergeRsbuildConfig(config, {
          source: {
            include,
          },
        });
      });

      mfPlugin.setup(api);
    },
  };
}

export default pluginModuleFederationRspeedy;

function pathDirOf(pkgName) {
  try {
    const pkgPath = require.resolve(`${pkgName}/package.json`);
    return pkgPath && pkgPath.replace(/\/package\.json$/, '');
  } catch {
    if (pkgName === '@module-federation/webpack-bundler-runtime') {
      // Workspace fallback when the bundler runtime is linked but not published.
      try {
        const pkgUrl = new URL(
          '../../webpack-bundler-runtime',
          import.meta.url,
        );
        return fileURLToPath(pkgUrl);
      } catch {
        // ignore
      }
    }
    return undefined;
  }
}
