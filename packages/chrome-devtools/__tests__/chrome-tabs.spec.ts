import { afterEach, describe, expect, it, vi } from 'vitest';

import { getCurrentTabId, syncActiveTab, TabInfo } from '../src/utils/chrome';

describe('chrome tab helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'chrome');
    window.targetTab = undefined as any;
    TabInfo.currentTabId = 0;
  });

  it('does not warn when active tab query returns no array', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    vi.stubGlobal('chrome', {
      tabs: {
        query: vi.fn().mockResolvedValue(undefined),
      },
    });

    await expect(syncActiveTab()).resolves.toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
    expect(getCurrentTabId()).toBe(0);
  });

  it('syncs the queried active tab when chrome returns a tab array', async () => {
    const activeTab = { id: 8080 };

    vi.stubGlobal('chrome', {
      tabs: {
        query: vi.fn().mockResolvedValue([activeTab]),
      },
    });

    await expect(syncActiveTab()).resolves.toBe(activeTab);
    expect(window.targetTab).toBe(activeTab);
    expect(getCurrentTabId()).toBe(8080);
  });
});
