import fs from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';
import { htmlToText } from 'html-to-text';

import type { RouteMeta } from '@rspress/shared';

export type RebuildLlmsByHtmlOptions = {
  outputDir: string;
  defaultLang: string;
  base?: string;
  defaultVersion?: string;
};

type RouteMarkdown = {
  route: RouteMeta;
  markdown: string;
  title: string;
  description?: string;
};

const replaceHtmlExt = (filepath: string) => {
  return filepath.replace(path.extname(filepath), '.html');
};

const routePageToMdFilename = (routePath: string) => {
  const fileName = routePath.endsWith('/')
    ? `${routePath}index.md`
    : `${routePath}.md`;
  return fileName.replace(/^\/+/, '');
};

const addBase = (url: string, base?: string) => {
  if (!base || base === '/') {
    return url;
  }
  return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
};

const routePathToMdPath = (routePath: string, base?: string) => {
  const normalizedRoutePath = routePath.replace(/\.html$/, '');
  const mdPath = normalizedRoutePath.endsWith('/')
    ? `${normalizedRoutePath}index.md`
    : `${normalizedRoutePath}.md`;
  return addBase(mdPath, base);
};

const getRouteHtmlPath = (
  route: RouteMeta,
  { outputDir, defaultLang }: RebuildLlmsByHtmlOptions,
) => {
  return replaceHtmlExt(
    path.join(
      outputDir,
      route.lang === defaultLang
        ? route.relativePath.replace(route.lang, '')
        : route.relativePath,
    ),
  );
};

function normalizeText(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/^#+\s*/, '')
    .trim();
}

