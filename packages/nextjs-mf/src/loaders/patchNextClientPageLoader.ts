import type { LoaderContext } from 'webpack';

import path from 'path';

/**
 * This webpack loader patches next/dist/client/page-loader.js file.
 * Also it requires `include-defaults.js` with required shared libs
 *
 */
export default function patchNextClientPageLoader(
  this: LoaderContext<Record<string, unknown>>,
  content: string
) {
  if (content.includes('MFClient')) {
    // If MFClient already applied then skip patch
    return content;
  }

  // avoid absolute paths as they break hashing when the root for the project is moved
  // @see https://webpack.js.org/contribute/writing-a-loader/#absolute-paths
  const pathIncludeDefaults = path.relative(
    this.context,
    path.resolve(__dirname, '../include-defaults.js')
  );

  const pathMFClient = path.relative(
    this.context,
    path.resolve(__dirname, '../../client/MFClient.js')
  );

  const patchedContent = content.replace(
    'exports.default = PageLoader;',
    `
      require(${JSON.stringify(pathIncludeDefaults)});
      const MFClient = require(${JSON.stringify(pathMFClient)}).MFClient;

      class PageLoaderExtended extends PageLoader {
        constructor(buildId, assetPrefix) {
          super(buildId, assetPrefix);
          global.mf_client = new MFClient(this, { mode: process.env.NODE_ENV });
        }

        _getPageListOriginal() {
          return super.getPageList();
        }

        getPageList() {
          return global.mf_client.getPageList();
        }
      }
      exports.default = PageLoaderExtended;
    `
  );

  return patchedContent;
}

// module.exports = patchNextClientPageLoader;
