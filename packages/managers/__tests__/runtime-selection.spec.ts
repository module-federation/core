import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  finalizeRuntimeSelection,
  getSelectionSlot,
  inheritRuntimeSelection,
  reduceCapabilityProfile,
  registerRuntimeParticipant,
  resolveRuntimeImplementation,
  RuntimeSelectionError,
} from '../src/runtime-selection';

const NAMES = {
  'runtime-tools': '@module-federation/runtime-tools',
  runtime: '@module-federation/runtime',
  'runtime-core': '@module-federation/runtime-core',
  'bundler-runtime': '@module-federation/webpack-bundler-runtime',
  sdk: '@module-federation/sdk',
} as const;

function link(target: string, linkPath: string) {
  fs.mkdirSync(path.dirname(linkPath), { recursive: true });
  fs.symlinkSync(target, linkPath, 'dir');
}

function writePackage(
  directory: string,
  name: string,
  options: { version?: string; contract?: Record<string, unknown> } = {},
) {
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'index.js'), 'module.exports = {};\n');
  fs.writeFileSync(
    path.join(directory, 'package.json'),
    JSON.stringify({
      name,
      version: options.version ?? '1.0.0',
      main: 'index.js',
      exports: { '.': './index.js' },
      ...(options.contract ? { federationRuntime: options.contract } : {}),
    }),
  );
}

function installLegacy(root: string, sdkDir = path.join(root, 'sdk')) {
  const dirs = {
    'runtime-tools': path.join(root, 'runtime-tools'),
    runtime: path.join(root, 'runtime'),
    'runtime-core': path.join(root, 'runtime-core'),
    'bundler-runtime': path.join(root, 'bundler-runtime'),
    sdk: sdkDir,
  };
  for (const [role, directory] of Object.entries(dirs)) {
    if (
      directory !== sdkDir ||
      !fs.existsSync(path.join(sdkDir, 'package.json'))
    ) {
      writePackage(directory, NAMES[role as keyof typeof NAMES]);
    }
  }
  link(
    dirs.runtime,
    path.join(dirs['runtime-tools'], 'node_modules', NAMES.runtime),
  );
  link(
    dirs['bundler-runtime'],
    path.join(dirs['runtime-tools'], 'node_modules', NAMES['bundler-runtime']),
  );
  link(
    dirs['runtime-core'],
    path.join(dirs.runtime, 'node_modules', NAMES['runtime-core']),
  );
  link(dirs.sdk, path.join(dirs.runtime, 'node_modules', NAMES.sdk));
  link(
    dirs.runtime,
    path.join(dirs['bundler-runtime'], 'node_modules', NAMES.runtime),
  );
  link(dirs.sdk, path.join(dirs['bundler-runtime'], 'node_modules', NAMES.sdk));
  link(dirs.sdk, path.join(dirs['runtime-core'], 'node_modules', NAMES.sdk));
  return dirs;
}

function stampConditions(directory: string, id: string, role: string) {
  const file = path.join(directory, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(file, 'utf8')) as {
    federationRuntime?: Record<string, unknown>;
  };
  pkg.federationRuntime = {
    contract: 1,
    compatibilityId: id,
    mode: 'conditions',
    role,
    ...(role === 'runtime-tools'
      ? {
          entryLoadingIdentity: 'family-a-loader',
          facade: { require: './index.js' },
          allowedRequests: {
            '@module-federation/runtime-tools$': {
              role: 'runtime-tools',
              export: '.',
            },
          },
          selectors: {
            'remote-module': {
              ownerRole: 'runtime-tools',
              disabledCondition: 'module-federation:no-remote',
              leaves: {
                enabled: './index.js',
                disabled: './index.js',
                legacy: './index.js',
              },
            },
          },
          members: [
            {
              role: 'runtime-tools',
              package: NAMES['runtime-tools'],
              dependsOn: ['runtime', 'bundler-runtime'],
            },
            {
              role: 'runtime',
              package: NAMES.runtime,
              dependsOn: ['runtime-core', 'sdk'],
            },
            {
              role: 'runtime-core',
              package: NAMES['runtime-core'],
              dependsOn: ['sdk'],
            },
            {
              role: 'bundler-runtime',
              package: NAMES['bundler-runtime'],
              dependsOn: ['runtime', 'sdk'],
            },
            {
              role: 'sdk',
              package: NAMES.sdk,
              dependsOn: [],
            },
          ],
        }
      : {}),
  };
  fs.writeFileSync(file, JSON.stringify(pkg));
}

