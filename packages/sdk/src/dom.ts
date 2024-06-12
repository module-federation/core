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

export type CreateScriptHookReturn =
  | HTMLScriptElement
  | { script?: HTMLScriptElement; timeout?: number }
  | void;

export function createScript(info: {
  url: string;
  cb?: (value: void | PromiseLike<void>) => void;
  attrs?: Record<string, any>;
  needDeleteScript?: boolean;
  createScriptHook?: (url: string) => CreateScriptHookReturn;
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
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = info.url;
    if (info.createScriptHook) {
      const createScriptRes = info.createScriptHook(info.url);

      if (createScriptRes instanceof HTMLScriptElement) {
        script = createScriptRes;
      } else if (typeof createScriptRes === 'object') {
        if (createScriptRes.script) script = createScriptRes.script;
        if (createScriptRes.timeout) timeout = createScriptRes.timeout;
      }
    }

    const attrs = info.attrs;
    if (attrs) {
      Object.keys(attrs).forEach((name) => {
        if (script) {
          if (name === 'async' || name === 'defer') {
            script[name] = attrs[name];
          } else {
            script.setAttribute(name, attrs[name]);
          }
        }
      });
    }
  }

  const onScriptComplete = (
    prev: OnErrorEventHandler | GlobalEventHandlers['onload'] | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any,
  ): void => {
    clearTimeout(timeoutId);
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
      if (prev) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = (prev as any)(event);
        info?.cb?.();
        return res;
      }
    }
    info?.cb?.();
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
  cb: (value: void | PromiseLike<void>) => void;
  attrs: Record<string, string>;
  needDeleteLink?: boolean;
  createLinkHook?: (url: string) => HTMLLinkElement | void;
}) {
  // <link rel="preload" href="script.js" as="script">

  // Retrieve the existing script element by its src attribute
  let link: HTMLLinkElement | null = null;
  let needAttach = true;
  const links = document.getElementsByTagName('link');
  for (let i = 0; i < links.length; i++) {
    const l = links[i];
    const linkHref = l.getAttribute('href');
    const linkRef = l.getAttribute('ref');
    if (
      linkHref &&
      isStaticResourcesEqual(linkHref, info.url) &&
      linkRef === info.attrs['ref']
    ) {
      link = l;
      needAttach = false;
      break;
    }
  }

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('href', info.url);

    if (info.createLinkHook) {
      const createLinkRes = info.createLinkHook(info.url);
      if (createLinkRes instanceof HTMLLinkElement) {
        link = createLinkRes;
      }
    }

    const attrs = info.attrs;
    if (attrs) {
      Object.keys(attrs).forEach((name) => {
        if (link) {
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
        info.cb();
        return res;
      }
    }
    info.cb();
  };

  link.onerror = onLinkComplete.bind(null, link.onerror);
  link.onload = onLinkComplete.bind(null, link.onload);

  return { link, needAttach };
}

export function loadScript(
  url: string,
  info: {
    attrs?: Record<string, any>;
    createScriptHook?: (url: string) => CreateScriptHookReturn;
  },
) {
  const { attrs = {}, createScriptHook } = info;
  return new Promise<void>((resolve, _reject) => {
    const { script, needAttach } = createScript({
      url,
      cb: resolve,
      attrs: {
        crossorigin: 'anonymous',
        fetchpriority: 'high',
        ...attrs,
      },
      createScriptHook,
      needDeleteScript: true,
    });
    needAttach && document.head.appendChild(script);
  });
}
