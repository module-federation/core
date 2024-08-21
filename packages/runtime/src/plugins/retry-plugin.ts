import { FederationRuntimePlugin } from '../type/plugin';

const defaultRetries = 3;
interface FetchWithRetryOptions {
  url: string;
  options?: RequestInit;
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
});

export default RetryPlugin;
