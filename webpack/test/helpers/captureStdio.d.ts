declare function _exports(
  stdio: any,
  tty: any,
): {
  data: any[];
  reset: () => any[];
  toString: () => string;
  toStringRaw: () => string;
  restore(): void;
};
export = _exports;
