import { beforeEach, describe, expect, it } from 'vitest';
import { RUNTIME_014 } from '@module-federation/error-codes';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import type { ModuleFederationRuntimePlugin } from '../src/type';
import { mockStaticServer, removeScriptTags } from './mock/utils';

const createDiagnosticsRecorder = (
  events: Array<Record<string, unknown>>,
): ModuleFederationRuntimePlugin => ({
  name: 'load-remote-diagnostics-test-plugin',
  afterMatchRemote(args) {
    events.push({
      type: 'afterMatchRemote',
      id: args.id,
      expose: args.expose,
      remote: args.remoteInfo,
      error: args.error,
    });
  },
  beforeInitRemote(args) {
    events.push({
      type: 'beforeInitRemote',
      id: args.id,
      remote: args.remoteInfo,
    });
  },
  afterInitRemote(args) {
    events.push({
      type: 'afterInitRemote',
      id: args.id,
      remote: args.remoteInfo,
      error: args.error,
      cached: args.cached,
    });
  },
  beforeGetExpose(args) {
    events.push({
      type: 'beforeGetExpose',
      id: args.id,
      expose: args.expose,
      remote: args.moduleInfo,
    });
  },
  afterGetExpose(args) {
    events.push({
      type: 'afterGetExpose',
      id: args.id,
      expose: args.expose,
      remote: args.moduleInfo,
      error: args.error,
    });
  },
  beforeExecuteFactory(args) {
    events.push({
      type: 'beforeExecuteFactory',
      id: args.id,
      expose: args.expose,
      remote: args.moduleInfo,
    });
  },
  afterExecuteFactory(args) {
    events.push({
      type: 'afterExecuteFactory',
      id: args.id,
      expose: args.expose,
      remote: args.moduleInfo,
      error: args.error,
    });
  },
  afterLoadRemote(args) {
    events.push({
      type: 'afterLoadRemote',
      ...args,
    });
  },
});

describe('loadRemote diagnostics', () => {
  mockStaticServer({
    baseDir: __dirname,
    filterKeywords: [],
    basename: 'http://localhost:1111/',
  });

  beforeEach(() => {
    resetFederationGlobalInfo();
    removeScriptTags();
  });

  it('emits an afterLoadRemote hook after a successful remote load', async () => {
    const events: Array<Record<string, unknown>> = [];
    const mf = new ModuleFederation({
      name: 'load-remote-diagnostics-host',
      remotes: [
        {
          name: '@demo/main',
          entry:
            'http://localhost:1111/resources/main/federation-manifest.json',
        },
      ],
      plugins: [createDiagnosticsRecorder(events)],
    });

    const say = await mf.loadRemote<() => string>('@demo/main/say');

    expect(say?.()).toBe('hello world');
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'afterLoadRemote',
          id: '@demo/main/say',
          expose: './say',
        }),
      ]),
    );

    expect(events.map((event) => event.type)).toEqual([
      'afterMatchRemote',
      'beforeInitRemote',
      'afterInitRemote',
      'beforeGetExpose',
      'afterGetExpose',
      'beforeExecuteFactory',
      'afterExecuteFactory',
      'afterLoadRemote',
    ]);
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'afterMatchRemote',
          id: '@demo/main/say',
          expose: './say',
        }),
        expect.objectContaining({
          type: 'afterInitRemote',
          error: undefined,
        }),
        expect.objectContaining({
          type: 'afterGetExpose',
          id: '@demo/main/say',
          expose: './say',
          error: undefined,
        }),
        expect.objectContaining({
          type: 'afterExecuteFactory',
          id: '@demo/main/say',
          expose: './say',
          error: undefined,
        }),
      ]),
    );
  });

  it('emits the expose phase before a missing expose bubbles to loadRemote', async () => {
    const events: Array<Record<string, unknown>> = [];
    const mf = new ModuleFederation({
      name: 'load-remote-diagnostics-host',
      remotes: [
        {
          name: '@demo/main',
          entry:
            'http://localhost:1111/resources/main/federation-manifest.json',
        },
      ],
      plugins: [createDiagnosticsRecorder(events)],
    });

    await expect(
      mf.loadRemote<() => string>('@demo/main/__missing__'),
    ).rejects.toThrow(RUNTIME_014);

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'afterGetExpose',
          id: '@demo/main/__missing__',
          expose: './__missing__',
          error: expect.any(Error),
        }),
        expect.objectContaining({
          type: 'afterLoadRemote',
          id: '@demo/main/__missing__',
          expose: './__missing__',
          error: expect.any(Error),
        }),
      ]),
    );

    const afterGetExposeError = events.find(
      (event) => event.type === 'afterGetExpose',
    )?.error;
    expect(afterGetExposeError).toBeInstanceOf(Error);
    expect(String((afterGetExposeError as Error).message)).toContain(
      'availableExposes',
    );
    expect(String((afterGetExposeError as Error).message)).toContain(
      'shared-button',
    );
  });
});
