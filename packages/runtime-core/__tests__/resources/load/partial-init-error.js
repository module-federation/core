globalThis['partial'] = {
  get() {
    return () => 'unused';
  },
  async init(shareScope) {
    const gate = globalThis.__partialInitGate;
    if (gate) {
      gate.started();
      await gate.waitForHealthy;
    }
    shareScope.lodash['4.17.22'] = {
      version: '4.17.22',
      from: 'partial',
      scope: ['default'],
      shareConfig: { singleton: false, requiredVersion: '^4.17.21' },
      get: () =>
        Promise.resolve(() => {
          throw new Error('broken remote share selected');
        }),
    };
    throw new Error('remote init failed after registering a share');
  },
};
