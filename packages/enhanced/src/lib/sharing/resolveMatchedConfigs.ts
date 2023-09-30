/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/
import type Compilation from 'webpack/lib/Compilation';
import type { ResolveOptionsWithDependencyType } from 'webpack/lib/ResolverFactory';
//@ts-ignore
import ModuleNotFoundError = require('webpack/lib/ModuleNotFoundError');
//@ts-ignore
import LazySet = require('webpack/lib/util/LazySet');

interface MatchedConfigs<T> {
  resolved: Map<string, T>;
  unresolved: Map<string, T>;
  prefixed: Map<string, T>;
}

const RESOLVE_OPTIONS: ResolveOptionsWithDependencyType = {
  dependencyType: 'esm',
};

export async function resolveMatchedConfigs<T>(
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
    //@ts-ignore
    configs.map(([request, config]) => {
      if (/^\.\.?(\/|$)/.test(request)) {
        // relative request
        return new Promise<void>((resolve) => {
          resolver.resolve(
            {},
            context,
            request,
            resolveContext,
            (err, result) => {
              if (err || result === false) {
                err = err || new Error(`Can't resolve ${request}`);
                compilation.errors.push(
                  new ModuleNotFoundError(null, err, {
                    name: `shared module ${request}`,
                  }),
                );
                return resolve();
              }
              resolved.set(result as string, config);
              resolve();
            },
          );
        });
      } else if (/^(\/|[A-Za-z]:\\|\\\\)/.test(request)) {
        // absolute path
        resolved.set(request, config);
      } else if (request.endsWith('/')) {
        // module request prefix
        prefixed.set(request, config);
      } else {
        // module request
        unresolved.set(request, config);
      }
    }),
  );
  compilation.contextDependencies.addAll(resolveContext.contextDependencies);
  compilation.fileDependencies.addAll(resolveContext.fileDependencies);
  compilation.missingDependencies.addAll(resolveContext.missingDependencies);
  return { resolved, unresolved, prefixed };
}
