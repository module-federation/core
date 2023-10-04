import type { LoaderContext } from 'webpack';

import path from 'path';

/**
 * This webpack loader patches next/dist/client/page-loader.js file.
 * It also requires `include-defaults.js` with required shared libraries.
 * @param {LoaderContext<Record<string, unknown>>} this - The loader context.
 * @param {string} content - The content to be patched.
 * @returns {string} The patched content.
 */
export default function patchNextClientPageLoader(
  this: LoaderContext<Record<string, unknown>>,
  content: string,
) {
  if (content.includes('MFClient')) {
    // If MFClient already applied then skip patch
    return content;
  }

  /**
   * The relative path to the MFClient.js file.
   * @type {string}
   */
  const pathMFClient = path.relative(
    this.context,
    path.resolve(__dirname, '../../client/MFClient.js'),
  );

  /**
   * Replace the default export of the content with a new class that extends PageLoader.
   * This new class has a new instance of MFClient and overrides the getPageList method.
   * @returns {string} The patched content.
   */
  return content.replace(
    'exports.default = PageLoader;',
    `
        const MFClient = require(${JSON.stringify(pathMFClient)}).MFClient;

        class PageLoaderExtended extends PageLoader {
          constructor(buildId, assetPrefix) {
            super(buildId, assetPrefix);
            global.mf_client = new MFClient(this, { mode: process.env.NODE_ENV });
          }

          /**
           * Get the original page list from the super class.
           * @returns {Array} The original page list.
           */
          _getPageListOriginal() {
            return super.getPageList();
          }

          /**
           * Get the page list from the global mf_client.
           * @returns {Array} The page list from the global mf_client.
           */
          getPageList() {
            return global.mf_client.getPageList();
          }
        }
        exports.default = PageLoaderExtended;
      `,
  );
}

// module.exports = patchNextClientPageLoader;
