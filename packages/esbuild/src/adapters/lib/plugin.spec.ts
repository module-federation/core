/**
 * Tests for the Module Federation esbuild plugin.
 *
 * Covers code generation, plugin configuration, esbuild integration,
 * config normalization, and edge cases for all features including:
 * shareScope, runtimePlugins, publicPath, import:false, shareKey,
 * per-dep shareScope, packageName, per-remote shareScope, eager,
 * version auto-detection, subpath imports, scoped packages.
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

function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'mf-esbuild-test-'));
}

function cleanupTempDir(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

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
// generateRuntimeInitCode
// =============================================================================

describe('generateRuntimeInitCode', () => {
  it('should generate valid JS with init call', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).toContain('import { init as __mfInit }');
    expect(code).toContain('@module-federation/runtime');
    expect(code).toContain('__mfInit(');
    expect(code).toContain('"host"');
  });

  it('should include remote configurations', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).toContain('"mfe1"');
    expect(code).toContain('http://localhost:3001/remoteEntry.js');
  });

  it('should include shared config with fallback factories', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).toContain('"react"');
    expect(code).toContain('singleton: true');
    expect(code).toContain('__mf_fallback__/react');
  });

  it('should include initializeSharing with top-level await', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).toContain('initializeSharing(');
    expect(code).toContain('await Promise.all');
  });

  it('should respect shareStrategy', () => {
    const code = generateRuntimeInitCode(
      hostConfig({ shareStrategy: 'loaded-first' }),
    );
    expect(code).toContain('"loaded-first"');
  });

  it('should default shareStrategy to version-first', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).toContain('"version-first"');
  });

  it('should parse name@http remote format', () => {
    const code = generateRuntimeInitCode(
      hostConfig({
        remotes: { mfe1: 'mfe1@http://localhost:3001/remoteEntry.js' },
      }),
    );
    expect(code).toContain('"name":"mfe1"');
    expect(code).toContain('"entry":"http://localhost:3001/remoteEntry.js"');
  });

  it('should parse name@https remote format', () => {
    const code = generateRuntimeInitCode(
      hostConfig({
        remotes: { mfe1: 'mfe1@https://cdn.example.com/remoteEntry.js' },
      }),
    );
    expect(code).toContain('"entry":"https://cdn.example.com/remoteEntry.js"');
  });

  it('should handle no remotes', () => {
    const code = generateRuntimeInitCode(hostConfig({ remotes: undefined }));
    expect(code).toContain('remotes: []');
  });

  it('should handle no shared', () => {
    const code = generateRuntimeInitCode(hostConfig({ shared: undefined }));
    expect(code).toContain('shared: {');
  });

  it('should generate eager imports', () => {
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

  it('should use dynamic import for non-eager shared', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).not.toContain('import * as __mfEager_');
  });

  // --- NEW: shareScope ---
  it('should use custom shareScope', () => {
    const code = generateRuntimeInitCode(
      hostConfig({ shareScope: 'customScope' }),
    );
    expect(code).toContain('initializeSharing("customScope"');
    expect(code).toContain('scope: "customScope"');
  });

  it('should default shareScope to "default"', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).toContain('initializeSharing("default"');
    expect(code).toContain('scope: "default"');
  });

  // --- NEW: runtimePlugins ---
  it('should inject runtimePlugins imports and plugins array', () => {
    const code = generateRuntimeInitCode(
      hostConfig({ runtimePlugins: ['./my-plugin.js', '@mf/logger-plugin'] }),
    );
    expect(code).toContain('import __mfRuntimePlugin0 from "./my-plugin.js"');
    expect(code).toContain(
      'import __mfRuntimePlugin1 from "@mf/logger-plugin"',
    );
    expect(code).toContain('plugins: __mfPlugins');
  });

  it('should not include plugins section when no runtimePlugins', () => {
    const code = generateRuntimeInitCode(hostConfig());
    expect(code).not.toContain('plugins:');
  });

  // --- NEW: per-remote shareScope ---
  it('should include per-remote shareScope', () => {
    const code = generateRuntimeInitCode(
      hostConfig({
        remotes: {
          mfe1: {
            entry: 'http://localhost:3001/remoteEntry.js',
            shareScope: 'isolatedScope',
          },
        },
      }),
    );
    expect(code).toContain('"shareScope":"isolatedScope"');
  });

  // --- NEW: shared import:false ---
  it('should handle import:false (no fallback)', () => {
    const code = generateRuntimeInitCode(
      hostConfig({
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.2.0',
            import: false,
          },
        },
      }),
    );
    // Should not contain fallback import path
    expect(code).not.toContain('__mf_fallback__/react');
    expect(code).toContain('undefined');
  });

  // --- NEW: custom shareKey ---
  it('should use custom shareKey', () => {
    const code = generateRuntimeInitCode(
      hostConfig({
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.2.0',
            version: '18.2.0',
            shareKey: 'my-react',
          },
        },
      }),
    );
    expect(code).toContain('"my-react"');
  });

  // --- NEW: per-shared shareScope ---
  it('should use per-shared shareScope', () => {
    const code = generateRuntimeInitCode(
      hostConfig({
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.2.0',
            version: '18.2.0',
            shareScope: 'react-scope',
          },
        },
      }),
    );
    expect(code).toContain('scope: "react-scope"');
  });
});

// =============================================================================
// generateContainerEntryCode
// =============================================================================

describe('generateContainerEntryCode', () => {
  it('should export get and init', () => {
    const code = generateContainerEntryCode(remoteConfig());
    expect(code).toContain('export function get(');
    expect(code).toContain('export function init(');
  });

  it('should include module map with exposes', () => {
    const code = generateContainerEntryCode(remoteConfig());
    expect(code).toContain('"./component"');
    expect(code).toContain('import("./src/Component")');
  });

  it('should throw for missing module', () => {
    const code = generateContainerEntryCode(remoteConfig());
    expect(code).toContain('does not exist in container');
  });

  it('should call initShareScopeMap', () => {
    const code = generateContainerEntryCode(remoteConfig());
    expect(code).toContain('initShareScopeMap');
  });

  it('should include shared config', () => {
    const code = generateContainerEntryCode(remoteConfig());
    expect(code).toContain('"react"');
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
  });

  it('should respect shareStrategy', () => {
    const code = generateContainerEntryCode(
      remoteConfig({ shareStrategy: 'loaded-first' }),
    );
    expect(code).toContain('"loaded-first"');
  });

  it('should forward initScope', () => {
    const code = generateContainerEntryCode(remoteConfig());
    expect(code).toContain('initScope: initScope');
  });

  it('should support eager shared', () => {
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
  });

  it('should use custom shareScope', () => {
    const code = generateContainerEntryCode(
      remoteConfig({ shareScope: 'myScope' }),
    );
    expect(code).toContain('initializeSharing("myScope"');
    expect(code).toContain('initShareScopeMap("myScope"');
  });

  it('should inject runtimePlugins', () => {
    const code = generateContainerEntryCode(
      remoteConfig({ runtimePlugins: ['./container-plugin.js'] }),
    );
    expect(code).toContain('import __mfRuntimePlugin0');
    expect(code).toContain('plugins: __mfPlugins');
  });
});

// =============================================================================
// generateSharedProxyCode
// =============================================================================

describe('generateSharedProxyCode', () => {
  it('should generate loadShare for top-level package', async () => {
    const code = await generateSharedProxyCode('react', 'react', {
      singleton: true,
      strictVersion: false,
      requiredVersion: '^18.2.0',
    });
    expect(code).toContain('loadShare("react")');
    expect(code).toContain('__mf_fallback__/react');
  });

  it('should import from runtime', async () => {
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

  it('should fallback gracefully for subpath', async () => {
    const code = await generateSharedProxyCode('react/jsx-runtime', 'react', {
      singleton: true,
      strictVersion: false,
      requiredVersion: '^18.2.0',
    });
    expect(code).toContain('catch');
    expect(code).toContain('__mf_fallback__/react/jsx-runtime');
  });

  // --- NEW: import:false ---
  it('should throw when import:false and module not in scope', async () => {
    const code = await generateSharedProxyCode('react', 'react', {
      singleton: true,
      strictVersion: false,
      requiredVersion: '^18.2.0',
      import: false,
    });
    expect(code).toContain('throw new Error');
    expect(code).toContain('import:false prevents local fallback');
    expect(code).not.toContain('__mf_fallback__');
  });

  // --- NEW: custom shareKey ---
  it('should use custom shareKey in loadShare', async () => {
    const code = await generateSharedProxyCode('react', 'react', {
      singleton: true,
      strictVersion: false,
      requiredVersion: '^18.2.0',
      shareKey: 'my-react-key',
    });
    expect(code).toContain('loadShare("my-react-key")');
    expect(code).toContain('__mf_fallback__/my-react-key');
  });
});

// =============================================================================
// generateRemoteProxyCode
// =============================================================================

describe('generateRemoteProxyCode', () => {
  it('should generate loadRemote call', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('loadRemote("mfe1/component")');
  });

  it('should import from runtime', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('import { loadRemote }');
  });

  it('should export default', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('export default');
  });

  it('should throw on null loadRemote', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('throw new Error');
  });

  it('should export __mfModule', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('export var __mfModule');
  });

  it('should use top-level await', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('await loadRemote');
  });

  it('should prefer default from module', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('"default" in __mfRemote');
  });
});

// =============================================================================
// moduleFederationPlugin
// =============================================================================

describe('moduleFederationPlugin', () => {
  it('should return an esbuild plugin', () => {
    const plugin = moduleFederationPlugin(hostConfig());
    expect(plugin.name).toBe('module-federation');
    expect(typeof plugin.setup).toBe('function');
  });

  it('should accept empty config', () => {
    const plugin = moduleFederationPlugin({ name: 'test' });
    expect(plugin).toBeDefined();
  });

  it('should accept host config', () => {
    expect(moduleFederationPlugin(hostConfig())).toBeDefined();
  });

  it('should accept remote config', () => {
    expect(moduleFederationPlugin(remoteConfig())).toBeDefined();
  });

  it('should accept combined config', () => {
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
      shareScope: 'myScope',
      runtimePlugins: ['./plugin.js'],
      publicPath: 'https://cdn.example.com/',
    });
    expect(plugin).toBeDefined();
  });
});

// =============================================================================
// esbuild integration
// =============================================================================

describe('esbuild integration', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tmpDir);
  });

  it('should build a host with shared deps', async () => {
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
    const files = fs.readdirSync(outDir);
    expect(files.some((f) => f.endsWith('.js'))).toBe(true);
  });

  it('should build a container with exposes', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'main.js'), 'console.log("app");\n');
    fs.writeFileSync(
      path.join(srcDir, 'Comp.js'),
      'export default function Comp() { return "hi"; }\n',
    );

    const outDir = path.join(tmpDir, 'dist');
    const result = await esbuild.build({
      entryPoints: [path.join(srcDir, 'main.js')],
      outdir: outDir,
      bundle: true,
      format: 'esm',
      splitting: true,
      write: true,
      external: ['@module-federation/runtime'],
      plugins: [
        moduleFederationPlugin({
          name: 'mfe1',
          filename: 'remoteEntry.js',
          exposes: { './Comp': path.join(srcDir, 'Comp.js') },
        }),
      ],
    });

    expect(result.errors.length).toBe(0);
    expect(result.metafile).toBeDefined();
  });

  it('should auto-set format and splitting', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'main.js'), 'console.log("test");\n');

    const result = await esbuild.build({
      entryPoints: [path.join(srcDir, 'main.js')],
      outdir: path.join(tmpDir, 'dist'),
      bundle: true,
      write: true,
      plugins: [moduleFederationPlugin({ name: 'test' })],
    });

    expect(result.errors.length).toBe(0);
  });

  it('should generate metafile', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(path.join(srcDir, 'main.js'), 'console.log("test");\n');

    const result = await esbuild.build({
      entryPoints: [path.join(srcDir, 'main.js')],
      outdir: path.join(tmpDir, 'dist'),
      bundle: true,
      format: 'esm',
      splitting: true,
      write: true,
      plugins: [moduleFederationPlugin({ name: 'test' })],
    });

    expect(result.metafile).toBeDefined();
    expect(result.metafile!.outputs).toBeDefined();
  });

  it('should inject runtime init into entry', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, 'main.js'),
      'export const x = "hello";\n',
    );

    const result = await esbuild.build({
      entryPoints: [path.join(srcDir, 'main.js')],
      outdir: path.join(tmpDir, 'dist'),
      bundle: true,
      format: 'esm',
      splitting: true,
      write: false,
      external: ['@module-federation/runtime'],
      plugins: [
        moduleFederationPlugin({
          name: 'host',
          remotes: { mfe1: 'http://localhost:3001/remoteEntry.js' },
        }),
      ],
    });

    expect(result.errors.length).toBe(0);
    const mainOut = result.outputFiles?.find((f) => f.path.includes('main'));
    expect(mainOut).toBeDefined();
    expect(mainOut!.text).toContain('@module-federation/runtime');
  });

  it('should handle remote imports as virtual modules', async () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, 'main.js'),
      `import RemoteComp from 'mfe1/component';\nexport default RemoteComp;\n`,
    );

    const result = await esbuild.build({
      entryPoints: [path.join(srcDir, 'main.js')],
      outdir: path.join(tmpDir, 'dist'),
      bundle: true,
      format: 'esm',
      splitting: true,
      write: false,
      external: ['@module-federation/runtime'],
      plugins: [
        moduleFederationPlugin({
          name: 'host',
          remotes: { mfe1: 'http://localhost:3001/remoteEntry.js' },
        }),
      ],
    });

    expect(result.errors.length).toBe(0);
    const allText = result.outputFiles?.map((f) => f.text).join('\n') || '';
    expect(allText).toContain('loadRemote');
  });
});

// =============================================================================
// withFederation
// =============================================================================

describe('withFederation', () => {
  let withFederation: (config: any) => any;

  beforeAll(async () => {
    const mod = await import('../../lib/config/with-native-federation');
    withFederation = mod.withFederation;
  });

  it('should normalize basic config', () => {
    const result = withFederation({
      name: 'test',
      filename: 'remoteEntry.js',
      shared: { react: { singleton: true } },
    });
    expect(result.name).toBe('test');
    expect(result.filename).toBe('remoteEntry.js');
  });

  it('should append .js extension', () => {
    expect(
      withFederation({ name: 'x', filename: 'remoteEntry' }).filename,
    ).toBe('remoteEntry.js');
  });

  it('should not double-add .js', () => {
    expect(
      withFederation({ name: 'x', filename: 'remoteEntry.js' }).filename,
    ).toBe('remoteEntry.js');
  });

  it('should preserve .mjs', () => {
    expect(
      withFederation({ name: 'x', filename: 'remoteEntry.mjs' }).filename,
    ).toBe('remoteEntry.mjs');
  });

  it('should default filename', () => {
    expect(withFederation({ name: 'x' }).filename).toBe('remoteEntry.js');
  });

  it('should normalize shared', () => {
    const r = withFederation({
      name: 'x',
      shared: { react: { singleton: true } },
    });
    expect(r.shared.react.singleton).toBe(true);
  });

  it('should default name to empty string', () => {
    expect(withFederation({}).name).toBe('');
  });

  it('should default exposes and remotes', () => {
    const r = withFederation({ name: 'x' });
    expect(r.exposes).toEqual({});
    expect(r.remotes).toEqual({});
  });

  // --- NEW: pass-through fields ---
  it('should pass through shareScope', () => {
    const r = withFederation({ name: 'x', shareScope: 'myScope' });
    expect(r.shareScope).toBe('myScope');
  });

  it('should pass through shareStrategy', () => {
    const r = withFederation({ name: 'x', shareStrategy: 'loaded-first' });
    expect(r.shareStrategy).toBe('loaded-first');
  });

  it('should pass through runtimePlugins', () => {
    const r = withFederation({
      name: 'x',
      runtimePlugins: ['./a.js', './b.js'],
    });
    expect(r.runtimePlugins).toEqual(['./a.js', './b.js']);
  });

  it('should pass through publicPath', () => {
    const r = withFederation({ name: 'x', publicPath: 'https://cdn.com/' });
    expect(r.publicPath).toBe('https://cdn.com/');
  });

  it('should normalize remote config objects', () => {
    const r = withFederation({
      name: 'x',
      remotes: {
        mfe1: {
          external: 'http://localhost:3001/remoteEntry.js',
          shareScope: 'isolated',
        },
      },
    });
    expect(r.remotes.mfe1).toBeDefined();
    expect(r.remotes.mfe1.entry).toBe('http://localhost:3001/remoteEntry.js');
    expect(r.remotes.mfe1.shareScope).toBe('isolated');
  });

  it('should pass through shared import:false', () => {
    const r = withFederation({
      name: 'x',
      shared: { react: { singleton: true, import: false } },
    });
    expect(r.shared.react.import).toBe(false);
  });

  it('should pass through shared shareKey', () => {
    const r = withFederation({
      name: 'x',
      shared: { react: { singleton: true, shareKey: 'my-react' } },
    });
    expect(r.shared.react.shareKey).toBe('my-react');
  });

  it('should pass through shared shareScope', () => {
    const r = withFederation({
      name: 'x',
      shared: { react: { singleton: true, shareScope: 'react-scope' } },
    });
    expect(r.shared.react.shareScope).toBe('react-scope');
  });

  it('should pass through shared packageName', () => {
    const r = withFederation({
      name: 'x',
      shared: { react: { singleton: true, packageName: 'react-pkg' } },
    });
    expect(r.shared.react.packageName).toBe('react-pkg');
  });
});

// =============================================================================
// Edge cases
// =============================================================================

describe('edge cases', () => {
  describe('scoped packages', () => {
    it('should handle scoped package', async () => {
      const code = await generateSharedProxyCode(
        '@emotion/react',
        '@emotion/react',
        { singleton: true, strictVersion: false, requiredVersion: '^11.0.0' },
      );
      expect(code).toContain('loadShare("@emotion/react")');
    });

    it('should handle scoped subpath', async () => {
      const code = await generateSharedProxyCode(
        '@emotion/react/jsx-runtime',
        '@emotion/react',
        { singleton: true, strictVersion: false, requiredVersion: '^11.0.0' },
      );
      expect(code).toContain('loadShare("@emotion/react/jsx-runtime")');
    });
  });

  describe('multiple remotes', () => {
    it('should include all remotes', () => {
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
    });
  });

  describe('multiple shared deps', () => {
    it('should include all shared', () => {
      const code = generateContainerEntryCode({
        name: 'mfe1',
        filename: 'remoteEntry.js',
        exposes: { './C': './src/C' },
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

  describe('empty configs', () => {
    it('should handle empty shared', () => {
      const code = generateRuntimeInitCode({ name: 'test', shared: {} });
      expect(code).toContain('shared: {');
    });

    it('should handle empty remotes', () => {
      const code = generateRuntimeInitCode({ name: 'test', remotes: {} });
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

  describe('special characters', () => {
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
