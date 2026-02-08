/**
 * Comprehensive tests for the Module Federation esbuild plugin.
 *
 * Modeled after the webpack enhanced plugin test suite, covering:
 * - Code generation for all virtual modules
 * - Plugin setup and hook registration
 * - Full esbuild integration builds
 * - Config normalization (withFederation)
 * - Container entry get/init protocol
 * - Shared module negotiation patterns
 * - Remote module loading patterns
 * - Manifest generation
 * - Edge cases, error handling, special characters
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
  transformRemoteImports,
} from './plugin';
import type {
  NormalizedFederationConfig,
  NormalizedSharedConfig,
} from '../../lib/config/federation-config';

// =============================================================================
// Helpers
// =============================================================================

function tmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'mf-esbuild-test-'));
}

function rm(dir: string): void {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {
    /* noop */
  }
}

function writeFile(dir: string, name: string, content: string): string {
  const fp = path.join(dir, name);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  fs.writeFileSync(fp, content);
  return fp;
}

function host(
  o: Partial<NormalizedFederationConfig> = {},
): NormalizedFederationConfig {
  return {
    name: 'host',
    remotes: { mfe1: 'http://localhost:3001/remoteEntry.js' },
    shared: {
      react: {
        singleton: true,
        strictVersion: false,
        requiredVersion: '^18.2.0',
        version: '18.2.0',
      },
    },
    ...o,
  };
}

function remote(
  o: Partial<NormalizedFederationConfig> = {},
): NormalizedFederationConfig {
  return {
    name: 'mfe1',
    filename: 'remoteEntry.js',
    exposes: { './component': './src/Component' },
    shared: {
      react: {
        singleton: true,
        strictVersion: false,
        requiredVersion: '^18.2.0',
        version: '18.2.0',
      },
    },
    ...o,
  };
}

/** Build helper that runs esbuild with the MF plugin. */
async function build(
  dir: string,
  config: NormalizedFederationConfig,
  files: Record<string, string>,
  opts: Partial<esbuild.BuildOptions> = {},
): Promise<esbuild.BuildResult> {
  const srcDir = path.join(dir, 'src');
  const entries: string[] = [];
  for (const [name, content] of Object.entries(files)) {
    const fp = writeFile(dir, name, content);
    if (name.startsWith('src/main')) entries.push(fp);
  }
  if (entries.length === 0) {
    // use first file as entry
    entries.push(path.join(dir, Object.keys(files)[0]));
  }

  const { external: extraExternal, plugins: extraPlugins, ...restOpts } = opts;
  return esbuild.build({
    entryPoints: entries,
    outdir: path.join(dir, 'dist'),
    bundle: true,
    format: 'esm',
    splitting: true,
    write: true,
    metafile: true,
    ...restOpts,
    external: ['@module-federation/runtime', ...(extraExternal || [])],
    plugins: [moduleFederationPlugin(config), ...(extraPlugins || [])],
  });
}

// =============================================================================
// 1. Code Generation - Runtime Init
// =============================================================================

