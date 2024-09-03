import type { ReqiuredUrl, FetchWithRetryOptions } from './types';
import { defaultRetries, defaultRetryDelay } from './constant';

async function fetchWithRetry({
  url, // fetch url
  options = {}, // fetch options
  retryTimes = defaultRetries, // retry times
  retryDelay = defaultRetryDelay, // retry delay
  fallback, // fallback url
}: ReqiuredUrl<FetchWithRetryOptions>) {
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
        `>>>>>>>>> retry failed after ${retryTimes} times for url: ${url}, now will try fallbackUrl url <<<<<<<<<`,
      );
      if (fallback && typeof fallback === 'function') {
        return fetchWithRetry({
          url: fallback(),
          options,
          retryTimes: 0,
          retryDelay: 0,
        });
      }

      if (
        error instanceof Error &&
        error.message.includes('Json parse error')
      ) {
        throw error;
      }

      throw new Error(
        'The request failed three times and has now been abandoned',
      );
    } else {
      // If there are remaining times, delay 1 second and try again
      retryDelay > 0 &&
        (await new Promise((resolve) => setTimeout(resolve, retryDelay)));

      console.log(
        `Trying again. Number of retries available：${retryTimes - 1}`,
      );
      return await fetchWithRetry({
        url,
        options,
        retryTimes: retryTimes - 1,
        retryDelay,
        fallback,
      });
    }
    return fetch(url, options);
  }
}

export { fetchWithRetry };
