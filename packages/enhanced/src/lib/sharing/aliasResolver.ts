import type { Compilation } from 'webpack';
import type { ResolveOptionsWithDependencyType } from 'webpack/lib/ResolverFactory';
import { extractPathAfterNodeModules } from './utils';

// Cache to avoid repeated alias resolutions within a compilation
const aliasCache: WeakMap<Compilation, Map<string, string>> = new WeakMap();

export function logAliasDebug(..._args: any[]) {}

/**
 * Resolve a request using webpack's resolverFactory so that user aliases
 * (from resolve.alias and rules[].resolve.alias) are applied.
 * Falls back to the original request on error.
 */
export function resolveWithAlias(
  compilation: Compilation,
  context: string,
  request: string,
  resolveOptions?: ResolveOptionsWithDependencyType,
): Promise<string> {
  const keyBase = `${context}::${request}`;
  let map = aliasCache.get(compilation);
  if (!map) {
    map = new Map();
    aliasCache.set(compilation, map);
  }
  const cacheKey = resolveOptions
    ? `${keyBase}::${JSON.stringify(Object.keys(resolveOptions).sort())}`
    : keyBase;

  const cached = map.get(cacheKey);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const resolver = compilation.resolverFactory.get('normal', {
      dependencyType: 'esm',
      ...(resolveOptions || {}),
    });
    const resolveContext = {} as any;
    resolver.resolve({}, context, request, resolveContext, (err, result) => {
      if (err) {
        logAliasDebug('resolve error - falling back', {
          context,
          request,
          err: String(err),
        });
        resolve(request);
        return;
      }
      const output = (result || request) as string;
      logAliasDebug('resolved', { context, request, resolved: output });
      map!.set(cacheKey, output);
      resolve(output);
    });
  });
}

/**
 * Convert an absolute resolved path into a share key-like request by
 * extracting the part after node_modules and stripping common index files
 * and extensions. Returns null when conversion is not possible.
 */
export function toShareKeyFromResolvedPath(
  resolvedPath: string,
): string | null {
  const afterNM = extractPathAfterNodeModules(resolvedPath);
  if (!afterNM) return null;

  // Normalize path separators to forward slashes for matching
  let p = afterNM.replace(/\\/g, '/');

  // Strip /index.(js|mjs|cjs|ts|tsx|jsx)
  p = p.replace(/\/(index\.(?:m?jsx?|cjs|mjs|tsx?))$/i, '');

  // Also strip common extensions when the request targets a file directly
  p = p.replace(/\.(m?jsx?|cjs|mjs|tsx?)$/i, '');

  // Remove any leading ./ or / that may sneak in (shouldn't after extract)
  p = p.replace(/^\/?\.\//, '').replace(/^\//, '');

  const key = p || null;
  logAliasDebug('toShareKeyFromResolvedPath', { resolvedPath, afterNM, key });
  return key;
}

type Rule = {
  test?: RegExp | ((s: string) => boolean);
  include?: string | RegExp | (string | RegExp)[];
  exclude?: string | RegExp | (string | RegExp)[];
  oneOf?: Rule[];
  rules?: Rule[];
  resolve?: ResolveOptionsWithDependencyType & { alias?: any };
};

function matchCondition(cond: any, file: string): boolean {
  if (!cond) return true;
  if (typeof cond === 'function') return !!cond(file);
  if (cond instanceof RegExp) return cond.test(file);
  if (Array.isArray(cond)) return cond.some((c) => matchCondition(c, file));
  if (typeof cond === 'string') return file.startsWith(cond);
  return false;
}

function ruleMatchesFile(rule: Rule, file: string): boolean {
  if (rule.test && !matchCondition(rule.test, file)) return false;
  if (rule.include && !matchCondition(rule.include, file)) return false;
  if (rule.exclude && matchCondition(rule.exclude, file)) return false;
  return true;
}

function findRuleResolveForFile(
  rules: Rule[] | undefined,
  file: string,
): ResolveOptionsWithDependencyType | undefined {
  if (!rules) return undefined;
  for (const r of rules) {
    if (r.oneOf) {
      const nested = findRuleResolveForFile(r.oneOf, file);
      if (nested) return nested;
    }
    if (r.rules) {
      const nested = findRuleResolveForFile(r.rules, file);
      if (nested) return nested;
    }
    if (r.resolve && ruleMatchesFile(r, file)) {
      return r.resolve as ResolveOptionsWithDependencyType;
    }
  }
  return undefined;
}

/**
 * Best-effort: get rule-specific resolve options for an issuer file, so that
 * alias resolution mirrors webpack's rule-based resolve.alias behavior.
 */
export function getRuleResolveForIssuer(
  compilation: Compilation,
  issuer: string | undefined,
): ResolveOptionsWithDependencyType | undefined {
  if (!issuer) return undefined;
  // @ts-ignore - access via compiler.options
  const rules = compilation.compiler?.options?.module?.rules as
    | Rule[]
    | undefined;
  return findRuleResolveForFile(rules, issuer);
}