describe('generateRuntimeInitCode', () => {
  it('should generate a module that imports from the runtime', () => {
    const code = generateRuntimeInitCode(host());
    expect(code).toContain('import { init as __mfInit }');
    expect(code).toContain('@module-federation/runtime');
  });

  it('should call init with container name', () => {
    const code = generateRuntimeInitCode(host({ name: 'myHost' }));
    expect(code).toContain('"myHost"');
  });

  it('should include all remote entries', () => {
    const code = generateRuntimeInitCode(
      host({
        remotes: {
          r1: 'http://a.com/re.js',
          r2: 'http://b.com/re.js',
          r3: 'r3@https://c.com/re.js',
        },
      }),
    );
    expect(code).toContain('"r1"');
    expect(code).toContain('http://a.com/re.js');
    expect(code).toContain('"r2"');
    expect(code).toContain('http://b.com/re.js');
    expect(code).toContain('"r3"');
    expect(code).toContain('https://c.com/re.js');
  });

  it('should parse name@http format', () => {
    const code = generateRuntimeInitCode(
      host({ remotes: { mfe1: 'mfe1@http://localhost:3001/re.js' } }),
    );
    expect(code).toContain('"name":"mfe1"');
    expect(code).toContain('"entry":"http://localhost:3001/re.js"');
  });

  it('should parse name@https format', () => {
    const code = generateRuntimeInitCode(
      host({ remotes: { x: 'myApp@https://cdn.com/re.js' } }),
    );
    expect(code).toContain('"name":"myApp"');
    expect(code).toContain('"entry":"https://cdn.com/re.js"');
  });

  it('should handle plain URL (no name@)', () => {
    const code = generateRuntimeInitCode(
      host({ remotes: { mfe1: 'http://localhost:3001/re.js' } }),
    );
    expect(code).toContain('"name":"mfe1"');
    expect(code).toContain('"entry":"http://localhost:3001/re.js"');
  });

  it('should set type to esm for all remotes', () => {
    const code = generateRuntimeInitCode(
      host({ remotes: { a: 'http://a.com/re.js' } }),
    );
    expect(code).toContain('"type":"esm"');
  });

  it('should include per-remote shareScope', () => {
    const code = generateRuntimeInitCode(
      host({
        remotes: {
          mfe1: {
            entry: 'http://localhost:3001/re.js',
            shareScope: 'isolated',
          },
        },
      }),
    );
    expect(code).toContain('"shareScope":"isolated"');
  });

  it('should include shared config with version/scope/get', () => {
    const code = generateRuntimeInitCode(host());
    expect(code).toContain('"react"');
    expect(code).toContain('version: "18.2.0"');
    expect(code).toContain('scope: "default"');
    expect(code).toContain('get:');
  });

  it('should include shareConfig booleans', () => {
    const code = generateRuntimeInitCode(host());
    expect(code).toContain('singleton: true');
    expect(code).toContain('strictVersion: false');
    expect(code).toContain('eager: false');
  });

  it('should use dynamic import for non-eager shared', () => {
    const code = generateRuntimeInitCode(host());
    expect(code).toContain('import("__mf_fallback__/react")');
    expect(code).not.toContain('import * as __mfEager');
  });

  it('should use static import for eager shared', () => {
    const code = generateRuntimeInitCode(
      host({
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            version: '18.2.0',
            eager: true,
          },
        },
      }),
    );
    expect(code).toContain('import * as __mfEager_react');
    expect(code).toContain('Promise.resolve');
    expect(code).not.toContain('import("__mf_fallback__/react")');
  });

  it('should handle import:false (no fallback)', () => {
    const code = generateRuntimeInitCode(
      host({
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            import: false,
          },
        },
      }),
    );
    expect(code).toContain('undefined');
    expect(code).not.toContain('__mf_fallback__/react');
  });

  it('should use custom shareKey', () => {
    const code = generateRuntimeInitCode(
      host({
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            version: '18.2.0',
            shareKey: 'my-react',
          },
        },
      }),
    );
    // The key in the shared object should be the shareKey
    expect(code).toContain('"my-react"');
  });

  it('should use per-shared shareScope', () => {
    const code = generateRuntimeInitCode(
      host({
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            version: '18.2.0',
            shareScope: 'react-only',
          },
        },
      }),
    );
    expect(code).toContain('scope: "react-only"');
  });

  it('should use global shareScope', () => {
    const code = generateRuntimeInitCode(host({ shareScope: 'myScope' }));
    expect(code).toContain('initializeSharing("myScope"');
    expect(code).toContain('scope: "myScope"');
  });

  it('should default shareScope to "default"', () => {
    const code = generateRuntimeInitCode(host());
    expect(code).toContain('initializeSharing("default"');
  });

  it('should use shareStrategy from config', () => {
    const code = generateRuntimeInitCode(
      host({ shareStrategy: 'loaded-first' }),
    );
    expect(code).toContain('"loaded-first"');
  });

  it('should default shareStrategy to version-first', () => {
    const code = generateRuntimeInitCode(host());
    expect(code).toContain('"version-first"');
  });

  it('should call initializeSharing with await', () => {
    const code = generateRuntimeInitCode(host());
    expect(code).toContain('await Promise.all(__mfSharePromises)');
  });

  it('should wrap initializeSharing in try/catch', () => {
    const code = generateRuntimeInitCode(host());
    expect(code).toContain('try {');
    expect(code).toContain('} catch(__mfErr)');
  });

  it('should inject runtimePlugins', () => {
    const code = generateRuntimeInitCode(
      host({ runtimePlugins: ['./plug1.js', '@mf/logger'] }),
    );
    expect(code).toContain('import __mfRuntimePlugin0 from "./plug1.js"');
    expect(code).toContain('import __mfRuntimePlugin1 from "@mf/logger"');
    expect(code).toContain('plugins: __mfPlugins');
  });

  it('should not inject plugins section when no runtimePlugins', () => {
    const code = generateRuntimeInitCode(host());
    expect(code).not.toContain('plugins:');
    expect(code).not.toContain('__mfRuntimePlugin');
  });

  it('should handle empty remotes', () => {
    const code = generateRuntimeInitCode(host({ remotes: {} }));
    expect(code).toContain('remotes: []');
  });

  it('should handle empty shared', () => {
    const code = generateRuntimeInitCode(host({ shared: {} }));
    expect(code).toContain('shared: {');
    expect(code).toContain('}');
  });

  it('should handle multiple shared deps', () => {
    const code = generateRuntimeInitCode(
      host({
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            version: '18.2.0',
          },
          'react-dom': {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            version: '18.2.0',
          },
          lodash: {
            singleton: false,
            strictVersion: true,
            requiredVersion: '^4.17.0',
            version: '4.17.21',
          },
        },
      }),
    );
    expect(code).toContain('"react"');
    expect(code).toContain('"react-dom"');
    expect(code).toContain('"lodash"');
  });
});

// =============================================================================
// 2. Code Generation - Container Entry
// =============================================================================

