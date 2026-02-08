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

export const resolvePackageJson = async (
  packageName: string,
  callback: (err: Error | null, result?: string) => void,
): Promise<void> => {
  try {
    const filepath = await resolve(__dirname, packageName);
    if (typeof filepath !== 'string') {
      return callback(new Error('Failed to resolve package path'));
    }

    // Resolve the path to the package.json file
    const packageJsonPath = path.join(filepath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      callback(null, packageJsonPath);
    } else {
      callback(new Error(`package.json not found for package: ${packageName}`));
    }
  } catch (err) {
    callback(err as Error);
  }
};
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
