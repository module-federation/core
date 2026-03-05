import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import * as ts from 'typescript';
import { initializeSharing } from '../src/initializeSharing';
import { remotes } from '../src/remotes';
import type { InitializeSharingOptions, RemotesOptions } from '../src/types';

const hasOwn = (obj: Record<string, unknown>, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);
const forbiddenGlobalNames = new Set([
  '__webpack_require__',
  '__webpack_share_scopes__',
  '__webpack_init_sharing__',
]);
const enhancedRuntimeEmitterFiles = [
  '../../enhanced/src/lib/sharing/ShareRuntimeModule.ts',
  '../../enhanced/src/lib/sharing/ConsumeSharedRuntimeModule.ts',
  '../../enhanced/src/lib/container/runtime/FederationRuntimePlugin.ts',
  '../../enhanced/src/lib/container/runtime/getFederationGlobal.ts',
  '../../enhanced/src/lib/container/RemoteRuntimeModule.ts',
  '../../enhanced/src/lib/container/ContainerEntryModule.ts',
];
const esbuildTemplateFile =
  '../../esbuild/src/lib/core/createContainerTemplate.ts';

function collectTsFilesRecursively(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsFilesRecursively(absolutePath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(absolutePath);
    }
  }
  return files;
}

function collectExecutableForbiddenGlobalReferences(
  source: string,
  filePath: string,
): string[] {
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const offenders: string[] = [];

  const visit = (node: ts.Node) => {
    if (ts.isIdentifier(node) && forbiddenGlobalNames.has(node.text)) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(),
      );
      offenders.push(`${node.text}@${line + 1}:${character + 1}`);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return offenders;
}

describe('webpackRequire contract', () => {
  test('source files do not execute webpack runtime globals directly', () => {
    const srcDir = join(__dirname, '../src');
    const files = collectTsFilesRecursively(srcDir);
    const offenders: string[] = [];

    for (const file of files) {
      const content = readFileSync(file, 'utf-8');
      const executableReferences = collectExecutableForbiddenGlobalReferences(
        content,
        file,
      );
      if (executableReferences.length > 0) {
        offenders.push(
          `${file.replace(`${srcDir}/`, '')} -> ${executableReferences.join(', ')}`,
        );
      }
    }

    expect(offenders).toEqual([]);
  });

  test('string and template mentions are allowed because they are non-executable', () => {
    const source = `
      const a = "__webpack_require__";
      const b = '__webpack_share_scopes__';
      const c = \`__webpack_init_sharing__\`;
    `;

    expect(
      collectExecutableForbiddenGlobalReferences(source, 'virtual.ts'),
    ).toEqual([]);
  });

  test('enhanced runtime emitters pass RuntimeGlobals.require into bundler runtime calls', () => {
    const missingInjectedRequire: string[] = [];
    const directWebpackRequireUsage: string[] = [];
    const injectedRequirePattern =
      /webpackRequire\s*:\s*\$\{(?:RuntimeGlobals|runtimeGlobals)\.require\}/;
    const directWebpackRequirePattern =
      /webpackRequire\s*:\s*__webpack_require__/;

    for (const file of enhancedRuntimeEmitterFiles) {
      const absolutePath = join(__dirname, file);
      const content = readFileSync(absolutePath, 'utf-8');
      if (!injectedRequirePattern.test(content)) {
        missingInjectedRequire.push(file);
      }
      if (directWebpackRequirePattern.test(content)) {
        directWebpackRequireUsage.push(file);
      }
    }

    expect(missingInjectedRequire).toEqual([]);
    expect(directWebpackRequireUsage).toEqual([]);
  });

  test('esbuild container template passes local webpackRequire into bundler runtime APIs', () => {
    const content = readFileSync(join(__dirname, esbuildTemplateFile), 'utf-8');
    const webpackRequireAssignments =
      content.match(/webpackRequire:\s*__webpack_require__/g) || [];

    expect(webpackRequireAssignments.length).toBeGreaterThanOrEqual(2);
    expect(content).toMatch(
      /initContainerEntry\(\{[\s\S]*?webpackRequire:\s*__webpack_require__/,
    );
    expect(content).toMatch(
      /bundlerRuntime\.I\(\{[\s\S]*?webpackRequire:\s*__webpack_require__/,
    );
    expect(content).not.toMatch(
      /webpackRequire:\s*(?:globalThis|window|global)\.__webpack_require__/,
    );
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

    await expect(Promise.resolve(initializeSharing(options))).resolves.toBe(
      true,
    );
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
