globalThis['healthy'] = {
  get() {
    return () => 'unused';
  },
  async init(shareScope) {
    const gate = globalThis.__partialInitGate;
    await gate.startedPromise;
    shareScope.lodash['4.17.22'] = {
      version: '4.17.22',
      from: 'healthy',
      scope: ['default'],
      shareConfig: { singleton: false, requiredVersion: '^4.17.21' },
      get: () => Promise.resolve(() => ({ version: '4.17.22' })),
    };
    gate.release();
  },
};
