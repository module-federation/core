globalThis.cacheProofBrowserB = {
  init() {},
  get(expose) {
    return () => `distinct-B:${expose}`;
  },
};
