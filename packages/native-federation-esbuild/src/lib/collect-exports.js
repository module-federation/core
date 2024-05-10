const tslib_1 = require('tslib');
const fs = require('fs');
const acorn = require('acorn');

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
    var _a, _b, _c, _d;
    if (
      node.type === 'AssignmentExpression' &&
      (_b = (_a = node?.left)?.object)?.name === 'exports'
    ) {
      exports.add((_c = node.left.property)?.name);
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
        defaultExportName = (_d = s?.local)?.name;
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
  var _a, _b;
  return (
    (_a = exportSpecifier.exported)?.type === 'Identifier' &&
    (_b = exportSpecifier.exported)?.name === 'default'
  );
}

module.exports = {
  collectExports,
  traverse,
  isDefaultExport,
};
//# sourceMappingURL=collect-exports.js.map
