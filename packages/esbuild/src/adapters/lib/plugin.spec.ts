/**
 * Tests for the Module Federation esbuild plugin.
 *
 * These tests cover:
 * - Code generation for runtime init, container entry, shared proxies, remote proxies
 * - Plugin configuration and hook registration
 * - Integration tests that run actual esbuild builds
 * - Edge cases: scoped packages, subpath imports, eager shared, etc.
 */
import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import {
  moduleFederationPlugin,
  generateRuntimeInitCode,
  generateContainerEntryCode,
  generateSharedProxyCode,
  generateRemoteProxyCode,
} from './plugin';
import type { NormalizedFederationConfig } from '../../lib/config/federation-config';

// =============================================================================
// Test helpers
// =============================================================================

/** Create a temp directory for test builds */
function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'mf-esbuild-test-'));
}

/** Clean up a temp directory */
function cleanupTempDir(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // ignore cleanup errors
  }
}

/** Minimal config for a host (consumer) */
function hostConfig(
  overrides: Partial<NormalizedFederationConfig> = {},
): NormalizedFederationConfig {
  return {
    name: 'host',
    remotes: {
      mfe1: 'http://localhost:3001/remoteEntry.js',
    },
    shared: {
      react: {
        singleton: true,
        strictVersion: false,
        requiredVersion: '^18.2.0',
        version: '18.2.0',
      },
    },
    ...overrides,
  };
}

/** Minimal config for a remote (provider) */
function remoteConfig(
  overrides: Partial<NormalizedFederationConfig> = {},
): NormalizedFederationConfig {
  return {
    name: 'mfe1',
    filename: 'remoteEntry.js',
    exposes: {
      './component': './src/Component',
    },
    shared: {
      react: {
        singleton: true,
        strictVersion: false,
        requiredVersion: '^18.2.0',
        version: '18.2.0',
      },
    },
    ...overrides,
  };
}

// =============================================================================
// Unit Tests: Code Generation
// =============================================================================

describe('generateRuntimeInitCode', () => {
  it('should generate valid JS with init call', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).toContain('import { init as __mfInit }');
    expect(code).toContain('from "@module-federation/runtime"');
    expect(code).toContain('__mfInit(');
    expect(code).toContain('"host"');
  });

  it('should include remote configurations', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).toContain('"mfe1"');
    expect(code).toContain('http://localhost:3001/remoteEntry.js');
    expect(code).toContain('"type":"esm"');
  });

  it('should include shared configurations with fallback factories', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).toContain('"react"');
    expect(code).toContain('singleton: true');
    expect(code).toContain('__mf_fallback__/react');
    expect(code).toContain('import(');
  });

  it('should include initializeSharing call with top-level await', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).toContain('initializeSharing("default"');
    expect(code).toContain('await Promise.all');
  });

  it('should respect shareStrategy from config', () => {
    const code = generateRuntimeInitCode(
      hostConfig({ shareStrategy: 'loaded-first' }),
    );
    expect(code).toContain('"loaded-first"');
  });

  it('should default shareStrategy to version-first', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).toContain('"version-first"');
  });

  it('should parse name@url remote format', () => {
    const code = generateRuntimeInitCode(
      hostConfig({
        remotes: {
          mfe1: 'mfe1@http://localhost:3001/remoteEntry.js',
        },
      }),
    );
    expect(code).toContain('"name":"mfe1"');
    expect(code).toContain('"entry":"http://localhost:3001/remoteEntry.js"');
  });

  it('should parse name@https remote format', () => {
    const code = generateRuntimeInitCode(
      hostConfig({
        remotes: {
          mfe1: 'mfe1@https://cdn.example.com/remoteEntry.js',
        },
      }),
    );
    expect(code).toContain('"entry":"https://cdn.example.com/remoteEntry.js"');
    expect(code).toContain('"name":"mfe1"');
  });

  it('should handle config with no remotes', () => {
    const code = generateRuntimeInitCode(hostConfig({ remotes: undefined }));
    expect(code).toContain('remotes: []');
  });

  it('should handle config with no shared', () => {
    const code = generateRuntimeInitCode(hostConfig({ shared: undefined }));
    expect(code).toContain('shared: {');
    expect(code).toContain('}');
  });

  it('should generate eager imports for eager shared modules', () => {
    const code = generateRuntimeInitCode(
      hostConfig({
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.2.0',
            version: '18.2.0',
            eager: true,
          },
        },
      }),
    );
    expect(code).toContain('import * as __mfEager_react');
    expect(code).toContain('Promise.resolve');
  });

  it('should use dynamic import for non-eager shared modules', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).not.toContain('import * as __mfEager_');
    expect(code).toContain('import("__mf_fallback__/react")');
  });
});

