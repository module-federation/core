import type { Compilation, Compiler, NormalModule } from 'webpack';
import { createRequire } from 'module';
import path from 'path';
import {
  collectServerActionModules,
  getServerReferencesMap,
} from './serverActionUtils';

const nodeRequire = createRequire(import.meta.url);
const { getWebpackPath, normalizeWebpackPath } = nodeRequire(
  '@module-federation/sdk/normalize-webpack-path',
);

function collectServerActionModulesFromCompilation(compilation: Compilation) {
  const modules = new Set<string>();
  if (!compilation || !compilation.modules) return modules;

  for (const mod of compilation.modules) {
    if (
      isNormalModule(mod) &&
      mod.buildInfo &&
      mod.buildInfo.rscDirective === 'use server' &&
      typeof mod.resource === 'string'
    ) {
      modules.add(mod.resource);
    }
  }

  return modules;
}

function isNormalModule(mod: unknown): mod is NormalModule {
  return !!mod && typeof mod === 'object' && 'resource' in mod;
}

type ClientServerActionsBootstrapPluginOptions = {
  entryName?: string;
};

export default class ClientServerActionsBootstrapPlugin {
  entryName: string;

  constructor(options: ClientServerActionsBootstrapPluginOptions = {}) {
    this.entryName = options.entryName || 'main';
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);

    compiler.hooks.finishMake.tapPromise(
      'ClientServerActionsBootstrapPlugin',
      async (compilation: Compilation) => {
        if (compilation.compiler.parentCompilation) {
          return;
        }
        const { getEntryRuntime } = nodeRequire(
          normalizeWebpackPath('webpack/lib/util/runtime'),
        ) as typeof import('webpack/lib/util/runtime');

        let SingleEntryDependency;
        try {
          // webpack >= 5.98
          SingleEntryDependency = nodeRequire(
            normalizeWebpackPath(
              'webpack/lib/dependencies/SingleEntryDependency',
            ),
          );
        } catch (_e) {
          // webpack <= 5.97
          SingleEntryDependency = nodeRequire(
            normalizeWebpackPath('webpack/lib/dependencies/EntryDependency'),
          );
        }

        let actionModules =
          collectServerActionModulesFromCompilation(compilation);
        if (!actionModules || actionModules.size === 0) {
          const serverReferencesMap = getServerReferencesMap(compiler);
          actionModules = collectServerActionModules(serverReferencesMap);
        }
        if (!actionModules || actionModules.size === 0) {
          return;
        }

        const runtime = getEntryRuntime(compilation, this.entryName);
        const includes = [...actionModules].map(
          (modulePath) =>
            new Promise<void>((resolve, reject) => {
              const absolutePath = path.isAbsolute(modulePath)
                ? modulePath
                : path.resolve(compiler.context, modulePath);
              let relativePath = path.relative(compiler.context, absolutePath);
              if (!relativePath.startsWith('.')) {
                relativePath = `./${relativePath}`;
              }
              const request = relativePath.split(path.sep).join('/');
              const dep = new SingleEntryDependency(request);
              dep.loc = { name: 'rsc-client-server-action-include' };
              compilation.addInclude(
                compiler.context,
                dep,
                { name: this.entryName },
                (err, mod) => {
                  if (err) return reject(err);
                  if (mod) {
                    try {
                      compilation.moduleGraph
                        .getExportsInfo(mod)
                        .setUsedInUnknownWay(runtime);
                    } catch (_e) {
                      // best effort: don't fail build if webpack internals change
                    }
                  }
                  resolve();
                },
              );
            }),
        );

        await Promise.all(includes);
      },
    );
  }
}
