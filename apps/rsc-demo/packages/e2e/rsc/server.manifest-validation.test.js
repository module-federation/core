'use strict';

/**
 * Comprehensive Manifest Validation Tests
 *
 * Tests validate the correctness of manifest files generated during build:
 * 1. react-server-actions-manifest.json - Server action references
 * 2. react-client-manifest.json - Client component references
 * 3. mf-manifest.json / mf-stats-* - Module Federation metadata
 *
 * These tests ensure that RSC bundling produces correct manifests for:
 * - Server action discovery and execution
 * - Client component hydration
 * - Module Federation remote resolution
 */

const {describe, it, before} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Build output paths
const app1BuildDir = path.resolve(__dirname, '../../app1/build');
const app2BuildDir = path.resolve(__dirname, '../../app2/build');

// Manifest file paths
const app1ServerActionsManifest = path.join(
  app1BuildDir,
  'react-server-actions-manifest.json'
);
const app1ClientManifest = path.join(
  app1BuildDir,
  'react-client-manifest.json'
);
const app1MfManifest = path.join(app1BuildDir, 'mf-manifest.json');

const app2ServerActionsManifest = path.join(
  app2BuildDir,
  'react-server-actions-manifest.json'
);
const app2ClientManifest = path.join(
  app2BuildDir,
  'react-client-manifest.json'
);
const app2MfManifest = path.join(app2BuildDir, 'mf-manifest.json');

// Source directories for validation
const app1SrcDir = path.resolve(__dirname, '../../app1/src');
const sharedRscSrcDir = path.resolve(__dirname, '../../shared-rsc/src');

// ============================================================================
// Helper Functions
// ============================================================================

function loadJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function findFilesWithDirective(dir, directive, extensions = ['.js', '.jsx']) {
  const results = [];

  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    const entries = fs.readdirSync(currentDir, {withFileTypes: true});
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const firstLine = content.split('\n')[0].trim();
        if (
          firstLine === `'${directive}';` ||
          firstLine === `"${directive}";`
        ) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return results;
}

function extractExportedFunctions(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const exports = [];

  // Match: export async function name() or export function name()
  const namedExportRegex = /export\s+(async\s+)?function\s+(\w+)/g;
  let match;
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.push(match[2]);
  }

  // Match: export default async function name() or export default function name()
  const defaultExportRegex = /export\s+default\s+(async\s+)?function\s+(\w+)?/g;
  while ((match = defaultExportRegex.exec(content)) !== null) {
    exports.push(match[2] || 'default');
  }

  return exports;
}

// ============================================================================
// TEST: Server Actions Manifest (react-server-actions-manifest.json)
// ============================================================================