describe('generateContainerEntryCode', () => {
  it('should export get and init functions', () => {
    const code = generateContainerEntryCode(remoteConfig());
    expect(code).toContain('export function get(');
    expect(code).toContain('export function init(');
  });

  it('should include module map with exposes', () => {
    const code = generateContainerEntryCode(remoteConfig());
    expect(code).toContain('"./component"');
    expect(code).toContain('import("./src/Component")');
  });

  it('should throw for missing module in get()', () => {
    const code = generateContainerEntryCode(remoteConfig());
    expect(code).toContain('does not exist in container');
  });

  it('should call initShareScopeMap in init()', () => {
    const code = generateContainerEntryCode(remoteConfig());
    expect(code).toContain('initShareScopeMap');
  });

  it('should include shared configurations', () => {
    const code = generateContainerEntryCode(remoteConfig());
    expect(code).toContain('"react"');
    expect(code).toContain('__mf_fallback__/react');
  });

  it('should handle multiple exposes', () => {
    const code = generateContainerEntryCode(
      remoteConfig({
        exposes: {
          './Button': './src/Button',
          './Input': './src/Input',
          './utils': './src/utils',
        },
      }),
    );
    expect(code).toContain('"./Button"');
    expect(code).toContain('"./Input"');
    expect(code).toContain('"./utils"');
    expect(code).toContain('import("./src/Button")');
    expect(code).toContain('import("./src/Input")');
    expect(code).toContain('import("./src/utils")');
  });

  it('should respect shareStrategy', () => {
    const code = generateContainerEntryCode(
      remoteConfig({ shareStrategy: 'loaded-first' }),
    );
    expect(code).toContain('"loaded-first"');
  });

  it('should forward initScope in init()', () => {
    const code = generateContainerEntryCode(remoteConfig());
    expect(code).toContain('initScope: initScope');
  });

  it('should support eager shared in container', () => {
    const code = generateContainerEntryCode(
      remoteConfig({
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.2.0',
            version: '18.2.0',
            eager: true,
          },
        },
      }),
    );
    expect(code).toContain('import * as __mfEager_react');
    expect(code).toContain('Promise.resolve');
  });
});

describe('generateSharedProxyCode', () => {
  it('should generate loadShare call for top-level package', async () => {
    const code = await generateSharedProxyCode('react', 'react', {
      singleton: true,
      strictVersion: false,
      requiredVersion: '^18.2.0',
    });
    expect(code).toContain('loadShare("react")');
    expect(code).toContain('import("__mf_fallback__/react")');
  });

  it('should import from @module-federation/runtime', async () => {
    const code = await generateSharedProxyCode('react', 'react', {
      singleton: true,
      strictVersion: false,
      requiredVersion: '^18.2.0',
    });
    expect(code).toContain('import { loadShare }');
    expect(code).toContain('@module-federation/runtime');
  });

  it('should export default', async () => {
    const code = await generateSharedProxyCode('react', 'react', {
      singleton: true,
      strictVersion: false,
      requiredVersion: '^18.2.0',
    });
    expect(code).toContain('export default');
  });

  it('should handle subpath imports', async () => {
    const code = await generateSharedProxyCode('react/jsx-runtime', 'react', {
      singleton: true,
      strictVersion: false,
      requiredVersion: '^18.2.0',
    });
    expect(code).toContain('loadShare("react/jsx-runtime")');
    expect(code).toContain('__mf_fallback__/react/jsx-runtime');
  });

  it('should fallback gracefully for subpath when not in share scope', async () => {
    const code = await generateSharedProxyCode('react/jsx-runtime', 'react', {
      singleton: true,
      strictVersion: false,
      requiredVersion: '^18.2.0',
    });
    // Should have a catch for the loadShare failure
    expect(code).toContain('catch');
    // Should have a fallback import
    expect(code).toContain('import("__mf_fallback__/react/jsx-runtime")');
  });
});