describe('runtime family resolution', () => {
  let root = '';

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'mf-runtime-family-'));
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('does not replace a broken member with another installation', () => {
    const dirs = installLegacy(root);
    const broken = path.join(root, 'broken-core');
    writePackage(broken, 'not-runtime-core');
    const coreLink = path.join(
      dirs.runtime,
      'node_modules',
      NAMES['runtime-core'],
    );
    fs.rmSync(coreLink, { recursive: true, force: true });
    link(broken, coreLink);

    expect(() =>
      resolveRuntimeImplementation(
        path.join(dirs['runtime-tools'], 'index.js'),
      ),
    ).toThrow(expect.objectContaining({ code: 'wrong-member' }));
  });

  it('fails when a declared member is not installed beside its parent', () => {
    const tools = path.join(root, 'runtime-tools');
    writePackage(tools, '@acme/runtime-tools', {
      contract: {
        contract: 1,
        compatibilityId: 'family-a',
        mode: 'conditions',
        entryLoadingIdentity: 'family-a-loader',
        facade: { require: './index.js' },
        allowedRequests: {
          '@acme/runtime-tools$': {
            role: 'runtime-tools',
            export: '.',
          },
        },
        selectors: {
          'remote-module': {
            ownerRole: 'runtime-tools',
            leaves: {
              enabled: './index.js',
              disabled: './index.js',
              legacy: './index.js',
            },
          },
        },
        members: [
          {
            role: 'runtime-tools',
            package: '@acme/runtime-tools',
            dependsOn: ['runtime'],
          },
          { role: 'runtime', package: '@acme/runtime', dependsOn: [] },
          {
            role: 'runtime-core',
            package: '@acme/runtime-core',
            dependsOn: [],
          },
          {
            role: 'bundler-runtime',
            package: '@acme/bundler-runtime',
            dependsOn: [],
          },
          { role: 'sdk', package: '@acme/sdk', dependsOn: [] },
        ],
      },
    });

    expect(() =>
      resolveRuntimeImplementation(path.join(tools, 'index.js')),
    ).toThrow(expect.objectContaining({ code: 'missing-member' }));
  });

  it('resolves one root per role for an older package without federationRuntime', () => {
    const dirs = installLegacy(root);
    const resolved = resolveRuntimeImplementation(
      path.join(dirs['runtime-tools'], 'index.js'),
    );

    expect(resolved.mode).toBe('legacy-defines');
    expect(resolved.family.members.runtime.canonicalRoot).toBe(
      fs.realpathSync(dirs.runtime),
    );
    expect(resolved.family.members.sdk.canonicalRoot).toBe(
      fs.realpathSync(dirs.sdk),
    );
    expect(resolved.family.compatibilityId).toBe(
      'legacy:@module-federation/runtime-core@1.0.0',
    );
  });

  it('rejects a malformed federationRuntime contract', () => {
    const dirs = installLegacy(root);
    const toolsPackage = path.join(dirs['runtime-tools'], 'package.json');
    const pkg = JSON.parse(fs.readFileSync(toolsPackage, 'utf8')) as {
      federationRuntime?: unknown;
    };
    pkg.federationRuntime = { contract: 0 };
    fs.writeFileSync(toolsPackage, JSON.stringify(pkg));

    expect(() =>
      resolveRuntimeImplementation(
        path.join(dirs['runtime-tools'], 'index.js'),
      ),
    ).toThrow(expect.objectContaining({ code: 'malformed-contract' }));
  });

  it('does not treat mode-less metadata as a legacy package', () => {
    const dirs = installLegacy(root);
    const toolsPackage = path.join(dirs['runtime-tools'], 'package.json');
    const pkg = JSON.parse(fs.readFileSync(toolsPackage, 'utf8')) as {
      federationRuntime?: unknown;
    };
    pkg.federationRuntime = {
      contract: 1,
      compatibilityId: 'mode-less-family',
    };
    fs.writeFileSync(toolsPackage, JSON.stringify(pkg));

    expect(() =>
      resolveRuntimeImplementation(
        path.join(dirs['runtime-tools'], 'index.js'),
      ),
    ).toThrow(expect.objectContaining({ code: 'malformed-contract' }));
  });

  it('does not accept a second copy of a member reached through another edge', () => {
    const dirs = installLegacy(root);
    const otherSdk = path.join(root, 'other-sdk');
    writePackage(otherSdk, NAMES.sdk, { version: '9.9.9' });
    fs.rmSync(path.join(dirs['bundler-runtime'], 'node_modules', NAMES.sdk), {
      recursive: true,
      force: true,
    });
    link(
      otherSdk,
      path.join(dirs['bundler-runtime'], 'node_modules', NAMES.sdk),
    );

    expect(() =>
      resolveRuntimeImplementation(
        path.join(dirs['runtime-tools'], 'index.js'),
      ),
    ).toThrow(expect.objectContaining({ code: 'split-family' }));
  });

  it('accepts two nested copies of a legacy member at the same version', () => {
    const dirs = installLegacy(root);
    const nestedSdk = path.join(dirs['bundler-runtime'], 'nested-sdk');
    writePackage(nestedSdk, NAMES.sdk);
    fs.rmSync(path.join(dirs['bundler-runtime'], 'node_modules', NAMES.sdk), {
      recursive: true,
      force: true,
    });
    link(
      nestedSdk,
      path.join(dirs['bundler-runtime'], 'node_modules', NAMES.sdk),
    );

    const resolved = resolveRuntimeImplementation(
      path.join(dirs['runtime-tools'], 'index.js'),
    );
    expect(resolved.family.members.sdk.canonicalRoot).toBe(
      fs.realpathSync(dirs.sdk),
    );
  });

  it('keeps root identity for condition-mode members at the same version', () => {
    const dirs = installLegacy(root);
    const nestedSdk = path.join(dirs['bundler-runtime'], 'nested-sdk');
    writePackage(nestedSdk, NAMES.sdk);
    fs.rmSync(path.join(dirs['bundler-runtime'], 'node_modules', NAMES.sdk), {
      recursive: true,
      force: true,
    });
    link(
      nestedSdk,
      path.join(dirs['bundler-runtime'], 'node_modules', NAMES.sdk),
    );
    for (const role of Object.keys(dirs) as (keyof typeof dirs)[]) {
      stampConditions(dirs[role], 'family-a', role);
    }
    stampConditions(nestedSdk, 'family-a', 'sdk');

    expect(() =>
      resolveRuntimeImplementation(
        path.join(dirs['runtime-tools'], 'index.js'),
      ),
    ).toThrow(expect.objectContaining({ code: 'split-family' }));
  });

  it('treats a linked package as the same member when realpaths match', () => {
    const dirs = installLegacy(root);
    const alias = path.join(root, 'sdk-link');
    fs.symlinkSync(dirs.sdk, alias, 'dir');
    fs.rmSync(path.join(dirs.runtime, 'node_modules', NAMES.sdk), {
      recursive: true,
      force: true,
    });
    link(alias, path.join(dirs.runtime, 'node_modules', NAMES.sdk));

    const resolved = resolveRuntimeImplementation(
      path.join(dirs['runtime-tools'], 'index.js'),
    );
    expect(resolved.family.members.sdk.canonicalRoot).toBe(
      fs.realpathSync(dirs.sdk),
    );
  });

  it('requires every condition-mode member to carry the same compatibility id', () => {
    const dirs = installLegacy(root);
    stampConditions(dirs['runtime-tools'], 'family-a', 'runtime-tools');
    stampConditions(dirs.runtime, 'family-a', 'runtime');
    stampConditions(dirs['runtime-core'], 'family-b', 'runtime-core');
    stampConditions(dirs['bundler-runtime'], 'family-a', 'bundler-runtime');
    stampConditions(dirs.sdk, 'family-a', 'sdk');

    expect(() =>
      resolveRuntimeImplementation(
        path.join(dirs['runtime-tools'], 'index.js'),
      ),
    ).toThrow(expect.objectContaining({ code: 'incompatible-member' }));
  });
});

