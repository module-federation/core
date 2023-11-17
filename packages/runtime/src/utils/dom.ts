import { isStaticResourcesEqual, safeWrapper } from './tool';

export function createScript(
  url: string,
  cb: (value: void | PromiseLike<void>) => void,
  attrs?: Record<string, any>,
  createScriptHook?: (url: string) => HTMLScriptElement | void,
): { script: HTMLScriptElement; needAttach: boolean } {
  // get existing script element by src
  let script: HTMLScriptElement | null = null;
  let needAttach = true;
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i];
    const scriptSrc = s.getAttribute('src');
    if (scriptSrc && isStaticResourcesEqual(scriptSrc, url)) {
      script = s;
      needAttach = false;
      break;
    }
  }

  if (!script) {
    script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    if (createScriptHook) {
      const createScriptRes = createScriptHook(url);
      if (createScriptRes instanceof HTMLScriptElement) {
        script = createScriptRes;
      }
    }
  }

  if (attrs) {
    Object.keys(attrs).forEach(name => {
      if (script) {
        if (name === 'async' || name === 'defer') {
          script[name] = attrs[name];
        } else {
          script.setAttribute(name, attrs[name]);
        }
      }
    });
  }

  const onScriptComplete = (
    prev: OnErrorEventHandler | GlobalEventHandlers['onload'] | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any,
  ): void => {
    // avoid mem leaks in IE.
    if (script) {
      script.onerror = null;
      script.onload = null;
      safeWrapper(() => {
        script?.parentNode && script.parentNode.removeChild(script);
      });
      if (prev) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = (prev as any)(event);
        cb();
        return res;
      }
    }
    cb();
  };

  script.onerror = onScriptComplete.bind(null, script.onerror);
  script.onload = onScriptComplete.bind(null, script.onload);

  return { script, needAttach };
}

export function loadScript(url: string, info: { attrs?: Record<string, any>; createScriptHook?: (url: string) => HTMLScriptElement | void }) {
  const { attrs, createScriptHook } = info;
  return new Promise<void>((resolve, _reject) => {
    const { script, needAttach } = createScript(url, resolve, attrs, createScriptHook);
    needAttach && document.getElementsByTagName('head')[0].appendChild(script);
  });
}
