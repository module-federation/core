import React from 'react';
import { createLogger } from '@module-federation/sdk';

export const LoggerInstance = createLogger(
  '[ Module Federation Bridge React ]',
);

type typeReact = typeof React;

export function atLeastReact18(React: typeReact) {
  if (
    React &&
    typeof React.version === 'string' &&
    React.version.indexOf('.') >= 0
  ) {
    const majorVersionString = React.version.split('.')[0];
    try {
      return Number(majorVersionString) >= 18;
    } catch (err) {
      return false;
    }
  } else {
    return false;
  }
}

export function pathJoin(...args: string[]) {
  const res = args.reduce((res, path: string) => {
    let nPath = path;
    if (!nPath || typeof nPath !== 'string') {
      return res;
    }
    if (nPath[0] !== '/') {
      nPath = `/${nPath}`;
    }
    const lastIndex = nPath.length - 1;
    if (nPath[lastIndex] === '/') {
      nPath = nPath.substring(0, lastIndex);
    }
    return res + nPath;
  }, '');
  return res || '/';
}

export const getModuleName = (id: string) => {
  if (!id) {
    return id;
  }
  // separate module name without detailed module path
  // @vmok-e2e/edenx-demo-app2/button -> @vmok-e2e/edenx-demo-app2
  const idArray = id.split('/');
  if (idArray.length < 2) {
    return id;
  }
  return idArray[0] + '/' + idArray[1];
};

export const getRootDomDefaultClassName = (moduleName: string) => {
  if (!moduleName) {
    return '';
  }
  const name = getModuleName(moduleName).replace(/\@/, '').replace(/\//, '-');
  return `bridge-root-component-${name}`;
};