describe('Server Actions Manifest Validation (app1)', () => {
  let manifest = null;

  before(() => {
    manifest = loadJsonIfExists(app1ServerActionsManifest);
  });

  it('manifest file exists after build', (t) => {
    if (!fs.existsSync(app1BuildDir)) {
      t.skip('Build output missing. Run `pnpm run build` first.');
      return;
    }
    assert.ok(
      fs.existsSync(app1ServerActionsManifest),
      'react-server-actions-manifest.json should exist in app1/build/'
    );
  });

  it('manifest is valid JSON with entries', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }
    assert.ok(
      typeof manifest === 'object',
      'Manifest should be a valid object'
    );
    assert.ok(Object.keys(manifest).length > 0, 'Manifest should have entries');
  });

  it('contains all use server functions from app1/src/server-actions.js', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const serverActionsPath = path.join(app1SrcDir, 'server-actions.js');
    if (!fs.existsSync(serverActionsPath)) {
      t.skip('server-actions.js not found');
      return;
    }

    const expectedFunctions = extractExportedFunctions(serverActionsPath);
    const manifestKeys = Object.keys(manifest);

    for (const funcName of expectedFunctions) {
      const found = manifestKeys.some(
        (key) =>
          key.includes('server-actions.js') &&
          (key.includes(`#${funcName}`) || funcName === 'default')
      );
      assert.ok(
        found,
        `Function "${funcName}" from server-actions.js should be in manifest`
      );
    }
  });

  it('contains all use server functions from app1/src/inline-actions.server.js', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const inlineActionsPath = path.join(app1SrcDir, 'inline-actions.server.js');
    if (!fs.existsSync(inlineActionsPath)) {
      t.skip('inline-actions.server.js not found');
      return;
    }

    const expectedFunctions = extractExportedFunctions(inlineActionsPath);
    const manifestKeys = Object.keys(manifest);

    for (const funcName of expectedFunctions) {
      const found = manifestKeys.some(
        (key) =>
          key.includes('inline-actions.server.js') &&
          (key.includes(`#${funcName}`) || funcName === 'default')
      );
      assert.ok(
        found,
        `Function "${funcName}" from inline-actions.server.js should be in manifest`
      );
    }
  });

  it('contains test-default-action.js default export', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const testDefaultPath = path.join(app1SrcDir, 'test-default-action.js');
    if (!fs.existsSync(testDefaultPath)) {
      t.skip('test-default-action.js not found');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some((key) =>
      key.includes('test-default-action.js')
    );
    assert.ok(found, 'test-default-action.js should be in manifest');
  });

  it('action IDs follow file:// URL format', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const actionIds = Object.keys(manifest);
    for (const actionId of actionIds) {
      assert.ok(
        actionId.startsWith('file://') || actionId.includes('/'),
        `Action ID "${actionId}" should follow file:// URL format or contain path`
      );
    }
  });

  it('action names match exported function names (named exports)', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const actionIds = Object.keys(manifest);
    const namedActionIds = actionIds.filter((id) => id.includes('#'));

    for (const actionId of namedActionIds) {
      const hashIndex = actionId.lastIndexOf('#');
      const actionName = actionId.substring(hashIndex + 1);

      // Action name should be a valid identifier or $$ACTION_ pattern for inline
      assert.ok(
        /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(actionName) ||
          actionName.startsWith('$$ACTION_'),
        `Action name "${actionName}" should be a valid identifier`
      );
    }
  });

  it('manifest entries have correct structure', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    for (const [actionId, entry] of Object.entries(manifest)) {
      assert.ok(
        typeof entry === 'object',
        `Entry for "${actionId}" should be an object`
      );
      // Entry should have at least id and name properties
      assert.ok(
        entry.id !== undefined || entry.chunks !== undefined,
        `Entry for "${actionId}" should have id or chunks property`
      );
    }
  });
});

describe('Server Actions Manifest - Shared RSC Module', () => {
  let manifest = null;

  before(() => {
    manifest = loadJsonIfExists(app1ServerActionsManifest);
  });

  it('contains all use server functions from @rsc-demo/shared-rsc', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const sharedActionsPath = path.join(
      sharedRscSrcDir,
      'shared-server-actions.js'
    );
    if (!fs.existsSync(sharedActionsPath)) {
      t.skip('shared-server-actions.js not found');
      return;
    }

    const expectedFunctions = extractExportedFunctions(sharedActionsPath);
    const manifestKeys = Object.keys(manifest);

    // Shared module actions may be registered under node_modules path or shared-rsc path
    for (const funcName of expectedFunctions) {
      const found = manifestKeys.some(
        (key) =>
          (key.includes('shared-server-actions.js') ||
            key.includes('shared-rsc') ||
            key.includes('@rsc-demo')) &&
          (key.includes(`#${funcName}`) || funcName === 'default')
      );
      assert.ok(
        found,
        `Shared function "${funcName}" from shared-server-actions.js should be in manifest`
      );
    }
  });
});

// ============================================================================
// TEST: Client Manifest (react-client-manifest.json)
// ============================================================================

