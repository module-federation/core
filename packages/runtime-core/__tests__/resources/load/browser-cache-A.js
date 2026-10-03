globalThis.cacheProofBrowserEvaluations += 1;
globalThis.cacheProofBrowserEntry = {
  init() {},
  get(expose) {
    return () => `A:${expose}`;
  },
};
