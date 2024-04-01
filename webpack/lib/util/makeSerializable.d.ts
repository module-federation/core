declare function _exports(
  Constructor: Constructor,
  request: string,
  name?: string | null,
): void;
export = _exports;
export type Constructor =
  import('../serialization/ObjectMiddleware').Constructor;
