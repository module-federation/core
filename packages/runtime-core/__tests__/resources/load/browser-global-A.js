globalThis.cacheProofBrowserA = {
  init() {},
  get(expose) {
    return () => `distinct-A:${expose}`;
  },
};