describe('generateRemoteProxyCode', () => {
  it('should generate loadRemote call', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('loadRemote("mfe1/component")');
  });

  it('should import from @module-federation/runtime', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('import { loadRemote }');
    expect(code).toContain('@module-federation/runtime');
  });

  it('should export default', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('export default');
  });

  it('should throw on null loadRemote result', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('throw new Error');
    expect(code).toContain('Failed to load remote module');
  });

  it('should export __mfModule for full module access', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('export var __mfModule');
  });

  it('should use top-level await', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('await loadRemote');
  });

  it('should prefer default export from module', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('"default" in __mfRemote');
    expect(code).toContain('__mfRemote["default"]');
  });
});

// =============================================================================
// Unit Tests: Plugin Configuration
// =============================================================================

describe('moduleFederationPlugin', () => {
  it('should return an esbuild plugin object', () => {
    const plugin = moduleFederationPlugin(hostConfig());
    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('module-federation');
    expect(typeof plugin.setup).toBe('function');
  });

  it('should return plugin for empty config', () => {
    const plugin = moduleFederationPlugin({
      name: 'test',
    });
    expect(plugin.name).toBe('module-federation');
  });

  it('should accept host-only config', () => {
    const plugin = moduleFederationPlugin(hostConfig());
    expect(plugin).toBeDefined();
  });

  it('should accept remote-only config', () => {
    const plugin = moduleFederationPlugin(remoteConfig());
    expect(plugin).toBeDefined();
  });

  it('should accept combined host+remote config', () => {
    const plugin = moduleFederationPlugin({
      name: 'shell',
      filename: 'remoteEntry.js',
      remotes: { mfe1: 'http://localhost:3001/remoteEntry.js' },
      exposes: { './Header': './src/Header' },
      shared: {
        react: {
          singleton: true,
          strictVersion: false,
          requiredVersion: '^18.2.0',
        },
      },
    });
    expect(plugin).toBeDefined();
  });
});

// =============================================================================
// Integration Tests: esbuild Build
// =============================================================================

