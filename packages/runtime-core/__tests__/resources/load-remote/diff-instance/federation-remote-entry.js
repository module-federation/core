if (!globalThis.execTime) {
  globalThis.execTime = 0;
}
globalThis.execTime++;

globalThis[`__FEDERATION_${'@module-federation/sub1:1.0.2'}__`] = {
  get(scope) {
    const moduleMap = {
      '.'() {
        return () => 'hello world';
      },
    };
    return moduleMap[scope];
  },
  init() {},
};
