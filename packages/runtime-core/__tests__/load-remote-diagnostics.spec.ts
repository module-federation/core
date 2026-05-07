import { beforeEach, describe, expect, it } from 'vitest';
import { ModuleFederation } from '../src/core';
import { resetFederationGlobalInfo } from '../src/global';
import type { ModuleFederationRuntimePlugin } from '../src/type';
import { mockStaticServer, removeScriptTags } from './mock/utils';

const createDiagnosticsRecorder = (
  events: Array<Record<string, unknown>>,
): ModuleFederationRuntimePlugin => ({
  name: 'load-remote-diagnostics-test-plugin',
  afterLoadRemote(args) {
    events.push(args);
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
          id: '@demo/main/say',
          expose: './say',
        }),
      ]),
    );
  });
});
