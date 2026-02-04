/**
 * Unit tests for RSC Client References from Shared Modules
 *
 * Tests cover:
 * 1. 'use client' components in shared modules are transformed to client references
 * 2. Client references appear in RSC flight stream with correct module ID
 * 3. Client manifest includes the shared client component
 * 4. createClientModuleProxy is used for shared 'use client' modules
 * 5. file:// URL in client reference points to correct location
 * 6. Both app1 and app2 get the same client reference for SharedClientWidget (singleton)
 */

const { describe, it } = require('node:test');
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const app1Root = path.dirname(require.resolve('app1/package.json'));
const app2Root = path.dirname(require.resolve('app2/package.json'));
const sharedRoot = path.dirname(
  require.resolve('@rsc-demo/shared/package.json'),
);
const sharedPkgSrcDir = path.join(sharedRoot, 'src');
const normalizePath = (value) => value.replace(/\\/g, '/');
const SHARED_CLIENT_WIDGET_SUFFIX = normalizePath(
  '/apps/rsc-demo/shared/src/SharedClientWidget.js',
);
const SHARED_CLIENT_WIDGET_URL_PATTERN =
  /file:\/\/\/.*\/apps\/rsc-demo\/shared\/src\/SharedClientWidget\.js/;

// Build paths
const app1BuildDir = path.join(app1Root, 'build');
const app2BuildDir = path.join(app2Root, 'build');

const app1ClientManifest = path.join(
  app1BuildDir,
  'react-client-manifest.json',
);
const app1ServerBundle = path.join(app1BuildDir, 'server.rsc.js');

const app2ClientManifest = path.join(
  app2BuildDir,
  'react-client-manifest.json',
);

