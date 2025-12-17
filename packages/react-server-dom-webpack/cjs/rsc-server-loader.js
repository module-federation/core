/**
 * rsc-server-loader.js
 *
 * Webpack loader for the RSC (React Server Components) layer.
 *
 * Transformations:
 * - 'use client' modules → createClientReference() proxies
 * - 'use server' modules → registerServerReference() metadata added
 * - Inline 'use server' functions → registerServerReference() for each function
 *
 * This loader runs on the SERVER during RSC rendering.
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
            exports.push({ name: node.declaration.id.name, type: 'function' });
          }
          if (node.declaration.type === 'VariableDeclaration') {
            for (const decl of node.declaration.declarations) {
              if (decl.id && decl.id.type === 'Identifier') {
                exports.push({ name: decl.id.name, type: 'variable' });
              }
            }
          }
        }
        if (node.specifiers) {
          for (const spec of node.specifiers) {
            exports.push({ name: spec.exported.name, type: 'reexport' });
          }
        }
      }
      if (node.type === 'ExportDefaultDeclaration') {
        // Capture the actual function/class name for default exports
        // This allows us to reference it directly instead of exports.default
        let localName = null;
        if (node.declaration) {
          if (
            node.declaration.type === 'FunctionDeclaration' &&
            node.declaration.id
          ) {
            localName = node.declaration.id.name;
          } else if (
            node.declaration.type === 'ClassDeclaration' &&
            node.declaration.id
          ) {
            localName = node.declaration.id.name;
          } else if (node.declaration.type === 'Identifier') {
            localName = node.declaration.name;
          }
        }
        exports.push({ name: 'default', type: 'default', localName });
      }
    }
  } catch (e) {
    // Ignore parse errors
  }
  return exports;
}

/**
 * Check if a function body starts with 'use server' directive
 */
function hasUseServerDirective(body) {
  if (
    !body ||
    body.type !== 'BlockStatement' ||
    !body.body ||
    body.body.length === 0
  ) {
    return false;
  }
  const firstStmt = body.body[0];
  return (
    firstStmt.type === 'ExpressionStatement' &&
    firstStmt.expression &&
    firstStmt.expression.type === 'Literal' &&
    firstStmt.expression.value === 'use server'
  );
}

// Shared map for inline server actions (populated by loader, read by plugin)
// Key format: "moduleUrl#actionName"
const inlineServerActionsMap = new Map();

// Track which modules have entries in the map (for clearing stale entries on rebuild)
const moduleEntriesMap = new Map(); // moduleUrl -> Set of actionIds

/**
 * Find all inline server action functions in the source
 * These are functions with 'use server' as their first statement
 */
function findInlineServerActions(source) {
  const actions = [];
  let actionCounter = 0;

  try {
    const ast = acorn.parse(source, {
      ecmaVersion: '2024',
      sourceType: 'module',
    });

    function visit(node, parent, parentKey) {
      if (!node || typeof node !== 'object') return;

      // Check function declarations
      if (
        node.type === 'FunctionDeclaration' &&
        node.id &&
        hasUseServerDirective(node.body)
      ) {
        actions.push({
          name: node.id.name,
          start: node.start,
          end: node.end,
          isAsync: node.async,
          generated: false,
        });
      }

      // Check function expressions and arrow functions assigned to variables
      if (node.type === 'VariableDeclaration') {
        for (const decl of node.declarations) {
          if (decl.init && decl.id && decl.id.type === 'Identifier') {
            const init = decl.init;
            if (
              (init.type === 'FunctionExpression' ||
                init.type === 'ArrowFunctionExpression') &&
              hasUseServerDirective(init.body)
            ) {
              actions.push({
                name: decl.id.name,
                start: node.start,
                end: node.end,
                isAsync: init.async,
                generated: false,
              });
            }
          }
        }
      }

      // Check async function expressions passed directly (e.g., as props or in JSX)
      if (
        (node.type === 'FunctionExpression' ||
          node.type === 'ArrowFunctionExpression') &&
        hasUseServerDirective(node.body) &&
        parent &&
        parent.type !== 'VariableDeclarator'
      ) {
        // Anonymous inline action - generate a name
        actionCounter++;
        actions.push({
          name: `$$ACTION_${actionCounter}`,
          start: node.start,
          end: node.end,
          isAsync: node.async,
          generated: true,
          node: node,
        });
      }

      // Recurse into child nodes
      for (const key in node) {
        if (key === 'parent') continue;
        const child = node[key];
        if (Array.isArray(child)) {
          for (const c of child) {
            visit(c, node, key);
          }
        } else if (child && typeof child === 'object' && child.type) {
          visit(child, node, key);
        }
      }
    }

    visit(ast, null, null);
  } catch (e) {
    // Ignore parse errors
  }

  return actions;
}

