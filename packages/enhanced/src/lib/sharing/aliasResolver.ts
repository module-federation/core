import type { Compilation } from 'webpack';
import type { ResolveOptionsWithDependencyType } from 'webpack/lib/ResolverFactory';

function matchPath(value: unknown, filePath: string): boolean {
  if (!value) return true;
  if (value instanceof RegExp) return value.test(filePath);
  if (typeof value === 'string') return filePath.startsWith(value);
  if (Array.isArray(value))
    return value.some((v) => matchPath(v as any, filePath));
  return true;
}

/**
 * Extract rule-specific resolve options (notably alias) for the given issuer path.
 * This approximates webpack's per-rule resolve by checking simple test/include/exclude.
 */
export function getRuleResolveForIssuer(
  compilation: Compilation,
  issuer?: string,
): ResolveOptionsWithDependencyType | null {
  if (!issuer) return null;
  const rules =
    (compilation.compiler.options.module &&
      compilation.compiler.options.module.rules) ||
    [];

  // Walk a (potentially) nested rules structure to accumulate matching resolve options
  const collectedAliases: Record<string, string | false | string[]> = {};

  const visitRules = (items: any[]): void => {
    for (const rule of items) {
      if (!rule) continue;
      // Handle nested ruleset constructs (oneOf, rules)
      if (Array.isArray(rule.oneOf)) visitRules(rule.oneOf);
      if (Array.isArray(rule.rules)) visitRules(rule.rules);

      const { test, include, exclude, resource } = rule as any;
      // Basic matching similar to webpack's RuleSet
      let matched = true;
      if (resource) {
        matched = matched && matchPath(resource, issuer);
      }
      if (test) {
        matched = matched && matchPath(test, issuer);
      }
      if (include) {
        matched = matched && matchPath(include, issuer);
      }
      if (exclude) {
        // If excluded, skip this rule
        if (matchPath(exclude, issuer)) matched = false;
      }

      if (!matched) continue;

      if (rule.resolve && rule.resolve.alias) {
        const alias = rule.resolve.alias as Record<string, any>;
        for (const [key, val] of Object.entries(alias)) {
          collectedAliases[key] = val as any;
        }
      }
    }
  };

  visitRules(rules as any[]);

  if (Object.keys(collectedAliases).length === 0) return null;

  const resolveOptions: ResolveOptionsWithDependencyType = {
    dependencyType: 'esm',
    alias: collectedAliases as any,
  };
  return resolveOptions;
}
