import {
  mergeLocalStorage,
  removeLocalStorageKey,
  removeLocalStorage,
  setLocalStorage,
} from '../sdk';
import { injectScript } from './index';

export const mergeStorage = async (...args: any[]) =>
  injectScript(mergeLocalStorage, false, ...args);

export const removeStorageKey = async (...args: any[]) =>
  injectScript(removeLocalStorageKey, false, ...args);

export const removeStorage = async (...args: any[]) =>
  injectScript(removeLocalStorage, false, ...args);

export const setStorage = async (...args: any[]) =>
  injectScript(setLocalStorage, false, ...args);
