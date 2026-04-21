export * from './graph';
export {
  definePropertyGlobalVal,
  getLocalStorage,
  mergeLocalStorage,
  removeLocalStorage,
  removeLocalStorageKey,
  setLocalStorage,
} from '@module-federation/sdk/proxy';

export const isObject = (target: any) =>
  Object.prototype.toString.call(target) === '[object Object]';

export const reloadPage = () => {
  globalThis?.location?.reload();
};

export const validateCustom = (schema: string) => schema?.endsWith('.json');

export const getUnpkgUrl = (pkg: string, version: string) => {
  if (pkg === 'react') {
    return `https://unpkg.com/react@${version}/umd/react.development.js`;
  } else if (pkg === 'react-dom') {
    return `https://unpkg.com/react-dom@${version}/umd/react-dom.development.js`;
  } else if (pkg === 'vue') {
    if ((version || '').split('.')[0] === '3') {
      return `https://unpkg.com/vue@${version}/dist/vue.global.js`;
    } else {
      return `https://unpkg.com/vue@${version}/dist/vue.common.dev.js`;
    }
  }
};
