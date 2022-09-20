const path = require('path');
const Template = require('webpack/lib/Template');

/**
 * This loader was specially created for tunning next-image-loader result
 *   see https://github.com/vercel/next.js/blob/canary/packages/next/build/webpack/loaders/next-image-loader.js
 * It takes regular string
 *   `export default {"src":"/_next/static/media/ssl.e3019f0e.svg","height":20,"width":20};`
 * And injects PUBLIC_PATH to it from webpack
 *   `export default {"src":__webpack_require__.p+"/static/media/ssl.e3019f0e.svg","height":20,"width":20};`
 *
 *
 * __webpack_require__.p - is a global variable in webpack container which contains publicPath
 *   For example:  http://localhost:3000/_next
 *
 * @type {(this: import("webpack").LoaderContext<{}>, content: string) => string>}
 */
async function fixImageLoader(remaining) {
  this.cacheable(true);

  const publicPath = this._compiler.webpack.RuntimeGlobals.publicPath;

  const isServer = this._compiler.options.name !== 'client';
  const result = await this.importModule(
    `${this.resourcePath}.webpack[javascript/auto]` + `!=!${remaining}`
  );
  const content = result.default || result;

  const computedAssetPrefix = isServer
    ? ` \'\'`
    : `(${publicPath} && ${publicPath}.indexOf('://') > 0 ? new URL(${publicPath}).origin : \'\')`;

  const constructedObject = Object.entries(content).reduce(
    (acc, [key, value]) => {
      if (key === 'src') {
        if (value && value.indexOf('://') < 0) {
          value = path.join(value);
        }
        acc.push(
          `${key}: computedAssetsPrefixReference + ${JSON.stringify(value)}`
        );
        return acc;
      }
      acc.push(`${key}: ${JSON.stringify(value)}`);
      return acc;
    },
    []
  );
  const updated = Template.asString([
    "let computedAssetsPrefixReference = '';",
    'try {',
    Template.indent(`computedAssetsPrefixReference = ${computedAssetPrefix};`),
    '} catch (e) {}',
    'export default {',
    Template.indent(constructedObject.join(',\n')),
    '}',
  ]);
  return updated;
}

module.exports.pitch = fixImageLoader;
