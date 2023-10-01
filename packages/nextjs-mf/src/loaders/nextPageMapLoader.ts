import type { LoaderContext } from 'webpack';

import fg from 'fast-glob';
import fs from 'fs';

import { UrlNode } from '../../client/UrlNode';

/**
 * Webpack loader which prepares MF map for NextJS pages.
 * This function is the main entry point for the loader.
 * It gets the options passed to the loader and prepares the pages map.
 * If the 'v2' option is passed, it prepares the pages map using the 'preparePageMapV2' function.
 * Otherwise, it uses the 'preparePageMap' function.
 * Finally, it calls the loader's callback function with the prepared pages map.
 *
 * @param {LoaderContext<Record<string, unknown>>} this - The loader context.
 */
export default function nextPageMapLoader(
  this: LoaderContext<Record<string, unknown>>,
) {
  // const [pagesRoot] = getNextPagesRoot(this.rootContext);
  // this.addContextDependency(pagesRoot);
  const opts = this.getOptions();
  const pages = getNextPages(this.rootContext);

  let result = {};

  if (Object.hasOwnProperty.call(opts, 'v2')) {
    result = preparePageMapV2(pages);
  } else {
    result = preparePageMap(pages);
  }

  this.callback(
    null,
    `module.exports = { default: ${JSON.stringify(result)} };`,
  );
}

/**
 * Webpack config generator for `exposes` option.
 * This function generates the webpack config for the 'exposes' option.
 * It creates a map of pages to modules and returns an object with the pages map and the pages map v2.
 *
 * @param {string} cwd - The current working directory.
 * @returns {Record<string, string>} The webpack config for the 'exposes' option.
 */
export function exposeNextjsPages(cwd: string) {
  const pages = getNextPages(cwd);

  const pageModulesMap = {} as Record<string, string>;
  pages.forEach((page) => {
    // Creating a map of pages to modules
    //   './pages/storage/index': './pages/storage/index.tsx',
    //   './pages/storage/[...slug]': './pages/storage/[...slug].tsx',
    pageModulesMap['./' + sanitizePagePath(page)] = `./${page}`;
  });

  return {
    './pages-map': `${__filename}!${__filename}`,
    './pages-map-v2': `${__filename}?v2!${__filename}`,
    ...pageModulesMap,
  };
}

/**
 * This function gets the root directory of the NextJS pages.
 * It checks if the 'src/pages/' directory exists.
 * If it does, it returns the absolute path and the relative path to this directory.
 * If it doesn't, it returns the absolute path and the relative path to the 'pages/' directory.
 *
 * @param {string} appRoot - The root directory of the application.
 * @returns {[string, string]} The absolute path and the relative path to the pages directory.
 */
function getNextPagesRoot(appRoot: string) {
  let pagesDir = 'src/pages/';
  let absPageDir = `${appRoot}/${pagesDir}`;
  if (!fs.existsSync(absPageDir)) {
    pagesDir = 'pages/';
    absPageDir = `${appRoot}/${pagesDir}`;
  }

  return [absPageDir, pagesDir];
}

/**
 * This function scans the pages directory and returns a list of user defined pages.
 * It excludes special pages like '_app', '_document', '_error', '404', '500', and federation pages.
 *
 * @param {string} rootDir - The root directory of the application.
 * @returns {string[]} The list of user defined pages.
 */
function getNextPages(rootDir: string) {
  const [cwd, pagesDir] = getNextPagesRoot(rootDir);

  // scan all files in pages folder except pages/api
  let pageList = fg.sync('**/*.{ts,tsx,js,jsx}', {
    cwd,
    onlyFiles: true,
    ignore: ['api/**'],
  });

  // remove specific nextjs pages
  const exclude = [
    /^_app\..*/, // _app.tsx
    /^_document\..*/, // _document.tsx
    /^_error\..*/, // _error.tsx
    /^404\..*/, // 404.tsx
    /^500\..*/, // 500.tsx
    /^\[\.\.\..*\]\..*/, // /[...federationPage].tsx
  ];
  pageList = pageList.filter((page) => {
    return !exclude.some((r) => r.test(page));
  });

  pageList = pageList.map((page) => `${pagesDir}${page}`);

  return pageList;
}

/**
 * This function sanitizes a page path.
 * It removes the 'src/pages/' prefix and the file extension.
 *
 * @param {string} item - The page path to sanitize.
 * @returns {string} The sanitized page path.
 */
function sanitizePagePath(item: string) {
  return item
    .replace(/^src\/pages\//i, 'pages/')
    .replace(/\.(ts|tsx|js|jsx)$/, '');
}

/**
 * This function creates a MF map from a list of NextJS pages.
 * It sanitizes the page paths and sorts them using the 'UrlNode' class.
 * Then, it creates a map with the sorted page paths as keys and the original page paths as values.
 *
 * @param {string[]} pages - The list of NextJS pages.
 * @returns {Record<string, string>} The MF map.
 */
function preparePageMap(pages: string[]) {
  const result = {} as Record<string, string>;

  const clearedPages = pages.map((p) => `/${sanitizePagePath(p)}`);

  // getSortedRoutes @see https://github.com/vercel/next.js/blob/canary/packages/next/shared/lib/router/utils/sorted-routes.ts
  const root = new UrlNode();
  clearedPages.forEach((pagePath) => root.insert(pagePath));
  // Smoosh will then sort those sublevels up to the point where you get the correct route definition priority
  const sortedPages = root.smoosh();

  sortedPages.forEach((page) => {
    let key = page
      .replace(/\[\.\.\.[^\]]+\]/gi, '*')
      .replace(/\[([^\]]+)\]/gi, ':$1');
    key = key.replace(/^\/pages\//, '/').replace(/\/index$/, '') || '/';
    result[key] = `.${page}`;
  });

  return result;
}

/**
 * This function creates a MF list from a list of NextJS pages.
 * It sanitizes the page paths and sorts them using the 'UrlNode' class.
 * Then, it creates a map with the sorted page paths as keys and the original page paths as values.
 * Unlike the 'preparePageMap' function, this function does not replace the '[...]' and '[]' parts in the page paths.
 *
 * @param {string[]} pages - The list of NextJS pages.
 * @returns {Record<string, string>} The MF list.
 */
function preparePageMapV2(pages: string[]) {
  const result = {} as Record<string, string>;

  const clearedPages = pages.map((p) => `/${sanitizePagePath(p)}`);

  // getSortedRoutes @see https://github.com/vercel/next.js/blob/canary/packages/next/shared/lib/router/utils/sorted-routes.ts
  const root = new UrlNode();
  clearedPages.forEach((pagePath) => root.insert(pagePath));
  // Smoosh will then sort those sublevels up to the point where you get the correct route definition priority
  const sortedPages = root.smoosh();

  sortedPages.forEach((page) => {
    const key = page.replace(/^\/pages\//, '/').replace(/\/index$/, '') || '/';
    result[key] = `.${page}`;
  });

  return result;
}
