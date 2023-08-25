import type { RuleSetRuleUnion, Loader } from '@module-federation/utilities';

/**
 * Inject a loader into the current module rule.
 * This function mutates `rule` argument!
 */
export function injectRuleLoader(rule: RuleSetRuleUnion, loader: Loader = {}) {
  if (rule !== '...') {
    //@ts-ignore
    if (rule.loader) {
      //@ts-ignore
      rule.use = [loader, { loader: rule.loader, options: rule.options }];
      //@ts-ignore

      delete rule.loader;
      //@ts-ignore

      delete rule.options;
      //@ts-ignore

    } else if (rule.use) {
      //@ts-ignore

      rule.use = [loader, ...(rule.use as any[])];
    }
  }
}

/**
 * Check that current module rule has a loader with the provided name.
 */
export function hasLoader(rule: RuleSetRuleUnion, loaderName: string) {
  if (rule !== '...') {
    //@ts-ignore
    if (rule.loader === loaderName) {
      return true;
      //@ts-ignore
    } else if (rule.use && Array.isArray(rule.use)) {
      //@ts-ignore
      for (let i = 0; i < rule.use.length; i++) {
        //@ts-ignore
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
