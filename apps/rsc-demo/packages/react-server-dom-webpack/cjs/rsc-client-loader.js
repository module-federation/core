/**
 * rsc-client-loader.js
 *
 * Webpack loader for the CLIENT (browser) layer.
 *
 * Transformations:
 * - 'use server' modules → createServerReference() calls
 * - 'use client' modules → Pass through (actual components)
 *
 * This loader runs in the BROWSER.
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

// Shared map for server references (populated by loader, read by plugin)
const serverReferencesMap = new Map();

function rscClientLoader(source) {
  const directive = getDirective(source);

  // Mark the module with the detected directive so the plugin can discover client refs
  if (this && this._module && this._module.buildInfo) {
    this._module.buildInfo.rscDirective = directive;
  }

  // 'use server' → Create server references
  if (directive === 'use server') {
    const resourcePath = this.resourcePath;
    const moduleUrl = url.pathToFileURL(resourcePath).href;
    const exports = getExports(source);

    // Register in shared map for plugin to generate manifest
    for (const name of exports) {
      const actionId = `${moduleUrl}#${name}`;
      serverReferencesMap.set(actionId, {
        id: moduleUrl,
        name: name,
        chunks: [],
      });
    }

    // Get loader options for callServer import source
    const options = this.getOptions ? this.getOptions() : {};
    const callServerImport = options.callServerModule
      ? `import { callServer } from '${options.callServerModule}';`
      : `const callServer = globalThis.__RSC_CALL_SERVER__ || ((id, args) => {
          throw new Error('callServer not initialized. Set globalThis.__RSC_CALL_SERVER__');
        });`;

    let output = `
// RSC Client Loader: 'use server' module transformed to server references
import { createServerReference } from 'react-server-dom-webpack/client';
${callServerImport}
`;

    for (const name of exports) {
      const actionId = `${moduleUrl}#${name}`;

      if (name === 'default') {
        output += `
const _default = createServerReference('${actionId}', callServer);
export default _default;
`;
      } else {
        output += `
export const ${name} = createServerReference('${actionId}', callServer);
`;
      }
    }

    return output;
  }

  // 'use client' and other modules - pass through unchanged
  return source;
}

// Export the loader function and the shared map
module.exports = rscClientLoader;
module.exports.serverReferencesMap = serverReferencesMap;
