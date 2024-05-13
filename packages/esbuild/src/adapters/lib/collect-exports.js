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
export async function getExports(modulePath) {
  if (!lexerInitialized) {
    await moduleLexer.init();
    lexerInitialized = true;
  }
  try {
    const exports = [];
    const paths = [];
    paths.push(await resolve(process.cwd(), modulePath));
    while (paths.length > 0) {
      const currentPath = paths.pop();
      const results = moduleLexer.parse(
        await fs.readFileSync(currentPath, 'utf8'),
      );
      exports.push(...results.exports);
      for (const reexport of results.reexports) {
        paths.push(await resolve(path.dirname(currentPath), reexport));
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

function collectExports(path) {
  const src = fs.readFileSync(path, 'utf8');
  const parseTree = acorn.parse(src, {
    ecmaVersion: 'latest',
    allowHashBang: true,
    sourceType: 'module',
  });
  let hasDefaultExport = false;
  let hasFurtherExports = false;
  let defaultExportName = '';
  const exports = new Set();
  traverse(parseTree, (node) => {
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

function traverse(node, visit) {
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

function isDefaultExport(exportSpecifier) {
  return (
    exportSpecifier.exported?.type === 'Identifier' &&
    exportSpecifier.exported?.name === 'default'
  );
}

export { collectExports, traverse, isDefaultExport };
