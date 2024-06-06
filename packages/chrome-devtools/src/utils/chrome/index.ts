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
            window.targetTab = target as chrome.tabs.Tab;
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
      if (window.targetTab && window.targetTab.id) {
        const tabId = window.targetTab.id;
        TabInfo.currentTabId = tabId;
        resolve(tabId);
      } else {
        throw Error(`can't get active tab`);
      }
    }
  });
}

export const getGlobalModuleInfo = async (
  callback: React.Dispatch<React.SetStateAction<GlobalModuleInfo>>,
) => {
  await sleep(300);

  chrome.runtime.onMessage.addListener(
    (message: { origin: string; data: any }) => {
      const { origin, data } = message;

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
      window.__FEDERATION__.moduleInfo = JSON.parse(
        JSON.stringify(window.__FEDERATION__.originModuleInfo),
      );
      callback(window.__FEDERATION__.moduleInfo);
    },
  );
  const postMessageStartUrl = getUrl('post-message-start.js');
  await injectScript(injectPostMessage, false, postMessageStartUrl);
};

export const getTabs = (queryOptions = {}) => chrome.tabs.query(queryOptions);

export const getScope = async () => {
  const activeTab = window.targetTab;
  const favIconUrl = activeTab?.favIconUrl;
  return favIconUrl || 'noScope';
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
    .then(() => {
      console.log('InjectScript success, excuteScript:', args);
    })
    .catch((e) => {
      console.log(e, 'InjectScript fail, excuteScript:', args);
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
