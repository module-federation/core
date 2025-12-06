/**
 * @license React
 * react-server-dom-webpack-node-register.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';
const acorn = require('acorn-loose'),
  url = require('url'),
  Module = require('module');

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

/**
 * Find all inline server action functions in the source AST
 * Returns array of { name, start, end } for each action
 */
function findInlineServerActions(content) {
  const actions = [];
  let ast;

  try {
    ast = acorn.parse(content, {
      ecmaVersion: '2024',
      sourceType: 'module',
    });
  } catch (x) {
    return actions;
  }

  function visit(node) {
    if (!node || typeof node !== 'object') return;

    // Check function declarations with 'use server' in body
    if (
      node.type === 'FunctionDeclaration' &&
      node.id &&
      hasUseServerDirective(node.body)
    ) {
      actions.push({
        name: node.id.name,
        start: node.start,
        end: node.end,
        bodyStart: node.body.start,
      });
    }

    // Check variable declarations with function expressions
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
              bodyStart: init.body.start,
            });
          }
        }
      }
    }

    // Recurse into child nodes
    for (const key in node) {
      if (key === 'parent') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const c of child) {
          visit(c);
        }
      } else if (child && typeof child === 'object' && child.type) {
        visit(child);
      }
    }
  }

  visit(ast);
  return actions;
}

/**
 * Transform source code to register inline server actions
 * Adds registerServerReference calls after each inline action definition
 */
function transformInlineServerActions(content, filename, inlineActions) {
  const moduleUrl = url.pathToFileURL(filename).href;

  // Sort by position descending so we can insert from end to beginning
  // without messing up positions
  const sorted = [...inlineActions].sort((a, b) => b.end - a.end);

  let result = content;

  for (const action of sorted) {
    // Insert registration after the function definition
    const registration = `\n;(function(){if(typeof ${action.name}==='function'){require('react-server-dom-webpack/server').registerServerReference(${action.name},'${moduleUrl}','${action.name}');}})();`;

    result =
      result.slice(0, action.end) + registration + result.slice(action.end);
  }

  return result;
}

module.exports = function () {
  const Server = require('react-server-dom-webpack/server'),
    registerServerReference = Server.registerServerReference,
    createClientModuleProxy = Server.createClientModuleProxy,
    originalCompile = Module.prototype._compile;

  Module.prototype._compile = function (content, filename) {
    // Quick check for any potential directives
    if (
      -1 === content.indexOf('use client') &&
      -1 === content.indexOf('use server')
    )
      return originalCompile.apply(this, arguments);

    let body;
    try {
      body = acorn.parse(content, {
        ecmaVersion: '2024',
        sourceType: 'module',
      }).body;
    } catch (x) {
      console.error('Error parsing %s %s', filename, x.message);
      return originalCompile.apply(this, arguments);
    }

    // Check for file-level directives
    let useClient = false,
      useServer = false;
    for (let i = 0; i < body.length; i++) {
      const node = body[i];
      if ('ExpressionStatement' !== node.type || !node.directive) break;
      if ('use client' === node.directive) useClient = true;
      if ('use server' === node.directive) useServer = true;
    }

    if (useClient && useServer) {
      throw Error(
        'Cannot have both "use client" and "use server" directives in the same file.'
      );
    }

    // Handle 'use client' modules
    if (useClient) {
      const moduleUrl = url.pathToFileURL(filename).href;
      this.exports = createClientModuleProxy(moduleUrl);
      return;
    }

    // Handle file-level 'use server' modules
    if (useServer) {
      originalCompile.apply(this, arguments);
      const moduleUrl = url.pathToFileURL(filename).href;
      const exports = this.exports;

      if ('function' === typeof exports) {
        registerServerReference(exports, moduleUrl, 'default');
      } else {
        for (const key of Object.keys(exports)) {
          const value = exports[key];
          if ('function' === typeof value) {
            registerServerReference(value, moduleUrl, key);
          }
        }
      }
      return;
    }

    // Check for inline 'use server' functions in this file
    const inlineActions = findInlineServerActions(content);

    if (inlineActions.length > 0) {
      // Transform the source to add registration calls
      const transformedContent = transformInlineServerActions(
        content,
        filename,
        inlineActions
      );

      // Compile the transformed source
      return originalCompile.call(this, transformedContent, filename);
    }

    // No directives - pass through unchanged
    return originalCompile.apply(this, arguments);
  };
};
