import type { RuleSetRuleUnion, Loader } from '@module-federation/utilities';

/**
 * This function injects a loader into the current module rule.
 * Note: This function mutates the `rule` argument.
 *
 * @param {RuleSetRuleUnion} rule - The current module rule.
 * @param {Loader} [loader={}] - The loader to be injected.
 */
export function injectRuleLoader(rule: RuleSetRuleUnion, loader: Loader = {}) {
  if (rule !== '...') {
    const _rule = rule as {
      loader?: string;
      use?: (Loader | string)[];
      options?: any;
    };
    if (_rule.loader) {
      _rule.use = [loader, { loader: _rule.loader, options: _rule.options }];
      delete _rule.loader;
      delete _rule.options;
    } else if (_rule.use) {
      _rule.use = [loader, ...(_rule.use as any[])];
    }
  }
}

/**
 * This function checks if the current module rule has a loader with the provided name.
 *
 * @param {RuleSetRuleUnion} rule - The current module rule.
 * @param {string} loaderName - The name of the loader to check.
 * @returns {boolean} Returns true if the current module rule has a loader with the provided name, otherwise false.
 */
export function hasLoader(rule: RuleSetRuleUnion, loaderName: string) {
  if (rule !== '...') {
    const _rule = rule as {
      loader?: string;
      use?: (Loader | string)[];
      options?: any;
    };
    if (_rule.loader === loaderName) {
      return true;
    } else if (_rule.use && Array.isArray(_rule.use)) {
      for (let i = 0; i < _rule.use.length; i++) {
        const loader = _rule.use[i];
        // check exact name, eg "url-loader" or its path "node_modules/url-loader/dist/cjs.js"
        if (
          typeof loader !== 'string' &&
          typeof loader !== 'function' &&
          loader.loader &&
          (loader.loader === loaderName ||
            loader.loader.includes(`/${loaderName}/`))
        ) {
          return true;
        } else if (typeof loader === 'string') {
          if (loader === loaderName || loader.includes(`/${loaderName}/`)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}
