export type WebpackSharedScope = {
  default: WebpackShareScopes;
};

export declare const __webpack_init_sharing__: (
  parameter: string
) => Promise<void>;

export type WebpackRequire = {
  l: (
    url: string | undefined,
    cb: (event: any) => void,
    id: string | number
  ) => Record<string, unknown>;
};

type WebpackShareScopes = Record<
  string,
  Record<
    string,
    { loaded?: 1; get: () => Promise<unknown>; from: string; eager: boolean }
  >
>;
