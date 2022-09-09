const path = require('path');

/**
 * This webpack loader patches next/dist/client/page-loader.js file.
 * Also it requires `include-defaults.js` with required shared libs
 *
 * @type {(this: import("webpack").LoaderContext<{}>, content: string) => string>}
 */
function patchNextClientPageLoader(content) {
  if (content.includes('MFPageLoader')) {
    // If MFPageLoader already applied then skip patch
    return content;
  }

  // avoid absolute paths as they break hashing when the root for the project is moved
  // @see https://webpack.js.org/contribute/writing-a-loader/#absolute-paths
  const pathIncludeDefaults = path.relative(
    this.context,
    path.resolve(__dirname, '../include-defaults.js')
  );
  path.resolve(__dirname, '../include-defaults.js');
  const pathMFPageLoader = path.relative(
    this.context,
    path.resolve(__dirname, '../runtime-mf-loader/MFPageLoader.js')
  );

  patchedContent = content.replace(
    'exports.default = PageLoader;',
    `
      require("${pathIncludeDefaults}");
      const MFPageLoader = require("${pathMFPageLoader}").MFPageLoader;

      class PageLoaderExtended extends PageLoader {
        constructor(buildId, assetPrefix) {
          super(buildId, assetPrefix);
          global.mf_loader = new MFPageLoader(this);
        }

        _getPageListOriginal() {
          return super.getPageList();
        }

        getPageList() {
          return global.mf_loader.getPageList();
        }
      }
      exports.default = PageLoaderExtended;
    `
  );

  return patchedContent;
}

module.exports = patchNextClientPageLoader;
