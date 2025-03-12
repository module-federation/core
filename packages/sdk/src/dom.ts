import type { CreateScriptHookDom, CreateScriptHookReturnDom } from './types';
import { warn } from './utils';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function safeWrapper<T extends (...args: Array<any>) => any>(
  callback: T,
  disableWarn?: boolean,
): Promise<ReturnType<T> | undefined> {
  try {
    const res = await callback();
    return res;
  } catch (e) {
    !disableWarn && warn(e);
    return;
  }
}

export function isStaticResourcesEqual(url1: string, url2: string): boolean {
  const REG_EXP = /^(https?:)?\/\//i;
  // Transform url1 and url2 into relative paths
  const relativeUrl1 = url1.replace(REG_EXP, '').replace(/\/$/, '');
  const relativeUrl2 = url2.replace(REG_EXP, '').replace(/\/$/, '');
  // Check if the relative paths are identical
  return relativeUrl1 === relativeUrl2;
}

export function createScript(info: {
  url: string;
  cb?: (value: void | PromiseLike<void>) => void;
  onErrorCallback?: (error: Error) => void;
  attrs?: Record<string, any>;
  needDeleteScript?: boolean;
  createScriptHook?: CreateScriptHookDom;
}): { script: HTMLScriptElement; needAttach: boolean } {
  // Retrieve the existing script element by its src attribute
  let script: HTMLScriptElement | null = null;
  let needAttach = true;
  let timeout = 20000;
  let timeoutId: NodeJS.Timeout;
  const scripts = document.getElementsByTagName('script');

  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i];
    const scriptSrc = s.getAttribute('src');
    if (scriptSrc && isStaticResourcesEqual(scriptSrc, info.url)) {
      script = s;
      needAttach = false;
      break;
    }
  }

  if (!script) {
    const attrs = info.attrs;
    script = document.createElement('script');
    script.type = attrs?.['type'] === 'module' ? 'module' : 'text/javascript';
    let createScriptRes: CreateScriptHookReturnDom = undefined;
    if (info.createScriptHook) {
      createScriptRes = info.createScriptHook(info.url, info.attrs);

      if (createScriptRes instanceof HTMLScriptElement) {
        script = createScriptRes;
      } else if (typeof createScriptRes === 'object') {
        if ('script' in createScriptRes && createScriptRes.script) {
          script = createScriptRes.script;
        }
        if ('timeout' in createScriptRes && createScriptRes.timeout) {
          timeout = createScriptRes.timeout;
        }
      }
    }
    if (!script.src) {
      script.src = info.url;
    }
    if (attrs && !createScriptRes) {
      Object.keys(attrs).forEach((name) => {
        if (script) {
          if (name === 'async' || name === 'defer') {
            script[name] = attrs[name];
            // Attributes that do not exist are considered overridden
          } else if (!script.getAttribute(name)) {
            script.setAttribute(name, attrs[name]);
          }
        }
      });
    }
  }

  const onScriptComplete = async (
    prev: OnErrorEventHandler | GlobalEventHandlers['onload'] | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any,
  ): Promise<void> => {
    clearTimeout(timeoutId);
    const onScriptCompleteCallback = () => {
      if (event?.type === 'error') {
        info?.onErrorCallback && info?.onErrorCallback(event);
      } else {
        info?.cb && info?.cb();
      }
    };

    // Prevent memory leaks in IE.
    if (script) {
      script.onerror = null;
      script.onload = null;
      safeWrapper(() => {
        const { needDeleteScript = true } = info;
        if (needDeleteScript) {
          script?.parentNode && script.parentNode.removeChild(script);
        }
      });
      if (prev && typeof prev === 'function') {
        const result = (prev as any)(event);
        if (result instanceof Promise) {
          const res = await result;
          onScriptCompleteCallback();
          return res;
        }
        onScriptCompleteCallback();
        return result;
      }
    }
    onScriptCompleteCallback();
  };

  script.onerror = onScriptComplete.bind(null, script.onerror);
  script.onload = onScriptComplete.bind(null, script.onload);

  timeoutId = setTimeout(() => {
    onScriptComplete(
      null,
      new Error(`Remote script "${info.url}" time-outed.`),
    );
  }, timeout);

  return { script, needAttach };
}

export function createLink(info: {
  url: string;
  cb?: (value: void | PromiseLike<void>) => void;
  onErrorCallback?: (error: Error) => void;
  attrs: Record<string, string>;
  needDeleteLink?: boolean;
  createLinkHook?: (
    url: string,
    attrs?: Record<string, any>,
  ) => HTMLLinkElement | void;
}) {
  // <link rel="preload" href="script.js" as="script">

  // Retrieve the existing script element by its src attribute
  let link: HTMLLinkElement | null = null;
  let needAttach = true;
  const links = document.getElementsByTagName('link');
  for (let i = 0; i < links.length; i++) {
    const l = links[i];
    const linkHref = l.getAttribute('href');
    const linkRel = l.getAttribute('rel');
    if (
      linkHref &&
      isStaticResourcesEqual(linkHref, info.url) &&
      linkRel === info.attrs['rel']
    ) {
      link = l;
      needAttach = false;
      break;
    }
  }

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('href', info.url);

    let createLinkRes: void | HTMLLinkElement = undefined;
    const attrs = info.attrs;

    if (info.createLinkHook) {
      createLinkRes = info.createLinkHook(info.url, attrs);
      if (createLinkRes instanceof HTMLLinkElement) {
        link = createLinkRes;
      }
    }

    if (attrs && !createLinkRes) {
      Object.keys(attrs).forEach((name) => {
        if (link && !link.getAttribute(name)) {
          link.setAttribute(name, attrs[name]);
        }
      });
    }
  }

  const onLinkComplete = (
    prev: OnErrorEventHandler | GlobalEventHandlers['onload'] | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any,
  ): void => {
    const onLinkCompleteCallback = () => {
      if (event?.type === 'error') {
        info?.onErrorCallback && info?.onErrorCallback(event);
      } else {
        info?.cb && info?.cb();
      }
    };
    // Prevent memory leaks in IE.
    if (link) {
      link.onerror = null;
      link.onload = null;
      safeWrapper(() => {
        const { needDeleteLink = true } = info;
        if (needDeleteLink) {
          link?.parentNode && link.parentNode.removeChild(link);
        }
      });
      if (prev) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = (prev as any)(event);
        onLinkCompleteCallback();
        return res;
      }
    }
    onLinkCompleteCallback();
  };

  link.onerror = onLinkComplete.bind(null, link.onerror);
  link.onload = onLinkComplete.bind(null, link.onload);

  return { link, needAttach };
}

export function loadScript(
  url: string,
  info: {
    attrs?: Record<string, any>;
    createScriptHook?: CreateScriptHookDom;
  },
) {
  const { attrs = {}, createScriptHook } = info;
  return new Promise<void>((resolve, reject) => {
    const { script, needAttach } = createScript({
      url,
      cb: resolve,
      onErrorCallback: reject,
      attrs: {
        fetchpriority: 'high',
        ...attrs,
      },
      createScriptHook,
      needDeleteScript: true,
    });
    needAttach && document.head.appendChild(script);
  });
}
