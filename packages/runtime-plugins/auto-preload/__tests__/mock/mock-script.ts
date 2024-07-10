import fs from 'fs';
import path from 'path';

async function safeWrapper<T extends (...args: Array<any>) => any>(
  callback: T,
  disableWarn?: boolean,
): Promise<ReturnType<T> | undefined> {
  try {
    const res = await callback();
    return res;
  } catch (e) {
    !disableWarn && console.warn(e);
  }
}

const mountElementMethods = [
  'append',
  'appendChild',
  'insertBefore',
  'insertAdjacentElement',
];
const rawElementMethods = Object.create(null);

type MatchInfo = {
  baseUrl: string;
  baseDir: string;
};

let responseMatchInfo: {
  [key: string]: MatchInfo;
} = {};

// eslint-disable-next-line @typescript-eslint/ban-types
function injector(current: Function, methodName: string) {
  return function (this: Element) {
    const index = methodName === 'insertAdjacentElement' ? 1 : 0;
    // eslint-disable-next-line prefer-rest-params
    const el = arguments[index];
    let oriArguments = arguments;

    // eslint-disable-next-line prefer-rest-params
    const originProcess = () => current.apply(this, oriArguments);
    function evalScript(element: HTMLScriptElement, preload?: boolean) {
      const matchInfoKey = Object.keys(responseMatchInfo).find(
        (matchKey) => element?.src?.indexOf(matchKey) > -1,
      );
      const matchInfo = matchInfoKey && responseMatchInfo[matchInfoKey];
      if (matchInfo && element.tagName === 'SCRIPT') {
        element.setAttribute('innerHTML', matchInfoKey);
        const nEl = document.createElement('script');
        const attrs = element.attributes;
        for (var j = 0; j < attrs.length; j++) {
          // Setting src causes a timeout
          if (attrs[j].name !== 'src') {
            nEl.setAttribute(attrs[j].name, attrs[j].value);
          }
        }
        // eslint-disable-next-line no-restricted-syntax
        for (const key in element) {
          if (key !== 'src') {
            safeWrapper(() => {
              (nEl as any)[key] = (element as any)[key];
            }, true);
          } else {
            // Setting src causes a timeout
            (nEl as any)['fakeSrc'] = (element as any)[key];
          }
        }
        const filePath = element.src.replace(matchInfo.baseUrl, '');
        const execScriptContent = fs.readFileSync(
          path.resolve(matchInfo.baseDir, filePath),
          'utf-8',
        );
        // nEl.innerHTML = fs.readFileSync(
        //   path.resolve(matchInfo.baseDir, matchInfo.innerHTML),
        //   'utf-8',
        // );
        nEl.innerHTML = execScriptContent;
        // vitest 无法让 jsdom 和当前环境处于同一个执行环境
        if (!preload) {
          new Function(execScriptContent)();
        }
        if (element && element.onload) {
          element.onload.call(element);
        }
        // eslint-disable-next-line prefer-rest-params
        oriArguments[index] = nEl;
      }
    }
    if (el instanceof DocumentFragment) {
      let listEl = el.querySelectorAll('script');
      listEl.forEach((element) => {
        evalScript(element, true);
      });
    } else if (el instanceof HTMLScriptElement) {
      evalScript(el);
    }
    return originProcess();
  };
}

const rewrite = (methods: Array<string>, builder: typeof injector) => {
  for (const name of methods) {
    const fn = (window.Element as any).prototype[name];
    rawElementMethods[name] = fn;
    const wrapper = builder(fn, name);
    (window.Element as any).prototype[name] = wrapper;
  }
};

rewrite(mountElementMethods, injector);

/**
 * vite 无法让 jsdom 和当前环境处于同一个执行环境
 * 所以需要 mock script dom response
 * 直接代理 http 返回结果无法对 script dom 进行处理
 * 目前实现的方式是通过劫持添加 script dom 的方法，将 script dom 的 src 替换为 script dom 的 innerHTML
 */
export const mockScriptDomResponse = ({
  baseUrl,
  baseDir,
}: {
  baseDir: string;
  baseUrl: string;
}): (() => void) => {
  responseMatchInfo[baseUrl] = {
    baseDir,
    baseUrl,
  };

  return () => {
    delete responseMatchInfo[baseUrl];
  };
};
