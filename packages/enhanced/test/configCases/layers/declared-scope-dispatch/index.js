it('initializes the non-script external with the expected scopes', async () => {
  const calls = [];
  globalThis.declaredScopePeer = Promise.resolve({
    init(pool, chain, options) {
      calls.push([pool, options.shareScopeKeys]);
    },
    get: () => () => 'remote widget',
  });
  try {
    const widget = await import('peer/widget');
    expect(widget.default).toBe('remote widget');
    const pools = __webpack_require__.S;
    const expected =
      VARIANT === 'scalar'
        ? [[pools.a, 'a']]
        : VARIANT === 'layered' || VARIANT === 'consume-only'
          ? [[pools.a, ['a', 'b']]]
          : [
              [pools.a, ['a', 'b']],
              [pools.b, ['a', 'b']],
            ];
    expect(calls).toEqual(expected);
    expect(calls[0][0]).toBe(pools.a);
  } finally {
    delete globalThis.declaredScopePeer;
  }
});

if (VARIANT === 'layered') {
  it('publishes its additional provider into the pool supplied by the host', async () => {
    const container = require('./layered-container.js');
    const pools = { host: {}, extra: {} };
    const options = { shareScopeKeys: 'host' };
    Object.defineProperty(options, 'shareScopeMap', { value: pools });
    await container.init(pools.host, [], options);
    const provider = pools.extra.extraWidget['1.0.0'];
    expect((await provider.get())()).toBe('widget');
    expect(Object.keys(pools).sort()).toEqual(['extra', 'host']);
  });

  it('does not publish an additional provider to a two-argument host', async () => {
    const container = require('./layered-container.js');
    const pool = {};
    await expect(Promise.resolve(container.init(pool, []))).resolves.toBe(true);
    expect(pool).toEqual({});
  });
}