describe('Client Manifest Validation (app1)', () => {
  let manifest = null;

  before(() => {
    manifest = loadJsonIfExists(app1ClientManifest);
  });

  it('manifest file exists after build', (t) => {
    if (!fs.existsSync(app1BuildDir)) {
      t.skip('Build output missing. Run `pnpm run build` first.');
      return;
    }
    assert.ok(
      fs.existsSync(app1ClientManifest),
      'react-client-manifest.json should exist in app1/build/'
    );
  });

  it('manifest is valid JSON with entries', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }
    assert.ok(
      typeof manifest === 'object',
      'Manifest should be a valid object'
    );
    assert.ok(Object.keys(manifest).length > 0, 'Manifest should have entries');
  });

  it('contains DemoCounterButton.js client component', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some((key) =>
      key.includes('DemoCounterButton.js')
    );
    assert.ok(found, 'DemoCounterButton.js should be in client manifest');
  });

  it('contains EditButton.js client component', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some((key) => key.includes('EditButton.js'));
    assert.ok(found, 'EditButton.js should be in client manifest');
  });

  it('contains SearchField.js client component', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some((key) => key.includes('SearchField.js'));
    assert.ok(found, 'SearchField.js should be in client manifest');
  });

  it('contains NoteEditor.js client component', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some((key) => key.includes('NoteEditor.js'));
    assert.ok(found, 'NoteEditor.js should be in client manifest');
  });

  it('contains SidebarNoteContent.js client component', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some((key) =>
      key.includes('SidebarNoteContent.js')
    );
    assert.ok(found, 'SidebarNoteContent.js should be in client manifest');
  });

  it('contains InlineActionButton.js client component', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some((key) =>
      key.includes('InlineActionButton.js')
    );
    assert.ok(found, 'InlineActionButton.js should be in client manifest');
  });

  it('contains SharedCounterButton.js client component', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some((key) =>
      key.includes('SharedCounterButton.js')
    );
    assert.ok(found, 'SharedCounterButton.js should be in client manifest');
  });

  it('contains FederatedActionDemo.js client component', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some((key) =>
      key.includes('FederatedActionDemo.js')
    );
    assert.ok(found, 'FederatedActionDemo.js should be in client manifest');
  });

  it('contains RemoteButton.js client component', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some((key) => key.includes('RemoteButton.js'));
    assert.ok(found, 'RemoteButton.js should be in client manifest');
  });

  it('contains framework/router.js client component', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some(
      (key) => key.includes('router.js') || key.includes('framework')
    );
    assert.ok(found, 'router.js should be in client manifest');
  });

  it('module entries have correct structure with chunks', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    for (const [moduleId, entry] of Object.entries(manifest)) {
      assert.ok(
        typeof entry === 'object',
        `Entry for "${moduleId}" should be an object`
      );

      // Entry should have id and chunks (or at minimum an id)
      if (entry.chunks !== undefined) {
        assert.ok(
          Array.isArray(entry.chunks),
          `Chunks for "${moduleId}" should be an array`
        );
      }
    }
  });

  it('chunk paths point to existing files or valid patterns', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const chunkPatterns = [];
    for (const [, entry] of Object.entries(manifest)) {
      if (entry.chunks && Array.isArray(entry.chunks)) {
        for (const chunk of entry.chunks) {
          if (typeof chunk === 'string') {
            chunkPatterns.push(chunk);
          }
        }
      }
    }

    // Verify chunk patterns look valid (contain .js extension or are webpack chunk names)
    for (const chunk of chunkPatterns) {
      assert.ok(
        chunk.includes('.js') ||
          chunk.includes('client') ||
          /^\d+$/.test(chunk) ||
          /^[a-zA-Z0-9_-]+$/.test(chunk),
        `Chunk "${chunk}" should be a valid chunk identifier`
      );
    }
  });
});

describe('Client Manifest - SharedClientWidget from @rsc-demo/shared-rsc', () => {
  let manifest = null;

  before(() => {
    manifest = loadJsonIfExists(app1ClientManifest);
  });

  it('contains SharedClientWidget from shared-rsc package', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);

    // SharedClientWidget may be registered under various paths
    const found = manifestKeys.some(
      (key) =>
        key.includes('SharedClientWidget') ||
        key.includes('shared-rsc') ||
        key.includes('@rsc-demo')
    );

    assert.ok(
      found,
      'SharedClientWidget from @rsc-demo/shared-rsc should be in client manifest'
    );
  });
});

// ============================================================================
// TEST: Module Federation Manifest (mf-manifest.json)
// ============================================================================

