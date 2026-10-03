globalThis.cacheProofBrowserEvaluations += 1;
globalThis.cacheProofBrowserEntry = {
  init() {},
  get(expose) {
    return () => `B:${expose}`;
  },
};
