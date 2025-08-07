// reuse `@babel/types` from `metro`
const metroPath = require.resolve('metro');
const babelTypesPath = require.resolve('@babel/types', { paths: [metroPath] });
const t = require(babelTypesPath);

/**
 * Inject require('mf:init-host') right after 'use strict' directive
 * in React Native's Initialize Core
 */
function injectInitHostRequire(path, state) {
  // Only process once per file
  if (state.hasInjected) return;

  let insertIndex = 0;

  // Find the position after 'use strict' directive
  for (let i = 0; i < path.node.body.length; i++) {
    const node = path.node.body[i];
    if (
      t.isExpressionStatement(node) &&
      t.isStringLiteral(node.expression) &&
      node.expression.value === 'use strict'
    ) {
      insertIndex = i + 1;
      break;
    }
  }

  // Create the require('mf:init-host') statement
  const requireStatement = t.expressionStatement(
    t.callExpression(t.identifier('require'), [
      t.stringLiteral('mf:init-host'),
    ]),
  );

  // Insert the require statement
  path.node.body.splice(insertIndex, 0, requireStatement);
  state.hasInjected = true;
}

function metroPatchInitializeCorePlugin() {
  return {
    name: 'module-federation-metro-patch-initialize-core',
    visitor: {
      Program: {
        enter(_, state) {
          state.hasInjected = false;
          state.shouldTransform = state.file.opts.filename.includes(
            'react-native/Libraries/Core/InitializeCore.js',
          );
        },
        exit(path, state) {
          if (!state.shouldTransform) return;
          injectInitHostRequire(path, state);
        },
      },
    },
  };
}

module.exports = metroPatchInitializeCorePlugin;
