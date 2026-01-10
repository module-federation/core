const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const Module = require('module');

// Load the loaders
const rscClientLoader = require('@module-federation/react-server-dom-webpack/rsc-client-loader');
const rscServerLoader = require('@module-federation/react-server-dom-webpack/rsc-server-loader');
const rscSsrLoader = require('@module-federation/react-server-dom-webpack/rsc-ssr-loader');

// Mock webpack loader context
function createLoaderContext(resourcePath) {
  return {
    resourcePath,
    rootContext: '/app',
    getOptions: () => ({}),
  };
}

// Helper to load a CommonJS module from transformed source
function loadFromSource(source, filename) {
  const m = new Module(filename, module.parent);
  m.filename = filename;
  m.paths = Module._nodeModulePaths(path.dirname(filename));
  m._compile(source, filename);
  return m.exports;
}

// --- rsc-client-loader tests ---

test('rsc-client-loader: transforms use server module to createServerReference calls', (t) => {
  const source = `'use server';

export async function incrementCount() {
  return 1;
}

export async function getCount() {
  return 0;
}
`;

  const context = createLoaderContext('/app/src/actions.js');
  const result = rscClientLoader.call(context, source);

  // Should import createServerReference
  assert.match(
    result,
    /import \{ createServerReference \} from '@module-federation\/react-server-dom-webpack\/client'/,
  );

  // Should create server references for both exports
  assert.match(result, /export const incrementCount = createServerReference\(/);
  assert.match(result, /export const getCount = createServerReference\(/);

  // Should include the action IDs
  assert.match(result, /file:\/\/\/app\/src\/actions\.js#incrementCount/);
  assert.match(result, /file:\/\/\/app\/src\/actions\.js#getCount/);
});

test('rsc-client-loader: handles default export in use server module', (t) => {
  const source = `'use server';

export default async function submitForm(data) {
  return { success: true };
}
`;

  const context = createLoaderContext('/app/src/submit.js');
  const result = rscClientLoader.call(context, source);

  // Should handle default export
  assert.match(result, /const _default = createServerReference\(/);
  assert.match(result, /export default _default/);
});

test('rsc-client-loader: passes through use client module unchanged', (t) => {
  const source = `'use client';

import { useState } from 'react';

export default function Button() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
`;

  const context = createLoaderContext('/app/src/Button.js');
  const result = rscClientLoader.call(context, source);

  // Should return original source unchanged
  assert.equal(result, source);
});

test('rsc-client-loader: passes through regular module unchanged', (t) => {
  const source = `
export function formatDate(date) {
  return date.toISOString();
}
`;

  const context = createLoaderContext('/app/src/utils.js');
  const result = rscClientLoader.call(context, source);

  // Should return original source unchanged
  assert.equal(result, source);
});

test('rsc-client-loader: populates serverReferencesMap', (t) => {
  const serverReferencesMap =
    typeof rscClientLoader.getServerReferencesMap === 'function'
      ? rscClientLoader.getServerReferencesMap('/app')
      : rscClientLoader.serverReferencesMap;

  // Clear the map first
  serverReferencesMap.clear();

  const source = `'use server';

export async function myAction() {
  return 'done';
}
`;

  const context = createLoaderContext('/app/src/my-actions.js');
  rscClientLoader.call(context, source);

  // Check the map was populated
  const actionId = 'file:///app/src/my-actions.js#myAction';
  assert.ok(serverReferencesMap.has(actionId));

  const entry = serverReferencesMap.get(actionId);
  assert.equal(entry.id, 'file:///app/src/my-actions.js');
  assert.equal(entry.name, 'myAction');
  assert.deepEqual(entry.chunks, []);
});

// --- rsc-server-loader tests ---

test('rsc-server-loader: transforms use client module to createClientModuleProxy', (t) => {
  const source = `'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button>{count}</button>;
}

export function Label({ text }) {
  return <span>{text}</span>;
}
`;

  const context = createLoaderContext('/app/src/Counter.js');
  const result = rscServerLoader.call(context, source);

  // Should import createClientModuleProxy
  assert.match(
    result,
    /import \{ createClientModuleProxy \} from '@module-federation\/react-server-dom-webpack\/server\.node'/,
  );

  // Should create proxy
  assert.match(
    result,
    /const proxy = createClientModuleProxy\('file:\/\/\/app\/src\/Counter\.js'\)/,
  );

  // Should export proxy properties
  assert.match(result, /export default proxy\.default/);
  assert.match(result, /export const Label = proxy\['Label'\]/);
});

test('rsc-server-loader: adds registerServerReference to use server module', (t) => {
  const source = `'use server';

export async function saveData(data) {
  return { saved: true };
}
`;

  const context = createLoaderContext('/app/src/save.js');
  const result = rscServerLoader.call(context, source);

  // Should keep original source
  assert.match(result, /export async function saveData\(data\)/);

  // Should import registerServerReference (webpack resolves this through its module system)
  assert.match(
    result,
    /import \{ registerServerReference as __rsc_registerServerReference__ \} from '@module-federation\/react-server-dom-webpack\/server\.node'/,
  );

  // Should register the server reference using the imported function
  assert.match(
    result,
    /__rsc_registerServerReference__\(saveData, 'file:\/\/\/app\/src\/save\.js', 'saveData'\)|registerServerReference\(saveData, 'file:\/\/\/app\/src\/save\.js', 'saveData'\)/,
  );
});

test('rsc-server-loader: passes through regular module unchanged', (t) => {
  const source = `
export const API_URL = 'https://api.example.com';

export function fetchData(endpoint) {
  return fetch(API_URL + endpoint);
}
`;

  const context = createLoaderContext('/app/src/api.js');
  const result = rscServerLoader.call(context, source);

  // Should return original source unchanged
  assert.equal(result, source);
});

// --- rsc-ssr-loader tests ---

test('rsc-ssr-loader: transforms use server module to error stubs', (t) => {
  const source = `'use server';

export async function deleteItem(id) {
  // database delete
}

export async function updateItem(id, data) {
  // database update
}
`;

  const context = createLoaderContext('/app/src/db-actions.js');
  const result = rscSsrLoader.call(context, source);

  // Should create stubs that throw errors
  assert.match(result, /export const deleteItem = function\(\)/);
  assert.match(result, /export const updateItem = function\(\)/);

  // Should include helpful error messages
  assert.match(
    result,
    /Server action "deleteItem" from "\/app\/src\/db-actions\.js" cannot be called during SSR/,
  );
  assert.match(
    result,
    /Server action "updateItem" from "\/app\/src\/db-actions\.js" cannot be called during SSR/,
  );

  // Should NOT include original function bodies
  assert.doesNotMatch(result, /database delete/);
  assert.doesNotMatch(result, /database update/);
});

test('rsc-ssr-loader: handles default export in use server module', (t) => {
  const source = `'use server';

export default async function processForm(formData) {
  // process
}
`;

  const context = createLoaderContext('/app/src/process.js');
  const result = rscSsrLoader.call(context, source);

  // Should create default export stub
  assert.match(result, /export default function\(\)/);
  assert.match(result, /Server action "default"/);
});

test('rsc-ssr-loader: passes through use client module unchanged', (t) => {
  const source = `'use client';

export default function Modal({ children }) {
  return <div className="modal">{children}</div>;
}
`;

  const context = createLoaderContext('/app/src/Modal.js');
  const result = rscSsrLoader.call(context, source);

  // Should return original source unchanged (SSR needs client component code)
  assert.equal(result, source);
});

test('rsc-ssr-loader: passes through regular module unchanged', (t) => {
  const source = `
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
`;

  const context = createLoaderContext('/app/src/calc.js');
  const result = rscSsrLoader.call(context, source);

  // Should return original source unchanged
  assert.equal(result, source);
});

test('rsc-ssr-loader: stubbed server actions throw when called during SSR', (t) => {
  const source = `'use server';

export async function doSomething() {
  // real logic would go here
}
`;

  const filename = '/app/src/ssr-actions.js';
  const context = createLoaderContext(filename);
  const transformed = rscSsrLoader.call(context, source);

  const mod = loadFromSource(transformed, filename);
  assert.equal(typeof mod.doSomething, 'function');

  assert.throws(() => mod.doSomething(), /cannot be called during SSR/);
});

// --- Directive detection edge cases ---

test('loaders: comment before directive is still valid', (t) => {
  // Comments don't count as statements, so directive after comment is valid
  const source = `// This is a comment
'use server';

export async function action() {}
`;

  const context = createLoaderContext('/app/src/with-comment.js');

  // Directive should be detected (comments don't prevent detection)
  const clientResult = rscClientLoader.call(context, source);
  assert.match(clientResult, /createServerReference/);

  const ssrResult = rscSsrLoader.call(context, source);
  assert.match(ssrResult, /Server action "action"/);
});

test('loaders: handle directive blocked by code', (t) => {
  // Directive after actual code is NOT valid
  const source = `const x = 1;
'use server';

export async function action() {}
`;

  const context = createLoaderContext('/app/src/blocked.js');

  // All loaders should pass through (directive not valid after code)
  assert.equal(rscClientLoader.call(context, source), source);
  assert.equal(rscSsrLoader.call(context, source), source);
  assert.equal(rscServerLoader.call(context, source), source);
});

test('loaders: handle files without directives', (t) => {
  const source = `
import React from 'react';

export function SharedComponent() {
  return <div>Shared</div>;
}
`;

  const context = createLoaderContext('/app/src/Shared.js');

  // All loaders should pass through unchanged
  assert.equal(rscClientLoader.call(context, source), source);
  assert.equal(rscSsrLoader.call(context, source), source);
  assert.equal(rscServerLoader.call(context, source), source);
});

// --- serverReferencesMap export test ---

test('rsc-client-loader: exports serverReferencesMap correctly', (t) => {
  const serverReferencesMap =
    typeof rscClientLoader.getServerReferencesMap === 'function'
      ? rscClientLoader.getServerReferencesMap('/app')
      : rscClientLoader.serverReferencesMap;
  assert.ok(
    serverReferencesMap instanceof Map,
    'serverReferencesMap should be a Map',
  );
  assert.equal(
    typeof rscClientLoader,
    'function',
    'module.exports should be the loader function',
  );
});

// --- Inline 'use server' tests ---

test('rsc-server-loader: detects inline use server in function declaration', (t) => {
  const source = `
export default function Page() {
  async function submitForm(data) {
    'use server';
    return { success: true };
  }

  return <form action={submitForm}></form>;
}
`;

  const context = createLoaderContext('/app/src/page.js');
  const result = rscServerLoader.call(context, source);

  // Should keep original source
  assert.match(result, /async function submitForm\(data\)/);

  // Should import registerServerReference at top of module
  assert.match(
    result,
    /import \{ registerServerReference as __rsc_registerServerReference__ \} from '@module-federation\/react-server-dom-webpack\/server\.node'/,
  );

  // Should register the inline action using imported function
  assert.match(result, /__rsc_registerServerReference__\(submitForm/);
});

test('rsc-server-loader: detects inline use server in arrow function', (t) => {
  const source = `
export default function Page() {
  const handleSubmit = async (data) => {
    'use server';
    return { saved: true };
  };

  return <form action={handleSubmit}></form>;
}
`;

  const context = createLoaderContext('/app/src/page2.js');
  const result = rscServerLoader.call(context, source);

  // Should add registerServerReference for the arrow function using imported function
  assert.match(result, /__rsc_registerServerReference__\(handleSubmit/);
});

test('rsc-server-loader: detects multiple inline server actions', (t) => {
  const source = `
export default function Page() {
  async function createItem(data) {
    'use server';
    return { id: 1 };
  }

  async function deleteItem(id) {
    'use server';
    return { deleted: true };
  }

  return <div></div>;
}
`;

  const context = createLoaderContext('/app/src/page3.js');
  const result = rscServerLoader.call(context, source);

  // Should register both actions using imported function
  assert.match(result, /__rsc_registerServerReference__\(createItem/);
  assert.match(result, /__rsc_registerServerReference__\(deleteItem/);
});

test('rsc-server-loader: populates inlineServerActionsMap', (t) => {
  // Clear the map first
  rscServerLoader.inlineServerActionsMap.clear();

  const source = `
export default function Page() {
  async function myInlineAction() {
    'use server';
    return 'done';
  }
  return null;
}
`;

  const context = createLoaderContext('/app/src/inline-page.js');
  rscServerLoader.call(context, source);

  // Check the map was populated
  const actionId = 'file:///app/src/inline-page.js#myInlineAction';
  assert.ok(
    rscServerLoader.inlineServerActionsMap.has(actionId),
    'inlineServerActionsMap should have the action',
  );

  const entry = rscServerLoader.inlineServerActionsMap.get(actionId);
  assert.equal(entry.id, 'file:///app/src/inline-page.js');
  assert.equal(entry.name, 'myInlineAction');
});

test('rsc-server-loader: does not detect use server in string literal', (t) => {
  const source = `
export default function Page() {
  const message = 'use server';
  return <div>{message}</div>;
}
`;

  const context = createLoaderContext('/app/src/no-action.js');
  const result = rscServerLoader.call(context, source);

  // Should NOT add registerServerReference (no actual server action)
  assert.doesNotMatch(result, /registerServerReference/);
});

test('rsc-server-loader: exports inlineServerActionsMap', (t) => {
  assert.ok(
    rscServerLoader.inlineServerActionsMap instanceof Map,
    'inlineServerActionsMap should be a Map',
  );
  assert.equal(
    typeof rscServerLoader.findInlineServerActions,
    'function',
    'findInlineServerActions should be exported',
  );
});
