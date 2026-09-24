import { describe, expect, it, rs } from '@rstest/core';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { configureBridgeApplications } from './bridgeApplications';
import type { InternalModernPluginOptions } from '../types';

function setup(
  directory: string,
  bridge: any = { exposes: { './App': true } },
) {
  const callbacks: { generate?: any; chain?: any } = {};
  const api = {
    getConfig: () => ({ server: { ssr: { mode: 'stream' } } }),
    getAppContext: () => ({
      appDirectory: process.cwd(),
      internalDirectory: directory,
    }),
    generateEntryCode: (callback: any) => {
      callbacks.generate = callback;
    },
    modifyBundlerChain: (callback: any) => {
      callbacks.chain = callback;
    },
  };
  const options = {
    originPluginOptions: { bridge },
    csrConfig: { name: 'products' },
    ssrConfig: { name: 'products' },
  } as InternalModernPluginOptions;
  return { api, options, callbacks };
}

describe('independent Modern application configuration', () => {
  it('generates separate target exposes using the real named Modern registry', async () => {
    const directory = await fs.mkdtemp(
      path.join(os.tmpdir(), 'modern-bridge-entry-'),
    );
    try {
      const { api, options, callbacks } = setup(directory);
      configureBridgeApplications(api as any, options);
      await callbacks.generate({
        entrypoints: [
          { entryName: 'store', isMainEntry: true, isAutoMount: true },
        ],
      });
      const browser = (options.csrConfig!.exposes as Record<string, string>)[
        './App'
      ];
      const server = (options.ssrConfig!.exposes as Record<string, string>)[
        './App'
      ];
      expect(browser).not.toBe(server);
      expect(await fs.readFile(browser, 'utf8')).toContain(
        '@modern-js/runtime/registry/store',
      );
      expect(await fs.readFile(browser, 'utf8')).toContain(
        "from '@modern-js/runtime/application'",
      );
      expect(await fs.readFile(server, 'utf8')).toContain(
        "from '@modern-js/runtime/application/server'",
      );
      expect(options.csrConfig!.runtimePlugins).toHaveLength(1);
      expect(options.ssrConfig!.runtimePlugins).toHaveLength(1);
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });

  it('rejects sharing the renderer instead of silently breaking React version isolation', () => {
    for (const shared of [
      { react: { singleton: true } },
      ['react-dom/client'],
      [{ '@modern-js/runtime/router': {} }],
    ]) {
      const { api, options } = setup('/unused');
      options.csrConfig!.shared = shared;
      expect(() => configureBridgeApplications(api as any, options)).toThrow(
        'must not share',
      );
    }
  });

  it('rejects an existing expose and a missing automatic application entry', async () => {
    const directory = await fs.mkdtemp(
      path.join(os.tmpdir(), 'modern-bridge-entry-'),
    );
    try {
      const { api, options, callbacks } = setup(directory);
      options.csrConfig!.exposes = { './App': './custom.tsx' };
      expect(() => configureBridgeApplications(api as any, options)).toThrow(
        'Duplicate Bridge expose',
      );
      options.csrConfig!.exposes = {};
      configureBridgeApplications(api as any, options);
      await expect(
        callbacks.generate({
          entrypoints: [
            { entryName: 'main', isMainEntry: true, isAutoMount: false },
          ],
        }),
      ).rejects.toThrow('auto-mount');
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  });

  it('leaves the existing setup alone unless bridge is enabled', () => {
    const { api, options } = setup('/unused', false);
    const config = rs.spyOn(api, 'getConfig');
    configureBridgeApplications(api as any, options);
    expect(config).not.toHaveBeenCalled();
    expect(options.csrConfig!.exposes).toBeUndefined();
  });
});