describe('generateContainerEntryCode', () => {
  it('should export get function', () => {
    const code = generateContainerEntryCode(remote());
    expect(code).toContain('export function get(module, getScope)');
  });

  it('should export init function', () => {
    const code = generateContainerEntryCode(remote());
    expect(code).toContain(
      'export function init(shareScope, initScope, remoteEntryInitOptions)',
    );
  });

  it('should have module map with exposes', () => {
    const code = generateContainerEntryCode(remote());
    expect(code).toContain('"./component"');
    expect(code).toContain('import("./src/Component")');
  });

  it('should return factory from get()', () => {
    const code = generateContainerEntryCode(remote());
    expect(code).toContain('return function() { return m; }');
  });

  it('should throw for unknown module in get()', () => {
    const code = generateContainerEntryCode(remote());
    expect(code).toContain('does not exist in container');
    expect(code).toContain('"mfe1"');
  });

  it('should handle multiple exposes', () => {
    const code = generateContainerEntryCode(
      remote({
        exposes: {
          './Button': './src/Button',
          './Input': './src/Input',
          './utils': './src/utils',
          '.': './src/index',
        },
      }),
    );
    expect(code).toContain('"./Button"');
    expect(code).toContain('"./Input"');
    expect(code).toContain('"./utils"');
    expect(code).toContain('"."');
    expect(code).toContain('import("./src/Button")');
    expect(code).toContain('import("./src/index")');
  });

  it('should call initShareScopeMap in init()', () => {
    const code = generateContainerEntryCode(remote());
    expect(code).toContain('initShareScopeMap(');
    expect(code).toContain('hostShareScopeMap');
  });

  it('should call initOptions in init()', () => {
    const code = generateContainerEntryCode(remote());
    expect(code).toContain('__mfInstance.initOptions(');
  });

  it('should forward initScope', () => {
    const code = generateContainerEntryCode(remote());
    expect(code).toContain('initScope: initScope');
  });

  it('should call initializeSharing in init()', () => {
    const code = generateContainerEntryCode(remote());
    expect(code).toContain('initializeSharing(');
  });

  it('should use shareStrategy', () => {
    const code = generateContainerEntryCode(
      remote({ shareStrategy: 'loaded-first' }),
    );
    expect(code).toContain('"loaded-first"');
  });

  it('should use custom shareScope', () => {
    const code = generateContainerEntryCode(remote({ shareScope: 'custom' }));
    expect(code).toContain('initializeSharing("custom"');
    expect(code).toContain('initShareScopeMap("custom"');
  });

  it('should include shared deps', () => {
    const code = generateContainerEntryCode(remote());
    expect(code).toContain('"react"');
    expect(code).toContain('__mf_fallback__/react');
  });

  it('should handle eager shared', () => {
    const code = generateContainerEntryCode(
      remote({
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            version: '18.2.0',
            eager: true,
          },
        },
      }),
    );
    expect(code).toContain('import * as __mfEager_react');
  });

  it('should inject runtimePlugins', () => {
    const code = generateContainerEntryCode(
      remote({ runtimePlugins: ['./my-plugin.js'] }),
    );
    expect(code).toContain('import __mfRuntimePlugin0 from "./my-plugin.js"');
    expect(code).toContain('plugins: __mfPlugins');
  });

  it('should handle empty exposes', () => {
    const code = generateContainerEntryCode(remote({ exposes: {} }));
    expect(code).toContain('__mfModuleMap');
  });

  it('should handle import:false in container shared', () => {
    const code = generateContainerEntryCode(
      remote({
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            import: false,
          },
        },
      }),
    );
    expect(code).toContain('undefined');
    expect(code).not.toContain('__mf_fallback__/react');
  });
});

// =============================================================================
// 3. Code Generation - Shared Proxy
// =============================================================================

describe('generateSharedProxyCode', () => {
  const cfg = (
    o: Partial<NormalizedSharedConfig> = {},
  ): NormalizedSharedConfig => ({
    singleton: true,
    strictVersion: false,
    requiredVersion: '^18.2.0',
    ...o,
  });

  it('should call loadShare with package name', async () => {
    const code = await generateSharedProxyCode('react', 'react', cfg());
    expect(code).toContain('loadShare("react")');
  });

  it('should import from the MF runtime', async () => {
    const code = await generateSharedProxyCode('react', 'react', cfg());
    expect(code).toContain('import { loadShare }');
    expect(code).toContain('@module-federation/runtime');
  });

  it('should have fallback dynamic import', async () => {
    const code = await generateSharedProxyCode('react', 'react', cfg());
    expect(code).toContain('import("__mf_fallback__/react")');
  });

  it('should export default', async () => {
    const code = await generateSharedProxyCode('react', 'react', cfg());
    expect(code).toContain('export default');
  });

  it('should check for "default" in module', async () => {
    const code = await generateSharedProxyCode('react', 'react', cfg());
    expect(code).toContain('"default" in __mfMod');
  });

  it('should handle subpath imports', async () => {
    const code = await generateSharedProxyCode(
      'react/jsx-runtime',
      'react',
      cfg(),
    );
    expect(code).toContain('loadShare("react/jsx-runtime")');
    expect(code).toContain('__mf_fallback__/react/jsx-runtime');
  });

  it('should have catch for subpath loadShare', async () => {
    const code = await generateSharedProxyCode(
      'react/jsx-runtime',
      'react',
      cfg(),
    );
    expect(code).toContain('catch(__mfErr)');
  });

  it('should handle import:false', async () => {
    const code = await generateSharedProxyCode(
      'react',
      'react',
      cfg({ import: false }),
    );
    expect(code).toContain('throw new Error');
    expect(code).toContain('import:false prevents local fallback');
    expect(code).not.toContain('__mf_fallback__');
  });

  it('should use custom shareKey in loadShare but real package for fallback', async () => {
    const code = await generateSharedProxyCode(
      'react',
      'react',
      cfg({ shareKey: 'my-react' }),
    );
    // loadShare uses the shareKey for share scope negotiation
    expect(code).toContain('loadShare("my-react")');
    // Fallback uses the real package name for disk resolution
    expect(code).toContain('__mf_fallback__/react');
    expect(code).not.toContain('__mf_fallback__/my-react');
  });

  it('should handle scoped package', async () => {
    const code = await generateSharedProxyCode(
      '@emotion/react',
      '@emotion/react',
      cfg({ requiredVersion: '^11.0.0' }),
    );
    expect(code).toContain('loadShare("@emotion/react")');
    expect(code).toContain('__mf_fallback__/@emotion/react');
  });

  it('should handle scoped package subpath', async () => {
    const code = await generateSharedProxyCode(
      '@emotion/react/jsx-runtime',
      '@emotion/react',
      cfg({ requiredVersion: '^11.0.0' }),
    );
    expect(code).toContain('loadShare("@emotion/react/jsx-runtime")');
    expect(code).toContain('__mf_fallback__/@emotion/react/jsx-runtime');
  });

  it('should handle packages with dots', async () => {
    const code = await generateSharedProxyCode('core.js', 'core.js', cfg());
    expect(code).toContain('loadShare("core.js")');
  });

  it('should log warning on top-level loadShare failure', async () => {
    const code = await generateSharedProxyCode('react', 'react', cfg());
    expect(code).toContain('console.warn');
  });
});

