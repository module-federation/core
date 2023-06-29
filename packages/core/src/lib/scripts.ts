import type {
  IRemoteScriptFactory,
  RemoteScope,
  AsyncContainer,
  RemoteOptions,
  RemoteScriptLoader,
} from '../types';

const urlCache = new Set();
export const loadScript = async (url: string, callback: () => void) => {
  if (!url) return;

  if (urlCache.has(url)) {
    return;
  }

  const element = document.createElement('script');

  element.src = url;
  element.type = 'text/javascript';
  element.async = true;

  element.onload = () => {
    urlCache.add(url);
    callback();
    document.head.removeChild(element);
  };

  element.onerror = () => {
    throw new Error(`Failed to load script at: ${url}`);
  };

  document.head.appendChild(element);
};

/**
 * ScriptFactory is responsible for loading remote scripts and associating them with a scope.
 */
export class ScriptFactory implements IRemoteScriptFactory {
  remoteScriptLoader?: RemoteScriptLoader;

  /**
   *
   * @param remoteScriptLoader
   */
  constructor(remoteScriptLoader?: RemoteScriptLoader) {
    this.remoteScriptLoader = remoteScriptLoader;
  }

  loadScript(
    scope: RemoteScope,
    containerKey: string,
    remoteOptions: RemoteOptions
  ): AsyncContainer {
    return new Promise((resolve, reject) => {
      try {
        if (
          this.remoteScriptLoader &&
          typeof this.remoteScriptLoader === 'function'
        ) {
          const asyncContainer = this.remoteScriptLoader(
            scope,
            containerKey,
            remoteOptions
          );
          resolve(asyncContainer);
          return;
        }

        loadScript(remoteOptions.url, () => {
          resolve(scope[containerKey] as AsyncContainer);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