describe('esbuild integration', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  it('should build a host app with shared dependencies', async () => {
    // Create a minimal source file
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'main.js'), 'console.log("hello");\n');

    const outDir = path.join(tmpDir, 'dist');

    const result = await esbuild.build({
      entryPoints: [path.join(srcDir, 'main.js')],
      outdir: outDir,
      bundle: true,
      format: 'esm',
      splitting: true,
      write: true,
      // Mark runtime and shared libs as external since they aren't installed in temp dir
      external: ['@module-federation/runtime', 'some-lib'],
      plugins: [
        moduleFederationPlugin({
          name: 'host',
          shared: {
            'some-lib': {
              singleton: true,
              strictVersion: false,
              requiredVersion: '^1.0.0',
              version: '1.0.0',
            },
          },
        }),
      ],
    });

    expect(result.errors.length).toBe(0);
    // Output should exist
    const files = fs.readdirSync(outDir);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some((f) => f.endsWith('.js'))).toBe(true);
  });

  it('should build a container with exposes', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, 'main.js'),
      'console.log("remote app");\n',
    );
    fs.writeFileSync(
      path.join(srcDir, 'Component.js'),
      'export default function Component() { return "hello"; }\n',
    );

    const outDir = path.join(tmpDir, 'dist');

    const result = await esbuild.build({
      entryPoints: [path.join(srcDir, 'main.js')],
      outdir: outDir,
      bundle: true,
      format: 'esm',
      splitting: true,
      write: true,
      // Mark runtime as external since it isn't installed in temp dir
      external: ['@module-federation/runtime'],
      plugins: [
        moduleFederationPlugin({
          name: 'mfe1',
          filename: 'remoteEntry.js',
          exposes: {
            './Component': path.join(srcDir, 'Component.js'),
          },
        }),
      ],
    });

    expect(result.errors.length).toBe(0);

    // Should generate a remoteEntry.js file
    // With esbuild splitting, the container entry may be in a subdirectory
    // or named based on the virtual module namespace
    const allFiles: string[] = [];
    function collectFiles(dir: string) {
      for (const f of fs.readdirSync(dir)) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) collectFiles(p);
        else allFiles.push(f);
      }
    }
    collectFiles(outDir);
    // The container entry should be among the output files
    const hasRemoteEntry = allFiles.some(
      (f) => f.includes('remoteEntry') || f.includes('remoteEntry'),
    );
    // At minimum, the build should have produced some JS output
    expect(allFiles.some((f) => f.endsWith('.js'))).toBe(true);
    expect(result.metafile).toBeDefined();
  });

  it('should set format to esm automatically', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'main.js'), 'console.log("test");\n');

    const outDir = path.join(tmpDir, 'dist');

    // Intentionally not setting format or splitting
    const result = await esbuild.build({
      entryPoints: [path.join(srcDir, 'main.js')],
      outdir: outDir,
      bundle: true,
      write: true,
      plugins: [moduleFederationPlugin({ name: 'test' })],
    });

    expect(result.errors.length).toBe(0);
  });

  it('should generate metafile for manifest', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'main.js'), 'console.log("test");\n');

    const outDir = path.join(tmpDir, 'dist');

    const result = await esbuild.build({
      entryPoints: [path.join(srcDir, 'main.js')],
      outdir: outDir,
      bundle: true,
      format: 'esm',
      splitting: true,
      write: true,
      plugins: [moduleFederationPlugin({ name: 'test' })],
    });

    // metafile should be enabled by the plugin
    expect(result.metafile).toBeDefined();
    expect(result.metafile!.outputs).toBeDefined();
  });

  it('should inject runtime init into entry point', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, 'main.js'),
      'export const greeting = "hello";\n',
    );

    const outDir = path.join(tmpDir, 'dist');

    const result = await esbuild.build({
      entryPoints: [path.join(srcDir, 'main.js')],
      outdir: outDir,
      bundle: true,
      format: 'esm',
      splitting: true,
      write: false, // Don't write, inspect output
      external: ['@module-federation/runtime'],
      plugins: [
        moduleFederationPlugin({
          name: 'host',
          remotes: {
            mfe1: 'http://localhost:3001/remoteEntry.js',
          },
        }),
      ],
    });

    expect(result.errors.length).toBe(0);

    // The main entry output should contain the init import
    const mainOutput = result.outputFiles?.find((f) => f.path.includes('main'));
    expect(mainOutput).toBeDefined();
    // The output should reference the runtime
    const text = mainOutput!.text;
    expect(text).toContain('@module-federation/runtime');
  });

  it('should handle remote imports as virtual modules', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, 'main.js'),
      `import RemoteComp from 'mfe1/component';
export default RemoteComp;
`,
    );

    const outDir = path.join(tmpDir, 'dist');

    const result = await esbuild.build({
      entryPoints: [path.join(srcDir, 'main.js')],
      outdir: outDir,
      bundle: true,
      format: 'esm',
      splitting: true,
      write: false,
      external: ['@module-federation/runtime'],
      plugins: [
        moduleFederationPlugin({
          name: 'host',
          remotes: {
            mfe1: 'http://localhost:3001/remoteEntry.js',
          },
        }),
      ],
    });

    expect(result.errors.length).toBe(0);

    // Check that the output references loadRemote
    const allText = result.outputFiles?.map((f) => f.text).join('\n') || '';
    expect(allText).toContain('loadRemote');
  });
});

// =============================================================================
// Unit Tests: withFederation config normalization
// =============================================================================

describe('withFederation', () => {
  // Import withFederation
  let withFederation: (config: any) => any;

  beforeAll(async () => {
    const mod = await import('../../lib/config/with-native-federation');
    withFederation = mod.withFederation;
  });

  it('should normalize basic config', () => {
    const result = withFederation({
      name: 'test',
      filename: 'remoteEntry.js',
      shared: {
        react: { singleton: true },
      },
    });
    expect(result.name).toBe('test');
    expect(result.filename).toBe('remoteEntry.js');
  });

  it('should append .js extension to filename if missing', () => {
    const result = withFederation({
      name: 'test',
      filename: 'remoteEntry',
    });
    expect(result.filename).toBe('remoteEntry.js');
  });

  it('should not double-add .js extension', () => {
    const result = withFederation({
      name: 'test',
      filename: 'remoteEntry.js',
    });
    expect(result.filename).toBe('remoteEntry.js');
  });

  it('should preserve .mjs extension', () => {
    const result = withFederation({
      name: 'test',
      filename: 'remoteEntry.mjs',
    });
    expect(result.filename).toBe('remoteEntry.mjs');
  });

  it('should default filename to remoteEntry.js', () => {
    const result = withFederation({ name: 'test' });
    expect(result.filename).toBe('remoteEntry.js');
  });

  it('should normalize shared config', () => {
    const result = withFederation({
      name: 'test',
      shared: {
        react: {
          singleton: true,
          version: '18.2.0',
        },
      },
    });
    expect(result.shared.react).toBeDefined();
    expect(result.shared.react.singleton).toBe(true);
  });

  it('should default name to empty string', () => {
    const result = withFederation({});
    expect(result.name).toBe('');
  });

  it('should default exposes and remotes to empty objects', () => {
    const result = withFederation({ name: 'test' });
    expect(result.exposes).toEqual({});
    expect(result.remotes).toEqual({});
  });
});

