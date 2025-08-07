// reuse `@babel/types` from `metro`
const metroPath = require.resolve('metro');
const babelTypesPath = require.resolve('@babel/types', { paths: [metroPath] });
const t = require(babelTypesPath);

const METRO_PREFIX = '__METRO_GLOBAL_PREFIX__';
const GLOBAL_NAMES_TO_PREFIX = ['__r', '__c', '__registerSegment', '__accept'];
const REFRESH_SYMBOLS = ['$RefreshReg$', '$RefreshSig$'];

/**
 * - global.__r = metroRequire;
 * + global[`${__METRO_GLOBAL_PREFIX__}__r`] = metroRequire;
 */
function prefixGlobalNames(path) {
  const { object, property, computed } = path.node;

  if (
    t.isIdentifier(object, { name: 'global' }) &&
    t.isIdentifier(property) &&
    !computed &&
    GLOBAL_NAMES_TO_PREFIX.includes(property.name)
  ) {
    path.replaceWith(
      t.memberExpression(
        t.identifier('global'),
        t.templateLiteral(
          [
            t.templateElement({ raw: '', cooked: '' }),
            t.templateElement(
              { raw: property.name, cooked: property.name },
              true,
            ),
          ],
          [t.identifier(METRO_PREFIX)],
        ),
        true,
      ),
    );
  }
}

/**
 * - global.$RefreshReg$ = () => {};
 * - global.$RefreshSig$ = () => (type) => type;
 * + global.$RefreshReg$ = global.$RefreshReg$ ?? (() => {});
 * + global.$RefreshSig$ = global.$RefreshSig$ ?? (() => type => type);
 */
function defaultRefreshSymbols(path, state) {
  const { node } = path;

  if (
    t.isMemberExpression(node.left) &&
    t.isIdentifier(node.left.object, { name: 'global' }) &&
    t.isIdentifier(node.left.property) &&
    REFRESH_SYMBOLS.includes(node.left.property.name)
  ) {
    const propName = node.left.property.name;

    if (state.hasTransformed[propName]) {
      return;
    }

    const globalProp = t.memberExpression(
      t.identifier('global'),
      t.identifier(node.left.property.name),
    );

    path.replaceWith(
      t.assignmentExpression(
        '=',
        globalProp,
        t.logicalExpression('??', globalProp, node.right),
      ),
    );
    state.hasTransformed[propName] = true;
  }
}

/**
 * - RefreshRuntime.register(type, moduleId + " " + id);
 * + RefreshRuntime.register(type, __METRO_GLOBAL_PREFIX__ + ' ' + moduleId + ' ' + id);
 */
function prefixModuleIDs(path) {
  const { callee, arguments: args } = path.node;
  const isRegisterExports = t.isIdentifier(callee, {
    name: 'registerExportsForReactRefresh',
  });
  const isRefreshRuntimeRegister =
    t.isMemberExpression(callee) &&
    t.isIdentifier(callee.object, { name: 'RefreshRuntime' }) &&
    t.isIdentifier(callee.property, { name: 'register' });

  if (!isRegisterExports && !isRefreshRuntimeRegister) return;

  const lastArgIndex = args.length - 1;
  const lastArg = args[lastArgIndex];

  args[lastArgIndex] = t.binaryExpression(
    '+',
    t.identifier(METRO_PREFIX),
    t.binaryExpression('+', t.stringLiteral(' '), lastArg),
  );
}

/**
 * - global[__METRO_GLOBAL_PREFIX__ + '__ReactRefresh'] || metroRequire.Refresh
 * + global[global.__METRO_GLOBAL_PREFIX__ + '__ReactRefresh'] ||
 * + metroRequire.Refresh
 */
function patchRequireRefresh(path) {
  const funcPath = path.findParent(
    (p) =>
      (p.isFunctionDeclaration() || p.isFunctionExpression()) &&
      p.node.id?.name === 'requireRefresh',
  );

  if (!funcPath) return;

  const newReturn = t.logicalExpression(
    '||',
    t.memberExpression(
      t.identifier('global'),
      t.binaryExpression(
        '+',
        t.memberExpression(t.identifier('global'), t.identifier(METRO_PREFIX)),
        t.stringLiteral('__ReactRefresh'),
      ),
      true,
    ),
    t.memberExpression(t.identifier('metroRequire'), t.identifier('Refresh')),
  );

  path.get('argument').replaceWith(newReturn);
}

function metroPatchRequireBabelPlugin() {
  return {
    name: 'module-federation-metro-patch-require',
    visitor: {
      Program: {
        enter(_, state) {
          // Transform only require.js from metro-runtime
          state.shouldTransform = state.file.opts.filename.includes(
            'metro-runtime/src/polyfills/require.js',
          );
          // Perform refreshSymbols transformation only once
          // Because it is referenced in multiple places
          state.hasTransformed = {
            $RefreshReg$: false,
            $RefreshSig$: false,
          };
        },
      },
      MemberExpression(path, state) {
        if (!state.shouldTransform) return;
        prefixGlobalNames(path);
      },
      AssignmentExpression(path, state) {
        if (!state.shouldTransform) return;
        defaultRefreshSymbols(path, state);
      },
      CallExpression(path, state) {
        if (!state.shouldTransform) return;
        prefixModuleIDs(path);
      },
      ReturnStatement(path, state) {
        if (!state.shouldTransform) return;
        patchRequireRefresh(path);
      },
    },
  };
}

module.exports = metroPatchRequireBabelPlugin;
