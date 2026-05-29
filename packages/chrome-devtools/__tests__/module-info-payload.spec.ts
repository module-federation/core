import { afterEach, describe, expect, it, vi } from 'vitest';

import { normalizeModuleInfoPayload } from '../src/utils/chrome';

const dispatchModuleInfoMessage = (moduleInfo: unknown) => {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: {
        moduleInfo,
      },
      origin: 'https://example.com',
    }),
  );
};

const dispatchRawMessageData = (data: unknown) => {
  window.dispatchEvent(
    new MessageEvent('message', {
      data,
      origin: 'https://example.com',
    }),
  );
};

describe('normalizeModuleInfoPayload', () => {
  afterEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'chrome');
    Reflect.deleteProperty(window, 'moduleHandler');
  });

  it('drops undefined placeholders produced by safe post message serialization', () => {
    expect(normalizeModuleInfoPayload('[undefined]')).toEqual({});
  });

  it('drops non-object module info payloads', () => {
    expect(normalizeModuleInfoPayload(undefined)).toEqual({});
    expect(normalizeModuleInfoPayload(null)).toEqual({});
    expect(normalizeModuleInfoPayload([])).toEqual({});
  });

  it('keeps valid module info snapshots', () => {
    expect(
      normalizeModuleInfoPayload({
        'host:http://localhost:3000/mf-manifest.json': {
          remotesInfo: {},
        },
        broken: '[undefined]',
      }),
    ).toEqual({
      'host:http://localhost:3000/mf-manifest.json': {
        remotesInfo: {},
      },
    });
  });

  it('does not relay undefined placeholders from the page message listener', async () => {
    const sendMessage = vi.fn(() => Promise.resolve());
    vi.stubGlobal('chrome', {
      runtime: {
        sendMessage,
      },
    });

    await import('../src/utils/chrome/post-message-listener');

    dispatchModuleInfoMessage('[undefined]');
    expect(sendMessage).not.toHaveBeenCalled();

    dispatchRawMessageData(null);
    dispatchRawMessageData('[undefined]');
    expect(sendMessage).not.toHaveBeenCalled();

    dispatchModuleInfoMessage({
      'host:http://localhost:3000/mf-manifest.json': {
        remotesInfo: {},
      },
    });
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });
});
