export * from './graph';

export const setLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, value);
};

export const getLocalStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('[MF Devtools] getLocalStorage failed', error);
    return null;
  }
};

export const removeLocalStorage = (key: string) => {
  const data = localStorage.getItem(key);
  if (data) {
    localStorage.removeItem(key);
  }
};

export const mergeLocalStorage = (target: string, key: string, value: any) => {
  const str = localStorage.getItem(target);
  const obj = JSON.parse(str || '{}');
  obj[key] = value;
  localStorage.setItem(target, JSON.stringify(obj));
};

export const removeLocalStorageKey = (target: string, key: string) => {
  const str = localStorage.getItem(target);
  if (str) {
    const obj = JSON.parse(str || '{}');
    delete obj[key];
    localStorage.setItem(target, JSON.stringify(obj));
  }
};

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

export const definePropertyGlobalVal = (
  target: Record<string, any>,
  key: string,
  val: any,
) => {
  Object.defineProperty(target, key, {
    value: val,
    configurable: false,
    writable: true,
  });
};
