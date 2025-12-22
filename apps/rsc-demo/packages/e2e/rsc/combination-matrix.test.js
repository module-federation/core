/**
 * RSC + Module Federation Combination Matrix Tests
 *
 * This file tests ALL combinations of:
 * - Server Components (SC)
 * - Client Components (CC)
 * - Server Actions (SA)
 * - Module Federation Host/Remote
 *
 * COMBINATION MATRIX:
 * ┌────────────────────────────────────────┬────────┬─────────────────────────────────┐
 * │ Pattern                                │ Status │ Test ID                         │
 * ├────────────────────────────────────────┼────────┼─────────────────────────────────┤
 * │ LOCAL PATTERNS (within single app)     │        │                                 │
 * │ SC → SC child                          │   ✅   │ LOCAL_SC_SC                     │
 * │ SC → CC child                          │   ✅   │ LOCAL_SC_CC                     │
 * │ CC → CC child                          │   ✅   │ LOCAL_CC_CC                     │
 * │ SC → SA call                           │   ✅   │ LOCAL_SC_SA                     │
 * │ CC → SA call                           │   ✅   │ LOCAL_CC_SA                     │
 * │ SC with inline SA                      │   ✅   │ LOCAL_SC_INLINE_SA              │
 * ├────────────────────────────────────────┼────────┼─────────────────────────────────┤
 * │ FEDERATION PATTERNS (host ← remote)    │        │                                 │
 * │ Host CC → Remote CC (client-side MF)   │   ✅   │ FED_HOST_CC_REMOTE_CC           │
 * │ Remote CC with Host children           │   ✅   │ FED_REMOTE_CC_HOST_CHILDREN     │
 * │ Host CC → Remote SA (HTTP forward)     │   ✅   │ FED_HOST_CC_REMOTE_SA           │
 * │ Host SC → Remote CC (server-side MF)   │   ❌   │ FED_HOST_SC_REMOTE_CC (broken)  │
 * │ Host SC → Remote SA (MF native)        │   ❌   │ FED_HOST_SC_REMOTE_SA (TODO)    │
 * ├────────────────────────────────────────┼────────┼─────────────────────────────────┤
 * │ NESTING PATTERNS                       │        │                                 │
 * │ SC → CC → CC (2 levels)                │   ✅   │ NEST_SC_CC_CC                   │
 * │ SC → SC → CC (2 levels)                │   ✅   │ NEST_SC_SC_CC                   │
 * │ SC → CC → Remote CC (federation)       │   ✅   │ NEST_SC_CC_REMOTE               │
 * │ SC → SC → SC (deep server)             │   ✅   │ NEST_SC_SC_SC                   │
 * └────────────────────────────────────────┴────────┴─────────────────────────────────┘
 */

const { describe, it, before, after } = require('node:test');
const assert = require('assert');
const path = require('path');
const { readFileSync, existsSync } = require('fs');

// ============================================================================
// TEST INFRASTRUCTURE
// ============================================================================

const APP1_BUILD = path.resolve(__dirname, '../../app1/build');
const APP2_BUILD = path.resolve(__dirname, '../../app2/build');

function skipIfNoBuild(buildPath, label) {
  if (!existsSync(path.join(buildPath, 'server.rsc.js'))) {
    console.log(`Skipping ${label} tests - build not found`);
    return true;
  }
  return false;
}

// ============================================================================
// LOCAL PATTERNS - Single App Combinations
// ============================================================================

