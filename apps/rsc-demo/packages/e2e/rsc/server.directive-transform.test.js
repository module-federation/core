const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

// Load the loaders
const rscServerLoader = require('../../react-server-dom-webpack/cjs/rsc-server-loader.js');

// Mock webpack loader context
function createLoaderContext(resourcePath) {
  return {
    resourcePath,
    getOptions: () => ({}),
    _module: {buildInfo: {}},
  };
}

// Escape special regex characters in a string
// First escape backslashes, then other special chars (CodeQL: complete escaping)
function escapeRegExp(string) {
  // Escape backslashes first to avoid double-escaping
  const withBackslashes = string.replace(/\\/g, '\\\\');
  // Then escape other regex special characters
  return withBackslashes.replace(/[.*+?^${}()|[\]]/g, '\\$&');
}

// === 'use client' TRANSFORMATION TESTS ===

test("'use client' transformation: replaces module with createClientModuleProxy call", (t) => {
  const source = `'use client';

import { useState } from 'react';

export default function MyComponent() {
  const [count, setCount] = useState(0);
  return <button>{count}</button>;
}
`;

  const context = createLoaderContext('/app/src/MyComponent.js');
  const result = rscServerLoader.call(context, source);

  // Should import createClientModuleProxy
  assert.match(
    result,
    /import \{ createClientModuleProxy \} from 'react-server-dom-webpack\/server\.node'/,
    'Should import createClientModuleProxy from react-server-dom-webpack/server.node'
  );

  // Should create proxy with file URL
  assert.match(
    result,
    /const proxy = createClientModuleProxy\('file:\/\/\/app\/src\/MyComponent\.js'\)/,
    'Should create proxy referencing the original file path as file URL'
  );
});

test("'use client' transformation: proxy references the original file path", (t) => {
  const source = `'use client';
export function Widget() { return <div>Widget</div>; }
`;

  const testPaths = [
    '/project/src/components/Widget.js',
    '/Users/dev/app/ui/Button.jsx',
    '/home/user/code/lib/Modal.js',
  ];

  for (const testPath of testPaths) {
    const context = createLoaderContext(testPath);
    const result = rscServerLoader.call(context, source);

    // Convert to file URL format
    const expectedUrl = `file://${testPath}`;
    assert.match(
      result,
      new RegExp(`createClientModuleProxy\\('${escapeRegExp(expectedUrl)}`)
    );
  }
});

test("'use client' transformation: default export is proxied correctly", (t) => {
  const source = `'use client';

export default function Button() {
  return <button>Click me</button>;
}
`;

  const context = createLoaderContext('/app/src/Button.js');
  const result = rscServerLoader.call(context, source);

  // Should export proxy.default as default
  assert.match(
    result,
    /export default proxy\.default/,
    'Default export should reference proxy.default'
  );
});

test("'use client' transformation: named exports are proxied correctly", (t) => {
  const source = `'use client';

export function PrimaryButton() {
  return <button className="primary">Primary</button>;
}

export function SecondaryButton() {
  return <button className="secondary">Secondary</button>;
}

export const IconButton = () => <button className="icon">Icon</button>;
`;

  const context = createLoaderContext('/app/src/Buttons.js');
  const result = rscServerLoader.call(context, source);

  // Should export named exports from proxy
  assert.match(
    result,
    /export const PrimaryButton = proxy\['PrimaryButton'\]/,
    'Named export PrimaryButton should reference proxy'
  );
  assert.match(
    result,
    /export const SecondaryButton = proxy\['SecondaryButton'\]/,
    'Named export SecondaryButton should reference proxy'
  );
  assert.match(
    result,
    /export const IconButton = proxy\['IconButton'\]/,
    'Named export IconButton should reference proxy'
  );
});

