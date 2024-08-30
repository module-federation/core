import { FederationRuntimePlugin } from '../type/plugin';
import type { CreateScriptHookReturn } from '@module-federation/sdk';

const defaultRetries = 3;
const maxRetries = 3;
interface FetchWithRetryOptions {
  url: string;
  options?: RequestInit;
  retryTimes?: number;
  fallback?: () => string;
}

interface ScriptWithRetryOptions {
  url: string;
  attrs?: Record<string, string>;
  retryTimes?: number;
  fallback?: () => string;
}

async function fetchWithRetry({
  url, // fetch url
  options = {}, // fetch options
  retryTimes = defaultRetries, // retry times
  fallback, // fallback url
}: FetchWithRetryOptions) {
  try {
    const response = await fetch(url, options);

    // To prevent the response object from being read multiple times and causing errors, clone it
    const responseClone = response.clone();

    // Network error
    if (!response.ok) {
      throw new Error(`Server error：${response.status}`);
    }

    // parse json error
    await responseClone.json().catch((error) => {
      throw new Error(`Json parse error: ${error}, url is: ${url}`);
    });

    return response;
  } catch (error) {
    if (retryTimes <= 0) {
      console.log(
        `>>>>>>>>> retry failed after ${defaultRetries} times for url: ${url}, now will try fallbackUrl url <<<<<<<<<`,
      );
      if (fallback && typeof fallback === 'function') {
        return fetchWithRetry({
          url: fallback(),
          options,
          retryTimes: 1,
        });
      }
      throw new Error(
        'The request failed three times and has now been abandoned',
      );
    }

    // If there are remaining times, delay 1 second and try again
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`Trying again. Number of retries available：${retryTimes - 1}`);
    return await fetchWithRetry({
      url,
      options,
      retryTimes: retryTimes - 1,
      fallback,
    });
  }
}

export const createScript = (url: string, options: Record<string, any>) => {
  let script = document.createElement('script');
  script.src = url;
  Object.keys(options).forEach((key) => {
    if (key === 'async' || key === 'defer') {
      script[key] = options[key];
      // Attributes that do not exist are considered overridden
    } else if (!script.getAttribute(key)) {
      script.setAttribute(key, options[key]);
    }
  });
  return script;
};

async function loadScriptWithRetry(
  script: any,
  maxRetries = 3,
  retryDelay = 1000,
) {
  let retries = 0;

  async function loadScript() {
    return new Promise((resolve, reject) => {
      console.log(`Loading script: ${script.src}, retries is ${retries}`);
      // 加载失败时触发重试机制
      if (retries < maxRetries) {
        console.log('Script load failed, retrying...', retries);

        retries++;
        console.warn(
          `Failed to load script. Retrying... (${retries}/${maxRetries})`,
        );
        setTimeout(loadScript, retryDelay); // 重试延迟后再尝试加载

        console.log('---appendChild script');
        // 加载脚本
        document.head.appendChild(script);
      } else {
        console.error(
          'Failed to load script after maximum retries. will resolve',
        );
        resolve({});
      }
    });
  }

  // 初次加载脚本
  await loadScript();
  console.log('---loadScriptWithRetry end');
  return;
}

function scriptWithRetry({
  url, // fetch url
  attrs = {}, // fetch options
  retryTimes = 0, // retry times
  fallback, // fallback url
}: ScriptWithRetryOptions) {
  console.log('------ scriptWithRetry ', url, retryTimes);
  const script = createScript(url, attrs);

  script.onerror = async (event) => {
    // 改为 async
    console.log(
      '------ onScriptComplete script onError ------',
      url,
      retryTimes,
      maxRetries,
    );

    // if (retryTimes < maxRetries) { // 修改条件
    console.warn(
      `Script load failed, retrying (${retryTimes + 1}/${maxRetries}): ${url}`,
    );
    // await new Promise((resolve) => setTimeout(resolve, 8000)); // 等待 1 秒
    // return scriptWithRetry({ // 递归调用
    //   url,
    //   attrs,
    //   retryTimes: retryTimes + 1,
    //   fallback,
    // });
    await loadScriptWithRetry(script, 3, 1000);
    // await new Promise((resolve) => setTimeout(resolve, 8000));

    // } else {
    //   console.warn(`Script load failed, times is out`);
    //   throw new Error(`Failed to load script after ${maxRetries} attempts: ${url}`); // 抛出错误
    // }
  };
  return script;
}

// function scriptWithRetry({
//   url, // fetch url
//   attrs = {}, // fetch options
//   retryTimes = 0, // retry times
//   fallback, // fallback url
// }: ScriptWithRetryOptions) {
//   console.log('------ scriptWithRetry ', url, retryTimes);
//   const script = createScript(url, attrs);

//   script.onerror = (event) => {
//     return new Promise((resolve, reject) => {
//       console.log('------ onScriptComplete script onError ------', url, retryTimes, maxRetries);

//       if (retryTimes <= maxRetries) {
//         console.warn(
//           `Script load failed, retrying (${retryTimes + 1}/${maxRetries}): ${url}`,
//         );
//         setTimeout(() => scriptWithRetry({
//           url,
//           attrs,
//           retryTimes: retryTimes + 1,
//           fallback,
//         }));
//       } else {
//         console.warn(
//           `Script load failed, times is out`,
//         );

//         // onScriptComplete(script.onerror, event);
//         // throw new Error(
//         //   `Failed to load script after ${maxRetries} attempts: ${url}`,
//         // );
//         // reject(
//         //   new Error(
//         //     `Failed to load script after ${maxRetries} attempts: ${url}`,
//         //   ),
//         // );
//         // resolve({});
//       }
//     })
//   }
//   return script;
// }

const RetryPlugin: (
  params?: Omit<FetchWithRetryOptions, 'url'>,
) => FederationRuntimePlugin = (params) => ({
  name: 'retry-plugin',
  async fetch(url: string, options: RequestInit) {
    return fetchWithRetry({
      url,
      options: {
        ...options,
        ...params?.options,
      },
      retryTimes: params?.retryTimes,
      fallback: params?.fallback,
    });
  },
  createScript({ url, attrs }) {
    console.log('>>>>>>>>>> createScript <<<<<<<<<<<', url, attrs);
    // TODO: add script logic

    // if (url === testRemoteEntry) {
    //   let script = document.createElement('script');
    //   script.src = testRemoteEntry;
    //   script.setAttribute('loader-hooks', 'isTrue');
    //   script.setAttribute('crossorigin', 'anonymous');
    //   return script;
    // }
    if (url.endsWith('src_App_tsx.js')) {
      return scriptWithRetry({
        url: `${url}-fake`,
        attrs,
        retryTimes: params?.retryTimes,
        fallback: params?.fallback,
      });
    }
    return null as unknown as CreateScriptHookReturn; // Ensure null is assignable
  },
});

export default RetryPlugin;
