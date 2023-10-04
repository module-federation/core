import { RuntimeRemotesMap } from '../types';
import { extractUrlAndGlobal, remoteVars } from './pure';

export const getRuntimeRemotes = () => {
  try {
    return Object.entries(remoteVars).reduce(function (acc, item) {
      const [key, value] = item;
      // if its an object with a thenable (eagerly executing function)
      if (typeof value === 'object' && typeof value.then === 'function') {
        acc[key] = { asyncContainer: value };
      }
      // if its a function that must be called (lazily executing function)
      else if (typeof value === 'function') {
        // @ts-ignore
        acc[key] = { asyncContainer: value };
      }
      // if its a delegate module, skip it
      else if (typeof value === 'string' && value.startsWith('internal ')) {
        const [request, query] = value.replace('internal ', '').split('?');
        if (query) {
          const remoteSyntax = new URLSearchParams(query).get('remote');
          if (remoteSyntax) {
            const [url, global] = extractUrlAndGlobal(remoteSyntax);
            acc[key] = { global, url };
          }
        }
      }
      // if its just a string (global@url)
      else if (typeof value === 'string') {
        const [url, global] = extractUrlAndGlobal(value);
        acc[key] = { global, url };
      }
      // we dont know or currently support this type
      else {
        //@ts-ignore
        console.warn('remotes process', process.env.REMOTES);
        throw new Error(
          `[mf] Invalid value received for runtime_remote "${key}"`,
        );
      }
      return acc;
    }, {} as RuntimeRemotesMap);
  } catch (err) {
    console.warn('Unable to retrieve runtime remotes: ', err);
  }

  return {} as RuntimeRemotesMap;
};
