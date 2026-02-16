import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { initializeSharing } from '../src/initializeSharing';
import { remotes } from '../src/remotes';
import type { InitializeSharingOptions, RemotesOptions } from '../src/types';

const hasOwn = (obj: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

describe('webpackRequire contract', () => {
  test('source files do not reference webpack runtime globals directly', () => {
    const srcDir = join(__dirname, '../src');
    const files = readdirSync(srcDir).filter((file) => file.endsWith('.ts'));
    const forbiddenGlobals = [
      /\b__webpack_require__\b/,
      /\b__webpack_share_scopes__\b/,
      /\b__webpack_init_sharing__\b/,
    ];
    const offenders: string[] = [];

    for (const file of files) {
      const content = readFileSync(join(srcDir, file), 'utf-8');
      if (forbiddenGlobals.some((pattern) => pattern.test(content))) {
        offenders.push(file);
      }
    }

    expect(offenders).toEqual([]);
  });

  test('initializeSharing resolves externals through injected webpackRequire', async () => {
    const externalInit = jest.fn();
    const webpackRequire = jest.fn().mockReturnValue({
      init: externalInit,
    }) as any;

    webpackRequire.S = { default: {} };
    webpackRequire.o = hasOwn;
    webpackRequire.federation = {
      hasAttachShareScopeMap: false,
      instance: {
        name: 'host-app',
        options: { shareStrategy: 'version-first' },
        shareScopeMap: { default: {} },
        initializeSharing: jest.fn().mockReturnValue([]),
      },
      bundlerRuntimeOptions: {
        remotes: {
          idToRemoteMap: {
            modA: [
              { externalType: 'script', name: 'remote-a' },
              { externalType: 'script', name: 'remote-b' },
            ],
          },
          idToExternalAndNameMapping: {
            modA: ['default', './entry', 'external-mod-a'],
          },
        },
      },
    };

    const options: InitializeSharingOptions = {
      shareScopeName: 'default',
      webpackRequire,
      initPromises: {},
      initTokens: {},
      initScope: [],
    };

    await expect(
      Promise.resolve(initializeSharing(options)),
    ).resolves.toBe(true);
    expect(webpackRequire).toHaveBeenCalledWith('external-mod-a');
    expect(externalInit).toHaveBeenCalled();
  });

  test('remotes loads externals through injected webpackRequire for unsupported remote types', () => {
    const externalGet = jest.fn().mockReturnValue(() => 'remote-factory');
    const webpackRequire = jest.fn().mockImplementation((id: string) => {
      if (id !== 'external-remote-id') {
        throw new Error(`Unexpected external id: ${id}`);
      }
      return {
        init: jest.fn(),
        get: externalGet,
      };
    }) as any;

    webpackRequire.o = hasOwn;
    webpackRequire.S = {};
    webpackRequire.R = [];
    webpackRequire.m = {};
    webpackRequire.I = jest.fn().mockReturnValue(undefined);
    webpackRequire.federation = {
      hasAttachShareScopeMap: false,
      instance: {
        options: { shareStrategy: 'loaded-first' },
        shareScopeMap: { default: {} },
        sharedHandler: { initializeSharing: jest.fn().mockReturnValue([]) },
        loadRemote: jest.fn(),
      },
    };

    const options: RemotesOptions = {
      chunkId: 'chunk-a',
      promises: [],
      chunkMapping: {
        'chunk-a': ['remote-module-a'],
      },
      idToExternalAndNameMapping: {
        'remote-module-a': ['default', './widget', 'external-remote-id'],
      } as any,
      idToRemoteMap: {
        'remote-module-a': [
          // Not in FEDERATION_SUPPORTED_TYPES -> force external path
          { externalType: 'module', name: 'remote-app' } as any,
        ],
      },
      webpackRequire,
    };

    remotes(options);

    expect(webpackRequire).toHaveBeenCalledWith('external-remote-id', 0);
    expect(webpackRequire.I).toHaveBeenCalledWith('default', 0);
    expect(typeof webpackRequire.m['remote-module-a']).toBe('function');

    const moduleObj = { exports: undefined as unknown };
    webpackRequire.m['remote-module-a'](moduleObj);
    expect(moduleObj.exports).toBe('remote-factory');
    expect(externalGet).toHaveBeenCalled();
  });
});
