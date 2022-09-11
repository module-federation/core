import type { WebpackOptionsNormalized } from 'webpack';

type Module = WebpackOptionsNormalized['module'];
type Rules = Module['rules'];
type RuleSetRuleUnion = Rules[0];

type RuleSetRule = Extract<RuleSetRuleUnion, { loader?: string }>;
type Loader = Extract<RuleSetRule['use'], { loader?: string }>;

/**
 * Inject a loader into the current module rule.
 * This function mutates `rule` argument!
 */
export function injectRuleLoader(rule: RuleSetRuleUnion, loader: Loader = {}) {
  if (rule !== '...') {
    if (rule.loader) {
      rule.use = [loader, { loader: rule.loader, options: rule.options }];
      delete rule.loader;
      delete rule.options;
    } else if (rule.use) {
      rule.use = [loader, ...(rule.use as any[])];
    }
  }
}

/**
 * Check that current module rule has a loader with the provided name.
 */
export function hasLoader(rule: RuleSetRuleUnion, loaderName: string) {
  if (rule !== '...') {
    if (rule.loader === loaderName) {
      return true;
    } else if (rule.use && Array.isArray(rule.use)) {
      for (let i = 0; i < rule.use.length; i++) {
        const loader = rule.use[i];
        // check exact name, eg "url-loader" or its path "node_modules/url-loader/dist/cjs.js"
        if (
          typeof loader !== 'string' &&
          typeof loader !== 'function' &&
          loader.loader &&
          (loader.loader === loaderName ||
            loader.loader.includes(`/${loaderName}/`))
        ) {
          return true;
        }
      }
    }
  }
  return false;
}