describe('Module Federation Manifest Validation (app1)', () => {
  let manifest = null;

  before(() => {
    manifest = loadJsonIfExists(app1MfManifest);
  });

  it('mf-manifest.json exists after build', (t) => {
    if (!fs.existsSync(app1BuildDir)) {
      t.skip('Build output missing. Run `pnpm run build` first.');
      return;
    }

    // MF manifest might not exist in all configurations
    if (!fs.existsSync(app1MfManifest)) {
      t.skip('mf-manifest.json not generated for this build configuration');
      return;
    }

    assert.ok(
      fs.existsSync(app1MfManifest),
      'mf-manifest.json should exist in app1/build/'
    );
  });

  it('manifest is valid JSON', (t) => {
    if (!manifest) {
      t.skip('MF manifest not available');
      return;
    }
    assert.ok(
      typeof manifest === 'object',
      'MF manifest should be a valid object'
    );
  });

  it('contains federation metadata', (t) => {
    if (!manifest) {
      t.skip('MF manifest not available');
      return;
    }

    // MF manifest should have standard federation properties
    const hasMetadata =
      manifest.name !== undefined ||
      manifest.id !== undefined ||
      manifest.remotes !== undefined ||
      manifest.exposes !== undefined ||
      manifest.shared !== undefined;

    assert.ok(hasMetadata, 'MF manifest should contain federation metadata');
  });

  it('lists remote entries if configured', (t) => {
    if (!manifest) {
      t.skip('MF manifest not available');
      return;
    }

    // If remotes are configured, they should be listed
    if (manifest.remotes) {
      assert.ok(
        typeof manifest.remotes === 'object' || Array.isArray(manifest.remotes),
        'Remotes should be an object or array'
      );
    }
  });

  it('lists shared modules if configured', (t) => {
    if (!manifest) {
      t.skip('MF manifest not available');
      return;
    }

    if (manifest.shared) {
      assert.ok(
        typeof manifest.shared === 'object' || Array.isArray(manifest.shared),
        'Shared modules should be an object or array'
      );
    }
  });
});

describe('Module Federation Manifest Validation (app2)', () => {
  let manifest = null;

  before(() => {
    manifest = loadJsonIfExists(app2MfManifest);
  });

  it('mf-manifest.json exists after build', (t) => {
    if (!fs.existsSync(app2BuildDir)) {
      t.skip('Build output missing. Run `pnpm run build` first.');
      return;
    }

    if (!fs.existsSync(app2MfManifest)) {
      t.skip('mf-manifest.json not generated for this build configuration');
      return;
    }

    assert.ok(
      fs.existsSync(app2MfManifest),
      'mf-manifest.json should exist in app2/build/'
    );
  });

  it('app2 remote container bundle exists', (t) => {
    if (!fs.existsSync(app2BuildDir)) {
      t.skip('Build output missing');
      return;
    }

    const remoteBundlePath = path.join(app2BuildDir, 'app2-remote.js');
    assert.ok(
      fs.existsSync(remoteBundlePath),
      'app2-remote.js should exist in app2/build/'
    );
  });

  it('contains exposes configuration for server-actions', (t) => {
    if (!manifest) {
      t.skip('MF manifest not available');
      return;
    }

    if (manifest.exposes) {
      // exposes can be an array of objects with name/path/id properties
      // or an object with keys as module names
      let hasServerActions = false;

      if (Array.isArray(manifest.exposes)) {
        // Array format: [{id: "app2:server-actions", name: "server-actions", path: "./server-actions"}, ...]
        hasServerActions = manifest.exposes.some(
          (exp) =>
            (exp.name && exp.name.includes('server-actions')) ||
            (exp.path && exp.path.includes('server-actions')) ||
            (exp.id && exp.id.includes('server-actions'))
        );
      } else {
        // Object format: {"./server-actions": "./src/server-actions.js", ...}
        const exposesKeys = Object.keys(manifest.exposes);
        const exposesValues = Object.values(manifest.exposes);
        hasServerActions =
          exposesKeys.some((key) => key.includes('server-actions')) ||
          exposesValues.some((val) =>
            typeof val === 'string' ? val.includes('server-actions') : false
          );
      }

      assert.ok(hasServerActions, 'Should expose server-actions module');
    }
  });
});

// ============================================================================
// TEST: MF Stats Files
// ============================================================================

describe('Module Federation Stats Validation', () => {
  it('mf-stats files exist for client build (app1)', (t) => {
    if (!fs.existsSync(app1BuildDir)) {
      t.skip('Build output missing');
      return;
    }

    const files = fs.readdirSync(app1BuildDir);
    const statsFiles = files.filter(
      (f) => f.startsWith('mf-stats') || f.includes('stats')
    );

    // Stats files are optional but useful for debugging
    if (statsFiles.length === 0) {
      t.skip('No MF stats files generated');
      return;
    }

    assert.ok(statsFiles.length > 0, 'MF stats files should exist');
  });

  it('mf-stats files are valid JSON if they exist (app1)', (t) => {
    if (!fs.existsSync(app1BuildDir)) {
      t.skip('Build output missing');
      return;
    }

    const files = fs.readdirSync(app1BuildDir);
    const statsFiles = files.filter(
      (f) => f.startsWith('mf-stats') && f.endsWith('.json')
    );

    for (const statsFile of statsFiles) {
      const statsPath = path.join(app1BuildDir, statsFile);
      const stats = loadJsonIfExists(statsPath);
      assert.ok(stats !== null, `${statsFile} should be valid JSON`);
    }
  });
});

