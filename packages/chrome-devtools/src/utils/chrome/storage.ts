import {
  mergeLocalStorage,
  removeLocalStorageKey,
  removeLocalStorage,
  setLocalStorage,
} from '../sdk';
import { injectScript } from './index';

export const mergeStorage = async (...args: any[]) => {
  await injectScript(mergeLocalStorage, false, ...args);
};

export const removeStorageKey = async (...args: any[]) => {
  await injectScript(removeLocalStorageKey, false, ...args);
};

export const removeStorage = async (...args: any[]) => {
  await injectScript(removeLocalStorage, false, ...args);
};

export const setStorage = async (...args: any[]) => {
  await injectScript(setLocalStorage, false, ...args);
};
