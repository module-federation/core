// import { SEARCH_INDEX_NAME } from '@rspress/core';

// import path from 'path';
// import fs from 'fs';

// export function findSearchIndexPaths(outputDir: string) {
//   const staticDir = path.join(outputDir, 'static');
//   if (!fs.existsSync(staticDir)) {
//     return undefined;
//   }
//   const files = fs.readdirSync(staticDir);
//   const searchIndexFiles = files.filter(
//     (file) =>
//       file.startsWith(SEARCH_INDEX_NAME) &&
//       file.endsWith('.json') &&
//       fs.statSync(path.join(staticDir, file)).isFile(),
//   );
//   if (searchIndexFiles) {
//     return searchIndexFiles.map((searchIndexFile) =>
//       path.join(staticDir, searchIndexFile),
//     );
//   }
//   return undefined;
// }
