if (failEvaluation) {
  throw new Error('transient evaluator failure');
}

({
  init() {},
  async get(expose) {
    return () => `${evaluatorName}:${expose}`;
  },
});