describe('capability profile reduction', () => {
  it('treats omitted capabilities as enabled and explicit disables as forbidden', () => {
    const profile = reduceCapabilityProfile(
      [
        {
          pluginName: 'host',
          remotes: { remote: 'remote@http://localhost/remote.js' },
        },
        {
          pluginName: 'provider',
          exposes: { './App': './src/App' },
          experiments: {
            optimization: { disableSnapshot: true, target: 'web' },
          },
        },
      ],
      'web',
    );

    expect(profile).toMatchObject({
      remote: 'required',
      shared: 'neutral',
      snapshotPlugins: 'forbidden',
      containerEntry: 'required',
      explicitTarget: 'web',
      target: 'web',
    });
  });

  it('lets a participant disable a capability it also configures', () => {
    const profile = reduceCapabilityProfile([
      {
        pluginName: 'host',
        remotes: { app: 'app@url' },
        shared: { react: {} },
        experiments: {
          optimization: { disableRemote: true, disableShared: true },
        },
      },
    ]);

    expect(profile.remote).toBe('forbidden');
    expect(profile.shared).toBe('forbidden');
  });

  it('fails when one participant requires a capability another forbids', () => {
    expect(() =>
      reduceCapabilityProfile([
        { pluginName: 'host', remotes: { app: 'app@url' } },
        {
          pluginName: 'other',
          experiments: { optimization: { disableRemote: true } },
        },
      ]),
    ).toThrow(expect.objectContaining({ code: 'capability-conflict' }));
    expect(() =>
      reduceCapabilityProfile([
        { pluginName: 'host', shared: { react: {} } },
        {
          pluginName: 'other',
          experiments: { optimization: { disableShared: true } },
        },
      ]),
    ).toThrow(expect.objectContaining({ code: 'capability-conflict' }));
  });

  it('ignores an unknown or null optimization target and infers from the compiler', () => {
    const profile = reduceCapabilityProfile(
      [
        {
          pluginName: 'odd',
          experiments: { optimization: { target: 'toaster' } },
        },
        {
          pluginName: 'nullish',
          experiments: { optimization: { target: null } },
        },
      ],
      'node',
    );

    expect(profile.explicitTarget).toBeNull();
    expect(profile.target).toBe('node');
  });

  it('chooses universal when compiler target properties are mixed', () => {
    const profile = reduceCapabilityProfile(
      [{ pluginName: 'app' }],
      ['electron-renderer'],
    );
    expect(profile.target).toBe('universal');
  });
});

describe('compiler selection slot', () => {
  it('keeps a child on the parent family and rejects participants after finalization', () => {
    const parent = {};
    const child = {};
    registerRuntimeParticipant(parent, { pluginName: 'host' });
    const slot = finalizeRuntimeSelection(
      parent,
      'web',
      path.join(
        path.dirname(require.resolve('@module-federation/runtime-tools')),
      ),
    );
    inheritRuntimeSelection(parent, child);
    expect(() =>
      registerRuntimeParticipant(child, {
        pluginName: 'late',
        experiments: { optimization: { disableRemote: true } },
      }),
    ).toThrow(expect.objectContaining({ code: 'late-participant' }));

    expect(getSelectionSlot(child).image?.family.instanceId).toBe(
      slot.image?.family.instanceId,
    );
    expect(getSelectionSlot(child).profile?.remote).toBe('neutral');
  });
});
