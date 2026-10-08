import { afterEach, describe, expect, it, rs } from '@rstest/core';

import {
  getCurrentTabId,
  getInspectWindowTabId,
  getInspectedWindowTabId,
  isRuntimeMessageForCurrentTab,
  isTabEventForCurrentContext,
  syncActiveTab,
  TabInfo,
} from '../src/utils/chrome';

describe('chrome tab helpers', () => {
  afterEach(() => {
    rs.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'chrome');
    window.history.replaceState({}, '', '/');
    window.targetTab = undefined as any;
    TabInfo.currentTabId = 0;
    TabInfo.currentWindowId = undefined;
  });

  it('does not warn when active tab query returns no array', async () => {
    const warn = rs.spyOn(console, 'warn').mockImplementation(() => {});

    rs.stubGlobal('chrome', {
      tabs: {
        query: rs.fn().mockResolvedValue(undefined),
      },
    });

    await expect(syncActiveTab()).resolves.toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
    expect(getCurrentTabId()).toBe(0);
  });

  it('syncs the queried active tab when chrome returns a tab array', async () => {
    const activeTab = { id: 8080, windowId: 42 };
    const query = rs.fn().mockResolvedValue([activeTab]);

    rs.stubGlobal('chrome', {
      tabs: {
        query,
      },
    });

    await expect(syncActiveTab()).resolves.toBe(activeTab);
    expect(query).toHaveBeenCalledWith({
      active: true,
      currentWindow: true,
    });
    expect(window.targetTab).toBe(activeTab);
    expect(getCurrentTabId()).toBe(8080);
    expect(TabInfo.currentWindowId).toBe(42);
  });

  it('prefers the inspected DevTools tab over the browser active tab', async () => {
    const activeTab = { id: 8080 };
    const inspectedTab = { id: 9090 };
    const query = rs.fn().mockResolvedValue([activeTab]);

    rs.stubGlobal('chrome', {
      devtools: {
        inspectedWindow: {
          tabId: inspectedTab.id,
        },
      },
      tabs: {
        query,
      },
    });

    await expect(syncActiveTab()).resolves.toMatchObject(inspectedTab);
    expect(getInspectedWindowTabId()).toBe(inspectedTab.id);
    expect(query).not.toHaveBeenCalled();
    expect(getCurrentTabId()).toBe(inspectedTab.id);
  });

  it('does not use tabs APIs to resolve an inspected DevTools tab', async () => {
    const inspectedTabId = 9090;
    const evalFn = rs.fn(
      (
        _expression: string,
        callback: (result: unknown, error?: unknown) => void,
      ) => callback(true),
    );

    rs.stubGlobal('chrome', {
      devtools: {
        inspectedWindow: {
          tabId: inspectedTabId,
          eval: evalFn,
        },
      },
    });

    await expect(syncActiveTab()).resolves.toMatchObject({
      id: inspectedTabId,
    });
    await expect(getInspectWindowTabId()).resolves.toBe(inspectedTabId);
    expect(evalFn).toHaveBeenCalled();
    expect(getCurrentTabId()).toBe(inspectedTabId);
  });

  it('keeps the panel scoped to its tab when Chrome reports another active tab', () => {
    window.history.replaceState({}, '', '/?inspectedTabId=9090');
    rs.stubGlobal('chrome', {
      devtools: {
        inspectedWindow: {
          tabId: 8080,
        },
      },
    });

    expect(getInspectedWindowTabId()).toBe(9090);
    expect(isTabEventForCurrentContext(9090)).toBe(true);
    expect(isTabEventForCurrentContext(8080)).toBe(false);
    expect(isTabEventForCurrentContext()).toBe(false);
  });

  it('filters tab events to the inspected DevTools tab', () => {
    rs.stubGlobal('chrome', {
      devtools: {
        inspectedWindow: {
          tabId: 9090,
        },
      },
    });

    expect(isTabEventForCurrentContext(9090)).toBe(true);
    expect(isTabEventForCurrentContext(8080)).toBe(false);
  });

  it('filters active-tab events to the side panel window', () => {
    TabInfo.currentWindowId = 22;

    expect(isTabEventForCurrentContext(8080, 22)).toBe(true);
    expect(isTabEventForCurrentContext(8080, 33)).toBe(false);
  });

  it('filters runtime messages to the current side panel tab', () => {
    TabInfo.currentTabId = 8080;

    expect(isRuntimeMessageForCurrentTab(8080)).toBe(true);
    expect(isRuntimeMessageForCurrentTab(9090)).toBe(false);
  });

  it('accepts active-tab events when running outside DevTools', () => {
    rs.stubGlobal('chrome', {});

    expect(isTabEventForCurrentContext(8080)).toBe(true);
  });
});
