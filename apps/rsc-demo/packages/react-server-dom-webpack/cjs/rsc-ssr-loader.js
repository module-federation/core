/**
 * rsc-ssr-loader.js
 *
 * Webpack loader for the SSR (Server-Side Rendering) layer.
 *
 * Transformations:
 * - 'use server' modules → Stubs that throw errors
 *   (Server actions should not be called during SSR)
 * - 'use client' modules → Pass through (actual components for SSR)
 *
 * This loader runs on the SERVER during SSR/hydration.
 */

'use strict';

const acorn = require('acorn-loose');
const url = require('url');

function getDirective(source) {
  if (!source.includes('use client') && !source.includes('use server'))
    return null;
  try {
    const ast = acorn.parse(source, {
      ecmaVersion: '2024',
      sourceType: 'module',
    });
    for (const node of ast.body) {
      if (node.type !== 'ExpressionStatement' || !node.directive) break;
      if (node.directive === 'use client') return 'use client';
      if (node.directive === 'use server') return 'use server';
    }
  } catch (e) {
    return null;
  }
  return null;
}

function getExports(source) {
  const exports = [];
  try {
    const ast = acorn.parse(source, {
      ecmaVersion: '2024',
      sourceType: 'module',
    });
    for (const node of ast.body) {
      if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration) {
          if (
            node.declaration.type === 'FunctionDeclaration' &&
            node.declaration.id
          ) {
            exports.push(node.declaration.id.name);
          }
          if (node.declaration.type === 'VariableDeclaration') {
            for (const decl of node.declaration.declarations) {
              if (decl.id && decl.id.type === 'Identifier') {
                exports.push(decl.id.name);
              }
            }
          }
        }
      }
      if (node.type === 'ExportDefaultDeclaration') {
        exports.push('default');
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return exports;
}

module.exports = function rscSsrLoader(source) {
  const directive = getDirective(source);

  // 'use server' → Create stubs that throw errors
  // Server actions should never be called during SSR
  if (directive === 'use server') {
    const exports = getExports(source);
    const resourcePath = this.resourcePath;

    let output = `'use strict';
// RSC SSR Loader: 'use server' module replaced with stubs
// Server actions cannot be called during SSR
`;

    const defaultExport = exports.includes('default');

    exports.forEach((name) => {
      const stubBody = `function() {
  throw new Error(
    'Server action "${name}" from "${resourcePath}" cannot be called during SSR. ' +
    'Server actions should only be invoked from client-side code after hydration.'
  );
}`;

      if (name === 'default') {
        // Keep an ESM-style marker for tests while emitting CJS
        output += `// export default function()\n`;
        output += `module.exports = ${stubBody};\n`;
      } else {
        output += `// export const ${name} = function()\n`;
        output += `exports.${name} = ${stubBody};\n`;
      }
    });

    if (!defaultExport) {
      output += `module.exports = exports;\n`;
    }

    return output;
  }

  // 'use client' and other modules - pass through unchanged
  // SSR needs the actual client component code to render
  return source;
};
