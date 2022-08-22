/**
 * Inject a loader into the current module rule.
 * This function mutates `rule` argument!
 */
module.exports.injectRuleLoader = function injectRuleLoader(rule, loader) {
  if (rule.loader) {
    rule.use = [loader, { loader: rule.loader, options: rule.options }];
    delete rule.loader;
    delete rule.options;
  } else if (rule.use) {
    rule.use = [loader, ...rule.use];
  }
};

/**
 * Check that current module rule has a loader with the provided name.
 */
module.exports.hasLoader = function hasLoader(rule, loaderName) {
  if (rule.loader === loaderName) {
    return true;
  } else if (rule.use) {
    for (let i = 0; i < rule.use.length; i++) {
      const loader = rule.use[i];
      // check exact name, eg "url-loader" or its path "node_modules/url-loader/dist/cjs.js"
      if (
        loader.loader === loaderName ||
        loader.loader.includes(`/${loaderName}/`)
      ) {
        return true;
      }
    }
  }
  return false;
};