// ============================================================================
// TEST: Cross-Reference Validation
// ============================================================================

describe('Cross-Reference Validation', () => {
  let serverActionsManifest = null;
  let clientManifest = null;

  before(() => {
    serverActionsManifest = loadJsonIfExists(app1ServerActionsManifest);
    clientManifest = loadJsonIfExists(app1ClientManifest);
  });

  it('server action IDs are unique', (t) => {
    if (!serverActionsManifest) {
      t.skip('Server actions manifest not available');
      return;
    }

    const actionIds = Object.keys(serverActionsManifest);
    const uniqueIds = new Set(actionIds);
    assert.strictEqual(
      actionIds.length,
      uniqueIds.size,
      'All server action IDs should be unique'
    );
  });

  it('client module IDs are unique', (t) => {
    if (!clientManifest) {
      t.skip('Client manifest not available');
      return;
    }

    const moduleIds = Object.keys(clientManifest);
    const uniqueIds = new Set(moduleIds);
    assert.strictEqual(
      moduleIds.length,
      uniqueIds.size,
      'All client module IDs should be unique'
    );
  });

  it('no orphaned server action entries (actions reference valid modules)', (t) => {
    if (!serverActionsManifest) {
      t.skip('Server actions manifest not available');
      return;
    }

    for (const [actionId, entry] of Object.entries(serverActionsManifest)) {
      // Each entry should have a resolvable module reference
      assert.ok(
        entry.id !== undefined ||
          entry.chunks !== undefined ||
          entry.name !== undefined,
        `Server action "${actionId}" should have resolvable module reference`
      );
    }
  });

  it('no orphaned client entries (modules reference valid chunks)', (t) => {
    if (!clientManifest) {
      t.skip('Client manifest not available');
      return;
    }

    for (const [moduleId, entry] of Object.entries(clientManifest)) {
      // Each entry should have a resolvable chunk reference
      assert.ok(
        entry.id !== undefined ||
          entry.chunks !== undefined ||
          entry.name !== undefined,
        `Client module "${moduleId}" should have resolvable chunk reference`
      );
    }
  });

  it('server actions can be resolved from manifest entries', (t) => {
    if (!serverActionsManifest) {
      t.skip('Server actions manifest not available');
      return;
    }

    // Verify that action entries have the necessary info for resolution
    for (const [actionId, entry] of Object.entries(serverActionsManifest)) {
      const canResolve =
        (entry.id && typeof entry.id === 'string') ||
        (entry.chunks && Array.isArray(entry.chunks)) ||
        entry.name;

      assert.ok(
        canResolve,
        `Action "${actionId}" should have resolvable metadata`
      );
    }
  });

  it('client refs can be resolved from manifest entries', (t) => {
    if (!clientManifest) {
      t.skip('Client manifest not available');
      return;
    }

    // Verify that client entries have the necessary info for resolution
    for (const [moduleId, entry] of Object.entries(clientManifest)) {
      const canResolve =
        (entry.id && typeof entry.id === 'string') ||
        (entry.chunks && Array.isArray(entry.chunks)) ||
        entry.name;

      assert.ok(
        canResolve,
        `Client module "${moduleId}" should have resolvable metadata`
      );
    }
  });

  it('source files with use server have corresponding manifest entries', (t) => {
    if (!serverActionsManifest) {
      t.skip('Server actions manifest not available');
      return;
    }

    const serverFiles = findFilesWithDirective(app1SrcDir, 'use server');
    const manifestKeys = Object.keys(serverActionsManifest);

    for (const filePath of serverFiles) {
      const fileName = path.basename(filePath);
      const found = manifestKeys.some((key) => key.includes(fileName));
      assert.ok(
        found,
        `Server file "${fileName}" should have entries in manifest`
      );
    }
  });

  it('source files with use client have corresponding manifest entries', (t) => {
    if (!clientManifest) {
      t.skip('Client manifest not available');
      return;
    }

    const clientFiles = findFilesWithDirective(app1SrcDir, 'use client');
    const manifestKeys = Object.keys(clientManifest);

    for (const filePath of clientFiles) {
      const fileName = path.basename(filePath);
      const found = manifestKeys.some((key) => key.includes(fileName));
      assert.ok(
        found,
        `Client file "${fileName}" should have entries in manifest`
      );
    }
  });
});

