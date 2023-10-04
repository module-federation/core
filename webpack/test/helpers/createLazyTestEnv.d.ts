declare function _exports(
  globalTimeout?: number,
  nameSuffix?: string,
): {
  setDefaultTimeout(time: any): void;
  getNumberOfTests(): number;
  it(...args: any[]): void;
  beforeEach(...args: any[]): void;
  afterEach(...args: any[]): void;
};
export = _exports;
