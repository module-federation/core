import type { LoaderContext } from 'webpack';
import fg from 'fast-glob';
import fs from 'fs';

const PAGE_EXTENSION_PATTERN = /\.(ts|tsx|js|jsx)$/i;

function getPagesRoot(appRoot: string): [string, string] {
  const srcPages = `${appRoot}/src/pages`;
  if (fs.existsSync(srcPages)) {
    return [srcPages, 'src/pages'];
  }
  return [`${appRoot}/pages`, 'pages'];
}

function discoverPages(rootDir: string): string[] {
  const [absolutePagesRoot, relativePagesRoot] = getPagesRoot(rootDir);

  if (!fs.existsSync(absolutePagesRoot)) {
    return [];
  }

  const pageFiles = fg.sync('**/*.{ts,tsx,js,jsx}', {
    cwd: absolutePagesRoot,
    onlyFiles: true,
    ignore: ['api/**'],
  });

  return pageFiles
    .filter((file) => {
      return ![/^_app\./, /^_document\./, /^_error\./, /^404\./, /^500\./].some(
        (pattern) => pattern.test(file),
      );
    })
    .map((file) => `${relativePagesRoot}/${file}`);
}

function sanitizePagePath(page: string): string {
  return page
    .replace(/^src\/pages\//i, 'pages/')
    .replace(PAGE_EXTENSION_PATTERN, '');
}

function normalizeRoute(route: string, format: 'legacy' | 'routes-v2'): string {
  const cleaned =
    route.replace(/^\/pages\//, '/').replace(/\/index$/, '') || '/';

  if (format === 'routes-v2') {
    return cleaned;
  }

  return cleaned
    .replace(/\[\.\.\.[^\]]+\]/g, '*')
    .replace(/\[([^\]]+)\]/g, ':$1');
}

function routeRank(route: string): [number, number, number, string] {
  const segments = route.split('/').filter(Boolean);
  const catchAllCount = segments.filter(
    (segment) =>
      /^\[\.\.\.[^\]]+\]$/.test(segment) ||
      /^\[\[\.\.\.[^\]]+\]\]$/.test(segment),
  ).length;
  const dynamicCount = segments.filter(
    (segment) => segment.startsWith('[') && segment.endsWith(']'),
  ).length;
  const staticCount = segments.length - dynamicCount;
  return [catchAllCount, dynamicCount, -staticCount, route];
}

function sortPagesForMatchPriority(routes: string[]): string[] {
  return [...routes].sort((left, right) => {
    const leftRank = routeRank(left);
    const rightRank = routeRank(right);

    for (let index = 0; index < leftRank.length; index += 1) {
      if (leftRank[index] < rightRank[index]) {
        return -1;
      }
      if (leftRank[index] > rightRank[index]) {
        return 1;
      }
    }

    return 0;
  });
}

function createPagesMap(
  pages: string[],
  format: 'legacy' | 'routes-v2',
): Record<string, string> {
  const routes = pages.map((page) => `/${sanitizePagePath(page)}`);
  const sortedRoutes = sortPagesForMatchPriority(routes);

  return sortedRoutes.reduce(
    (acc, route) => {
      const mappedRoute = normalizeRoute(route, format);
      acc[mappedRoute] = `.${route}`;
      return acc;
    },
    {} as Record<string, string>,
  );
}

export function exposeNextPages(
  cwd: string,
  pageMapFormat: 'legacy' | 'routes-v2',
): Record<string, string> {
  const pages = discoverPages(cwd);
  const exposeMap = pages.reduce(
    (acc, page) => {
      acc[`./${sanitizePagePath(page)}`] = `./${page}`;
      return acc;
    },
    {} as Record<string, string>,
  );

  const loaderPath = __filename;
  const includeLegacyMap = pageMapFormat === 'legacy';

  return {
    './pages-map': `${loaderPath}${includeLegacyMap ? '' : '?v2'}!${loaderPath}`,
    './pages-map-v2': `${loaderPath}?v2!${loaderPath}`,
    ...exposeMap,
  };
}

export default function pagesMapLoader(
  this: LoaderContext<Record<string, unknown>>,
): void {
  const options = this.getOptions();
  const pageMapFormat = Object.prototype.hasOwnProperty.call(options, 'v2')
    ? 'routes-v2'
    : 'legacy';

  const pages = discoverPages(this.rootContext);
  const map = createPagesMap(pages, pageMapFormat);

  this.callback(null, `module.exports = { default: ${JSON.stringify(map)} };`);
}
