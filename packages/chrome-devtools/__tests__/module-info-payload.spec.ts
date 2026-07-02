import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getGlobalModuleInfo,
  normalizeModuleInfoPayload,
} from '../src/utils/chrome';
import {
  MESSAGE_ACTIVE_TAB_CHANGED,
  MESSAGE_OBSERVABILITY_DEVTOOLS_EVENT,
} from '../src/utils/chrome/messages';

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
    vi.useRealTimers();
    vi.resetModules();
    vi.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'chrome');
    Reflect.deleteProperty(window, 'moduleHandler');
    Reflect.deleteProperty(window, '__FEDERATION__');
    Reflect.deleteProperty(window, '__VMOK__');
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

  it('ignores unrelated runtime messages without clearing cached module info', async () => {
    vi.useFakeTimers();

    const moduleInfo = {
      'host:http://localhost:3000/mf-manifest.json': {
        remotesInfo: {},
      },
    };
    window.__FEDERATION__ = {
      moduleInfo,
    } as any;
    window.__VMOK__ = window.__FEDERATION__;

    let runtimeListener:
      | ((message: { data?: unknown; type?: string; tabId?: number }) => void)
      | undefined;
    const addListener = vi.fn((listener) => {
      runtimeListener = listener;
    });
    const removeListener = vi.fn();

    vi.stubGlobal('chrome', {
      runtime: {
        getURL: (file: string) => `chrome-extension://id/${file}`,
        onMessage: {
          addListener,
          removeListener,
        },
      },
      devtools: {
        inspectedWindow: {
          tabId: 1,
          eval: vi.fn((_code: string, callback) => {
            callback(true, undefined);
          }),
        },
      },
      tabs: {
        query: vi.fn().mockResolvedValue([{ id: 1 }]),
      },
      scripting: {
        executeScript: vi.fn().mockResolvedValue([]),
      },
    });

    const callback = vi.fn();
    const cleanupPromise = getGlobalModuleInfo(callback);

    expect(callback).toHaveBeenCalledWith(moduleInfo);
    await vi.advanceTimersByTimeAsync(300);
    expect(addListener).toHaveBeenCalledTimes(1);

    runtimeListener?.({
      type: MESSAGE_ACTIVE_TAB_CHANGED,
      tabId: 1,
    });
    runtimeListener?.({
      type: MESSAGE_OBSERVABILITY_DEVTOOLS_EVENT,
      data: {
        kind: 'installed',
      },
    });

    expect(window.__FEDERATION__?.moduleInfo).toEqual(moduleInfo);
    expect(callback).toHaveBeenCalledTimes(1);

    runtimeListener?.({
      data: {
        share: {
          default: {},
        },
      },
    });

    expect(window.__FEDERATION__?.moduleInfo).toEqual(moduleInfo);
    expect(window.__FEDERATION__?.__SHARE__).toEqual({
      default: {},
    });
    expect(callback).toHaveBeenCalledTimes(2);

    const nextModuleInfo = {
      'remote:http://localhost:3001/mf-manifest.json': {
        remoteEntry: 'http://localhost:3001/remoteEntry.js',
        version: 'http://localhost:3001/remoteEntry.js',
      },
    };
    runtimeListener?.({
      data: {
        moduleInfo: nextModuleInfo,
      },
    });

    expect(window.__FEDERATION__?.moduleInfo).toEqual(nextModuleInfo);
    expect(callback).toHaveBeenCalledWith(nextModuleInfo);

    await vi.advanceTimersByTimeAsync(50);
    const cleanup = await cleanupPromise;
    cleanup();
    expect(removeListener).toHaveBeenCalledWith(runtimeListener);
  });
});