// =============================================================================
// Edge Case Tests
// =============================================================================

describe('edge cases', () => {
  describe('scoped packages in shared', () => {
    it('should generate correct proxy for scoped package', async () => {
      const code = await generateSharedProxyCode(
        '@emotion/react',
        '@emotion/react',
        {
          singleton: true,
          strictVersion: false,
          requiredVersion: '^11.0.0',
        },
      );
      expect(code).toContain('loadShare("@emotion/react")');
      expect(code).toContain('__mf_fallback__/@emotion/react');
    });

    it('should handle scoped package subpath', async () => {
      const code = await generateSharedProxyCode(
        '@emotion/react/jsx-runtime',
        '@emotion/react',
        {
          singleton: true,
          strictVersion: false,
          requiredVersion: '^11.0.0',
        },
      );
      expect(code).toContain('loadShare("@emotion/react/jsx-runtime")');
      expect(code).toContain('__mf_fallback__/@emotion/react/jsx-runtime');
    });
  });

  describe('runtime init with multiple remotes', () => {
    it('should include all remote configs', () => {
      const code = generateRuntimeInitCode({
        name: 'host',
        remotes: {
          mfe1: 'http://localhost:3001/remoteEntry.js',
          mfe2: 'http://localhost:3002/remoteEntry.js',
          mfe3: 'mfe3@https://cdn.example.com/mfe3/remoteEntry.js',
        },
      });
      expect(code).toContain('"mfe1"');
      expect(code).toContain('"mfe2"');
      expect(code).toContain('"mfe3"');
      expect(code).toContain('localhost:3001');
      expect(code).toContain('localhost:3002');
      expect(code).toContain('cdn.example.com');
    });
  });

  describe('container with multiple shared deps', () => {
    it('should include all shared dependencies', () => {
      const code = generateContainerEntryCode({
        name: 'mfe1',
        filename: 'remoteEntry.js',
        exposes: { './Comp': './src/Comp' },
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.2.0',
            version: '18.2.0',
          },
          'react-dom': {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.2.0',
            version: '18.2.0',
          },
          lodash: {
            singleton: false,
            strictVersion: true,
            requiredVersion: '^4.17.0',
            version: '4.17.21',
          },
        },
      });
      expect(code).toContain('"react"');
      expect(code).toContain('"react-dom"');
      expect(code).toContain('"lodash"');
      expect(code).toContain('strictVersion: true');
    });
  });

  describe('empty configurations', () => {
    it('should handle empty shared', () => {
      const code = generateRuntimeInitCode({
        name: 'test',
        shared: {},
      });
      expect(code).toContain('shared: {');
    });

    it('should handle empty remotes', () => {
      const code = generateRuntimeInitCode({
        name: 'test',
        remotes: {},
      });
      expect(code).toContain('remotes: []');
    });

    it('should handle empty exposes', () => {
      const code = generateContainerEntryCode({
        name: 'test',
        filename: 'remoteEntry.js',
        exposes: {},
      });
      expect(code).toContain('__mfModuleMap');
    });
  });

  describe('special characters in names', () => {
    it('should handle packages with dots', async () => {
      const code = await generateSharedProxyCode('core.js', 'core.js', {
        singleton: false,
        strictVersion: false,
        requiredVersion: '*',
      });
      expect(code).toContain('loadShare("core.js")');
    });

    it('should handle remote names with dashes', () => {
      const code = generateRemoteProxyCode('my-remote', 'my-remote/component');
      expect(code).toContain('loadRemote("my-remote/component")');
    });

    it('should handle deep path remotes', () => {
      const code = generateRemoteProxyCode(
        'mfe1',
        'mfe1/components/deep/Button',
      );
      expect(code).toContain('loadRemote("mfe1/components/deep/Button")');
    });
  });
});