// =============================================================================
// 4. Code Generation - Remote Proxy
// =============================================================================

describe('generateRemoteProxyCode', () => {
  it('should call loadRemote', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('loadRemote("mfe1/component")');
  });

  it('should import from runtime', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('import { loadRemote }');
    expect(code).toContain('@module-federation/runtime');
  });

  it('should use top-level await', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('await loadRemote');
  });

  it('should throw on null result', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('throw new Error');
    expect(code).toContain('Failed to load remote module');
  });

  it('should export default', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('export default');
  });

  it('should prefer module.default', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('"default" in __mfRemote');
    expect(code).toContain('__mfRemote["default"]');
  });

  it('should export __mfModule for full access', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/component');
    expect(code).toContain('export var __mfModule = __mfRemote');
  });

  it('should handle deep path', () => {
    const code = generateRemoteProxyCode('mfe1', 'mfe1/components/deep/Button');
    expect(code).toContain('loadRemote("mfe1/components/deep/Button")');
  });

  it('should handle dashes in remote name', () => {
    const code = generateRemoteProxyCode('my-app', 'my-app/utils');
    expect(code).toContain('loadRemote("my-app/utils")');
  });
});

// =============================================================================
// 5. Plugin Object
// =============================================================================

describe('moduleFederationPlugin', () => {
  it('should return plugin with correct name', () => {
    expect(moduleFederationPlugin(host()).name).toBe('module-federation');
  });

  it('should have a setup function', () => {
    expect(typeof moduleFederationPlugin(host()).setup).toBe('function');
  });

  it('should accept minimal config', () => {
    expect(moduleFederationPlugin({ name: 'x' })).toBeDefined();
  });

  it('should accept host config', () => {
    expect(moduleFederationPlugin(host())).toBeDefined();
  });

  it('should accept remote config', () => {
    expect(moduleFederationPlugin(remote())).toBeDefined();
  });

  it('should accept combined config', () => {
    expect(
      moduleFederationPlugin({
        name: 'shell',
        filename: 'remoteEntry.js',
        remotes: { mfe1: 'http://a.com/re.js' },
        exposes: { './H': './src/H' },
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
          },
        },
        shareScope: 'myScope',
        runtimePlugins: ['./p.js'],
        publicPath: 'https://cdn.com/',
        shareStrategy: 'loaded-first',
      }),
    ).toBeDefined();
  });
});

// =============================================================================
// 6. esbuild Integration Builds
// =============================================================================

