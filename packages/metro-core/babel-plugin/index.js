// reuse `@babel/types` from `metro`
const metroPath = require.resolve('metro');
const babelTypesPath = require.resolve('@babel/types', { paths: [metroPath] });
const t = require(babelTypesPath);

const UNSUPPORTED_IMPORT_MESSAGE =
  'The module path for import() must be a static string literal. Expressions or variables are not supported.';
const WEBPACK_IGNORE_COMMENT = 'webpackIgnore: true';

function isIgnoredWebpackImport(path) {
  const [firstArg] = path.node.arguments;

  const comments = [
    ...(firstArg?.leadingComments || []),
    ...(path.node?.leadingComments || []),
    ...(path.node?.innerComments || []),
  ];

  return (
    t.isImport(path.node.callee) &&
    comments.some((comment) => comment.value.includes(WEBPACK_IGNORE_COMMENT))
  );
}

function getRemotesRegExp(remotes) {
  return new RegExp(`^(${Object.keys(remotes).join('|')})/`);
}

function getSharedRegExp(shared) {
  return new RegExp(`^(${Object.keys(shared).join('|')})$`);
}

function isRemoteImport(path, options) {
  return (
    t.isImport(path.node.callee) &&
    t.isStringLiteral(path.node.arguments[0]) &&
    Object.keys(options.remotes).length > 0 &&
    path.node.arguments[0].value.match(getRemotesRegExp(options.remotes))
  );
}

function isSharedImport(path, options) {
  return (
    t.isImport(path.node.callee) &&
    t.isStringLiteral(path.node.arguments[0]) &&
    Object.keys(options.shared).length > 0 &&
    path.node.arguments[0].value.match(getSharedRegExp(options.shared))
  );
}

function createWrappedImport(importName, methodName) {
  const importArg = t.stringLiteral(importName);

  // require('mf:remote-module-registry')
  const requireCall = t.callExpression(t.identifier('require'), [
    t.stringLiteral('mf:remote-module-registry'),
  ]);

  // .loadAndGetRemote(importName) or .loadAndGetShared(importName)
  const loadAndGetCall = t.callExpression(
    t.memberExpression(requireCall, t.identifier(methodName)),
    [importArg],
  );

  return loadAndGetCall;
}

function getWrappedRemoteImport(importName) {
  return createWrappedImport(importName, 'loadAndGetRemote');
}

function getWrappedSharedImport(importName) {
  return createWrappedImport(importName, 'loadAndGetShared');
}

function getRejectedPromise(errorMessage) {
  return t.callExpression(
    t.memberExpression(t.identifier('Promise'), t.identifier('reject')),
    [t.newExpression(t.identifier('Error'), [t.stringLiteral(errorMessage)])],
  );
}

function moduleFederationMetroBabelPlugin() {
  return {
    name: 'module-federation-metro-babel-plugin',
    visitor: {
      CallExpression(path, state) {
        if (state.opts.blacklistedPaths.includes(state.filename)) {
          return;
        }

        // Workaround to remove problematic import from `loadEsmEntry` in `@module-federation/runtime-core`
        // That causes crashes in Metro bundler
        if (isIgnoredWebpackImport(path)) {
          path.replaceWith(getRejectedPromise(UNSUPPORTED_IMPORT_MESSAGE));
          return;
        }

        if (isRemoteImport(path, state.opts)) {
          const wrappedImport = getWrappedRemoteImport(
            path.node.arguments[0].value,
          );
          path.replaceWith(wrappedImport);
        } else if (isSharedImport(path, state.opts)) {
          const wrappedImport = getWrappedSharedImport(
            path.node.arguments[0].value,
          );
          path.replaceWith(wrappedImport);
        }
      },
    },
  };
}

module.exports = moduleFederationMetroBabelPlugin;