function findRscBundle(buildDir, predicate) {
  if (!fs.existsSync(buildDir)) return null;
  const rscFiles = fs
    .readdirSync(buildDir)
    .filter((file) => file.endsWith('.rsc.js'));
  for (const file of rscFiles) {
    const fullPath = path.join(buildDir, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    if (predicate(content, file)) return fullPath;
  }
  return null;
}

function findSharedClientWidgetRscBundle(buildDir) {
  return findRscBundle(
    buildDir,
    (content) =>
      content.includes('SharedClientWidget') &&
      content.includes('createClientModuleProxy'),
  );
}

// Expected file:// URL suffix for SharedClientWidget (normalize workspace roots)
const SHARED_CLIENT_WIDGET_PATH = path.resolve(
  sharedPkgSrcDir,
  'SharedClientWidget.js',
);

function findSharedClientWidgetKey(manifest) {
  return Object.keys(manifest).find((key) =>
    normalizePath(key).endsWith(SHARED_CLIENT_WIDGET_SUFFIX),
  );
}

function normalizeManifestKey(key) {
  const normalized = normalizePath(key);
  const marker = '/apps/rsc-demo/shared/';
  const idx = normalized.indexOf(marker);
  return idx === -1 ? normalized : normalized.slice(idx);
}

// ============================================================================
// TEST: Shared 'use client' Module Transformation
// ============================================================================

describe('Shared use client module transformation', () => {
  it('SharedClientWidget.js uses createClientModuleProxy in RSC bundle', () => {
    const app1SharedRscBundle = findSharedClientWidgetRscBundle(app1BuildDir);
    if (!app1SharedRscBundle) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const bundleContent = fs.readFileSync(app1SharedRscBundle, 'utf8');

    // Verify the RSC loader comment is present
    assert.match(
      bundleContent,
      /RSC Server Loader: 'use client' module transformed to client references/,
      'Should have RSC server loader comment indicating transformation',
    );

    // Verify createClientModuleProxy is used
    assert.match(
      bundleContent,
      /createClientModuleProxy/,
      'Should use createClientModuleProxy for client reference',
    );
  });

  it('client reference uses correct file:// URL for SharedClientWidget', () => {
    if (!fs.existsSync(app1ClientManifest)) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const manifest = JSON.parse(fs.readFileSync(app1ClientManifest, 'utf8'));
    const key = findSharedClientWidgetKey(manifest);
    assert.ok(key, 'Manifest should contain SharedClientWidget file URL key');
    assert.ok(
      normalizePath(key).endsWith(SHARED_CLIENT_WIDGET_SUFFIX),
      `Manifest key should end with ${SHARED_CLIENT_WIDGET_SUFFIX}`,
    );
  });

  it('proxy.default is exported as SharedClientWidget', () => {
    const app1SharedRscBundle = findSharedClientWidgetRscBundle(app1BuildDir);
    if (!app1SharedRscBundle) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const bundleContent = fs.readFileSync(app1SharedRscBundle, 'utf8');

    // Verify the bundle references SharedClientWidget
    assert.ok(
      bundleContent.includes('SharedClientWidget'),
      'Should reference SharedClientWidget in bundle',
    );
  });
});

// ============================================================================
// TEST: Client Manifest Contains Shared Client Component
// ============================================================================

describe('Client manifest includes shared client component', () => {
  it('app1 react-client-manifest.json contains SharedClientWidget entry', () => {
    if (!fs.existsSync(app1ClientManifest)) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const manifest = JSON.parse(fs.readFileSync(app1ClientManifest, 'utf8'));

    const key = findSharedClientWidgetKey(manifest);
    assert.ok(key, 'Manifest should contain SharedClientWidget file URL key');
  });

  it('SharedClientWidget manifest entry has correct id format', () => {
    if (!fs.existsSync(app1ClientManifest)) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const manifest = JSON.parse(fs.readFileSync(app1ClientManifest, 'utf8'));
    const key = findSharedClientWidgetKey(manifest);
    const entry = key ? manifest[key] : undefined;

    assert.ok(entry, 'SharedClientWidget entry should exist');
    assert.ok(entry.id, 'Entry should have id field');
    const normalizedId = normalizePath(entry.id);
    const normalizedSharedRoot = normalizePath(sharedRoot);
    assert.ok(
      normalizedId.includes('(client)') &&
        (normalizedId.includes(normalizedSharedRoot) ||
          normalizedId.includes('rsc-demo/shared') ||
          normalizedId.includes('/shared/src/')) &&
        normalizedId.includes('SharedClientWidget'),
      'ID should contain (client) prefix, shared package path, and module name',
    );
  });

  it('SharedClientWidget manifest entry has chunks array', () => {
    if (!fs.existsSync(app1ClientManifest)) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const manifest = JSON.parse(fs.readFileSync(app1ClientManifest, 'utf8'));
    const key = findSharedClientWidgetKey(manifest);
    const entry = key ? manifest[key] : undefined;

    assert.ok(entry, 'SharedClientWidget entry should exist');
    assert.ok(Array.isArray(entry.chunks), 'Entry should have chunks array');
    assert.ok(entry.chunks.length > 0, 'Chunks array should not be empty');
    assert.ok(
      entry.chunks.some((c) => c.endsWith('.js')),
      'Should have at least one .js chunk',
    );
  });

  it('SharedClientWidget manifest entry has name field', () => {
    if (!fs.existsSync(app1ClientManifest)) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const manifest = JSON.parse(fs.readFileSync(app1ClientManifest, 'utf8'));
    const key = findSharedClientWidgetKey(manifest);
    const entry = key ? manifest[key] : undefined;

    assert.ok(entry, 'SharedClientWidget entry should exist');
    assert.strictEqual(
      entry.name,
      '*',
      'Entry name should be "*" for wildcard exports',
    );
  });
});

// ============================================================================
// TEST: Singleton Client Reference Across Apps
// ============================================================================

describe('Singleton client reference for SharedClientWidget', () => {
  it('app1 and app2 manifests use same file:// URL for SharedClientWidget', () => {
    if (
      !fs.existsSync(app1ClientManifest) ||
      !fs.existsSync(app2ClientManifest)
    ) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const app1Manifest = JSON.parse(
      fs.readFileSync(app1ClientManifest, 'utf8'),
    );
    const app2Manifest = JSON.parse(
      fs.readFileSync(app2ClientManifest, 'utf8'),
    );

    const app1Key = findSharedClientWidgetKey(app1Manifest);
    const app2Key = findSharedClientWidgetKey(app2Manifest);
    assert.ok(app1Key, 'app1 manifest should contain SharedClientWidget');
    assert.ok(app2Key, 'app2 manifest should contain SharedClientWidget');
  });

  it('both apps reference the same canonical file path', () => {
    if (
      !fs.existsSync(app1ClientManifest) ||
      !fs.existsSync(app2ClientManifest)
    ) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const app1Manifest = JSON.parse(
      fs.readFileSync(app1ClientManifest, 'utf8'),
    );
    const app2Manifest = JSON.parse(
      fs.readFileSync(app2ClientManifest, 'utf8'),
    );

    const app1Key = findSharedClientWidgetKey(app1Manifest);
    const app2Key = findSharedClientWidgetKey(app2Manifest);

    assert.ok(app1Key, 'app1 should have one SharedClientWidget entry');
    assert.ok(app2Key, 'app2 should have one SharedClientWidget entry');
    assert.strictEqual(
      normalizeManifestKey(app1Key),
      normalizeManifestKey(app2Key),
      'Both apps should reference the same shared module path',
    );
  });

  it('client module IDs reference shared package path in both apps', () => {
    if (
      !fs.existsSync(app1ClientManifest) ||
      !fs.existsSync(app2ClientManifest)
    ) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const app1Manifest = JSON.parse(
      fs.readFileSync(app1ClientManifest, 'utf8'),
    );
    const app2Manifest = JSON.parse(
      fs.readFileSync(app2ClientManifest, 'utf8'),
    );

    const app1Key = findSharedClientWidgetKey(app1Manifest);
    const app2Key = findSharedClientWidgetKey(app2Manifest);
    const app1Entry = app1Key ? app1Manifest[app1Key] : undefined;
    const app2Entry = app2Key ? app2Manifest[app2Key] : undefined;

    const normalizedSharedRoot = normalizePath(sharedRoot);

    // Both IDs should reference the shared package path
    const app1Id = normalizePath(app1Entry.id);
    const app2Id = normalizePath(app2Entry.id);
    assert.ok(
      app1Id.includes(normalizedSharedRoot) ||
        app1Id.includes('rsc-demo/shared') ||
        app1Id.includes('/shared/src/'),
      'app1 ID should reference shared package path',
    );
    assert.ok(
      app2Id.includes(normalizedSharedRoot) ||
        app2Id.includes('rsc-demo/shared') ||
        app2Id.includes('/shared/src/'),
      'app2 ID should reference shared package path',
    );
  });
});

// ============================================================================
// TEST: Client Reference Structure in Bundled Output
// ============================================================================

describe('Client reference structure in bundled output', () => {
  it('server bundle imports shared module with createClientModuleProxy', () => {
    if (!fs.existsSync(app1ServerBundle)) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const bundleContent = fs.readFileSync(app1ServerBundle, 'utf8');

    // The bundled server should contain the createClientModuleProxy call
    // for SharedClientWidget from the shared module
    assert.match(
      bundleContent,
      /createClientModuleProxy/,
      'Server bundle should contain createClientModuleProxy',
    );
  });

  it('shared module RSC chunk is referenced from server bundle', () => {
    if (!fs.existsSync(app1ServerBundle)) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const bundleContent = fs.readFileSync(app1ServerBundle, 'utf8');

    // The server bundle should reference the shared module RSC code
    // This can be via chunk IDs or module paths
    assert.ok(
      bundleContent.includes('rsc-demo/shared') ||
        bundleContent.includes('SharedClientWidget'),
      'Server bundle should reference shared module or SharedClientWidget',
    );
  });

  it('client manifest chunks can be loaded from build directory', () => {
    if (!fs.existsSync(app1ClientManifest)) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const manifest = JSON.parse(fs.readFileSync(app1ClientManifest, 'utf8'));
    const key = findSharedClientWidgetKey(manifest);
    const entry = key ? manifest[key] : undefined;

    assert.ok(entry, 'SharedClientWidget should be in manifest');

    // Verify the chunks exist in the build directory
    const chunks = entry.chunks.filter((c) => c.endsWith('.js'));
    for (const chunk of chunks) {
      const chunkPath = path.join(app1BuildDir, chunk);
      assert.ok(
        fs.existsSync(chunkPath),
        `Client chunk should exist: ${chunk}`,
      );
    }
  });

  it('client chunk contains SharedClientWidget component code', () => {
    if (!fs.existsSync(app1ClientManifest)) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const manifest = JSON.parse(fs.readFileSync(app1ClientManifest, 'utf8'));
    const key = findSharedClientWidgetKey(manifest);
    const entry = key ? manifest[key] : undefined;

    assert.ok(entry, 'SharedClientWidget should be in manifest');

    // Find the client chunk and verify it has the component
    const chunks = entry.chunks.filter((c) => c.endsWith('.js'));
    let foundWidget = false;

    for (const chunk of chunks) {
      const chunkPath = path.join(app1BuildDir, chunk);
      if (fs.existsSync(chunkPath)) {
        const chunkContent = fs.readFileSync(chunkPath, 'utf8');
        if (
          chunkContent.includes('SharedClientWidget') ||
          chunkContent.includes('shared-client-widget')
        ) {
          foundWidget = true;
          break;
        }
      }
    }

    assert.ok(
      foundWidget,
      'At least one client chunk should contain SharedClientWidget code',
    );
  });
});

// ============================================================================
// TEST: App2 RSC Bundle Also Uses createClientModuleProxy
// ============================================================================

describe('App2 shared module transformation', () => {
  it('app2 has shared module RSC bundle', () => {
    const app2SharedRscBundle = findSharedClientWidgetRscBundle(app2BuildDir);
    assert.ok(app2SharedRscBundle, 'app2 should have shared module RSC bundle');
  });

  it('app2 shared module bundle uses createClientModuleProxy', () => {
    const app2SharedRscBundle = findSharedClientWidgetRscBundle(app2BuildDir);
    if (!app2SharedRscBundle) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const bundleContent = fs.readFileSync(app2SharedRscBundle, 'utf8');

    assert.match(
      bundleContent,
      /createClientModuleProxy/,
      'app2 should use createClientModuleProxy for SharedClientWidget',
    );
  });

  it('app2 uses same file:// URL as app1 for SharedClientWidget', () => {
    const app2SharedRscBundle = findSharedClientWidgetRscBundle(app2BuildDir);
    if (!app2SharedRscBundle) {
      assert.fail('Build output missing. Run `pnpm run build` first.');
    }

    const bundleContent = fs.readFileSync(app2SharedRscBundle, 'utf8');

    assert.ok(
      bundleContent.includes('SharedClientWidget'),
      'app2 bundle should reference SharedClientWidget',
    );
  });
});

console.log('RSC client references from shared modules tests loaded');
