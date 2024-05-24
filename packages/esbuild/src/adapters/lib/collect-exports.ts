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

export const resolve = promisify(
  enhancedResolve.create({
    mainFields: ['browser', 'module', 'main'],
  }),
);

export async function getExports(modulePath: string): Promise<string[]> {
  await initEsLexer;
  await initCjsLexer;

  try {
    const exports: string[] = [];
    const paths: string[] = [];
    const resolvedPath = await resolve(process.cwd(), modulePath);
    if (typeof resolvedPath === 'string') {
      paths.push(resolvedPath);
    }
    while (paths.length > 0) {
      const currentPath = paths.pop();
      if (currentPath) {
        const content = await fs.promises.readFile(currentPath, 'utf8');

        try {
          const { exports: cjsExports } = parseCjsModule(content);
          exports.push(...cjsExports);
        } catch {
          const [, esExports] = parseEsModule(content);
          exports.push(...esExports.map((exp: ExportSpecifier) => exp.n));
        }

        // TODO: Handle re-exports
      }
    }

    if (!exports.includes('default')) {
      exports.push('default');
    }
    return exports;
  } catch (e) {
    console.log(e);
    return ['default'];
  }
}