function htmlToMarkdown(html: string) {
  const $ = cheerio.load(html);

  // Strip chrome and runtime-only nodes before converting the page body into
  // Markdown, so llms output contains document content instead of navigation UI.
  $('script, style, noscript, template').remove();
  $('header, nav, aside, footer').remove();
  $(
    [
      '.rp-nav',
      '.rp-sidebar',
      '.rp-aside',
      '.rp-footer',
      '.rp-doc-footer',
      '.rp-not-doc',
    ].join(','),
  ).remove();

  const docHtml =
    $('main').first().html() ||
    $('article').first().html() ||
    $('.rp-doc').first().html() ||
    $('body').html() ||
    html;

  return htmlToText(docHtml, {
    wordwrap: 80,
    selectors: [
      {
        selector: 'a',
        options: {
          ignoreHref: false,
        },
      },
      {
        selector: 'img',
        format: 'skip',
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
  }).trim();
}

function extractPageInfoFromHtml(html: string) {
  const $ = cheerio.load(html);
  const $doc = $('main').first().length
    ? $('main').first()
    : $('article').first().length
      ? $('article').first()
      : $('.rp-doc').first().length
        ? $('.rp-doc').first()
        : $('body');

  $doc
    .find('a.header-anchor, .header-anchor, .rp-copy, .rp-llms-button')
    .remove();

  const title =
    normalizeText($doc.find('h1').first().text()) ||
    normalizeText($('h1').first().text()) ||
    normalizeText($('title').first().text());
  const description = $doc
    .find('p')
    .toArray()
    .map((paragraph) => normalizeText($(paragraph).text()))
    .find(Boolean);

  return {
    title,
    description,
  };
}

async function extractRouteMarkdown(
  routes: RouteMeta[],
  options: RebuildLlmsByHtmlOptions,
) {
  return Promise.all(
    routes.map(async (route) => {
      const htmlPath = getRouteHtmlPath(route, options);
      const html = await fs.readFile(htmlPath, 'utf-8');
      const { title, description } = extractPageInfoFromHtml(html);
      return {
        route,
        markdown: htmlToMarkdown(html),
        title,
        description,
      };
    }),
  );
}

function getDefaultVersion(routeMarkdownList: RouteMarkdown[]) {
  return routeMarkdownList.find(({ route }) => route.version)?.route.version;
}

function getLlmsOutputPrefix(
  route: RouteMeta,
  defaultLang: string,
  defaultVersion?: string,
) {
  const langPrefix = route.lang === defaultLang ? '' : `${route.lang}/`;
  const versionPrefix =
    defaultVersion && route.version && route.version !== defaultVersion
      ? `${route.version}/`
      : '';
  return `${versionPrefix}${langPrefix}`;
}

function generateLlmsFullTxt(
  routeMarkdownList: RouteMarkdown[],
  options: RebuildLlmsByHtmlOptions,
) {
  return routeMarkdownList
    .map(({ route, markdown }) =>
      [
        '---',
        `url: ${routePathToMdPath(route.routePath, options.base)}`,
        '---',
        '',
        markdown,
        '',
      ].join('\n'),
    )
    .join('\n');
}

async function writeRouteMarkdownIfEmpty(
  routeMarkdownList: RouteMarkdown[],
  options: RebuildLlmsByHtmlOptions,
) {
  // Rspress may already emit route-level Markdown files. Only fill missing or
  // empty files from HTML so user-authored content is never overwritten.
  await Promise.all(
    routeMarkdownList.map(async ({ route, markdown }) => {
      const mdFilename = routePageToMdFilename(route.routePath);
      const mdPath = path.join(options.outputDir, mdFilename);
      await fs.mkdir(path.dirname(mdPath), { recursive: true });

      let existingContent = '';
      try {
        existingContent = await fs.readFile(mdPath, 'utf-8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }

      if (!existingContent.trim()) {
        await fs.writeFile(mdPath, markdown);
      }
    }),
  );
}

async function patchLlmsFullTxtIfEmpty(
  routeMarkdownList: RouteMarkdown[],
  options: RebuildLlmsByHtmlOptions,
  outputPrefix: string,
) {
  const llmsFullPath = path.join(
    options.outputDir,
    outputPrefix,
    'llms-full.txt',
  );
  await fs.mkdir(path.dirname(llmsFullPath), { recursive: true });

  const markdownMap = new Map(
    routeMarkdownList.map(({ route, markdown }) => [
      routePathToMdPath(route.routePath, options.base),
      markdown,
    ]),
  );

  let original = '';
  try {
    original = await fs.readFile(llmsFullPath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  // If llms-full.txt was not generated, create the whole file from the HTML
  // conversion. Otherwise only patch sections whose body is still empty.
  if (!original) {
    await fs.writeFile(
      llmsFullPath,
      generateLlmsFullTxt(routeMarkdownList, options),
    );
    return;
  }

  const patched = original.replace(
    /(---\nurl:\s*([^\n]+)\n---\n)([\s\S]*?)(?=\n---\nurl:|$)/g,
    (section, header: string, url: string, body: string) => {
      if (body.trim()) {
        return section;
      }
      const markdown = markdownMap.get(url.trim());
      if (!markdown) {
        return section;
      }
      return `${header}${markdown}\n`;
    },
  );

  await fs.writeFile(llmsFullPath, patched);
}

async function patchLlmsTxtIfEmpty(
  routeMarkdownList: RouteMarkdown[],
  options: RebuildLlmsByHtmlOptions,
  outputPrefix: string,
) {
  const llmsPath = path.join(options.outputDir, outputPrefix, 'llms.txt');
  let original = '';

  try {
    original = await fs.readFile(llmsPath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
    return;
  }

  // Rspress can emit placeholder entries like "- [](url)" when route metadata
  // is unavailable at compile time. Backfill those labels from built HTML.
  const pageInfoMap = new Map(
    routeMarkdownList.map(({ route, title, description }) => [
      routePathToMdPath(route.routePath, options.base),
      {
        title,
        description,
      },
    ]),
  );

  const patched = original.replace(
    /^- \[\]\(([^)]+)\)(?::\s*)?$/gm,
    (line, url: string) => {
      const pageInfo = pageInfoMap.get(url.trim());
      if (!pageInfo?.title) {
        return line;
      }
      const suffix = pageInfo.description ? `: ${pageInfo.description}` : '';
      return `- [${pageInfo.title}](${url})${suffix}`;
    },
  );

  if (patched !== original) {
    await fs.writeFile(llmsPath, patched);
  }
}

export async function rebuildLlmsByHtml(
  routes: RouteMeta[],
  options: RebuildLlmsByHtmlOptions,
) {
  // Treat the generated HTML as the source of truth after federation has
  // rendered remote content into the static output.
  const routeMarkdownList = await extractRouteMarkdown(routes, options);
  const defaultVersion =
    options.defaultVersion || getDefaultVersion(routeMarkdownList);
  const groupedRouteMarkdown = new Map<string, RouteMarkdown[]>();

  await writeRouteMarkdownIfEmpty(routeMarkdownList, options);

  // llms.txt and llms-full.txt are emitted per version/language prefix, so
  // patch each output group independently.
  for (const routeMarkdown of routeMarkdownList) {
    const outputPrefix = getLlmsOutputPrefix(
      routeMarkdown.route,
      options.defaultLang,
      defaultVersion,
    );
    const group = groupedRouteMarkdown.get(outputPrefix) || [];
    group.push(routeMarkdown);
    groupedRouteMarkdown.set(outputPrefix, group);
  }

  await Promise.all(
    Array.from(groupedRouteMarkdown.entries()).map(
      async ([outputPrefix, group]) => {
        await patchLlmsTxtIfEmpty(group, options, outputPrefix);
        await patchLlmsFullTxtIfEmpty(group, options, outputPrefix);
      },
    ),
  );
}
