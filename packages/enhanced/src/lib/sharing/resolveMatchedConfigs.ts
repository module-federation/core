/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Compilation } from 'webpack';
import type { ResolveOptionsWithDependencyType } from 'webpack/lib/ResolverFactory';
import type { ConsumeOptions } from '../../declarations/plugins/sharing/ConsumeSharedModule';

const ModuleNotFoundError = require(
  normalizeWebpackPath('webpack/lib/ModuleNotFoundError'),
) as typeof import('webpack/lib/ModuleNotFoundError');
const LazySet = require(
  normalizeWebpackPath('webpack/lib/util/LazySet'),
) as typeof import('webpack/lib/util/LazySet');

const RELATIVE_REQUEST_REGEX = /^\.\.?(\/|$)/;
const ABSOLUTE_PATH_REGEX = /^(\/|[A-Za-z]:\\|\\\\)/;

interface MatchedConfigs<T> {
  resolved: Map<string, T>;
  unresolved: Map<string, T>;
  prefixed: Map<string, T>;
}

const RESOLVE_OPTIONS: ResolveOptionsWithDependencyType = {
  dependencyType: 'esm',
};

function createCompositeKey(request: string, config: ConsumeOptions): string {
  const layer = config.issuerLayer;
  if (layer) {
    return `(${layer})${request}`;
  }
  return request;
}

export async function resolveMatchedConfigs<T extends ConsumeOptions>(
  compilation: Compilation,
  configs: [string, T][],
): Promise<MatchedConfigs<T>> {
  const resolved = new Map<string, T>();
  const unresolved = new Map<string, T>();
  const prefixed = new Map<string, T>();
  const resolveContext = {
    fileDependencies: new LazySet<string>(),
    contextDependencies: new LazySet<string>(),
    missingDependencies: new LazySet<string>(),
  };
  const resolver = compilation.resolverFactory.get('normal', RESOLVE_OPTIONS);
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
              resolve();
            },
          );
        });
      } else if (ABSOLUTE_PATH_REGEX.test(resolveRequest)) {
        // absolute path
        resolved.set(resolveRequest, config);
        return undefined;
      } else if (resolveRequest.endsWith('/')) {
        // module request prefix
        const key = createCompositeKey(resolveRequest, config);
        prefixed.set(key, config);
        return undefined;
      } else {
        // module request
        const key = createCompositeKey(resolveRequest, config);
        unresolved.set(key, config);
        return undefined;
      }
    }),
  );
  compilation.contextDependencies.addAll(resolveContext.contextDependencies);
  compilation.fileDependencies.addAll(resolveContext.fileDependencies);
  compilation.missingDependencies.addAll(resolveContext.missingDependencies);
  return { resolved, unresolved, prefixed };
}
