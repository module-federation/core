const babelTransformer = require('__BABEL_TRANSFORMER_PATH__');
const babelPlugins = __BABEL_PLUGINS__;

function transform(config) {
  return babelTransformer.transform({
    ...config,
    plugins: [...babelPlugins, ...config.plugins],
  });
}

module.exports = { ...babelTransformer, transform };
