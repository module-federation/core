import { ScriptWithRetryOptions, CreateScriptFunc, ReqiuredUrl } from './types';
import { defaultRetries } from './constant';

export const defaultCreateScript = (
  url: string,
  attrs: Record<string, any>,
) => {
  let script = document.createElement('script');
  script.src = url;
  Object.keys(attrs).forEach((key) => {
    if (key === 'async' || key === 'defer') {
      script[key] = attrs[key];
      // Attributes that do not exist are considered overridden
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
  retryDelay = 1000,
  customCreateScript: CreateScriptFunc | undefined,
) {
  let retries = 0;

  function attemptLoad() {
    return new Promise((resolve, reject) => {
      const script = getScript(url, attrs, customCreateScript);
      // when the script is successfully loaded, call resolve
      script.onload = () => {
        console.log('Script loaded successfully.');
        resolve(script);
      };

      // when script fails to load, retry after a delay
      script.onerror = () => {
        if (retries < maxRetries) {
          retries++;
          console.warn(
            `Failed to load script. Retrying... (${retries}/${maxRetries})`,
          );

          // reload after a delay
          setTimeout(() => {
            resolve(attemptLoad()); // recursively call attemptLoad
          }, retryDelay);
        } else {
          console.error(
            'Failed to load script after maximum retries. the url is:',
            url,
          );
          resolve('Failed to load script after maximum retries.');
        }
      };

      // load script
      document.head.appendChild(script);
    });
  }

  return attemptLoad(); // begin the first attempt to load the script
}

function scriptWithRetry({
  url, // fetch url
  attrs = {}, // fetch options
  retryTimes = defaultRetries, // retry times
  customCreateScript, // user script create function
}: ReqiuredUrl<ScriptWithRetryOptions>) {
  const script = getScript(url, attrs, customCreateScript);
  script.onerror = async (event) => {
    console.warn(
      `Script load failed, retrying (${retryTimes + 1}/${defaultRetries}): ${url}`,
    );
    return await loadScript(url, attrs, retryTimes, 1000, customCreateScript);
  };
  return script;
}

export { scriptWithRetry };