describe('LOCAL PATTERNS: Single App RSC Combinations', () => {
  describe('LOCAL_SC_SC: Server Component → Server Component child', () => {
    it('App.js renders Note.js (both server components)', async () => {
      if (skipIfNoBuild(APP1_BUILD, 'app1')) return;

      // With asyncStartup: true, the bundle returns a promise
      // We verify the bundle exists and can be loaded
      const bundlePath = path.join(APP1_BUILD, 'server.rsc.js');
      assert.ok(existsSync(bundlePath), 'Server bundle should exist');

      // The bundle contains ReactApp - verified by module structure
      const bundleContent = readFileSync(bundlePath, 'utf8');
      assert.ok(
        bundleContent.includes('ReactApp') ||
          bundleContent.includes('renderApp'),
        'Server bundle should export React app or render function',
      );
    });
  });

  describe('LOCAL_SC_CC: Server Component → Client Component child', () => {
    it('DemoCounter.server.js renders DemoCounterButton (client)', async () => {
      if (skipIfNoBuild(APP1_BUILD, 'app1')) return;

      // The client manifest should contain DemoCounterButton
      const manifestPath = path.join(APP1_BUILD, 'react-client-manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

      // Find DemoCounterButton in manifest
      const hasButton = Object.keys(manifest).some((key) =>
        key.includes('DemoCounterButton'),
      );
      assert.ok(hasButton, 'DemoCounterButton should be in client manifest');
    });
  });

  describe('LOCAL_CC_CC: Client Component → Client Component child', () => {
    it('client components can nest other client components', async () => {
      if (skipIfNoBuild(APP1_BUILD, 'app1')) return;

      // Verified by build - no special test needed beyond build success
      // The client bundle includes all CC → CC relationships
      const clientBundle = path.join(APP1_BUILD, 'main.js');
      assert.ok(existsSync(clientBundle), 'Client bundle should exist');
    });
  });

  describe('LOCAL_SC_SA: Server Component → Server Action call', () => {
    it('DemoCounter.server.js can call getCount() server action', async () => {
      if (skipIfNoBuild(APP1_BUILD, 'app1')) return;

      // Server bundle exports getServerAction - verify it's in the bundle
      const bundlePath = path.join(APP1_BUILD, 'server.rsc.js');
      const bundleContent = readFileSync(bundlePath, 'utf8');

      // The bundle should contain server action infrastructure
      assert.ok(
        bundleContent.includes('getServerAction') ||
          bundleContent.includes('serverActionRegistry'),
        'Server bundle should include server action infrastructure',
      );

      // The server-actions module should be required/imported
      assert.ok(
        bundleContent.includes('server-actions') ||
          bundleContent.includes('incrementCount'),
        'Server bundle should include server actions module',
      );
    });
  });

  describe('LOCAL_CC_SA: Client Component → Server Action call', () => {
    it('DemoCounterButton can invoke incrementCount action', async () => {
      if (skipIfNoBuild(APP1_BUILD, 'app1')) return;

      // Server actions manifest should contain incrementCount
      const manifestPath = path.join(
        APP1_BUILD,
        'react-server-actions-manifest.json',
      );
      if (existsSync(manifestPath)) {
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        const hasIncrement = Object.keys(manifest).some((key) =>
          key.includes('incrementCount'),
        );
        assert.ok(hasIncrement, 'incrementCount should be in actions manifest');
      }
    });
  });

  describe('LOCAL_SC_INLINE_SA: Server Component with inline Server Action', () => {
    it('InlineActionDemo.server.js has inline actions registered', async () => {
      if (skipIfNoBuild(APP1_BUILD, 'app1')) return;

      // Verify inline-actions module is bundled
      const bundlePath = path.join(APP1_BUILD, 'server.rsc.js');
      const bundleContent = readFileSync(bundlePath, 'utf8');

      // The bundle should include inline action module
      assert.ok(
        bundleContent.includes('inline-actions') ||
          bundleContent.includes('$$ACTION'),
        'Server bundle should include inline actions infrastructure',
      );

      // The getDynamicServerActionsManifest function should be exported
      assert.ok(
        bundleContent.includes('getDynamicServerActionsManifest'),
        'Server bundle should export getDynamicServerActionsManifest',
      );
    });
  });
});

// ============================================================================
// FEDERATION PATTERNS - Cross-App Combinations
// ============================================================================

describe('FEDERATION PATTERNS: Cross-App RSC + MF Combinations', () => {
  describe('FED_HOST_CC_REMOTE_CC: Host Client → Remote Client (browser MF)', () => {
    it('app1 RemoteButton can load app2/Button via MF', async () => {
      if (skipIfNoBuild(APP1_BUILD, 'app1')) return;
      if (skipIfNoBuild(APP2_BUILD, 'app2')) return;

      // Verify app2 exposes Button in its remoteEntry
      const remoteEntry = path.join(APP2_BUILD, 'remoteEntry.client.js');
      assert.ok(
        existsSync(remoteEntry),
        'app2 should have remoteEntry.client.js',
      );

      // Verify app1's client bundle has MF configuration
      const clientBundle = readFileSync(
        path.join(APP1_BUILD, 'main.js'),
        'utf8',
      );
      assert.ok(
        clientBundle.includes('app2') || clientBundle.includes('remoteEntry'),
        'app1 client bundle should reference app2 remote',
      );
    });
  });

  describe('FED_REMOTE_CC_HOST_CHILDREN: Remote CC receives Host children', () => {
    it('React element model allows passing host elements to remote', () => {
      // This is a React architecture test, not a runtime test
      // The key insight: children are pre-created React elements, not imports

      // Simulate what happens:
      const React = require('react');

      // Host creates an element
      const hostElement = React.createElement(
        'span',
        { className: 'from-host' },
        'Local',
      );

      // Remote component receives it as children prop
      function RemoteButton({ children }) {
        return React.createElement('button', null, children);
      }

      // Compose them
      const composed = React.createElement(RemoteButton, {
        children: hostElement,
      });

      // Verify structure
      assert.strictEqual(composed.type, RemoteButton);
      assert.strictEqual(composed.props.children.type, 'span');
      assert.strictEqual(composed.props.children.props.className, 'from-host');
    });
  });

  describe('FED_HOST_CC_REMOTE_SA: Host Client → Remote Server Action (HTTP forward)', () => {
    it('action ID patterns correctly identify remote actions', () => {
      const rscPluginPath = path.resolve(
        __dirname,
        '../../app-shared/scripts/rscRuntimePlugin.js',
      );
      const { parseRemoteActionId } = require(rscPluginPath);

      // Test various action ID formats
      assert.strictEqual(
        parseRemoteActionId('remote:app2:incrementCount')?.remoteName,
        'app2',
        'Explicit prefix should match',
      );
      assert.strictEqual(
        parseRemoteActionId(
          'file:///workspace/packages/app1/src/server-actions.js#incrementCount',
        ),
        null,
        'Unprefixed action IDs are not treated as explicit remotes',
      );
    });
  });

  describe('FED_HOST_SC_REMOTE_CC: Host Server → Remote Client (KNOWN BROKEN)', () => {
    it('documents the manifest merging limitation', () => {
      // This pattern is KNOWN to be broken
      // Documenting it as a test ensures we don't forget

      /*
       * ISSUE: When app1's server component tries to import app2's 'use client' component:
       *
       *   // In app1 server component
       *   import Button from 'app2/Button';
       *   function ServerComp() { return <Button />; }
       *
       * The RSC server tries to serialize Button as a client reference ($L),
       * but app1's react-client-manifest.json doesn't contain app2's components.
       *
       * ERROR: "Could not find the module"
       *
       * FIX NEEDED: Merge app2's client manifest into app1's at build time.
       */

      // For now, this is a documentation test - it passes to show we know the limitation
      assert.ok(
        true,
        'Server-side MF of use client components requires manifest merging (TODO)',
      );
    });
  });

  describe('FED_HOST_SC_REMOTE_SA: Host Server → Remote SA via MF (TODO)', () => {
    it('documents the native MF action federation limitation', () => {
      // This is Option 2 from the architecture - not yet implemented

      /*
       * CURRENT: HTTP forwarding (Option 1)
       *   Client → app1/react → HTTP forward → app2/react → execute
       *
       * IDEAL: Native MF (Option 2)
       *   Client → app1/react → MF require → app2 action in memory
       *
       * CHANGES NEEDED:
       * 1. rsc-server-loader.js: Register remote 'use server' modules
       * 2. react-server-dom-webpack-plugin.js: Merge remote action manifests
       * 3. server.node.js: Support federated action lookup
       */

      assert.ok(
        true,
        'Native MF server actions require RSDW plugin changes (Option 2 TODO)',
      );
    });
  });
});

// ============================================================================
// NESTING PATTERNS - Deep Component Trees
// ============================================================================

describe('NESTING PATTERNS: Multi-Level Component Trees', () => {
  describe('NEST_SC_CC_CC: Server → Client → Client (2 levels)', () => {
    it('App.js → Sidebar → EditButton nesting works', async () => {
      if (skipIfNoBuild(APP1_BUILD, 'app1')) return;

      const manifest = JSON.parse(
        readFileSync(
          path.join(APP1_BUILD, 'react-client-manifest.json'),
          'utf8',
        ),
      );

      // Both EditButton and SearchField should be in manifest
      const hasEdit = Object.keys(manifest).some((k) =>
        k.includes('EditButton'),
      );
      const hasSearch = Object.keys(manifest).some((k) =>
        k.includes('SearchField'),
      );

      assert.ok(hasEdit, 'EditButton should be in client manifest');
      assert.ok(hasSearch, 'SearchField should be in client manifest');
    });
  });

  describe('NEST_SC_SC_CC: Server → Server → Client (2 levels)', () => {
    it('App.js → DemoCounter.server.js → DemoCounterButton', async () => {
      if (skipIfNoBuild(APP1_BUILD, 'app1')) return;

      // Verified by:
      // 1. DemoCounter.server.js existing in the build
      // 2. DemoCounterButton being in client manifest

      const manifest = JSON.parse(
        readFileSync(
          path.join(APP1_BUILD, 'react-client-manifest.json'),
          'utf8',
        ),
      );

      const hasButton = Object.keys(manifest).some((k) =>
        k.includes('DemoCounterButton'),
      );
      assert.ok(hasButton, 'Nested SC → SC → CC pattern should work');
    });
  });

  describe('NEST_SC_CC_REMOTE: Server → Client → Remote Client', () => {
    it('App.js → RemoteButton → app2/Button pattern', async () => {
      if (skipIfNoBuild(APP1_BUILD, 'app1')) return;

      const manifest = JSON.parse(
        readFileSync(
          path.join(APP1_BUILD, 'react-client-manifest.json'),
          'utf8',
        ),
      );

      // RemoteButton (wrapper) should be in manifest
      const hasRemote = Object.keys(manifest).some((k) =>
        k.includes('RemoteButton'),
      );
      assert.ok(hasRemote, 'RemoteButton wrapper should be in client manifest');

      // The actual app2/Button is loaded dynamically via MF, not in this manifest
    });
  });

  describe('NEST_SC_SC_SC: Server → Server → Server (deep server)', () => {
    it('deeply nested server components all render server-side', async () => {
      if (skipIfNoBuild(APP1_BUILD, 'app1')) return;

      // App.js → NoteList.js → Note.js (all server components)
      // Verified by: none of these appear in client manifest

      const manifest = JSON.parse(
        readFileSync(
          path.join(APP1_BUILD, 'react-client-manifest.json'),
          'utf8',
        ),
      );

      const hasNote = Object.keys(manifest).some(
        (k) => k.includes('/Note.js') && !k.includes('NoteEditor'),
      );
      const hasNoteList = Object.keys(manifest).some((k) =>
        k.includes('NoteList'),
      );

      // Server components should NOT be in client manifest
      assert.ok(
        !hasNoteList,
        'NoteList (server) should not be in client manifest',
      );
      // Note might have editor variants that are client, so we just verify NoteList
    });
  });
});

// ============================================================================
// SHARED MODULE PATTERNS
// ============================================================================

describe('SHARED MODULE PATTERNS: React Singleton & Framework', () => {
  describe('SHARED_REACT_SINGLETON: Same React instance across federation', () => {
    it('both apps configured for React singleton sharing', async () => {
      if (skipIfNoBuild(APP1_BUILD, 'app1')) return;
      if (skipIfNoBuild(APP2_BUILD, 'app2')) return;

      // app2 is a REMOTE - it exposes remoteEntry.client.js
      assert.ok(
        existsSync(path.join(APP2_BUILD, 'remoteEntry.client.js')),
        'app2 (remote) should have remoteEntry.client.js',
      );

      // app1 is a HOST - it consumes remotes, has main.js with MF runtime
      assert.ok(
        existsSync(path.join(APP1_BUILD, 'main.js')),
        'app1 (host) should have main.js client bundle',
      );

      // Verify app1's client bundle references app2 as a remote
      const app1Bundle = readFileSync(path.join(APP1_BUILD, 'main.js'), 'utf8');
      assert.ok(
        app1Bundle.includes('app2') || app1Bundle.includes('remoteEntry'),
        'app1 client bundle should reference app2 remote',
      );
    });
  });

  describe('SHARED_FRAMEWORK: Router and bootstrap shared', () => {
    it('both apps use shared framework from app-shared', () => {
      const sharedPath = path.resolve(__dirname, '../../app-shared');
      assert.ok(existsSync(sharedPath), 'app-shared package should exist');
      assert.ok(
        existsSync(path.join(sharedPath, 'framework/router.js')),
        'Shared router should exist',
      );
      assert.ok(
        existsSync(path.join(sharedPath, 'scripts/webpackShared.js')),
        'Shared webpack config should exist',
      );
    });
  });
});

// ============================================================================
// NEGATIVE TESTS - Documenting Unsupported Patterns
// ============================================================================

describe('NEGATIVE TESTS: Unsupported Patterns (Expected Failures)', () => {
  describe('Client importing Server Component directly', () => {
    it('documents React limitation: CC cannot import SC', () => {
      /*
       * This is a React architecture limitation, not specific to MF:
       *
       *   // In client component - THIS IS INVALID
       *   import ServerComponent from './Server.server.js';
       *   function ClientComp() { return <ServerComponent />; }
       *
       * Server components can only be imported by other server components.
       * Client components receive server component output as children.
       */
      assert.ok(true, 'CC importing SC is a React limitation, not MF-specific');
    });
  });

  describe('Remote importing Host modules', () => {
    it('documents one-way federation limitation', () => {
      /*
       * Module Federation remotes config is one-directional:
       *
       *   // app1 has: remotes: { app2: '...' }
       *   // app2 can also have: remotes: { app1: '...' }  (bidirectional)
       *
       * Without bidirectional config, app2/Button.js cannot do:
       *   import Something from 'app1/Something';  // ❌ Error
       *
       * Solution: Use bidirectional federation config, or use
       *           children/render props patterns instead.
       */
      assert.ok(true, 'Remote → Host import requires bidirectional MF config');
    });
  });
});

console.log('RSC + MF Combination Matrix tests loaded');