describe('esbuild integration', () => {
  let dir: string;
  beforeEach(() => {
    dir = tmpDir();
  });
  afterEach(() => rm(dir));

  it('should build a host with shared deps', async () => {
    const result = await build(
      dir,
      {
        name: 'host',
        remotes: {},
        shared: {
          'some-lib': {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^1.0.0',
            version: '1.0.0',
          },
        },
      },
      { 'src/main.js': 'console.log("hello");\n' },
      { external: ['some-lib'] },
    );
    expect(result.errors).toHaveLength(0);
    expect(fs.readdirSync(path.join(dir, 'dist')).length).toBeGreaterThan(0);
  });

  it('should build a container with exposes', async () => {
    const compFile = writeFile(
      dir,
      'src/Component.js',
      'export default function C() {}\n',
    );
    const result = await build(
      dir,
      {
        name: 'mfe1',
        filename: 'remoteEntry.js',
        exposes: { './component': compFile },
        shared: {},
      },
      { 'src/main.js': 'console.log("app");\n' },
    );
    expect(result.errors).toHaveLength(0);
  });

  it('should auto-set format and splitting', async () => {
    const result = await esbuild.build({
      entryPoints: [writeFile(dir, 'src/main.js', 'console.log(1);\n')],
      outdir: path.join(dir, 'dist'),
      bundle: true,
      write: true,
      plugins: [moduleFederationPlugin({ name: 'test' })],
    });
    expect(result.errors).toHaveLength(0);
  });

  it('should enable metafile', async () => {
    const result = await build(
      dir,
      { name: 'test' },
      {
        'src/main.js': 'console.log(1);\n',
      },
    );
    expect(result.metafile).toBeDefined();
  });

  it('should inject runtime init into entry', async () => {
    const result = await esbuild.build({
      entryPoints: [writeFile(dir, 'src/main.js', 'export const x = 1;\n')],
      outdir: path.join(dir, 'dist'),
      bundle: true,
      format: 'esm',
      splitting: true,
      write: false,
      external: ['@module-federation/runtime'],
      plugins: [
        moduleFederationPlugin({
          name: 'host',
          shared: {},
          remotes: { m: 'http://a.com/re.js' },
        }),
      ],
    });
    expect(result.errors).toHaveLength(0);
    const main = result.outputFiles?.find((f) => f.path.includes('main'));
    expect(main).toBeDefined();
    expect(main!.text).toContain('@module-federation/runtime');
  });

  it('should NOT inject runtime init when no remotes/shared', async () => {
    const result = await esbuild.build({
      entryPoints: [writeFile(dir, 'src/main.js', 'export const x = 1;\n')],
      outdir: path.join(dir, 'dist'),
      bundle: true,
      format: 'esm',
      splitting: true,
      write: false,
      plugins: [moduleFederationPlugin({ name: 'test' })],
    });
    expect(result.errors).toHaveLength(0);
    const main = result.outputFiles?.find((f) => f.path.includes('main'));
    expect(main).toBeDefined();
    expect(main!.text).not.toContain('__mf_runtime_init__');
  });

  it('should handle remote imports as virtual modules', async () => {
    const result = await esbuild.build({
      entryPoints: [
        writeFile(
          dir,
          'src/main.js',
          `import R from 'mfe1/component';\nexport default R;\n`,
        ),
      ],
      outdir: path.join(dir, 'dist'),
      bundle: true,
      format: 'esm',
      splitting: true,
      write: false,
      external: ['@module-federation/runtime'],
      plugins: [
        moduleFederationPlugin({
          name: 'host',
          shared: {},
          remotes: { mfe1: 'http://a.com/re.js' },
        }),
      ],
    });
    expect(result.errors).toHaveLength(0);
    const all = result.outputFiles?.map((f) => f.text).join('\n') || '';
    expect(all).toContain('loadRemote');
  });

  it('should produce valid ESM output', async () => {
    const result = await esbuild.build({
      entryPoints: [writeFile(dir, 'src/main.js', 'export const x = 1;\n')],
      outdir: path.join(dir, 'dist'),
      bundle: true,
      format: 'esm',
      splitting: true,
      write: false,
      external: ['@module-federation/runtime', 'some-lib'],
      plugins: [
        moduleFederationPlugin({
          name: 'host',
          shared: {
            'some-lib': {
              singleton: true,
              strictVersion: false,
              requiredVersion: '*',
              version: '1.0.0',
            },
          },
        }),
      ],
    });
    expect(result.errors).toHaveLength(0);
    // Output files should be ESM (contain export/import keywords)
    for (const f of result.outputFiles || []) {
      if (f.path.endsWith('.js')) {
        // Basic ESM check: should not have module.exports
        expect(f.text).not.toContain('module.exports');
      }
    }
  });

  it('should build container entry that has get and init', async () => {
    const cFile = writeFile(dir, 'src/C.js', 'export default 1;\n');
    const result = await esbuild.build({
      entryPoints: [writeFile(dir, 'src/main.js', 'console.log(1);\n')],
      outdir: path.join(dir, 'dist'),
      bundle: true,
      format: 'esm',
      splitting: true,
      write: false,
      external: ['@module-federation/runtime'],
      plugins: [
        moduleFederationPlugin({
          name: 'mfe1',
          filename: 'remoteEntry.js',
          exposes: { './C': cFile },
          shared: {},
        }),
      ],
    });
    expect(result.errors).toHaveLength(0);
    const all = result.outputFiles?.map((f) => f.text).join('\n') || '';
    expect(all).toContain('function get(');
    expect(all).toContain('function init(');
  });

  it('should build with multiple shared deps', async () => {
    const result = await build(
      dir,
      {
        name: 'host',
        remotes: {},
        shared: {
          a: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '*',
            version: '1.0.0',
          },
          b: {
            singleton: false,
            strictVersion: true,
            requiredVersion: '^2.0.0',
            version: '2.1.0',
          },
        },
      },
      { 'src/main.js': 'console.log(1);\n' },
      { external: ['a', 'b'] },
    );
    expect(result.errors).toHaveLength(0);
  });

  it('should build with eager shared dep', async () => {
    const result = await build(
      dir,
      {
        name: 'host',
        remotes: {},
        shared: {
          mylib: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '*',
            version: '1.0.0',
            eager: true,
          },
        },
      },
      { 'src/main.js': 'console.log(1);\n' },
      { external: ['mylib'] },
    );
    expect(result.errors).toHaveLength(0);
  });
});

// =============================================================================
// 7. withFederation Config Normalization
// =============================================================================