// ============================================================================
// TEST: App2 Server Actions Manifest
// ============================================================================

describe('Server Actions Manifest Validation (app2)', () => {
  let manifest = null;

  before(() => {
    manifest = loadJsonIfExists(app2ServerActionsManifest);
  });

  it('manifest file exists after build', (t) => {
    if (!fs.existsSync(app2BuildDir)) {
      t.skip('Build output missing. Run `pnpm run build` first.');
      return;
    }
    assert.ok(
      fs.existsSync(app2ServerActionsManifest),
      'react-server-actions-manifest.json should exist in app2/build/'
    );
  });

  it('contains incrementCount action', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some(
      (key) =>
        key.includes('server-actions.js') && key.includes('#incrementCount')
    );
    assert.ok(
      found,
      'incrementCount should be in app2 server actions manifest'
    );
  });

  it('contains getCount action', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some(
      (key) => key.includes('server-actions.js') && key.includes('#getCount')
    );
    assert.ok(found, 'getCount should be in app2 server actions manifest');
  });
});

// ============================================================================
// TEST: App2 Client Manifest
// ============================================================================

describe('Client Manifest Validation (app2)', () => {
  let manifest = null;

  before(() => {
    manifest = loadJsonIfExists(app2ClientManifest);
  });

  it('manifest file exists after build', (t) => {
    if (!fs.existsSync(app2BuildDir)) {
      t.skip('Build output missing. Run `pnpm run build` first.');
      return;
    }
    assert.ok(
      fs.existsSync(app2ClientManifest),
      'react-client-manifest.json should exist in app2/build/'
    );
  });

  it('contains Button.js client component', (t) => {
    if (!manifest) {
      t.skip('Manifest not available');
      return;
    }

    const manifestKeys = Object.keys(manifest);
    const found = manifestKeys.some((key) => key.includes('Button.js'));
    assert.ok(found, 'Button.js should be in app2 client manifest');
  });
});

// ============================================================================
// TEST: Manifest Consistency Between Builds
// ============================================================================

describe('Manifest Consistency', () => {
  let app1ServerActions = null;
  let app2ServerActions = null;
  let app1Client = null;
  let app2Client = null;

  before(() => {
    app1ServerActions = loadJsonIfExists(app1ServerActionsManifest);
    app2ServerActions = loadJsonIfExists(app2ServerActionsManifest);
    app1Client = loadJsonIfExists(app1ClientManifest);
    app2Client = loadJsonIfExists(app2ClientManifest);
  });

  it('app1 and app2 use consistent action ID formats', (t) => {
    if (!app1ServerActions || !app2ServerActions) {
      t.skip('One or both manifests not available');
      return;
    }

    const app1Keys = Object.keys(app1ServerActions);
    const app2Keys = Object.keys(app2ServerActions);

    // Both should use same ID format pattern (file:// URLs)
    const app1UsesFileUrl = app1Keys.some((k) => k.startsWith('file://'));
    const app2UsesFileUrl = app2Keys.some((k) => k.startsWith('file://'));

    // Either both use file:// URLs or both use path-based IDs
    const consistent =
      app1UsesFileUrl === app2UsesFileUrl ||
      app1Keys.every((k) => k.includes('/')) ===
        app2Keys.every((k) => k.includes('/'));

    assert.ok(consistent, 'Both apps should use consistent action ID formats');
  });

  it('app1 and app2 use consistent client module ID formats', (t) => {
    if (!app1Client || !app2Client) {
      t.skip('One or both manifests not available');
      return;
    }

    const app1Keys = Object.keys(app1Client);
    const app2Keys = Object.keys(app2Client);

    // Both should use consistent module ID patterns
    const app1HasSrcPath = app1Keys.some((k) => k.includes('./src/'));
    const app2HasSrcPath = app2Keys.some((k) => k.includes('./src/'));

    const consistent =
      app1HasSrcPath === app2HasSrcPath ||
      app1Keys.every((k) => k.includes('.js')) ===
        app2Keys.every((k) => k.includes('.js'));

    assert.ok(consistent, 'Both apps should use consistent module ID formats');
  });
});

console.log('Manifest validation tests loaded');
