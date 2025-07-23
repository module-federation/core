import { SEARCH_INDEX_NAME } from '@rspress/shared';
import path from 'path';
import fs from 'fs';

import type { RouteMeta } from '@rspress/shared';

export function findSearchIndexPaths(outputDir: string) {
  const staticDir = path.join(outputDir, 'static');
  if (!fs.existsSync(staticDir)) {
    return undefined;
  }
  const files = fs.readdirSync(staticDir);
  const searchIndexFiles = files.filter(
    (file) =>
      file.startsWith(SEARCH_INDEX_NAME) &&
      file.endsWith('.json') &&
      fs.statSync(path.join(staticDir, file)).isFile(),
  );
  if (searchIndexFiles) {
    return searchIndexFiles.map((searchIndexFile) =>
      path.join(staticDir, searchIndexFile),
    );
  }
  return undefined;
}

export function findMarkdownFilePath(
  outputDir: string,
  defaultLang: string,
  route: RouteMeta,
) {
  const filepath = path.join(
    outputDir,
    route.relativePath.replace(new RegExp(`^${defaultLang}/`), ''),
  );
  return filepath.replace(path.extname(filepath), '.md');
}
