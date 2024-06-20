import React from 'react';
import { Logger } from '@module-federation/bridge-shared';

export const LoggerInstance = new Logger('bridge-react');

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