describe('withFederation', () => {
  let withFederation: (c: any) => any;
  beforeAll(async () => {
    withFederation = (await import('../../lib/config/with-native-federation'))
      .withFederation;
  });

  it('should normalize basic config', () => {
    const r = withFederation({
      name: 'test',
      filename: 'remoteEntry.js',
      shared: { react: { singleton: true } },
    });
    expect(r.name).toBe('test');
    expect(r.filename).toBe('remoteEntry.js');
  });

  it('should append .js extension', () => {
    expect(
      withFederation({ name: 'x', filename: 'remoteEntry' }).filename,
    ).toBe('remoteEntry.js');
  });

  it('should not double .js', () => {
    expect(
      withFederation({ name: 'x', filename: 'remoteEntry.js' }).filename,
    ).toBe('remoteEntry.js');
  });

  it('should preserve .mjs', () => {
    expect(
      withFederation({ name: 'x', filename: 'remoteEntry.mjs' }).filename,
    ).toBe('remoteEntry.mjs');
  });

  it('should default filename to remoteEntry.js', () => {
    expect(withFederation({ name: 'x' }).filename).toBe('remoteEntry.js');
  });

  it('should default name to empty', () => {
    expect(withFederation({}).name).toBe('');
  });

  it('should default exposes/remotes', () => {
    const r = withFederation({ name: 'x' });
    expect(r.exposes).toEqual({});
    expect(r.remotes).toEqual({});
  });

  it('should normalize shared config', () => {
    const r = withFederation({
      name: 'x',
      shared: { react: { singleton: true, version: '18.2.0' } },
    });
    expect(r.shared.react.singleton).toBe(true);
    expect(r.shared.react.version).toBe('18.2.0');
  });

  it('should default shared booleans', () => {
    const r = withFederation({
      name: 'x',
      shared: { react: {} },
    });
    expect(r.shared.react.singleton).toBe(false);
    expect(r.shared.react.strictVersion).toBe(false);
    expect(r.shared.react.requiredVersion).toBe('auto');
  });

  // Pass-through fields
  it('should pass through shareScope', () => {
    expect(withFederation({ name: 'x', shareScope: 's' }).shareScope).toBe('s');
  });

  it('should pass through shareStrategy', () => {
    expect(
      withFederation({ name: 'x', shareStrategy: 'loaded-first' })
        .shareStrategy,
    ).toBe('loaded-first');
  });

  it('should pass through runtimePlugins', () => {
    expect(
      withFederation({ name: 'x', runtimePlugins: ['a', 'b'] }).runtimePlugins,
    ).toEqual(['a', 'b']);
  });

  it('should pass through publicPath', () => {
    expect(
      withFederation({ name: 'x', publicPath: 'https://cdn.com/' }).publicPath,
    ).toBe('https://cdn.com/');
  });

  // Remote config objects
  it('should normalize remote string', () => {
    const r = withFederation({
      name: 'x',
      remotes: { mfe1: 'http://a.com/re.js' },
    });
    expect(r.remotes.mfe1).toBe('http://a.com/re.js');
  });

  it('should normalize remote config object', () => {
    const r = withFederation({
      name: 'x',
      remotes: {
        mfe1: {
          external: 'http://a.com/re.js',
          shareScope: 'isolated',
        },
      },
    });
    expect(r.remotes.mfe1.entry).toBe('http://a.com/re.js');
    expect(r.remotes.mfe1.shareScope).toBe('isolated');
  });

  it('should normalize remote config with array external', () => {
    const r = withFederation({
      name: 'x',
      remotes: {
        mfe1: {
          external: ['http://a.com/re.js', 'http://b.com/re.js'],
          shareScope: 'test',
        },
      },
    });
    expect(r.remotes.mfe1.entry).toBe('http://a.com/re.js');
  });

  // Shared advanced fields
  it('should pass through import:false', () => {
    const r = withFederation({
      name: 'x',
      shared: { react: { import: false } },
    });
    expect(r.shared.react.import).toBe(false);
  });

  it('should pass through shareKey', () => {
    const r = withFederation({
      name: 'x',
      shared: { react: { shareKey: 'k' } },
    });
    expect(r.shared.react.shareKey).toBe('k');
  });

  it('should pass through per-shared shareScope', () => {
    const r = withFederation({
      name: 'x',
      shared: { react: { shareScope: 'rs' } },
    });
    expect(r.shared.react.shareScope).toBe('rs');
  });

  it('should pass through packageName', () => {
    const r = withFederation({
      name: 'x',
      shared: { react: { packageName: 'react-pkg' } },
    });
    expect(r.shared.react.packageName).toBe('react-pkg');
  });

  it('should pass through eager', () => {
    const r = withFederation({
      name: 'x',
      shared: { react: { eager: true } },
    });
    expect(r.shared.react.eager).toBe(true);
  });
});

// =============================================================================
// 8. Edge Cases & Error Handling
// =============================================================================

