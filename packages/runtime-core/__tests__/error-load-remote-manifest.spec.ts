import { assert, describe, it, expect, vi } from 'vitest';
import { ModuleFederation } from '../src/core';
import type { ModuleFederationRuntimePlugin } from '../src/type/plugin';
import { mockStaticServer, removeScriptTags } from './mock/utils';
import { resetFederationGlobalInfo } from '../src/global';

mockStaticServer({
  baseDir: __dirname,
  filterKeywords: [],
  basename: 'http://localhost:1111/',
});

describe('errorLoadRemote — manifest validation errors', () => {
  beforeEach(() => {
    resetFederationGlobalInfo();
    removeScriptTags();
  });

  it('calls errorLoadRemote when manifest is valid JSON but missing required fields', async () => {
    const errorLoadRemoteSpy = vi.fn();

    const incompleteManifest = {
      id: '@test/bad-remote',
      name: '@test/bad-remote',
    };

    const fetchPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'test-fetch-plugin',
      fetch(url) {
        if (url.includes('bad-manifest')) {
          return Promise.resolve(
            new Response(JSON.stringify(incompleteManifest), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            }),
          );
        }
      },
    });

    const errorHandlerPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'test-error-handler',
      errorLoadRemote(args) {
        errorLoadRemoteSpy(args);
        return undefined;
      },
    });

    const FM = new ModuleFederation({
      name: '@test/host',
      remotes: [
        {
          name: '@test/bad-remote',
          entry: 'http://localhost:9999/bad-manifest/mf-manifest.json',
        },
      ],
      plugins: [fetchPlugin(), errorHandlerPlugin()],
    });

    await expect(
      FM.loadRemote('@test/bad-remote/someExpose'),
    ).rejects.toThrow();

    expect(errorLoadRemoteSpy).toHaveBeenCalled();
    const callArgs = errorLoadRemoteSpy.mock.calls[0][0];
    expect(callArgs.lifecycle).toBe('afterResolve');
    expect(callArgs.error).toBeDefined();
    expect(String(callArgs.error)).toContain('Missing required fields');
  });

  it('recovers via errorLoadRemote when manifest has missing fields and plugin returns fallback', async () => {
    const validManifestData = {
      id: '@test/bad-remote',
      name: '@test/bad-remote',
      metaData: {
        name: '@test/bad-remote',
        publicPath: 'http://localhost:1111/',
        type: 'app',
        buildInfo: { buildVersion: 'custom' },
        remoteEntry: {
          name: 'federation-remote-entry.js',
          path: 'resources/hooks/app2/',
        },
        types: { name: 'index.d.ts', path: './' },
        globalName: '@loader-hooks/app2',
      },
      remotes: [],
      shared: [],
      exposes: [],
    };

    const incompleteManifest = {
      id: '@test/bad-remote',
      name: '@test/bad-remote',
    };

    let fetchCallCount = 0;
    const fetchPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'test-fetch-plugin',
      fetch(url) {
        if (url.includes('bad-manifest')) {
          fetchCallCount++;
          if (fetchCallCount === 1) {
            return Promise.resolve(
              new Response(JSON.stringify(incompleteManifest), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              }),
            );
          }
        }
      },
    });

    const errorHandlerPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'test-error-handler',
      errorLoadRemote({ lifecycle }) {
        if (lifecycle === 'afterResolve') {
          return validManifestData;
        }
      },
    });

    const FM = new ModuleFederation({
      name: '@test/host-recover',
      remotes: [
        {
          name: '@test/bad-remote',
          entry: 'http://localhost:9999/bad-manifest/mf-manifest.json',
        },
      ],
      plugins: [fetchPlugin(), errorHandlerPlugin()],
    });

    const module = await FM.loadRemote<() => string>('@test/bad-remote/say');
    assert(module);
    expect(module()).toBe('hello app2');
  });

  it('calls errorLoadRemote when manifest fetch fails (network error)', async () => {
    const errorLoadRemoteSpy = vi.fn();

    const fetchPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'test-fetch-plugin',
      fetch(url) {
        if (url.includes('unreachable')) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
      },
    });

    const errorHandlerPlugin: () => ModuleFederationRuntimePlugin = () => ({
      name: 'test-error-handler',
      errorLoadRemote(args) {
        errorLoadRemoteSpy(args);
        return undefined;
      },
    });

    const FM = new ModuleFederation({
      name: '@test/host-network',
      remotes: [
        {
          name: '@test/unreachable-remote',
          entry: 'http://localhost:9999/unreachable/mf-manifest.json',
        },
      ],
      plugins: [fetchPlugin(), errorHandlerPlugin()],
    });

    await expect(
      FM.loadRemote('@test/unreachable-remote/someExpose'),
    ).rejects.toThrow();

    expect(errorLoadRemoteSpy).toHaveBeenCalled();
    const callArgs = errorLoadRemoteSpy.mock.calls[0][0];
    expect(callArgs.lifecycle).toBe('afterResolve');
    expect(callArgs.error).toBeInstanceOf(TypeError);
  });
});
