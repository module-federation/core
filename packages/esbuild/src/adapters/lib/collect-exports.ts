import acorn from 'acorn';
import { promisify } from 'util';
import enhancedResolve from 'enhanced-resolve';
import * as moduleLexer from 'cjs-module-lexer';
import fs from 'fs';
import path from 'path';

export const resolve = promisify(
  enhancedResolve.create({
    mainFields: ['browser', 'module', 'main'],
  }),
);

let lexerInitialized = false;
export async function getExports(modulePath: string): Promise<string[]> {
  if (!lexerInitialized) {
    await moduleLexer.init();
    lexerInitialized = true;
  }
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
        const results = moduleLexer.parse(
          await fs.readFileSync(currentPath, 'utf8'),
        );
        exports.push(...results.exports);
        for (const reexport of results.reexports) {
          const resolvedPath = await resolve(
            path.dirname(currentPath),
            reexport,
          );
          if (typeof resolvedPath === 'string') {
            paths.push(resolvedPath);
          }
        }
      }
    }
    /**
     * 追加default
     */
    if (!exports.includes('default')) {
      exports.push('default');
    }
    return exports;
  } catch (e) {
    console.log(e);
    return ['default'];
  }
}

function collectExports(filePath: string): {
  hasDefaultExport: boolean;
  hasFurtherExports: boolean;
  defaultExportName: string;
  exports: string[];
} {
  const src = fs.readFileSync(filePath, 'utf8');
  const parseTree = acorn.parse(src, {
    ecmaVersion: 'latest',
    allowHashBang: true,
    sourceType: 'module',
  });
  let hasDefaultExport = false;
  let hasFurtherExports = false;
  let defaultExportName = '';
  const exports = new Set<string>();
  traverse(parseTree, (node: any) => {
    if (
      node.type === 'AssignmentExpression' &&
      node?.left?.object?.name === 'exports'
    ) {
      exports.add(node.left.property?.name);
      return;
    }
    if (hasDefaultExport && hasFurtherExports) {
      return;
    }
    if (node.type !== 'ExportNamedDeclaration') {
      return;
    }
    if (!node.specifiers) {
      hasFurtherExports = true;
      return;
    }
    for (const s of node.specifiers) {
      if (isDefaultExport(s)) {
        defaultExportName = s?.local?.name;
        hasDefaultExport = true;
      } else {
        hasFurtherExports = true;
      }
    }
  });
  return {
    hasDefaultExport,
    hasFurtherExports,
    defaultExportName,
    exports: [...exports],
  };
}

function traverse(node: any, visit: (node: any) => void): void {
  visit(node);
  for (const key in node) {
    const prop = node[key];
    if (prop && typeof prop === 'object') {
      traverse(prop, visit);
    } else if (Array.isArray(prop)) {
      for (const sub of prop) {
        traverse(sub, visit);
      }
    }
  }
}

function isDefaultExport(exportSpecifier: any): boolean {
  return (
    exportSpecifier.exported?.type === 'Identifier' &&
    exportSpecifier.exported?.name === 'default'
  );
}

export { collectExports, traverse, isDefaultExport };
