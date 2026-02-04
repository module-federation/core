/**
 * Tests for singleton sharing behavior in Module Federation
 *
 * Tests cover:
 * 1. React singleton: app1 and app2 use same React instance
 * 2. @rsc-demo/shared singleton: SharedClientWidget and sharedServerActions state
 * 3. Share scope 'rsc': isolation from 'default' scope
 * 4. Version resolution: shareStrategy 'version-first' and requiredVersion: false
 * 5. Eager vs lazy loading: modules load on demand from correct source
 */

'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const app1Root = path.dirname(require.resolve('app1/package.json'));
const app2Root = path.dirname(require.resolve('app2/package.json'));
const sharedRoot = path.dirname(
  require.resolve('@rsc-demo/shared/package.json'),
);
const sharedPkgSrcDir = path.join(sharedRoot, 'src');

// Build script paths for config verification
// App1 uses modular build configs - concatenate them for pattern matching
const app1ClientBuildScript = fs.readFileSync(
  path.join(app1Root, 'scripts/client.build.js'),
  'utf8',
);
const app1ServerBuildScript = fs.readFileSync(
  path.join(app1Root, 'scripts/server.build.js'),
  'utf8',
);
const app1BuildScript = app1ClientBuildScript + '\n' + app1ServerBuildScript;

// App2 uses modular build configs (same structure as app1)
const app2ClientBuildScript = fs.readFileSync(
  path.join(app2Root, 'scripts/client.build.js'),
  'utf8',
);
const app2ServerBuildScript = fs.readFileSync(
  path.join(app2Root, 'scripts/server.build.js'),
  'utf8',
);
const app2BuildScript = app2ClientBuildScript + '\n' + app2ServerBuildScript;

// ============================================================================
// TEST: React Singleton Configuration
// ============================================================================

