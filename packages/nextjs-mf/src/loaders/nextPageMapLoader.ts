import type { LoaderContext } from 'webpack';

import fg from 'fast-glob';
import fs from 'fs';

import { UrlNode } from '../../client/UrlNode';

/**
 * Webpack loader which prepares MF map for NextJS pages
 *
 */
export default function nextPageMapLoader(
  this: LoaderContext<Record<string, unknown>>
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
    `module.exports = { default: ${JSON.stringify(result)} };`
  );
}

/**
 * Webpack config generator for `exposes` option.
 *   - automatically create `./pages-map` module
 *   - automatically add all page modules
 */
export function exposeNextjsPages(cwd: string, asyncBoundary: boolean) {
  const pages = getNextPages(cwd);

  const pageModulesMap = {} as Record<string, string>;
  pages.forEach((page) => {
    // Creating a map of pages to modules
    //   './pages/storage/index': './pages/storage/index.tsx',
    //   './pages/storage/[...slug]': './pages/storage/[...slug].tsx',
    if(asyncBoundary) {
      pageModulesMap['./' + sanitizePagePath(page)] = `./${page}?hasBoundary`;
    } else {
      pageModulesMap['./' + sanitizePagePath(page)] = `./${page}`;
    }
  });

  const exposesWithPageMap = {
    './pages-map': `${__filename}!${__filename}`,
    './pages-map-v2': `${__filename}?v2!${__filename}`,
    ...pageModulesMap,
  };

  return exposesWithPageMap;
}

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
 * From provided ROOT_DIR `scan` pages directory
 * and return list of user defined pages
 * (except special ones, like _app, _document, _error)
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

function sanitizePagePath(item: string) {
  return item
    .replace(/^src\/pages\//i, 'pages/')
    .replace(/\.(ts|tsx|js|jsx)$/, '');
}

/**
 * Create MF map from list of NextJS pages
 *
 * From
 *   ['pages/index.tsx', 'pages/storage/[...slug].tsx', 'pages/storage/index.tsx']
 *
 * Getting the following map
 *   {
 *     '/': './pages/index',
 *     '/storage/*': './pages/storage/[...slug]',
 *     '/storage': './pages/storage/index'
 *   }
 *
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
 * Create MF list of NextJS pages
 *
 * From
 *   ['pages/index.tsx', 'pages/storage/[...slug].tsx', 'pages/storage/index.tsx']
 * Getting the following map
 *   {
 *     '/': './pages/index',
 *     '/storage': './pages/storage/index'
 *     '/storage/[...slug]': './pages/storage/[...slug]',
 *   }
 *
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

// module.exports = nextPageMapLoader;
// module.exports.exposeNextjsPages = exposeNextjsPages;
