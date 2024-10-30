import { ScriptWithRetryOptions, CreateScriptFunc, RequiredUrl } from './types';
import { defaultRetries, defaultRetryDelay, loadStatus } from './constant';
import logger from './logger';

export const defaultCreateScript = (
  url: string,
  attrs: Record<string, any>,
) => {
  let script = document.createElement('script');
  script.src = url;
  Object.keys(attrs).forEach((key) => {
    if (key === 'async' || key === 'defer') {
      script[key] = attrs[key];
    } else if (!script.getAttribute(key)) {
      script.setAttribute(key, attrs[key]);
    }
  });
  return script;
};

const getScript = (
  url: string,
  attrs: Record<string, any>,
  customCreateScript: CreateScriptFunc | undefined,
) => {
  let script: HTMLScriptElement | null = null;
  if (customCreateScript && typeof customCreateScript === 'function') {
    script = customCreateScript(url, attrs);
  }

  if (!script) {
    script = defaultCreateScript(url, attrs);
  }
  return script;
};

async function loadScript(
  url: string,
  attrs: Record<string, any>,
  maxRetries = defaultRetries,
  retryDelay = defaultRetryDelay,
  customCreateScript: CreateScriptFunc | undefined,
): Promise<{
  status: 'success' | 'error';
  event?: Event;
}> {
  let retries = 0;

  function attemptLoad() {
    return new Promise((resolve, reject) => {
      const script = getScript(url, attrs, customCreateScript);
      // when the script is successfully loaded, call resolve
      script.onload = (event) => {
        resolve({
          status: loadStatus.success,
          event,
        });
      };

      // when script fails to load, retry after a delay
      script.onerror = (event) => {
        if (retries < maxRetries) {
          retries++;
          logger.warn(
            `Failed to load script. Retrying... (${retries}/${maxRetries})`,
          );

          // reload after a delay
          retryDelay > 0 &&
            setTimeout(() => {
              resolve(attemptLoad());
            }, retryDelay);
        } else {
          logger.error(
            `Failed to load script after maximum retries. the url is: ${url}`,
          );
          resolve({
            status: loadStatus.error,
            event,
          });
        }
      };

      // load script
      document.head.appendChild(script);
    });
  }

  // @ts-ignore
  return attemptLoad();
}

function scriptWithRetry({
  url, // fetch url
  attrs = {}, // fetch options
  retryTimes = defaultRetries, // retry times
  retryDelay = defaultRetryDelay, // retry delay
  customCreateScript, // user script create function
}: RequiredUrl<ScriptWithRetryOptions>) {
  const script = getScript(url, attrs, customCreateScript);
  const originOnerror = script.onerror;
  const originOnLoad = script.onload;
  script.onerror = async (event) => {
    logger.warn(
      `Script load failed, retrying (${retryTimes + 1}/${defaultRetries}): ${url}`,
    );

    const scriptLoader = await loadScript(
      url,
      attrs,
      retryTimes,
      retryDelay,
      customCreateScript,
    );

    if (scriptLoader.status === loadStatus.success) {
      originOnLoad?.call(script, scriptLoader?.event as Event);
      return;
    } else {
      originOnerror?.call(script, scriptLoader?.event as Event);
    }
    return;
  };
  return script;
}

export { scriptWithRetry };