test("'use client' transformation: mixed default and named exports", (t) => {
  const source = `'use client';

export default function Main() {
  return <main>Main content</main>;
}

export function Header() {
  return <header>Header</header>;
}

export function Footer() {
  return <footer>Footer</footer>;
}
`;

  const context = createLoaderContext('/app/src/Layout.js');
  const result = rscServerLoader.call(context, source);

  // Should have both default and named exports proxied
  assert.match(result, /export default proxy\.default/);
  assert.match(result, /export const Header = proxy\['Header'\]/);
  assert.match(result, /export const Footer = proxy\['Footer'\]/);
});

// === 'use server' TRANSFORMATION TESTS ===

test("'use server' transformation: registerServerReference is called for each exported function", (t) => {
  const source = `'use server';

export async function createItem(data) {
  return { id: 1, ...data };
}

export async function deleteItem(id) {
  return { deleted: true };
}

export async function updateItem(id, data) {
  return { id, ...data };
}
`;

  const context = createLoaderContext('/app/src/item-actions.js');
  const result = rscServerLoader.call(context, source);

  // Should keep original source
  assert.match(result, /export async function createItem/);
  assert.match(result, /export async function deleteItem/);
  assert.match(result, /export async function updateItem/);

  // Should call registerServerReference for each function
  assert.match(
    result,
    /registerServerReference\(createItem/,
    'Should register createItem'
  );
  assert.match(
    result,
    /registerServerReference\(deleteItem/,
    'Should register deleteItem'
  );
  assert.match(
    result,
    /registerServerReference\(updateItem/,
    'Should register updateItem'
  );
});

test("'use server' transformation: action ID includes file path and export name", (t) => {
  const source = `'use server';

export async function submitForm(data) {
  return { success: true };
}
`;

  const context = createLoaderContext('/app/src/form-actions.js');
  const result = rscServerLoader.call(context, source);

  // Action ID should be file URL path
  assert.match(
    result,
    /registerServerReference\(submitForm, 'file:\/\/\/app\/src\/form-actions\.js', 'submitForm'\)/,
    'Action ID should include full file path and export name'
  );
});

test("'use server' transformation: both async and sync functions are registered", (t) => {
  const source = `'use server';

export async function asyncAction() {
  return await Promise.resolve('async result');
}

export function syncAction() {
  return 'sync result';
}
`;

  const context = createLoaderContext('/app/src/mixed-actions.js');
  const result = rscServerLoader.call(context, source);

  // Both should be registered
  assert.match(
    result,
    /registerServerReference\(asyncAction/,
    'Async function should be registered'
  );
  assert.match(
    result,
    /registerServerReference\(syncAction/,
    'Sync function should be registered'
  );
});

test("'use server' transformation: default export function is registered", (t) => {
  const source = `'use server';

export default async function processData(data) {
  return { processed: true };
}
`;

  const context = createLoaderContext('/app/src/process.js');
  const result = rscServerLoader.call(context, source);

  // Default export should be registered using the function name
  assert.match(
    result,
    /registerServerReference\(processData, 'file:\/\/\/app\/src\/process\.js', 'default'\)/,
    'Default export should be registered with name "default"'
  );
});

// === SHARED MODULE (@rsc-demo/shared-rsc) TRANSFORMATION TESTS ===

test('shared module: SharedClientWidget.js with "use client" transforms to client proxy', (t) => {
  const source = `'use client';

import React from 'react';

export default function SharedClientWidget({label = 'shared'}) {
  return <span data-testid="shared-client-widget">Shared: {label}</span>;
}
`;

  const context = createLoaderContext(
    '/Users/zackjackson/core/apps/rsc-demo/packages/shared-rsc/src/SharedClientWidget.js'
  );
  const result = rscServerLoader.call(context, source);

  // Should be transformed to proxy
  assert.match(
    result,
    /createClientModuleProxy/,
    'SharedClientWidget should use createClientModuleProxy'
  );
  assert.match(
    result,
    /file:\/\/\/Users\/zackjackson\/core\/apps\/rsc-demo\/packages\/shared-rsc\/src\/SharedClientWidget\.js/,
    'Proxy should reference the SharedClientWidget file path'
  );
  assert.match(
    result,
    /export default proxy\.default/,
    'Default export should be proxied'
  );
});

test('shared module: shared-server-actions.js with "use server" registers actions', (t) => {
  const source = `'use server';

let sharedCounter = 0;

export async function incrementSharedCounter() {
  sharedCounter += 1;
  return sharedCounter;
}

export function getSharedCounter() {
  return sharedCounter;
}
`;

  const context = createLoaderContext(
    '/Users/zackjackson/core/apps/rsc-demo/packages/shared-rsc/src/shared-server-actions.js'
  );
  const result = rscServerLoader.call(context, source);

  // Should keep original code
  assert.match(result, /let sharedCounter = 0/);
  assert.match(result, /export async function incrementSharedCounter/);
  assert.match(result, /export function getSharedCounter/);

  // Should register both server references
  assert.match(
    result,
    /registerServerReference\(incrementSharedCounter, 'file:\/\/\/Users\/zackjackson\/core\/apps\/rsc-demo\/packages\/shared-rsc\/src\/shared-server-actions\.js', 'incrementSharedCounter'\)/,
    'incrementSharedCounter should be registered as server reference'
  );
  assert.match(
    result,
    /registerServerReference\(getSharedCounter, 'file:\/\/\/Users\/zackjackson\/core\/apps\/rsc-demo\/packages\/shared-rsc\/src\/shared-server-actions\.js', 'getSharedCounter'\)/,
    'getSharedCounter should be registered as server reference'
  );
});

test('shared module: index.js re-exports work correctly (no directive)', (t) => {
  const source = `export {default as SharedClientWidget} from './SharedClientWidget.js';
export * as sharedServerActions from './shared-server-actions.js';
`;

  const context = createLoaderContext(
    '/Users/zackjackson/core/apps/rsc-demo/packages/shared-rsc/src/index.js'
  );
  const result = rscServerLoader.call(context, source);

  // Should pass through unchanged (no directive)
  assert.equal(
    result,
    source,
    'index.js without directive should pass through unchanged'
  );
});

// === BUILT OUTPUT VERIFICATION TESTS ===

test('built output: app1 _rsc_shared-rsc_src_index_js.rsc.js has correct transformations', (t) => {
  const chunkFilePath = path.resolve(
    __dirname,
    '../../app1/build/_rsc_shared-rsc_src_index_js.rsc.js'
  );
  const mainBundlePath = path.resolve(
    __dirname,
    '../../app1/build/server.rsc.js'
  );

  // Skip if build output doesn't exist
  if (!fs.existsSync(chunkFilePath) || !fs.existsSync(mainBundlePath)) {
    t.skip('Build output not found - run build first');
    return;
  }

  const chunkContent = fs.readFileSync(chunkFilePath, 'utf-8');
  const mainContent = fs.readFileSync(mainBundlePath, 'utf-8');

  // Verify SharedClientWidget transformation in chunk
  assert.match(
    chunkContent,
    /createClientModuleProxy/,
    'Chunk should contain createClientModuleProxy call'
  );
  assert.match(
    chunkContent,
    /SharedClientWidget\.js/,
    'Chunk should reference SharedClientWidget.js'
  );

  // Verify shared-server-actions transformation in main bundle (where the module is bundled)
  assert.match(
    mainContent,
    /registerServerReference.*incrementSharedCounter|__rsc_registerServerReference__.*incrementSharedCounter/,
    'Main bundle should register incrementSharedCounter'
  );
  assert.match(
    mainContent,
    /registerServerReference.*getSharedCounter|__rsc_registerServerReference__.*getSharedCounter/,
    'Main bundle should register getSharedCounter'
  );
});

test('built output: verify registerServerReference calls in built output', (t) => {
  const mainBundlePath = path.resolve(
    __dirname,
    '../../app1/build/server.rsc.js'
  );

  if (!fs.existsSync(mainBundlePath)) {
    t.skip('Build output not found - run build first');
    return;
  }

  const builtContent = fs.readFileSync(mainBundlePath, 'utf-8');

  // Verify structure of registerServerReference calls (may use __rsc_registerServerReference__ alias)
  assert.match(
    builtContent,
    /(?:registerServerReference|__rsc_registerServerReference__)\(incrementSharedCounter,\s*['"]file:\/\/.*shared-server-actions\.js['"],\s*['"]incrementSharedCounter['"]\)/,
    'registerServerReference call should have correct signature for incrementSharedCounter'
  );
  assert.match(
    builtContent,
    /(?:registerServerReference|__rsc_registerServerReference__)\(getSharedCounter,\s*['"]file:\/\/.*shared-server-actions\.js['"],\s*['"]getSharedCounter['"]\)/,
    'registerServerReference call should have correct signature for getSharedCounter'
  );
});

test('built output: verify createClientModuleProxy calls in built output', (t) => {
  const builtFilePath = path.resolve(
    __dirname,
    '../../app1/build/_rsc_shared-rsc_src_index_js.rsc.js'
  );

  if (!fs.existsSync(builtFilePath)) {
    t.skip('Build output not found - run build first');
    return;
  }

  const builtContent = fs.readFileSync(builtFilePath, 'utf-8');

  // Verify createClientModuleProxy is called with correct path
  // Note: webpack concatenation may wrap the call as (0,module.createClientModuleProxy)
  assert.match(
    builtContent,
    /createClientModuleProxy\)\(['"]file:\/\/.*SharedClientWidget\.js['"]\)/,
    'createClientModuleProxy should be called with SharedClientWidget.js file URL'
  );

  // Verify proxy.default is used for default export
  assert.match(
    builtContent,
    /proxy\.default/,
    'Built output should use proxy.default for default export'
  );
});

test('built output: verify re-exports are wired correctly', (t) => {
  const builtFilePath = path.resolve(
    __dirname,
    '../../app1/build/_rsc_shared-rsc_src_index_js.rsc.js'
  );

  if (!fs.existsSync(builtFilePath)) {
    t.skip('Build output not found - run build first');
    return;
  }

  const builtContent = fs.readFileSync(builtFilePath, 'utf-8');

  // Verify that exports are defined
  assert.match(
    builtContent,
    /__webpack_require__\.d\(__webpack_exports__,\s*\{[^}]*"SharedClientWidget"/,
    'Built output should export SharedClientWidget'
  );
  assert.match(
    builtContent,
    /__webpack_require__\.d\(__webpack_exports__,\s*\{[^}]*"sharedServerActions"/,
    'Built output should export sharedServerActions namespace'
  );
});

// === EDGE CASES ===

test('directive transformation: module without directive passes through unchanged', (t) => {
  const source = `
import { formatDate } from './utils';

export function DataDisplay({ date }) {
  return <div>{formatDate(date)}</div>;
}
`;

  const context = createLoaderContext('/app/src/DataDisplay.js');
  const result = rscServerLoader.call(context, source);

  assert.equal(
    result,
    source,
    'Module without directive should pass through unchanged'
  );
});

test('directive transformation: directive must be at module level', (t) => {
  // Directive after code is not valid
  const source = `const x = 1;
'use client';

export function Component() {
  return <div>{x}</div>;
}
`;

  const context = createLoaderContext('/app/src/Invalid.js');
  const result = rscServerLoader.call(context, source);

  // Should pass through unchanged since directive is not at module level
  assert.equal(result, source, 'Directive after code should not be recognized');
  assert.doesNotMatch(
    result,
    /createClientModuleProxy/,
    'Should not transform invalid directive position'
  );
});

test('directive transformation: handles re-export specifiers', (t) => {
  const source = `'use client';

export { Button } from './Button';
export { Input, Select } from './FormElements';
`;

  const context = createLoaderContext('/app/src/components.js');
  const result = rscServerLoader.call(context, source);

  // Re-exports should be proxied
  assert.match(result, /createClientModuleProxy/);
  assert.match(result, /export const Button = proxy\['Button'\]/);
  assert.match(result, /export const Input = proxy\['Input'\]/);
  assert.match(result, /export const Select = proxy\['Select'\]/);
});
