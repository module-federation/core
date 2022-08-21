const fg = require('fast-glob');
const fs = require('fs');

/**
 * Webpack loader which prepares MF map for NextJS pages
 *
 * @type {(this: import("webpack").LoaderContext<{}>, content: string) => string>}
 */
function nextPageMapLoader() {
  const pages = getNextPages(this.rootContext);
  const pageMap = preparePageMap(pages);

  // const [pagesRoot] = getNextPagesRoot(this.rootContext);
  // this.addContextDependency(pagesRoot);

  const result = `module.exports = { 
    default: ${JSON.stringify(pageMap)},
  };`;

  this.callback(null, result);
}

/**
 * Webpack config generator for `exposes` option.
 *   - automatically create `./pages-map` module
 *   - automatically add all page modules
 */
function exposeNextjsPages(cwd) {
  const pages = getNextPages(cwd);

  const pageModulesMap = {};
  pages.forEach((page) => {
    // Creating a map of pages to modules
    //   './pages/storage/index': './pages/storage/index.tsx',
    //   './pages/storage/[...slug]': './pages/storage/[...slug].tsx',
    pageModulesMap['./' + sanitizePagePath(page)] = `./${page}`;
  });

  const exposesWithPageMap = {
    './pages-map': `${__filename}!${__filename}`,
    ...pageModulesMap,
  };

  return exposesWithPageMap;
}

function getNextPagesRoot(appRoot) {
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
 *
 * @type {(rootDir: string) => string[]}
 */
function getNextPages(rootDir) {
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

function sanitizePagePath(item) {
  return item
    .replace(/^src\/pages\//i, 'pages/')
    .replace(/\.(ts|tsx|js|jsx)$/, '');
}

/**
 * Create MF map from list of NextJS pages
 *
 * From
 *   ['pages/index.tsx', 'pages/storage/[...slug].tsx', 'pages/storage/index.tsx']
 * Getting the following map
 *   {
 *     '/': './pages/index',
 *     '/storage/*': './pages/storage/[...slug]',
 *     '/storage': './pages/storage/index'
 *   }
 *
 * @type {(pages: string[]) => {[key: string]: string}}
 */
function preparePageMap(pages) {
  const result = {};

  pages.forEach((pagePath) => {
    const page = sanitizePagePath(pagePath);
    let key =
      '/' +
      page.replace(/\[\.\.\.[^\]]+\]/gi, '*').replace(/\[([^\]]+)\]/gi, ':$1');
    key = key.replace(/^\/pages\//, '/').replace(/\/index$/, '') || '/';
    result[key] = `./${page}`;
  });

  return result;
}

module.exports = nextPageMapLoader;
module.exports.exposeNextjsPages = exposeNextjsPages;
