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
  if (config.issuerLayer) {
    return `(${config.issuerLayer})${request}`;
    // layer unlikely to be used, issuerLayer is what factorize provides
    // which is what we need to create a matching key for
  } else if (config.layer) {
    return `(${config.layer})${request}`;
  } else {
    return request;
  }
}

export async function resolveMatchedConfigs<T extends ConsumeOptions>(
  compilation: Compilation,
  configs: [string, T][],
): Promise<MatchedConfigs<T>> {
  console.log('[resolveMatchedConfigs] Starting with configs count:', configs.length);

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
      console.log(`[resolveMatchedConfigs] Processing ${request}:`, {
        hasInclude: !!config.include,
        includeDetails: config.include,
        actualRequest: config.request || request
      });

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
        console.log(`[resolveMatchedConfigs-DEBUG] Adding to prefixed: key='${key}'`, { config });
        prefixed.set(key, config);
        return undefined;
      } else {
        // module request
        const key = createCompositeKey(resolveRequest, config);
        console.log(`[resolveMatchedConfigs-DEBUG] Adding to unresolved: key='${key}'`, { config });
        unresolved.set(key, config);
        return undefined;
      }
    }),
  );
  compilation.contextDependencies.addAll(resolveContext.contextDependencies);
  compilation.fileDependencies.addAll(resolveContext.fileDependencies);
  compilation.missingDependencies.addAll(resolveContext.missingDependencies);

  // Log the final statistics
  console.log('[resolveMatchedConfigs] Final counts:', {
    resolvedCount: resolved.size,
    unresolvedCount: unresolved.size,
    prefixedCount: prefixed.size
  });

  // Sample log a few prefix entries for debugging include/exclude
  const prefixEntries = Array.from(prefixed.entries());
  if (prefixEntries.length > 0) {
    console.log('[resolveMatchedConfigs] Sample prefix entries:');
    prefixEntries.slice(0, Math.min(5, prefixEntries.length)).forEach(([key, config]) => {
      console.log(`  - Prefix ${key}:`, {
        hasInclude: !!config.include,
        includeDetails: config.include
      });
    });
  }

  return { resolved, unresolved, prefixed };
}
