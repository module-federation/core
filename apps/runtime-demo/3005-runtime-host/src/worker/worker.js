/* eslint-env worker */
import { workerMap } from './map';

self.onmessage = (event) => {
  const value = event.data && event.data.value;
  self.postMessage({
    answer: workerMap[value] ?? null,
  });
};
