import {
  MESSAGE_ACTIVE_TAB_CHANGED,
  MESSAGE_OPEN_SIDE_PANEL,
} from '../utils/chrome/messages';

const SIDE_PANEL_PATH = 'html/main/index.html';

const getSidePanel = () => (chrome as any)?.sidePanel;

const resolveTabId = async (tabId?: number) => {
  if (typeof tabId === 'number') {
    return tabId;
  }
  const [activeTab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return activeTab?.id;
};

const broadcastActiveTab = (tabId: number) => {
  try {
    chrome.runtime.sendMessage({
      type: MESSAGE_ACTIVE_TAB_CHANGED,
      tabId,
    });
  } catch (error) {
    console.warn(
      '[Module Federation Devtools] Failed to broadcast active tab',
      error,
    );
  }
};

const openSidePanel = async (tabId?: number) => {
  const sidePanel = getSidePanel();
  if (!sidePanel) {
    throw new Error('sidePanel api not available');
  }

  const targetTabId = await resolveTabId(tabId);
  if (typeof targetTabId !== 'number') {
    throw new Error('No active tab available');
  }

  await sidePanel.setOptions({
    tabId: targetTabId,
    path: SIDE_PANEL_PATH,
    enabled: true,
  });

  if (sidePanel.open) {
    await sidePanel.open({ tabId: targetTabId });
  }
  broadcastActiveTab(targetTabId);

  if (sidePanel.getOptions) {
    try {
      const options = await sidePanel.getOptions({ tabId: targetTabId });
      broadcastActiveTab(targetTabId);
      return options;
    } catch (error) {
      console.warn('[Module Federation Devtools] getOptions failed', error);
    }
  }

  return {
    path: SIDE_PANEL_PATH,
    enabled: true,
  };
};

chrome.runtime.onInstalled.addListener(() => {
  const sidePanel = getSidePanel();
  if (sidePanel?.setPanelBehavior) {
    sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error: unknown) => {
        console.warn(
          '[Module Federation Devtools] setPanelBehavior failed',
          error,
        );
      });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await openSidePanel(tab.id);
  } catch (error) {
    console.warn(
      '[Module Federation Devtools] Failed to open side panel',
      error,
    );
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === MESSAGE_OPEN_SIDE_PANEL) {
    openSidePanel(message.tabId)
      .then((options) => sendResponse({ ok: true, options }))
      .catch((error: unknown) =>
        sendResponse({ ok: false, message: String(error) }),
      );
    return true;
  }
  return undefined;
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo?.tabId;
  if (typeof tabId !== 'number') {
    return;
  }
  try {
    broadcastActiveTab(tabId);
  } catch (error) {
    console.warn(
      '[Module Federation Devtools] Failed to handle tab activation',
      error,
    );
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') {
    return;
  }
  if (tab?.active) {
    try {
      broadcastActiveTab(tabId);
    } catch (error) {
      console.warn(
        '[Module Federation Devtools] Failed to handle tab update',
        error,
      );
    }
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  try {
    const FormID = 'FormID';
    const data = await chrome.storage.sync.get(FormID);
    const storeData = data[FormID];
    if (storeData?.[String(tabId)]) {
      delete storeData[String(tabId)];
      await chrome.storage.sync.set({
        [FormID]: storeData,
      });
    }
  } catch (error) {
    console.warn(
      '[Module Federation Devtools] Failed to handle tab removal',
      error,
    );
  }
});

console.log('Module Federation Worker ready');
