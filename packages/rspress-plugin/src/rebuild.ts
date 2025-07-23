import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { htmlToText } from 'html-to-text';
import { groupBy } from 'lodash-es';
import { SEARCH_INDEX_NAME } from '@rspress/shared';
import TurndownService from 'turndown';

import type {
  RouteMeta,
  PageIndexInfo,
  ReplaceRule,
  Header,
} from '@rspress/shared';
import { findMarkdownFilePath, findSearchIndexPaths } from './findPath';
import logger from './logger';

interface TocItem {
  text: string;
  id: string;
  depth: number;
}

interface RouteHtmlMap {
  [routeId: string]: {
    filepath: string;
    content: string;
  };
}

export type RebuildOptions = {
  domain: string;
  searchCodeBlocks: boolean;
  replaceRules: ReplaceRule[];
  versioned?: boolean;
  outputDir: string;
  defaultLang: string;
};

function generateTocFromHtml(html: string) {
  const $ = cheerio.load(html);
  const headings = $('h1, h2, h3, h4, h5, h6');
  const toc: TocItem[] = [];
  let title = '';

  headings.each((index, heading) => {
    const $heading = $(heading);
    const text = $heading.text();
    const id = $heading.attr('id');
    const depth = parseInt(heading.tagName.replace('h', ''), 10);

    if (id) {
      toc.push({ text, id, depth });
    }
    if (depth === 1) {
      title = text;
    }
  });

  return { toc, title };
}

const replaceHtmlExt = (filepath: string) => {
  return filepath.replace(path.extname(filepath), '.html');
};

export const getRouteId = (route: RouteMeta) => {
  return route.absolutePath;
};

export async function getRouteHtmlMap(
  routesMap: Record<string, RouteMeta>,
  options: RebuildOptions,
) {
  const routeHtmlMap: RouteHtmlMap = {};
  await Promise.all(
    Object.entries(routesMap).map(async ([routeId, route]) => {
      const { outputDir, defaultLang } = options;
      const htmlPath = replaceHtmlExt(
        path.join(
          outputDir,
          route.lang === defaultLang
            ? route.relativePath.replace(route.lang, '')
            : route.relativePath,
        ),
      );
      const content = await fs.readFile(htmlPath, 'utf-8');
      routeHtmlMap[routeId] = {
        filepath: htmlPath,
        content,
      };
    }),
  );
  return routeHtmlMap;
}

async function extractPageDataFromHtml(
  routesMap: Record<string, RouteMeta>,
  routeHtmlMap: RouteHtmlMap,
  options: RebuildOptions,
) {
  return Promise.all(
    Object.entries(routesMap).map(async ([routeId, route]) => {
      const { domain, searchCodeBlocks, outputDir, defaultLang } = options;
      const defaultIndexInfo: PageIndexInfo = {
        title: '',
        content: '',
        _html: '',
        _flattenContent: '',
        routePath: route.routePath,
        lang: route.lang,
        toc: [],
        domain,
        frontmatter: {},
        version: route.version,
        _filepath: route.absolutePath,
        _relativePath: '',
      };

      const html = routeHtmlMap[routeId].content;
      if (!html) {
        throw new Error(`html not found for route "${routeId}"`);
      }
      let { toc: rawToc, title } = generateTocFromHtml(html);
      let content = html;

      content = htmlToText(html, {
        // decodeEntities: true, // default value of decodeEntities is `true`, so that htmlToText can decode &lt; &gt;
        wordwrap: 80,
        selectors: [
          {
            selector: 'a',
            options: {
              ignoreHref: true,
            },
          },
          {
            selector: 'img',
            format: 'skip',
          },
          {
            // Skip code blocks
            selector: 'pre > code',
            format: searchCodeBlocks ? 'block' : 'skip',
          },
          ...['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((tag) => ({
            selector: tag,
            options: {
              uppercase: false,
            },
          })),
        ],
        tables: true,
        longWordSplit: {
          forceWrapOnLimit: true,
        },
      });
      if (content.startsWith(title)) {
        // Remove the title from the content
        content = content.slice(title.length);
      }

      // rawToc comes from mdx compile and it uses `-number` to unique toc of same id
      // We need to find the character index position of each toc in the content thus benefiting for search engines
      const toc: Header[] = rawToc.map((item) => {
        const match = item.id.match(/-(\d+)$/);
        let position = -1;
        if (match) {
          for (let i = 0; i < Number(match[1]); i++) {
            // When text is repeated, the position needs to be determined based on -number
            position = content.indexOf(`\n${item.text}#\n\n`, position + 1);

            // If the positions don't match, it means the text itself may exist -number
            if (position === -1) {
              break;
            }
          }
        }
        return {
          ...item,
          charIndex: content.indexOf(`\n${item.text}#\n\n`, position + 1),
        };
      });

      return {
        ...defaultIndexInfo,
        title,
        toc,
        // raw txt, for search index
        content,
        _html: html,
      } satisfies PageIndexInfo;
    }),
  );
}

function deletePrivateField<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  const newObj: T = { ...obj };
  for (const key in newObj) {
    if (key.startsWith('_')) {
      delete newObj[key];
    }
  }
  return newObj;
}

export async function rebuildSearchIndexByHtml(
  routesMap: Record<string, RouteMeta>,
  routeHtmlMap: RouteHtmlMap,
  options: RebuildOptions,
) {
  const { versioned, outputDir } = options;
  const searchFilePaths = findSearchIndexPaths(outputDir);

  if (!searchFilePaths) {
    logger.error('Cannot find search index files!');
    process.exit(1);
  }

  const pages = await extractPageDataFromHtml(routesMap, routeHtmlMap, options);

  const groupedPages = groupBy(pages, (page) => {
    if (page.frontmatter?.pageType === 'home') {
      return 'noindex';
    }

    const version = versioned ? page.version : '';
    const lang = page.lang || '';

    return `${version}###${lang}`;
  });
  // remove the pages marked as noindex
  delete groupedPages.noindex;

  await Promise.all(
    Object.keys(groupedPages).map(async (group) => {
      // Avoid writing filepath in compile-time
      const stringifiedIndex = JSON.stringify(
        groupedPages[group].map(deletePrivateField),
      );

      const [version, lang] = group.split('###');
      const indexVersion = version ? `.${version.replace('.', '_')}` : '';
      const indexLang = lang ? `.${lang}` : '';
      const searchFilePath = searchFilePaths.find((filePath) =>
        filePath
          .replace(`${path.dirname(filePath)}/`, '')
          .startsWith(`${SEARCH_INDEX_NAME}${indexVersion}${indexLang}`),
      );
      if (!searchFilePath) {
        logger.error(
          `Cannot find search index file for version ${version} and lang ${lang}!`,
        );
        process.exit(1);
      }

      await fs.writeFile(searchFilePath, stringifiedIndex);
    }),
  );
}

export async function rebuildLLMsMDFilesByHtml(
  routesMap: Record<string, RouteMeta>,
  routeHtmlMap: RouteHtmlMap,
  options: RebuildOptions,
) {
  const { outputDir, defaultLang } = options;
  const turndownService = new TurndownService();

  await Promise.all(
    Object.entries(routeHtmlMap).map(async ([routeId, routeHtml]) => {
      try {
        const { content } = routeHtml;
        const markdown = turndownService.turndown(content);
        const mdFilePath = findMarkdownFilePath(
          outputDir,
          defaultLang,
          routesMap[routeId],
        );
        await fs.writeFile(mdFilePath, markdown);
      } catch (e) {
        logger.error(`rebuildLLMsMDFilesByHtml ${routeId} error:${e}`);
      }
    }),
  );
}
