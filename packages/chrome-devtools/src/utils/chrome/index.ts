import { GlobalModuleInfo } from '@module-federation/sdk';
import { FormID } from '../../template/constant';
import { definePropertyGlobalVal } from '../sdk';

export * from './storage';

const sleep = (num: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, num);
  });
};

export const injectPostMessage = (postMessageUrl: string) => {
  const script = document.createElement('script');
  script.src = postMessageUrl;
  document.getElementsByTagName('head')[0].appendChild(script);
};

export const TabInfo = {
  currentTabId: 0,
};

export const setTargetTab = (tab?: chrome.tabs.Tab | null) => {
  if (!tab || typeof tab.id !== 'number') {
    return;
  }
  window.targetTab = tab;
  TabInfo.currentTabId = tab.id;
};

export const syncActiveTab = async (tabId?: number) => {
  try {
    if (typeof tabId === 'number') {
      const tab = await chrome.tabs.get(tabId);
      setTargetTab(tab);
      return tab;
    }
    const [activeTab] = await getTabs({
      active: true,
      lastFocusedWindow: true,
    });
    setTargetTab(activeTab);
    return activeTab;
  } catch (error) {
    console.warn('[Module Federation Devtools] syncActiveTab failed', error);
    return undefined;
  }
};

export function getCurrentTabId() {
  return TabInfo.currentTabId;
}

export function getInspectWindowTabId() {
  return new Promise((resolve, reject) => {
    if (chrome?.devtools?.inspectedWindow) {
      // @ts-expect-error In dev mode, should resolve by hand
      if (chrome.isDevMode) {
        resolve(0);
      }
      chrome.devtools.inspectedWindow.eval(
        'typeof window.__FEDERATION__ !== "undefined" || typeof window.__VMOK__ !== "undefined"',
        function (info, error) {
          const { tabId } = chrome.devtools.inspectedWindow;
          getTabs().then((tabs) => {
            const target = tabs.find(
              (tab: chrome.tabs.Tab) => tab.id === tabId,
            );
            setTargetTab(target as chrome.tabs.Tab);
          });
          console.log(
            'chrome.devtools.inspectedWindow.tabId',
            chrome.devtools.inspectedWindow.tabId,
          );
          TabInfo.currentTabId = tabId;
          resolve(tabId);
          if (error) {
            reject(error);
          }
        },
      );
    } else {
      // chrome devtool e2e test，The test window opens independently
      if (window.targetTab?.id) {
        const tabId = window.targetTab.id;
        TabInfo.currentTabId = tabId;
        resolve(tabId);
      } else {
        throw Error(`can't get active tab`);
      }
    }
  });
}

export const refreshModuleInfo = async () => {
  if (typeof window !== 'undefined' && window.__FEDERATION__?.moduleInfo) {
    // noop - consumers can synchronise from existing cache
  }
  await sleep(50);
  const postMessageStartUrl = getUrl('post-message-start.js');
  await injectScript(injectPostMessage, false, postMessageStartUrl);
};

export const getGlobalModuleInfo = async (
  callback: (moduleInfo: GlobalModuleInfo) => void,
) => {
  if (typeof window !== 'undefined' && window.__FEDERATION__?.moduleInfo) {
    callback(
      JSON.parse(
        JSON.stringify(window.__FEDERATION__?.moduleInfo),
      ) as GlobalModuleInfo,
    );
  }
  await sleep(300);

  const listener = (message: { origin: string; data: any }) => {
    const { data } = message;

    if (!data || data?.appInfos) {
      return;
    }
    if (!window?.__FEDERATION__) {
      definePropertyGlobalVal(window, '__FEDERATION__', {});
      definePropertyGlobalVal(window, '__VMOK__', window.__FEDERATION__);
    }
    window.__FEDERATION__.originModuleInfo = JSON.parse(
      JSON.stringify(data?.moduleInfo),
    );
    if (data?.updateModule) {
      const moduleIds = Object.keys(window.__FEDERATION__.originModuleInfo);
      const shouldUpdate = !moduleIds.some((id) =>
        id.includes(data.updateModule.name),
      );
      if (shouldUpdate) {
        const destination =
          data.updateModule.entry || data.updateModule.version;
        window.__FEDERATION__.originModuleInfo[
          `${data.updateModule.name}:${destination}`
        ] = {
          remoteEntry: destination,
          version: destination,
        };
      }
    }
    if (data?.share) {
      window.__FEDERATION__.__SHARE__ = data.share;
    }
    window.__FEDERATION__.moduleInfo = JSON.parse(
      JSON.stringify(window.__FEDERATION__.originModuleInfo),
    );
    console.log('getGlobalModuleInfo window', window.__FEDERATION__);
    callback(window.__FEDERATION__.moduleInfo);
  };
  chrome.runtime.onMessage.addListener(listener);
  await refreshModuleInfo();
  return () => chrome.runtime.onMessage.removeListener(listener);
};

export const getTabs = (queryOptions = {}) => chrome.tabs.query(queryOptions);

export const getScope = async () => {
  const activeTab = window.targetTab;
  const tabId = activeTab?.id;
  return tabId ? String(tabId) : 'noScope';
};

export const injectScript = async (
  excuteScript: (...args: Array<any>) => any,
  world = false,
  ...args: any
) => {
  await getInspectWindowTabId();
  return chrome.scripting
    .executeScript({
      target: {
        tabId: getCurrentTabId(),
      },
      func: excuteScript,
      world: world ? 'MAIN' : 'ISOLATED',
      args,
    })
    .then((results) => {
      console.log('InjectScript success, excuteScript:', args);
      if (Array.isArray(results) && results.length) {
        return results[0]?.result;
      }
      return undefined;
    })
    .catch((e) => {
      console.log(e, 'InjectScript fail, excuteScript:', args);
      return undefined;
    });
};

export const getUrl = (file: string) => {
  try {
    const pathSet = chrome.runtime.getURL(file).split('/');
    const fileName = pathSet.pop() as string;

    pathSet.push('static', 'js', fileName);
    return pathSet.join('/');
  } catch (e) {
    return '';
  }
};

export const injectToast = (toastUtilUrl: string, e2eFlag: string) => {
  const ele = document.querySelector(`[data-e2e=${e2eFlag}]`);
  if (ele) {
    return;
  }

  const scriptToast = document.createElement('script');
  scriptToast.src = toastUtilUrl;
  scriptToast.dataset.e2e = e2eFlag;
  document.getElementsByTagName('head')[0].appendChild(scriptToast);
};

export const setChromeStorage = (formData: Record<string, any>) => {
  getScope().then(async (scope) => {
    const data = await chrome.storage.sync.get('FormID');

    const storeData = data[FormID];
    const scopes = Object.keys(storeData || {});

    // Remove outdated data to avoid exceeded memory
    let filterOutDatedData = storeData || {};
    const { length } = scopes;
    if (length >= 10) {
      filterOutDatedData = scopes
        .slice(0, length - 3)
        .reduce((memo: Record<string, any>, cur) => {
          memo[cur] = storeData[cur];
          return memo;
        }, {});
    }

    const existRules = storeData?.[scope];
    chrome.storage.sync.set({
      [FormID]: {
        ...filterOutDatedData,
        [scope]: {
          ...existRules,
          ...formData,
        },
      },
    });
  });
};
