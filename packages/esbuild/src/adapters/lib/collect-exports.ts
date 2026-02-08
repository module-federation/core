import {
  init as initEsLexer,
  parse as parseEsModule,
  ExportSpecifier,
} from 'es-module-lexer';
import {
  init as initCjsLexer,
  parse as parseCjsModule,
} from 'cjs-module-lexer';
import { promisify } from 'util';
import enhancedResolve from 'enhanced-resolve';
import fs from 'fs';
import path from 'path';

export const resolve = promisify(
  enhancedResolve.create({
    mainFields: ['browser', 'module', 'main'],
  }),
);

/**
 * Analyze a module's exports by reading its source code and parsing with
 * es-module-lexer (ESM) and cjs-module-lexer (CJS).
 *
 * Handles re-exports (`export * from './other'`) by recursively following
 * the re-export chain up to a depth limit to avoid infinite loops.
 *
 * @param modulePath - The module specifier or path to analyze
 * @returns Array of export names (always includes 'default')
 */
export async function getExports(modulePath: string): Promise<string[]> {
  await initEsLexer;
  await initCjsLexer;

  try {
    const exports: string[] = [];
    const visited = new Set<string>();
    const paths: Array<{ filePath: string; depth: number }> = [];

    const resolvedPath = await resolve(process.cwd(), modulePath);
    if (typeof resolvedPath === 'string') {
      paths.push({ filePath: resolvedPath, depth: 0 });
    }

    const MAX_DEPTH = 5;

    while (paths.length > 0) {
      const item = paths.pop();
      if (!item) continue;
      const { filePath, depth } = item;

      // Skip already-visited files (handles circular re-exports)
      if (visited.has(filePath)) continue;
      visited.add(filePath);

      let content: string;
      try {
        content = await fs.promises.readFile(filePath, 'utf8');
      } catch {
        continue;
      }

      try {
        // Try CJS first
        const { exports: cjsExports, reexports: cjsReexports } =
          parseCjsModule(content);
        exports.push(...cjsExports);

        // Follow CJS re-exports
        if (depth < MAX_DEPTH && cjsReexports.length > 0) {
          for (const reexport of cjsReexports) {
            try {
              const resolved = await resolve(path.dirname(filePath), reexport);
              if (typeof resolved === 'string' && !visited.has(resolved)) {
                paths.push({ filePath: resolved, depth: depth + 1 });
              }
            } catch {
              // Can't resolve re-export target, skip
            }
          }
        }
      } catch {
        // Not CJS, try ESM
        const [esImports, esExports] = parseEsModule(content);
        exports.push(...esExports.map((exp: ExportSpecifier) => exp.n));

        // Follow ESM re-exports (`export * from '...'` and `export { x } from '...'`)
        // es-module-lexer returns import entries; re-exports appear as imports
        // with assertion `a === -1` for `export *` style.
        if (depth < MAX_DEPTH) {
          for (const imp of esImports) {
            // imp.n is the module specifier, imp.a is the assert index
            // For `export * from 'x'`, the import will have imp.n set
            // and the corresponding export will reference it.
            // Since es-module-lexer treats `export * from` as an import,
            // we check if it's a re-export by looking at the statement.
            if (imp.n && imp.t === 2) {
              // type 2 = export star
              try {
                const resolved = await resolve(path.dirname(filePath), imp.n);
                if (typeof resolved === 'string' && !visited.has(resolved)) {
                  paths.push({ filePath: resolved, depth: depth + 1 });
                }
              } catch {
                // Can't resolve re-export target, skip
              }
            }
          }
        }
      }
    }

    if (!exports.includes('default')) {
      exports.push('default');
    }
    // Deduplicate
    return [...new Set(exports)];
  } catch (e) {
    console.warn(
      '[module-federation] Failed to analyze exports for',
      modulePath,
      e,
    );
    return ['default'];
  }
}