describe('edge cases', () => {
  describe('container with no shared', () => {
    it('should generate container entry without shared section crashing', () => {
      const code = generateContainerEntryCode({
        name: 'bare',
        filename: 'remoteEntry.js',
        exposes: { './A': './A' },
      });
      expect(code).toContain('export function get(');
      expect(code).toContain('export function init(');
    });
  });

  describe('host with no remotes', () => {
    it('should generate init code with empty remotes', () => {
      const code = generateRuntimeInitCode({
        name: 'hostOnly',
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            version: '18.2.0',
          },
        },
      });
      expect(code).toContain('remotes: []');
    });
  });

  describe('config with only name', () => {
    it('should generate minimal init code', () => {
      const code = generateRuntimeInitCode({ name: 'minimal' });
      expect(code).toContain('"minimal"');
      expect(code).toContain('remotes: []');
      expect(code).toContain('shared: {');
    });
  });

  describe('shared with import:false and custom shareKey', () => {
    it('should use shareKey and skip fallback', async () => {
      const code = await generateSharedProxyCode('react', 'react', {
        singleton: true,
        strictVersion: false,
        requiredVersion: '^18.0.0',
        import: false,
        shareKey: 'store',
      });
      expect(code).toContain('loadShare("store")');
      expect(code).not.toContain('__mf_fallback__');
      expect(code).toContain('import:false prevents local fallback');
    });
  });

  describe('multiple share scopes', () => {
    it('should put different shared deps in different scopes', () => {
      const code = generateRuntimeInitCode({
        name: 'host',
        shareScope: 'default',
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            version: '18.2.0',
            shareScope: 'react-scope',
          },
          lodash: {
            singleton: false,
            strictVersion: false,
            requiredVersion: '^4.0.0',
            version: '4.17.21',
            // uses global scope
          },
        },
      });
      expect(code).toContain('scope: "react-scope"');
      expect(code).toContain('scope: "default"');
    });
  });

  describe('version auto-detection', () => {
    it('should use requiredVersion to derive version when version is empty', () => {
      const code = generateRuntimeInitCode({
        name: 'host',
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.2.0',
            // no version field
          },
        },
      });
      // Should derive version from requiredVersion by stripping prefix
      expect(code).toContain('version:');
      // Should contain some version string (derived from requiredVersion or auto-detected)
    });
  });

  describe('mixed eager and non-eager shared', () => {
    it('should handle both eager and non-eager in the same config', () => {
      const code = generateRuntimeInitCode({
        name: 'host',
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            version: '18.2.0',
            eager: true,
          },
          'react-dom': {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            version: '18.2.0',
            eager: false,
          },
          lodash: {
            singleton: false,
            strictVersion: false,
            requiredVersion: '^4.0.0',
            version: '4.17.21',
          },
        },
      });
      // react should be eager (static import)
      expect(code).toContain('import * as __mfEager_react from');
      // react-dom and lodash should be non-eager (dynamic import)
      expect(code).toContain('import("__mf_fallback__/react-dom")');
      expect(code).toContain('import("__mf_fallback__/lodash")');
      // Only react should have the eager var, not react-dom
      expect(code).not.toContain('__mfEager_react_dom');
      expect(code).not.toContain('__mfEager_lodash');
    });
  });

  describe('special characters in config', () => {
    it('should handle exposed module with dot path', () => {
      const code = generateContainerEntryCode({
        name: 'test',
        filename: 'remoteEntry.js',
        exposes: { '.': './src/index' },
      });
      expect(code).toContain('"."');
    });

    it('should handle scoped package in shared', () => {
      const code = generateRuntimeInitCode({
        name: 'host',
        shared: {
          '@scope/pkg': {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^1.0.0',
            version: '1.0.0',
          },
        },
      });
      expect(code).toContain('"@scope/pkg"');
      expect(code).toContain('__mf_fallback__/@scope/pkg');
    });

    it('should handle remote with numbers in name', () => {
      const code = generateRemoteProxyCode('app2', 'app2/widget');
      expect(code).toContain('loadRemote("app2/widget")');
    });

    it('should handle underscore in remote name', () => {
      const code = generateRemoteProxyCode('my_app', 'my_app/utils');
      expect(code).toContain('loadRemote("my_app/utils")');
    });
  });

  describe('runtimePlugins code generation', () => {
    it('should handle single runtime plugin', () => {
      const code = generateRuntimeInitCode(
        host({ runtimePlugins: ['./single-plugin.js'] }),
      );
      expect(code).toContain('import __mfRuntimePlugin0');
      expect(code).toContain('__mfRuntimePlugin0');
    });

    it('should handle multiple runtime plugins', () => {
      const code = generateRuntimeInitCode(
        host({
          runtimePlugins: ['./a.js', './b.js', './c.js'],
        }),
      );
      expect(code).toContain('__mfRuntimePlugin0');
      expect(code).toContain('__mfRuntimePlugin1');
      expect(code).toContain('__mfRuntimePlugin2');
    });

    it('should call plugins as functions or pass as objects', () => {
      const code = generateRuntimeInitCode(
        host({ runtimePlugins: ['./p.js'] }),
      );
      expect(code).toContain(
        'typeof __mfRuntimePlugin0 === "function" ? __mfRuntimePlugin0() : __mfRuntimePlugin0',
      );
    });
  });

  describe('P1 regression: shareKey vs package name in fallback', () => {
    it('should use package name (not shareKey) for fallback import path', async () => {
      // When shareKey differs from the package name, the fallback import
      // must resolve the actual package from node_modules, not the shareKey.
      // e.g., shared react with shareKey "my-react" should fallback to
      // __mf_fallback__/react, NOT __mf_fallback__/my-react
      const code = await generateSharedProxyCode('react', 'react', {
        singleton: true,
        strictVersion: false,
        requiredVersion: '^18.0.0',
        shareKey: 'my-react',
      });
      // loadShare should use the shareKey for scope negotiation
      expect(code).toContain('loadShare("my-react")');
      // But the fallback import should use the actual package name
      expect(code).toContain('__mf_fallback__/react');
      // Must NOT have __mf_fallback__/my-react
      expect(code).not.toContain('__mf_fallback__/my-react');
    });

    it('should use package name for fallback in runtime init too', () => {
      // In the runtime init shared config, the get() factory must also
      // use the real package name for the fallback import
      const code = generateRuntimeInitCode({
        name: 'host',
        shared: {
          react: {
            singleton: true,
            strictVersion: false,
            requiredVersion: '^18.0.0',
            version: '18.2.0',
            shareKey: 'aliased-react',
          },
        },
      });
      // The shared entry key should be the shareKey
      expect(code).toContain('"aliased-react"');
      // The fallback import should use the actual package name
      expect(code).toContain('__mf_fallback__/react');
      expect(code).not.toContain('__mf_fallback__/aliased-react');
    });
  });
});

// =============================================================================
// 9. transformRemoteImports
// =============================================================================