module.exports = function rscServerLoader(source) {
  const directive = getDirective(source);
  const resourcePath = this.resourcePath;
  const moduleUrl = url.pathToFileURL(resourcePath).href;

  // Mark directive on buildInfo so the plugin can discover client refs from module graph
  if (this && this._module && this._module.buildInfo) {
    this._module.buildInfo.rscDirective = directive;
  }

  // 'use client' → Create client references (proxies)
  if (directive === 'use client') {
    const exports = getExports(source);

    let output = `
// RSC Server Loader: 'use client' module transformed to client references
import { createClientModuleProxy } from 'react-server-dom-webpack/server.node';

const proxy = createClientModuleProxy('${moduleUrl}');
`;

    for (const exp of exports) {
      if (exp.name === 'default') {
        output += `export default proxy.default;\n`;
      } else {
        output += `export const ${exp.name} = proxy['${exp.name}'];\n`;
      }
    }

    return output;
  }

  // 'use server' at file level → Keep original + register server references
  if (directive === 'use server') {
    const exports = getExports(source);

    // IMPORTANT: Keep 'use server' directive FIRST so ReactFlightPlugin can detect it
    // The plugin's parser hook breaks out of the loop when it sees a non-directive statement
    // Import must come AFTER the 'use server' directive line
    const directiveLine = "'use server';\n";

    // Remove the 'use server' directive from the original source since we'll add it back at the top
    // Match 'use server' or "use server" with optional semicolon and whitespace
    const sourceWithoutDirective = source.replace(
      /^(['"])use server\1\s*;?\s*\n?/,
      '',
    );

    // Import after directive so webpack resolves it through its module system (ensures singleton)
    const importStatement = `// RSC Server Loader: Import for server action registration
import { registerServerReference as __rsc_registerServerReference__ } from 'react-server-dom-webpack/server.node';
`;

    // Registration code uses the imported function
    let registration = `
// RSC Server Loader: Server action registration
;(function() {
  var registerServerReference = __rsc_registerServerReference__;
`;

    for (const exp of exports) {
      const actionId = `${moduleUrl}#${exp.name}`;
      if (exp.name === 'default') {
        // For default exports, use the local function name if available
        // This works with webpack's ES module output where exports.default is undefined
        if (exp.localName) {
          registration += `
  if (typeof ${exp.localName} === 'function') {
    registerServerReference(${exp.localName}, '${moduleUrl}', 'default');
  }
`;
        } else {
          // Fallback for anonymous default exports - try module.exports pattern
          registration += `
  if (typeof module !== 'undefined' && typeof module.exports === 'function') {
    registerServerReference(module.exports, '${moduleUrl}', 'default');
  } else if (typeof exports !== 'undefined' && typeof exports.default === 'function') {
    registerServerReference(exports.default, '${moduleUrl}', 'default');
  }
`;
        }
      } else {
        registration += `
  if (typeof ${exp.name} === 'function') {
    registerServerReference(${exp.name}, '${moduleUrl}', '${exp.name}');
  }
`;
      }
    }

    registration += `})();`;

    // Order: 'use server' directive (FIRST) → import → original source (without directive) → registration
    return (
      directiveLine +
      importStatement +
      sourceWithoutDirective +
      '\n' +
      registration
    );
  }

  // Check for inline 'use server' functions (inside Server Components)
  if (source.includes('use server')) {
    const inlineActions = findInlineServerActions(source);

    // Filter out anonymous/generated actions - they require source rewriting we don't support yet
    // Only named functions (function declarations or variable-assigned functions) can be registered
    const namedActions = inlineActions.filter((action) => !action.generated);

    // Always clear stale entries for this module from previous compilation
    // This ensures removed actions don't persist in the manifest
    const existingEntries = moduleEntriesMap.get(moduleUrl);
    if (existingEntries) {
      for (const actionId of existingEntries) {
        inlineServerActionsMap.delete(actionId);
      }
      moduleEntriesMap.delete(moduleUrl);
    }

    if (namedActions.length > 0) {
      // Track new entries for this module
      const newEntries = new Set();

      // Register inline actions in shared map for plugin to generate manifest
      for (const action of namedActions) {
        const actionId = `${moduleUrl}#${action.name}`;
        newEntries.add(actionId);
        inlineServerActionsMap.set(actionId, {
          id: moduleUrl,
          name: action.name,
          chunks: [],
        });
      }

      moduleEntriesMap.set(moduleUrl, newEntries);

      // Insert registration INSIDE the same scope as each action definition
      // Sort by position descending so we can insert from end to beginning without affecting positions
      const sorted = [...namedActions].sort((a, b) => b.end - a.end);

      let result = source;

      for (const action of sorted) {
        // Insert registration right after the function definition, in the same lexical scope
        // Use the imported __rsc_registerServerReference__ which webpack resolves through its module system
        const registration = `\n;(function(){
  if(typeof ${action.name}==='function'){
    __rsc_registerServerReference__(${action.name},'${moduleUrl}','${action.name}');
  }
})();`;

        result =
          result.slice(0, action.end) + registration + result.slice(action.end);
      }

      // Prepend import for registerServerReference so webpack resolves it properly
      const importPrefix = `// RSC Server Loader: Import for inline server action registration
import { registerServerReference as __rsc_registerServerReference__ } from 'react-server-dom-webpack/server.node';
`;
      return importPrefix + result;
    } else if (inlineActions.length > 0) {
      // We found anonymous inline actions but can't register them
      // Log a warning in development
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[rsc-server-loader] Found ${inlineActions.length} anonymous inline 'use server' function(s) in ${resourcePath}. ` +
            `These cannot be registered as server actions. Assign the function to a variable first.`,
        );
      }
    }
  }

  // No directive - pass through unchanged
  return source;
};

// Export helper for testing and the shared map
module.exports.findInlineServerActions = findInlineServerActions;
module.exports.inlineServerActionsMap = inlineServerActionsMap;