describe('React singleton sharing', () => {
  it('app1 configures React as singleton with singleton: true', () => {
    // Client config
    assert.match(
      app1BuildScript,
      /react:\s*\{[^}]*singleton:\s*true/s,
      'app1 should configure React as singleton',
    );
  });

  it('app2 configures React as singleton with singleton: true', () => {
    assert.match(
      app2BuildScript,
      /react:\s*\{[^}]*singleton:\s*true/s,
      'app2 should configure React as singleton',
    );
  });

  it('app1 client bundle uses shareScope: client for React', () => {
    // Extract the client config section (first ModuleFederationPlugin)
    const clientConfigMatch = app1BuildScript.match(
      /new ModuleFederationPlugin\(\{[^}]*name:\s*['"]app1['"][^}]*filename:\s*['"]remoteEntry\.client\.js['"][^]*?shared:\s*\{([^}]*react:[^}]*\})/s,
    );
    assert.ok(clientConfigMatch, 'Should find client MF config');
    assert.match(
      clientConfigMatch[1],
      /shareScope:\s*['"]client['"]/,
      'Client React should use shareScope: client',
    );
  });

  it('app1 server bundle uses shareScope: rsc for React', () => {
    assert.ok(
      /shareScope:\s*['"]rsc['"]/.test(app1ServerBuildScript),
      'Server React should use shareScope: rsc',
    );
  });

  it('app2 server bundle uses shareScope: rsc for React', () => {
    assert.ok(
      /shareScope:\s*['"]rsc['"]/.test(app2ServerBuildScript),
      'app2 server React should use shareScope: rsc',
    );
  });

  it('React singleton prevents duplicate React errors (verified by config)', () => {
    // Verify both apps have matching singleton config which prevents multiple React instances
    const app1HasSingleton = /react:\s*\{[^}]*singleton:\s*true/s.test(
      app1BuildScript,
    );
    const app2HasSingleton = /react:\s*\{[^}]*singleton:\s*true/s.test(
      app2BuildScript,
    );
    assert.ok(
      app1HasSingleton && app2HasSingleton,
      'Both apps must configure React as singleton to prevent duplicate React errors',
    );
  });
});

// ============================================================================
// TEST: @rsc-demo/shared Singleton Configuration
// ============================================================================

describe('@rsc-demo/shared singleton sharing', () => {
  it('app1 configures @rsc-demo/shared as singleton', () => {
    assert.match(
      app1BuildScript,
      /@rsc-demo\/shared['"]:\s*\{[^}]*singleton:\s*true/s,
      'app1 should configure @rsc-demo/shared as singleton',
    );
  });

  it('app2 configures @rsc-demo/shared as singleton', () => {
    assert.match(
      app2BuildScript,
      /@rsc-demo\/shared['"]:\s*\{[^}]*singleton:\s*true/s,
      'app2 should configure @rsc-demo/shared as singleton',
    );
  });

  it('SharedClientWidget is exported from @rsc-demo/shared', () => {
    const sharedRscIndex = fs.readFileSync(
      path.join(sharedPkgSrcDir, 'index.js'),
      'utf8',
    );
    assert.match(
      sharedRscIndex,
      /export\s*\{[^}]*SharedClientWidget/,
      'SharedClientWidget should be exported',
    );
  });

  it('sharedServerActions is exported from @rsc-demo/shared', () => {
    const sharedRscIndex = fs.readFileSync(
      path.join(sharedPkgSrcDir, 'index.js'),
      'utf8',
    );
    assert.match(
      sharedRscIndex,
      /sharedServerActions/,
      'sharedServerActions should be exported',
    );
  });

  it('sharedServerActions has sharedCounter state functions', () => {
    const sharedServerActionsPath = path.join(
      sharedPkgSrcDir,
      'shared-server-actions.js',
    );
    const sharedServerActions = fs.readFileSync(
      sharedServerActionsPath,
      'utf8',
    );

    assert.match(
      sharedServerActions,
      /let\s+sharedCounter\s*=/,
      'sharedCounter state variable should exist',
    );
    assert.match(
      sharedServerActions,
      /export\s+(async\s+)?function\s+incrementSharedCounter/,
      'incrementSharedCounter should be exported',
    );
    assert.match(
      sharedServerActions,
      /export\s+function\s+getSharedCounter/,
      'getSharedCounter should be exported',
    );
  });

  it('incrementSharedCounter and getSharedCounter share state via module closure', () => {
    const sharedServerActionsPath = path.join(
      sharedPkgSrcDir,
      'shared-server-actions.js',
    );
    const sharedServerActions = fs.readFileSync(
      sharedServerActionsPath,
      'utf8',
    );

    // Both functions reference the same sharedCounter variable
    const incrementMatch = sharedServerActions.match(
      /incrementSharedCounter[^}]*sharedCounter\s*\+=/,
    );
    const getMatch = sharedServerActions.match(
      /getSharedCounter[^}]*return\s+sharedCounter/,
    );

    assert.ok(
      incrementMatch,
      'incrementSharedCounter should modify sharedCounter',
    );
    assert.ok(getMatch, 'getSharedCounter should return sharedCounter');
  });
});

// ============================================================================
// TEST: Share Scope Isolation ('rsc' vs 'default')
// ============================================================================

describe("Share scope 'rsc' isolation", () => {
  it("app1 server bundle initializes 'rsc' and 'client' share scopes", () => {
    // Server bundle must initialize both share scopes (RSC + SSR layer)
    assert.match(
      app1BuildScript,
      /shareScope:\s*\[['"]rsc['"]\s*,\s*['"]client['"]\]/,
      "app1 server bundle should initialize both 'rsc' and 'client' shareScopes",
    );
  });

  it("app2 server bundle initializes 'rsc' and 'client' share scopes", () => {
    assert.match(
      app2BuildScript,
      /shareScope:\s*\[['"]rsc['"]\s*,\s*['"]client['"]\]/,
      "app2 server bundle should initialize both 'rsc' and 'client' shareScopes",
    );
  });

  it('RSC layer modules use rsc share scope (app1)', () => {
    // Server bundle contains rsc layer shares in its MF config
    const rscScopeMatches = app1BuildScript.match(/shareScope:\s*['"]rsc['"]/g);
    assert.ok(
      rscScopeMatches && rscScopeMatches.length > 0,
      'Server shared modules should use rsc shareScope',
    );
  });

  it('client layer modules use client share scope (app1)', () => {
    // Check first ModuleFederationPlugin has client shareScope
    assert.match(
      app1BuildScript,
      /filename:\s*['"]remoteEntry\.client\.js['"][^]*?shareScope:\s*['"]client['"]/s,
      'Client shared modules should reference client shareScope',
    );
  });

  it('rsc share scope uses WEBPACK_LAYERS.rsc for layer config', () => {
    assert.match(
      app1BuildScript,
      /layer:\s*WEBPACK_LAYERS\.rsc/,
      'RSC modules should use WEBPACK_LAYERS.rsc layer',
    );
    assert.match(
      app1BuildScript,
      /issuerLayer:\s*WEBPACK_LAYERS\.rsc/,
      'RSC modules should use WEBPACK_LAYERS.rsc issuerLayer',
    );
  });

  it('client share scope uses WEBPACK_LAYERS.client for layer config', () => {
    assert.match(
      app1BuildScript,
      /layer:\s*WEBPACK_LAYERS\.client/,
      'Client modules should use WEBPACK_LAYERS.client layer',
    );
    assert.match(
      app1BuildScript,
      /issuerLayer:\s*WEBPACK_LAYERS\.client/,
      'Client modules should use WEBPACK_LAYERS.client issuerLayer',
    );
  });
});

// ============================================================================
// TEST: Version Resolution Strategy
// ============================================================================

describe('Version resolution: shareStrategy and requiredVersion', () => {
  it("app1 uses shareStrategy: 'version-first'", () => {
    assert.match(
      app1BuildScript,
      /shareStrategy:\s*['"]version-first['"]/,
      "app1 should use shareStrategy: 'version-first'",
    );
  });

  it("app2 uses shareStrategy: 'version-first'", () => {
    assert.match(
      app2BuildScript,
      /shareStrategy:\s*['"]version-first['"]/,
      "app2 should use shareStrategy: 'version-first'",
    );
  });

  it('React uses requiredVersion: false to allow any version', () => {
    assert.match(
      app1BuildScript,
      /react:\s*\{[^}]*requiredVersion:\s*false/s,
      'React should use requiredVersion: false',
    );
    assert.match(
      app2BuildScript,
      /react:\s*\{[^}]*requiredVersion:\s*false/s,
      'app2 React should use requiredVersion: false',
    );
  });

  it('react-dom uses requiredVersion: false', () => {
    assert.match(
      app1BuildScript,
      /['"]react-dom['"]:\s*\{[^}]*requiredVersion:\s*false/s,
      'react-dom should use requiredVersion: false',
    );
  });

  it('@rsc-demo/shared uses requiredVersion: false', () => {
    assert.match(
      app1BuildScript,
      /@rsc-demo\/shared['"]:\s*\{[^}]*requiredVersion:\s*false/s,
      '@rsc-demo/shared should use requiredVersion: false',
    );
  });
});

// ============================================================================
// TEST: Eager vs Lazy Loading
// ============================================================================

describe('Eager vs lazy loading configuration', () => {
  it('React uses eager: false for lazy loading (app1)', () => {
    assert.match(
      app1BuildScript,
      /react:\s*\{[^}]*eager:\s*false/s,
      'React should use eager: false for lazy loading',
    );
  });

  it('React uses eager: false for lazy loading (app2)', () => {
    assert.match(
      app2BuildScript,
      /react:\s*\{[^}]*eager:\s*false/s,
      'app2 React should use eager: false for lazy loading',
    );
  });

  it('react-dom uses eager: false', () => {
    assert.match(
      app1BuildScript,
      /['"]react-dom['"]:\s*\{[^}]*eager:\s*false/s,
      'react-dom should use eager: false',
    );
  });

  it('@rsc-demo/shared uses eager: false', () => {
    assert.match(
      app1BuildScript,
      /@rsc-demo\/shared['"]:\s*\{[^}]*eager:\s*false/s,
      '@rsc-demo/shared should use eager: false',
    );
  });

  it('server React specifies custom import path for react-server version', () => {
    assert.match(
      app1BuildScript,
      /import:\s*reactServerEntry/,
      'Server React should specify custom import for react-server entry',
    );
  });

  it('server jsx-runtime specifies custom import path', () => {
    assert.match(
      app1BuildScript,
      /['"]react\/jsx-runtime['"]:\s*\{[^}]*import:\s*reactJSXServerEntry/s,
      'Server jsx-runtime should specify custom import',
    );
  });
});

// ============================================================================
// TEST: Build Output Verification (if available)
// ============================================================================

describe('Singleton sharing in built artifacts', () => {
  const app1BuildPath = path.join(app1Root, 'build');
  const app2BuildPath = path.join(app2Root, 'build');

  it('app1 client remoteEntry exists (bidirectional demo)', function () {
    const entryPath = path.join(app1BuildPath, 'remoteEntry.client.js');
    assert.ok(
      fs.existsSync(entryPath),
      'app1 remoteEntry.client.js should exist',
    );
  });

  it('app2 client remoteEntry exists', function () {
    const entryPath = path.join(app2BuildPath, 'remoteEntry.client.js');
    assert.ok(
      fs.existsSync(entryPath),
      'app2 remoteEntry.client.js should exist',
    );
  });

  it('remote app (app2) server remoteEntry exists', function () {
    const entryPath = path.join(app2BuildPath, 'remoteEntry.server.js');
    assert.ok(
      fs.existsSync(entryPath),
      'app2 remoteEntry.server.js should exist',
    );
  });

  it('app1 client remoteEntry contains shareScope client initialization', function () {
    const entryPath = path.join(app1BuildPath, 'remoteEntry.client.js');
    if (!fs.existsSync(entryPath)) {
      this.skip();
      return;
    }
    const content = fs.readFileSync(entryPath, 'utf8');
    // Federation runtime initializes share scopes
    assert.ok(
      content.includes('client') || content.includes('shareScope'),
      'app1 client remoteEntry should reference share scope',
    );
  });

  it('client remoteEntry contains shareScope client initialization', function () {
    const entryPath = path.join(app2BuildPath, 'remoteEntry.client.js');
    if (!fs.existsSync(entryPath)) {
      this.skip();
      return;
    }
    const content = fs.readFileSync(entryPath, 'utf8');
    // Federation runtime initializes share scopes
    assert.ok(
      content.includes('client') || content.includes('shareScope'),
      'Client remoteEntry should reference share scope',
    );
  });

  it('server remoteEntry contains shareScope rsc initialization', function () {
    // Use app2's remoteEntry since app1 is a host-only app (no exposes)
    const entryPath = path.join(app2BuildPath, 'remoteEntry.server.js');
    if (!fs.existsSync(entryPath)) {
      this.skip();
      return;
    }
    const content = fs.readFileSync(entryPath, 'utf8');
    // Federation runtime initializes share scopes
    assert.ok(
      content.includes('rsc') || content.includes('shareScope'),
      'Server remoteEntry should reference rsc share scope',
    );
  });
});

// ============================================================================
// TEST: Shared Module State Behavior (Integration)
// ============================================================================

describe('Shared module state behavior', () => {
  it('shared-server-actions.js uses module-level state (sharedCounter)', () => {
    const actionsPath = path.join(sharedPkgSrcDir, 'shared-server-actions.js');
    const content = fs.readFileSync(actionsPath, 'utf8');

    // Verify it's a 'use server' module
    assert.match(
      content,
      /^['"]use server['"]/,
      'Should be a server action module',
    );

    // Verify module-level state exists
    assert.match(
      content,
      /let\s+sharedCounter\s*=\s*0/,
      'sharedCounter should be initialized to 0',
    );

    // Verify incrementSharedCounter modifies and returns state
    assert.match(
      content,
      /sharedCounter\s*\+=\s*1/,
      'incrementSharedCounter should increment sharedCounter',
    );
    assert.match(
      content,
      /return\s+sharedCounter/,
      'incrementSharedCounter should return sharedCounter',
    );
  });

  it('SharedClientWidget is a use client component', () => {
    const widgetPath = path.join(sharedPkgSrcDir, 'SharedClientWidget.js');
    const content = fs.readFileSync(widgetPath, 'utf8');

    assert.match(
      content,
      /^['"]use client['"]/,
      'Should be a client component',
    );
    assert.match(
      content,
      /export\s+default\s+function\s+SharedClientWidget/,
      'Should export SharedClientWidget as default',
    );
  });

  it('singleton ensures same module instance across apps when sharing is configured', () => {
    // This is verified by the config - both apps use:
    // - singleton: true
    // - same shareScope ('rsc' or 'client')
    // - same shareKey (implicit from package name)

    // Check app1 config
    const app1SharedRsc = app1BuildScript.match(
      /@rsc-demo\/shared['"]:\s*\{([^}]*)\}/s,
    );
    assert.ok(app1SharedRsc, 'app1 should configure @rsc-demo/shared');
    assert.match(app1SharedRsc[1], /singleton:\s*true/, 'Should be singleton');

    // Check app2 config
    const app2SharedRsc = app2BuildScript.match(
      /@rsc-demo\/shared['"]:\s*\{([^}]*)\}/s,
    );
    assert.ok(app2SharedRsc, 'app2 should configure @rsc-demo/shared');
    assert.match(app2SharedRsc[1], /singleton:\s*true/, 'Should be singleton');
  });
});

// ============================================================================
// TEST: Cross-App Singleton Verification
// ============================================================================

describe('Cross-app singleton verification', () => {
  it('both apps share identical React configuration keys', () => {
    // Extract React config from both apps
    const app1ReactKeys = [
      'singleton',
      'eager',
      'requiredVersion',
      'shareScope',
      'layer',
      'issuerLayer',
    ];
    const app2ReactKeys = [
      'singleton',
      'eager',
      'requiredVersion',
      'shareScope',
      'layer',
      'issuerLayer',
    ];

    // Verify all keys are present in both configs
    for (const key of app1ReactKeys) {
      assert.match(
        app1BuildScript,
        new RegExp(`react:[^}]*${key}:`),
        `app1 React config should have ${key}`,
      );
    }

    for (const key of app2ReactKeys) {
      assert.match(
        app2BuildScript,
        new RegExp(`react:[^}]*${key}:`),
        `app2 React config should have ${key}`,
      );
    }
  });

  it('server bundles use react-server condition for proper RSC resolution', () => {
    assert.match(
      app1BuildScript,
      /conditionNames:\s*\[\s*['"]react-server['"]/,
      'app1 server should use react-server condition',
    );
    assert.match(
      app2BuildScript,
      /conditionNames:\s*\[\s*['"]react-server['"]/,
      'app2 server should use react-server condition',
    );
  });

  it('server bundles specify allowNodeModulesSuffixMatch for React', () => {
    // This allows matching react/index.js when sharing react
    assert.match(
      app1BuildScript,
      /react:\s*\{[^}]*allowNodeModulesSuffixMatch:\s*true/s,
      'app1 server React should allow node_modules suffix matching',
    );
  });
});

console.log('Singleton sharing unit tests loaded');
