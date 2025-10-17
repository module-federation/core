/* eslint-env worker */
/* global __webpack_require__ */
import { workerMap } from './map.js';

self.onmessage = (event) => {
  const value = event.data && event.data.value;
  const federationKeys = Object.keys(__webpack_require__.federation);
  self.postMessage({
    answer: workerMap[value] ?? null,
    federationKeys,
  });
};
