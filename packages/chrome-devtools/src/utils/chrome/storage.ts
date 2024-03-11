import {
  mergeLocalStorage,
  removeLocalStorageKey,
  removeLocalStorage,
  setLocalStorage,
} from '../sdk';
import { injectScript } from './index';

export const mergeStorage = async (tab: chrome.tabs.Tab, ...args: any[]) => {
  await injectScript(mergeLocalStorage, tab, false, ...args);
};

export const removeStorageKey = async (
  tab: chrome.tabs.Tab,
  ...args: any[]
) => {
  await injectScript(removeLocalStorageKey, tab, false, ...args);
};

export const removeStorage = async (tab: chrome.tabs.Tab, ...args: any[]) => {
  await injectScript(removeLocalStorage, tab, false, ...args);
};

export const setStorage = async (tab: chrome.tabs.Tab, ...args: any[]) => {
  await injectScript(setLocalStorage, tab, false, ...args);
};
