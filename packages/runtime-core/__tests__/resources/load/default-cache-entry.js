globalThis.defaultCacheProofEvaluations += 1;
globalThis.defaultCacheProof = {
  init() {},
  async get(expose) {
    return () => `default:${expose}`;
  },
};