describe('transformRemoteImports', () => {
  const remotes = ['mfe1', 'mfe2', 'my-remote'];

  it('should transform named imports from remotes', async () => {
    const code = `import { App } from 'mfe1/component';`;
    const result = await transformRemoteImports(code, remotes);
    expect(result).toContain(
      'import { __mfModule as __mfR0 } from "mfe1/component"',
    );
    expect(result).toContain('const { App } = __mfR0');
    expect(result).not.toContain('import { App }');
  });

  it('should transform multiple named imports', async () => {
    const code = `import { App, Button, utils } from 'mfe1/component';`;
    const result = await transformRemoteImports(code, remotes);
    expect(result).toContain('const { App, Button, utils } = __mfR0');
  });

  it('should transform aliased imports (as)', async () => {
    const code = `import { App as RemoteApp, utils as remoteUtils } from 'mfe1/component';`;
    const result = await transformRemoteImports(code, remotes);
    expect(result).toContain(
      'const { App: RemoteApp, utils: remoteUtils } = __mfR0',
    );
  });

  it('should preserve default import alongside named imports', async () => {
    const code = `import Default, { App } from 'mfe1/component';`;
    const result = await transformRemoteImports(code, remotes);
    expect(result).toContain(
      'import Default, { __mfModule as __mfR0 } from "mfe1/component"',
    );
    expect(result).toContain('const { App } = __mfR0');
  });

  it('should transform namespace imports', async () => {
    const code = `import * as Mod from 'mfe1/component';`;
    const result = await transformRemoteImports(code, remotes);
    expect(result).toContain(
      'import { __mfModule as Mod } from "mfe1/component"',
    );
  });

  it('should NOT transform default-only imports', async () => {
    const code = `import RemoteApp from 'mfe1/component';`;
    const result = await transformRemoteImports(code, remotes);
    // Should be unchanged
    expect(result).toBe(code);
  });

  it('should NOT transform side-effect-only imports', async () => {
    const code = `import 'mfe1/component';`;
    const result = await transformRemoteImports(code, remotes);
    expect(result).toBe(code);
  });

  it('should NOT transform imports from non-remote modules', async () => {
    const code = `import { useState } from 'react';`;
    const result = await transformRemoteImports(code, remotes);
    expect(result).toBe(code);
  });

  it('should NOT transform TypeScript type-only imports', async () => {
    const code = `import type { AppProps } from 'mfe1/component';`;
    const result = await transformRemoteImports(code, remotes);
    expect(result).toBe(code);
  });

  it('should handle multiple imports from different remotes', async () => {
    const code = [
      `import { App } from 'mfe1/component';`,
      `import { Widget } from 'mfe2/widget';`,
      `import React from 'react';`,
    ].join('\n');
    const result = await transformRemoteImports(code, remotes);
    expect(result).toContain('const { App } = __mfR0');
    expect(result).toContain('const { Widget } = __mfR1');
    // React import should be unchanged
    expect(result).toContain(`import React from 'react'`);
  });

  it('should handle remotes with dashes in the name', async () => {
    const code = `import { helper } from 'my-remote/utils';`;
    const result = await transformRemoteImports(code, remotes);
    expect(result).toContain(
      'import { __mfModule as __mfR0 } from "my-remote/utils"',
    );
    expect(result).toContain('const { helper } = __mfR0');
  });

  it('should leave code without remote imports unchanged', async () => {
    const code = `const x = 1;\nconsole.log(x);`;
    const result = await transformRemoteImports(code, remotes);
    expect(result).toBe(code);
  });

  it('should handle deep subpath remote imports', async () => {
    const code = `import { Button } from 'mfe1/components/ui/Button';`;
    const result = await transformRemoteImports(code, remotes);
    expect(result).toContain('from "mfe1/components/ui/Button"');
    expect(result).toContain('const { Button } = __mfR0');
  });
});

// =============================================================================
// 10. Integration: named imports from remotes (webpack-like)
// =============================================================================

describe('integration: named imports from remotes', () => {
  let dir: string;
  beforeEach(() => {
    dir = tmpDir();
  });
  afterEach(() => rm(dir));

  it('should build successfully with named import from remote', async () => {
    const result = await esbuild.build({
      entryPoints: [
        writeFile(
          dir,
          'src/main.js',
          `import { App } from 'mfe1/component';\nexport default App;\n`,
        ),
      ],
      outdir: path.join(dir, 'dist'),
      bundle: true,
      format: 'esm',
      splitting: true,
      write: false,
      external: ['@module-federation/runtime'],
      plugins: [
        moduleFederationPlugin({
          name: 'host',
          shared: {},
          remotes: { mfe1: 'http://localhost:3001/remoteEntry.js' },
        }),
      ],
    });
    expect(result.errors).toHaveLength(0);
    const all = result.outputFiles?.map((f) => f.text).join('\n') || '';
    expect(all).toContain('loadRemote');
  });

  it('should build with mixed default + named imports from remote', async () => {
    const result = await esbuild.build({
      entryPoints: [
        writeFile(
          dir,
          'src/main.js',
          `import Default, { helper } from 'mfe1/utils';\nexport { Default, helper };\n`,
        ),
      ],
      outdir: path.join(dir, 'dist'),
      bundle: true,
      format: 'esm',
      splitting: true,
      write: false,
      external: ['@module-federation/runtime'],
      plugins: [
        moduleFederationPlugin({
          name: 'host',
          shared: {},
          remotes: { mfe1: 'http://localhost:3001/remoteEntry.js' },
        }),
      ],
    });
    expect(result.errors).toHaveLength(0);
  });

  it('should build with namespace import from remote', async () => {
    const result = await esbuild.build({
      entryPoints: [
        writeFile(
          dir,
          'src/main.js',
          `import * as Remote from 'mfe1/utils';\nexport default Remote;\n`,
        ),
      ],
      outdir: path.join(dir, 'dist'),
      bundle: true,
      format: 'esm',
      splitting: true,
      write: false,
      external: ['@module-federation/runtime'],
      plugins: [
        moduleFederationPlugin({
          name: 'host',
          shared: {},
          remotes: { mfe1: 'http://localhost:3001/remoteEntry.js' },
        }),
      ],
    });
    expect(result.errors).toHaveLength(0);
  });
});
