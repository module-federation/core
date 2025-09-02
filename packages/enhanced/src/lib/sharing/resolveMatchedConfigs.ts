/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Compilation } from 'webpack';
import type { ResolveOptionsWithDependencyType } from 'webpack/lib/ResolverFactory';
import type { ConsumeOptions } from '../../declarations/plugins/sharing/ConsumeSharedModule';
import { logAliasDebug } from './aliasResolver';

// Note: require webpack internals lazily inside the function so Jest mocks
// can intercept them in unit tests.

const RELATIVE_REQUEST_REGEX = /^\.\.?(\/|$)/;
const ABSOLUTE_PATH_REGEX = /^(\/|[A-Za-z]:\\|\\\\)/;

interface MatchedConfigs<T> {
  resolved: Map<string, T>;
  unresolved: Map<string, T>;
  prefixed: Map<string, T>;
}

// Do not hardcode/override user resolve options. ResolverFactory merges
// user's configured aliases via its internal hooks.
const BASE_RESOLVE_OPTIONS: ResolveOptionsWithDependencyType = {
  dependencyType: 'esm',
};

function createCompositeKey(request: string, config: ConsumeOptions): string {
  // disabling layer as fallback so that we can use issuerLayer to match
  // this way we can catch unlayered requests and default them to another layer
  // example react -> layered react without (layer)react
  const layer = config.issuerLayer; //|| config.layer;
  if (layer) {
    return `(${layer})${request}`;
  }
  return request;
}

export async function resolveMatchedConfigs<T extends ConsumeOptions>(
  compilation: Compilation,
  configs: [string, T][],
): Promise<MatchedConfigs<T>> {
  const ModuleNotFoundError = require(
    normalizeWebpackPath('webpack/lib/ModuleNotFoundError'),
  ) as typeof import('webpack/lib/ModuleNotFoundError');
  const LazySet = require(
    normalizeWebpackPath('webpack/lib/util/LazySet'),
  ) as typeof import('webpack/lib/util/LazySet');
  const resolved = new Map<string, T>();
  const unresolved = new Map<string, T>();
  const prefixed = new Map<string, T>();
  const resolveContext = {
    fileDependencies: new LazySet<string>(),
    contextDependencies: new LazySet<string>(),
    missingDependencies: new LazySet<string>(),
  };
  const resolver = compilation.resolverFactory.get(
    'normal',
    BASE_RESOLVE_OPTIONS,
  );
  const context = compilation.compiler.context;

  await Promise.all(
    configs.map(([request, config]) => {
      const resolveRequest = config.request || request;
      if (RELATIVE_REQUEST_REGEX.test(resolveRequest)) {
        // relative request
        return new Promise<void>((resolve) => {
          resolver.resolve(
            {},
            context,
            resolveRequest,
            resolveContext,
            (err, result) => {
              if (err || result === false) {
                err = err || new Error(`Can't resolve ${resolveRequest}`);
                compilation.errors.push(
                  new ModuleNotFoundError(null, err, {
                    name: `shared module ${resolveRequest}`,
                  }),
                );
                return resolve();
              }
              resolved.set(result as string, config);
              logAliasDebug('resolveMatchedConfigs resolved', {
                req: resolveRequest,
                to: result,
                shareKey: config.shareKey,
              });
              resolve();
            },
          );
        });
      } else if (ABSOLUTE_PATH_REGEX.test(resolveRequest)) {
        // absolute path
        resolved.set(resolveRequest, config);
        logAliasDebug('resolveMatchedConfigs absolute', {
          req: resolveRequest,
          shareKey: config.shareKey,
        });
        return undefined;
      } else if (resolveRequest.endsWith('/')) {
        // module request prefix
        const key = createCompositeKey(resolveRequest, config);
        prefixed.set(key, config);
        logAliasDebug('resolveMatchedConfigs prefixed', {
          req: resolveRequest,
          key,
          shareKey: config.shareKey,
        });
        return undefined;
      } else {
        // module request
        const key = createCompositeKey(resolveRequest, config);
        unresolved.set(key, config);
        logAliasDebug('resolveMatchedConfigs unresolved', {
          req: resolveRequest,
          key,
          shareKey: config.shareKey,
        });
        return undefined;
      }
    }),
  );
  compilation.contextDependencies.addAll(resolveContext.contextDependencies);
  compilation.fileDependencies.addAll(resolveContext.fileDependencies);
  compilation.missingDependencies.addAll(resolveContext.missingDependencies);

  return { resolved, unresolved, prefixed };
}
