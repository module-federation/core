/* eslint-env worker */
import { workerMap } from './map.js';

self.onmessage = (event) => {
  const value = event.data && event.data.value;
  const federation =
    typeof __webpack_require__ !== 'undefined'
      ? __webpack_require__.federation || {}
      : {};
  const federationKeys = Object.keys(federation);
  self.postMessage({
    answer: workerMap[value] ?? null,
    federationKeys,
  });
};
